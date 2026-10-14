const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { MercadoPagoConfig, Payment } = require('mercadopago');

// Inicializar cliente de Mercado Pago
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-0000000000000000-000000-00000000000000000000000000000000-000000000', options: { timeout: 5000 } });

// Genera un código único de 5 caracteres alfanuméricos para nuevos clientes
async function generarCodigo() {
  let codigo, existe = true;
  while (existe) {
    codigo = String(Math.floor(10000 + Math.random() * 90000));
    existe = await prisma.cliente.findUnique({ where: { codigo } });
  }
  return codigo;
}

// Genera número de orden, ej: ORD-1001
async function generarOrden() {
  const ultimo = await prisma.pedido.findFirst({ orderBy: { id: 'desc' }, select: { id: true } });
  const siguiente = (ultimo?.id ?? 0) + 1;
  return `ORD-${String(1000 + siguiente).padStart(4, '0')}`;
}

router.post('/process_payment', async (req, res) => {
  try {
    const { formData, orderData } = req.body;
    
    // Configurar Payment con los datos recibidos del Brick
    const payment = new Payment(client);
    
    // Aquí mandamos la petición real a MercadoPago para procesar el cargo
    const paymentResult = await payment.create({
      body: {
        transaction_amount: formData.transaction_amount,
        token: formData.token,
        description: 'Compra en SanSah Bikes',
        installments: formData.installments,
        payment_method_id: formData.payment_method_id,
        issuer_id: formData.issuer_id,
        payer: {
          email: formData.payer.email,
          identification: {
            type: formData.payer.identification.type,
            number: formData.payer.identification.number
          }
        }
      }
    });

    if (paymentResult.status === 'approved' || paymentResult.status === 'in_process') {
      const orden = await generarOrden();

      // Buscar o crear cliente
      let cliente = null;
      if (orderData.correo) {
        cliente = await prisma.cliente.findUnique({ where: { correo: orderData.correo } });
        if (!cliente) {
          const codigo = await generarCodigo();
          cliente = await prisma.cliente.create({
            data: {
              codigo,
              nombre: orderData.nombre || 'Cliente Tienda en Línea',
              correo: orderData.correo,
              telefono: orderData.telefono || null
            }
          });
        } else if (orderData.telefono && !cliente.telefono) {
          cliente = await prisma.cliente.update({
            where: { id: cliente.id },
            data: { telefono: orderData.telefono }
          });
        }
      }

      // Limpiar items para Prisma PedidoItem (excluyendo productoId y variationId que no existen en el modelo)
      const cleanItems = (orderData.items || []).map(item => ({
        nombre: item.nombre,
        variante: item.variante || null,
        cantidad: parseInt(item.cantidad) || 1,
        precio: parseFloat(item.precio),
        imagen: item.imagen || null
      }));

      // Procesar creación de pedido y descuento de inventario en transacción atómica
      const nuevoPedido = await prisma.$transaction(async (tx) => {
        const pedidoCreado = await tx.pedido.create({
          data: {
            orden,
            cliente_id: cliente ? cliente.id : null,
            nombre: orderData.nombre || 'Cliente Tienda en Línea',
            correo: orderData.correo,
            telefono: orderData.telefono || null,
            ciudad: orderData.ciudad || null,
            domicilio: orderData.domicilio || null,
            notas: orderData.notas || null,
            total: parseFloat(orderData.total),
            envio: parseFloat(orderData.envio) || 0,
            estado: 'Completado',
            canal_venta: 'Tienda en Línea',
            metodo_pago: 'Mercado Pago',
            items: {
              create: cleanItems
            }
          },
          include: { items: true }
        });

        // Descontar inventario para cada producto (simple o con variaciones)
        for (const item of (orderData.items || [])) {
          const qty = parseInt(item.cantidad) || 1;
          const prodId = item.productoId ? parseInt(item.productoId) : null;

          let prod = null;
          if (prodId) {
            prod = await tx.product.findUnique({
              where: { id: prodId },
              include: { variaciones: true }
            });
          }
          if (!prod && item.nombre) {
            prod = await tx.product.findFirst({
              where: { nombre: item.nombre },
              include: { variaciones: true }
            });
          }

          if (prod) {
            if (prod.es_variable) {
              let variation = null;
              if (item.variationId) {
                variation = prod.variaciones.find(v => v.id === parseInt(item.variationId));
              }
              if (!variation && item.variante && item.variante !== 'Única') {
                const normTarget = String(item.variante).toLowerCase().trim();
                variation = prod.variaciones.find(v => {
                  const vNorm = String(v.valor).toLowerCase().trim();
                  return vNorm === normTarget || vNorm.includes(normTarget) || normTarget.includes(vNorm);
                });
              }
              if (!variation && prod.variaciones.length > 0) {
                variation = prod.variaciones[0];
              }

              if (variation) {
                const currentVarStock = variation.stock || 0;
                await tx.productVariation.update({
                  where: { id: variation.id },
                  data: {
                    stock: Math.max(0, currentVarStock - qty)
                  }
                });

                // Registrar movimiento de salida
                await tx.inventarioMovimiento.create({
                  data: {
                    product_id: prod.id,
                    tipo: 'salida',
                    cantidad: qty,
                    referencia: orden,
                    motivo: `Venta online #${orden} (${variation.valor})`
                  }
                });
              }
            } else {
              // Producto simple
              const currentStock = prod.stock || 0;
              await tx.product.update({
                where: { id: prod.id },
                data: {
                  stock: Math.max(0, currentStock - qty)
                }
              });

              // Registrar movimiento de salida
              await tx.inventarioMovimiento.create({
                data: {
                  product_id: prod.id,
                  tipo: 'salida',
                  cantidad: qty,
                  referencia: orden,
                  motivo: `Venta online #${orden}`
                }
              });
            }
          }
        }

        return pedidoCreado;
      });

      res.status(200).json({ status: paymentResult.status, pedidoId: nuevoPedido.id, orden });
    } else {
      res.status(400).json({ status: paymentResult.status, message: 'Pago rechazado o en revisión' });
    }

  } catch (error) {
    console.error('Error al procesar el pago con MP:', error);
    res.status(500).json({ error: 'Hubo un problema al procesar el pago' });
  }
});

module.exports = router;
