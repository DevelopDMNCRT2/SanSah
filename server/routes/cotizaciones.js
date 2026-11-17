// Issue #22 — Cotizaciones guardadas: listar, buscar, abrir, editar y marcar como cobradas.
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { requireAuth } = require('./auth');

router.use(requireAuth);

const calcTotal = (items) =>
  (Array.isArray(items) ? items : []).reduce(
    (s, it) => s + (parseFloat(it.precio) || 0) * (parseInt(it.cantidad) || 0), 0);

const validarItems = (items) =>
  Array.isArray(items) && items.length > 0 &&
  items.every(it => it && typeof it.nombre === 'string' && it.nombre.trim() && !isNaN(parseFloat(it.precio)) && parseInt(it.cantidad) > 0);

async function siguienteFolio() {
  const ultima = await prisma.cotizacion.findFirst({ orderBy: { id: 'desc' }, select: { id: true } });
  let n = 1001 + (ultima ? ultima.id : 0);
  while (await prisma.cotizacion.findUnique({ where: { folio: `COT-${n}` } })) n++;
  return `COT-${n}`;
}

// GET /api/cotizaciones?q=&estado=  — listado (más recientes primero)
router.get('/', async (req, res) => {
  try {
    const { q, estado } = req.query;
    const where = {};
    if (estado) where.estado = estado;
    if (q && q.trim()) {
      const t = q.trim();
      where.OR = [
        { folio: { contains: t, mode: 'insensitive' } },
        { nombre: { contains: t, mode: 'insensitive' } },
        { telefono: { contains: t } },
      ];
    }
    const cotizaciones = await prisma.cotizacion.findMany({ where, orderBy: { created_at: 'desc' }, take: 100 });
    res.json(cotizaciones);
  } catch (e) {
    console.error('GET /api/cotizaciones', e);
    res.status(500).json({ error: 'Error al obtener cotizaciones' });
  }
});

router.get('/:id', async (req, res) => {
  const c = await prisma.cotizacion.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!c) return res.status(404).json({ error: 'Cotización no encontrada' });
  res.json(c);
});

// POST /api/cotizaciones  { nombre, telefono, items: [{id, nombre, variante, precio, cantidad, imagen, es_servicio, variacion_id}] }
router.post('/', async (req, res) => {
  try {
    const { nombre, telefono, items } = req.body;
    if (!validarItems(items)) return res.status(400).json({ error: 'La cotización necesita al menos un concepto válido' });
    const c = await prisma.cotizacion.create({
      data: {
        folio: await siguienteFolio(),
        nombre: nombre?.trim() || null,
        telefono: telefono?.trim() || null,
        items,
        total: calcTotal(items),
        usuario_id: req.user?.id ?? null,
      },
    });
    res.status(201).json(c);
  } catch (e) {
    console.error('POST /api/cotizaciones', e);
    res.status(500).json({ error: 'Error al guardar la cotización' });
  }
});

// PUT /api/cotizaciones/:id — editar (solo si sigue Abierta)
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const actual = await prisma.cotizacion.findUnique({ where: { id } });
    if (!actual) return res.status(404).json({ error: 'Cotización no encontrada' });
    if (actual.estado !== 'Abierta') return res.status(409).json({ error: 'La cotización ya fue cobrada' });
    const { nombre, telefono, items } = req.body;
    if (!validarItems(items)) return res.status(400).json({ error: 'La cotización necesita al menos un concepto válido' });
    const c = await prisma.cotizacion.update({
      where: { id },
      data: { nombre: nombre?.trim() || null, telefono: telefono?.trim() || null, items, total: calcTotal(items) },
    });
    res.json(c);
  } catch (e) {
    console.error('PUT /api/cotizaciones/:id', e);
    res.status(500).json({ error: 'Error al actualizar la cotización' });
  }
});

// PUT /api/cotizaciones/:id/cobrar { pedido_id } — se marca al convertirla en venta
router.put('/:id/cobrar', async (req, res) => {
  try {
    const c = await prisma.cotizacion.update({
      where: { id: parseInt(req.params.id) },
      data: { estado: 'Cobrada', pedido_id: req.body.pedido_id ? parseInt(req.body.pedido_id) : null },
    });
    res.json(c);
  } catch (e) {
    res.status(404).json({ error: 'Cotización no encontrada' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.cotizacion.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ ok: true });
  } catch (e) {
    res.status(404).json({ error: 'Cotización no encontrada' });
  }
});

module.exports = router;
