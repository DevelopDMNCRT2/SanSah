const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetDB() {
  console.log('🧹 Vaciando todas las tablas en PostgreSQL...');
  
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "pedido_items", "pedidos", "inventario", "ordenes_taller", "gastos", "cortes", "compras", "clientes", "products", "categorias", "users" RESTART IDENTITY CASCADE;`);

  console.log('📦 Creando 1 categoría de ejemplo...');
  await prisma.categoria.create({
    data: {
      nombre: 'Bicicletas de Montaña',
      imagen_url: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?q=80&w=1200&auto=format&fit=crop',
      publico: true
    }
  });

  console.log('🚲 Creando 1 producto de ejemplo...');
  await prisma.product.create({
    data: {
      nombre: 'Bicicleta Mountain Bike Pro 29"',
      descripcion: 'Bicicleta de montaña de alta gama con suspensión delantera de aire, frenos hidráulicos Shimano y transmisión 1x12.',
      tienda: 'Bicicletas de Montaña',
      precio: 12500,
      stock: 5,
      es_publico: true,
      es_publico_pos: true,
      slug: 'bicicleta-mountain-bike-pro-29',
      imagen_url: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?q=80&w=1200&auto=format&fit=crop',
      costo_real: 8500
    }
  });

  console.log('👤 Creando 1 usuario Administrador...');
  const hashedPassword = await bcrypt.hash('SanSah2026!', 10);
  await prisma.user.create({
    data: {
      id: 1,
      nombre: 'Administrador SanSah',
      correo: 'admin@sansahbikes.com',
      password: hashedPassword,
      rol: 'Administrador'
    }
  });

  console.log('🎉 Base de datos reiniciada y limpia con éxito.');
}

resetDB()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
