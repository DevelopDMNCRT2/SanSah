/**
 * Issue #24 — Re-liga pedidos que quedaron asignados al cliente "Mostrador"
 * aunque se capturó el nombre de otro cliente (POS / cobros de taller).
 *
 * Uso (desde server/):
 *   node scripts/relink-pedidos-clientes.js           → solo muestra lo que haría (dry-run)
 *   node scripts/relink-pedidos-clientes.js --apply   → aplica los cambios
 *
 * Reglas:
 *  - Solo toca pedidos cuyo cliente actual es el cliente Mostrador (correo pos@sansah.com)
 *    y cuyo campo `nombre` NO es un nombre genérico de mostrador.
 *  - Busca un cliente existente con el mismo nombre (sin distinguir mayúsculas).
 *    Si no existe, lo crea (con el teléfono del pedido si lo tiene).
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const APPLY = process.argv.includes('--apply');
const POS_DUMMY_EMAIL = 'pos@sansah.com';
const MOSTRADOR_NOMBRES = ['mostrador', 'cliente mostrador', 'público general', 'publico general'];

async function generarCodigo() {
  let codigo, existe = true;
  while (existe) {
    codigo = String(Math.floor(10000 + Math.random() * 90000));
    existe = await prisma.cliente.findUnique({ where: { codigo } });
  }
  return codigo;
}

async function main() {
  const mostrador = await prisma.cliente.findUnique({ where: { correo: POS_DUMMY_EMAIL } });
  if (!mostrador) {
    console.log('No existe cliente Mostrador (pos@sansah.com). Nada que hacer.');
    return;
  }

  const pedidos = await prisma.pedido.findMany({
    where: { cliente_id: mostrador.id },
    orderBy: { id: 'asc' },
  });

  const candidatos = pedidos.filter(p => {
    const n = (p.nombre || '').trim().toLowerCase();
    return n && !MOSTRADOR_NOMBRES.includes(n);
  });

  console.log(`${APPLY ? 'APLICANDO' : 'DRY-RUN'} — Mostrador id=${mostrador.id}: ${pedidos.length} pedidos, ${candidatos.length} con nombre de cliente.\n`);

  const creados = new Map();
  let movidos = 0;

  for (const p of candidatos) {
    const nombre = p.nombre.trim();
    let cliente = await prisma.cliente.findFirst({
      where: { nombre: { equals: nombre, mode: 'insensitive' }, NOT: { id: mostrador.id } },
      orderBy: { id: 'asc' },
    });

    let accion = cliente ? `→ cliente existente #${cliente.codigo} (${cliente.nombre})` : '→ se crearía cliente nuevo';

    if (!cliente && creados.has(nombre.toLowerCase())) {
      cliente = creados.get(nombre.toLowerCase());
      accion = `→ cliente creado en esta corrida #${cliente.codigo}`;
    }

    if (APPLY) {
      if (!cliente) {
        cliente = await prisma.cliente.create({
          data: { codigo: await generarCodigo(), nombre, correo: null, telefono: p.telefono || null },
        });
        creados.set(nombre.toLowerCase(), cliente);
        accion = `→ cliente creado #${cliente.codigo}`;
      }
      await prisma.pedido.update({ where: { id: p.id }, data: { cliente_id: cliente.id } });
    } else if (!cliente) {
      creados.set(nombre.toLowerCase(), { codigo: '(nuevo)' });
    }

    movidos++;
    console.log(`${p.orden.padEnd(10)} ${nombre.padEnd(40)} ${accion}`);
  }

  console.log(`\n${movidos} pedidos ${APPLY ? 're-ligados' : 'se re-ligarían'}. Clientes nuevos: ${creados.size}.`);
  if (!APPLY) console.log('Ejecuta con --apply para aplicar los cambios.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
