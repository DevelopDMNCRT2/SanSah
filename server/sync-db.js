const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const sourceDatabaseUrl = process.env.SOURCE_DATABASE_URL;

if (!sourceDatabaseUrl) {
  console.error('❌ Error de configuración: La variable de entorno SOURCE_DATABASE_URL no está definida.');
  console.error('Por favor define SOURCE_DATABASE_URL en tu archivo .env o en el entorno del sistema antes de ejecutar este script.');
  process.exit(1);
}

const neonPrisma = new PrismaClient({
  datasources: { db: { url: sourceDatabaseUrl } }
});

const localPrisma = new PrismaClient();

async function sync() {
  console.log('🔄 Iniciando migración de datos desde Neon a la BD local del VPS...');

  try {
    // 1. Categorías
    if (neonPrisma.categoria) {
      const categorias = await neonPrisma.categoria.findMany();
      console.log(`📦 Importando ${categorias.length} categorías...`);
      for (const item of categorias) {
        await localPrisma.categoria.upsert({
          where: { id: item.id },
          update: item,
          create: item
        });
      }
    }

    // 2. Usuarios
    if (neonPrisma.user) {
      const users = await neonPrisma.user.findMany();
      console.log(`👤 Importando ${users.length} usuarios...`);
      for (const item of users) {
        await localPrisma.user.upsert({
          where: { id: item.id },
          update: item,
          create: item
        });
      }
    }

    // 3. Productos
    if (neonPrisma.product) {
      const products = await neonPrisma.product.findMany();
      console.log(`🚲 Importando ${products.length} productos...`);
      for (const item of products) {
        await localPrisma.product.upsert({
          where: { id: item.id },
          update: item,
          create: item
        });
      }
    }

    // 4. Clientes
    if (neonPrisma.cliente) {
      const clientes = await neonPrisma.cliente.findMany();
      console.log(`👥 Importando ${clientes.length} clientes...`);
      for (const item of clientes) {
        await localPrisma.cliente.upsert({
          where: { id: item.id },
          update: item,
          create: item
        });
      }
    }

    // 5. Pedidos
    if (neonPrisma.pedido) {
      const pedidos = await neonPrisma.pedido.findMany();
      console.log(`🛒 Importando ${pedidos.length} pedidos...`);
      for (const item of pedidos) {
        await localPrisma.pedido.upsert({
          where: { id: item.id },
          update: item,
          create: item
        });
      }
    }

    // 6. Items Pedido
    if (neonPrisma.pedidoItem) {
      const items = await neonPrisma.pedidoItem.findMany();
      console.log(`📝 Importando ${items.length} ítems de pedido...`);
      for (const item of items) {
        await localPrisma.pedidoItem.upsert({
          where: { id: item.id },
          update: item,
          create: item
        });
      }
    }

    // 7. Inventario Movimiento
    if (neonPrisma.inventarioMovimiento) {
      const inventarios = await neonPrisma.inventarioMovimiento.findMany();
      console.log(`📊 Importando ${inventarios.length} registros de inventario...`);
      for (const item of inventarios) {
        await localPrisma.inventarioMovimiento.upsert({
          where: { id: item.id },
          update: item,
          create: item
        });
      }
    }

    // 8. Orden Taller
    if (neonPrisma.ordenTaller) {
      const talleres = await neonPrisma.ordenTaller.findMany();
      console.log(`🛠️ Importando ${talleres.length} órdenes de taller...`);
      for (const item of talleres) {
        await localPrisma.ordenTaller.upsert({
          where: { id: item.id },
          update: item,
          create: item
        });
      }
    }

    // 9. Gastos
    if (neonPrisma.gasto) {
      const gastos = await neonPrisma.gasto.findMany();
      console.log(`💵 Importando ${gastos.length} gastos...`);
      for (const item of gastos) {
        await localPrisma.gasto.upsert({
          where: { id: item.id },
          update: item,
          create: item
        });
      }
    }

    // 10. Cortes
    if (neonPrisma.corte) {
      const cortes = await neonPrisma.corte.findMany();
      console.log(`✂️ Importando ${cortes.length} cortes de caja...`);
      for (const item of cortes) {
        await localPrisma.corte.upsert({
          where: { id: item.id },
          update: item,
          create: item
        });
      }
    }

    // 11. Compras
    if (neonPrisma.compra) {
      const compras = await neonPrisma.compra.findMany();
      console.log(`🛍️ Importando ${compras.length} compras...`);
      for (const item of compras) {
        await localPrisma.compra.upsert({
          where: { id: item.id },
          update: item,
          create: item
        });
      }
    }

    console.log('✅ Migración de base de datos completada con éxito.');
  } catch (err) {
    console.error('❌ Error durante la migración:', err);
  } finally {
    await neonPrisma.$disconnect();
    await localPrisma.$disconnect();
  }
}

sync();
