require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const usersRouter      = require('./routes/users');
const uploadRouter     = require('./routes/upload');
const productsRouter   = require('./routes/products');
const categoriasRouter = require('./routes/categorias');
const clientesRouter   = require('./routes/clientes');
const pedidosRouter    = require('./routes/pedidos');
const inventarioRouter = require('./routes/inventario');
const tallerRouter     = require('./routes/taller');
const reportesRouter   = require('./routes/reportes');
const mercadopagoRouter= require('./routes/mercadopago');
const gastosRouter     = require('./routes/gastos');
const corteRouter       = require('./routes/corte');
const comprasRouter     = require('./routes/compras');
const cotizacionesRouter = require('./routes/cotizaciones');
const { router: authRouter } = require('./routes/auth');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRouter);
app.use('/api/users',      usersRouter);
app.use('/api/upload',     uploadRouter);
app.use('/api/products',   productsRouter);
app.use('/api/categorias', categoriasRouter);
// /api/tiendas is an alias for /api/categorias (frontend uses /api/tiendas)
app.use('/api/tiendas',    categoriasRouter);
app.use('/api/clientes',   clientesRouter);
app.use('/api/pedidos',    pedidosRouter);
app.use('/api/inventario', inventarioRouter);
app.use('/api/taller',     tallerRouter);
app.use('/api/reportes',   reportesRouter);
app.use('/api/mercadopago',mercadopagoRouter);
app.use('/api/gastos',     gastosRouter);
app.use('/api/corte',      corteRouter);
app.use('/api/compras',    comprasRouter);
app.use('/api/cotizaciones', cotizacionesRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 catch-all
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
// Solo iniciar el servidor si no estamos en un entorno serverless (Vercel)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Servidor SanSah corriendo en http://localhost:${PORT}`);
    console.log(`   → /api/users`);
    console.log(`   → /api/products`);
    console.log(`   → /api/tiendas  (alias /api/categorias)`);
    console.log(`   → /api/clientes`);
    console.log(`   → /api/pedidos`);
    console.log(`   → /api/inventario`);
    console.log(`   → /api/taller`);
    console.log(`   → /api/reportes`);
    console.log(`   → /api/gastos\n`);
  });
}

// Exportar para Vercel Serverless Functions
module.exports = app;
