const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/inventario
// Devuelve todos los productos con su stock actual (calculado desde products y variaciones)
// más los movimientos de ajuste manual
router.get('/', async (req, res) => {
  try {
    const productos = await prisma.product.findMany({
      include: { variaciones: true },
      orderBy: { nombre: 'asc' }
    });

    // Nota: products.stock / product_variations.stock ya reflejan ventas, compras,
    // devoluciones y entradas manuales (cada operación actualiza el stock y además
    // registra un movimiento como bitácora). Sumar los movimientos otra vez
    // duplicaba el efecto y podía mostrar existencias negativas.
    const data = productos.map(p => ({
      id: p.id,
      nombre: p.nombre,
      slug: p.slug,
      tienda: p.tienda,
      imagen_url: p.imagen_url,
      es_variable: p.es_variable,
      es_publico: p.es_publico,
      stock: p.es_variable
        ? p.variaciones.reduce((s, v) => s + (v.stock || 0), 0)
        : Math.max(0, p.stock || 0),
      variaciones_count: p.variaciones.length,
      variaciones: p.variaciones,
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener inventario' });
  }
});

// GET /api/inventario/movimientos/:product_id  — historial de un producto
router.get('/movimientos/:product_id', async (req, res) => {
  try {
    const movimientos = await prisma.inventarioMovimiento.findMany({
      where: { product_id: parseInt(req.params.product_id) },
      orderBy: { created_at: 'desc' }
    });
    res.json(movimientos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener movimientos' });
  }
});

// POST /api/inventario/movimiento  — registrar entrada, salida o ajuste
router.post('/movimiento', async (req, res) => {
  try {
    const { product_id, tipo, cantidad, motivo } = req.body;
    if (!['entrada', 'salida', 'ajuste'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo inválido. Usa: entrada, salida, ajuste' });
    }
    const mov = await prisma.inventarioMovimiento.create({
      data: {
        product_id: parseInt(product_id),
        tipo,
        cantidad: parseInt(cantidad),
        motivo: motivo || null,
      }
    });
    res.status(201).json(mov);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar movimiento' });
  }
});

module.exports = router;
