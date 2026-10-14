const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Genera un código único de 5 caracteres alfanuméricos
async function generarCodigo() {
  let codigo, existe = true;
  while (existe) {
    codigo = String(Math.floor(10000 + Math.random() * 90000)); // 5 dígitos: 10000–99999
    existe = await prisma.cliente.findUnique({ where: { codigo } });
  }
  return codigo;
}

// GET /api/clientes
// Devuelve lista de clientes con conteo de pedidos y total gastado
router.get('/', async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      include: { pedidos: { select: { id: true, total: true, created_at: true } } },
      orderBy: { created_at: 'desc' }
    });

    const data = clientes.map(c => ({
      id: c.id,
      codigo: c.codigo,
      nombre: c.nombre,
      correo: c.correo,
      telefono: c.telefono,
      primera_compra: c.created_at,  // Fecha de alta = siempre disponible
      ultima_compra: c.pedidos.length
        ? c.pedidos.reduce((newest, p) =>
            p.created_at > newest.created_at ? p : newest
          ).created_at
        : null,
      total_pedidos: c.pedidos.length,
      total_gastado: c.pedidos.reduce((sum, p) => sum + p.total, 0),
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// GET /api/clientes/buscar?q=nombre  — búsqueda para autocomplete del Taller
router.get('/buscar', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    const clientes = await prisma.cliente.findMany({
      where: { nombre: { contains: q, mode: 'insensitive' } },
      select: { id: true, nombre: true, telefono: true },
      take: 8,
      orderBy: { nombre: 'asc' }
    });
    res.json(clientes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar clientes' });
  }
});

// GET /api/clientes/:ref  — detalle del cliente + historial de compras (usado por ClienteDetalle.vue)
// :ref puede ser el id numérico, el código de 5 dígitos o (compatibilidad) el correo.
router.get('/:ref', async (req, res) => {
  try {
    const ref = decodeURIComponent(req.params.ref).trim();
    let cliente = null;

    if (/^\d+$/.test(ref)) {
      // Puede ser id interno o código visible (ambos numéricos)
      cliente = await prisma.cliente.findUnique({ where: { codigo: ref } });
      if (!cliente) cliente = await prisma.cliente.findUnique({ where: { id: parseInt(ref) } });
    }
    if (!cliente && ref.includes('@')) {
      cliente = await prisma.cliente.findUnique({ where: { correo: ref } });
    }
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

    // Pedidos vinculados por cliente_id + pedidos web antiguos sin vínculo pero con su correo
    const or = [{ cliente_id: cliente.id }];
    if (cliente.correo && cliente.correo !== 'pos@sansah.com') {
      or.push({ cliente_id: null, correo: cliente.correo });
    }

    const pedidos = await prisma.pedido.findMany({
      where: { OR: or },
      include: { items: true },
      orderBy: { created_at: 'desc' }
    });

    res.json({
      cliente: {
        id: cliente.id,
        codigo: cliente.codigo,
        nombre: cliente.nombre,
        correo: cliente.correo,
        telefono: cliente.telefono,
        created_at: cliente.created_at,
      },
      pedidos
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener detalle del cliente' });
  }
});

// POST /api/clientes — crear cliente manual
router.post('/', async (req, res) => {
  try {
    const { nombre, correo, telefono } = req.body;
    const codigo = await generarCodigo();
    const cliente = await prisma.cliente.create({ data: { codigo, nombre, correo: correo || null, telefono } });
    res.status(201).json(cliente);
  } catch (err) {
    console.error(err);
    if (err.code === 'P2002') return res.status(409).json({ error: 'Ya existe un cliente con ese correo' });
    res.status(500).json({ error: 'Error al crear cliente' });
  }
});

// PUT /api/clientes/:id
router.put('/:id', async (req, res) => {
  try {
    const { nombre, telefono } = req.body;
    const cliente = await prisma.cliente.update({
      where: { id: parseInt(req.params.id) },
      data: { nombre, telefono }
    });
    res.json(cliente);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

// DELETE /api/clientes/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.cliente.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
});

module.exports = router;
