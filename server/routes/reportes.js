const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/reportes/ventas
router.get('/ventas', async (req, res) => {
  try {
    const { tienda_id } = req.query; // Puede ser 'todas', id numérico o nombre de categoría

    let categoriaFiltro = null;
    if (tienda_id && tienda_id !== 'todas') {
      const parsedId = parseInt(tienda_id);
      if (!isNaN(parsedId)) {
        const cat = await prisma.categoria.findUnique({ where: { id: parsedId } });
        if (cat) categoriaFiltro = cat.nombre.toLowerCase().trim();
      }
      if (!categoriaFiltro) {
        categoriaFiltro = String(tienda_id).toLowerCase().trim();
      }
    }

    // Mapa de producto -> categoría
    const productosDB = await prisma.product.findMany({
      select: { nombre: true, tienda: true }
    });
    const productoCategoriaMap = {};
    productosDB.forEach(p => {
      productoCategoriaMap[p.nombre.toLowerCase().trim()] = p.tienda || 'General';
    });

    // Obtener pedidos completados para calcular ingresos
    const pedidos = await prisma.pedido.findMany({
      where: { estado: 'Completado' },
      include: { items: true },
      orderBy: { created_at: 'asc' }
    });

    // Meses en español
    const MESES_NOMBRES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Estructuras de acumulación
    const ventasPorMesMap = {};       // key: 'YYYY-MM' -> { total, count, categorias: {} }
    const ventasPorCategoriaMap = {}; // key: 'Categoría' -> total
    const pagosMap = {};
    const canalesMap = {};
    const productosMap = {};

    let ingresoNeto = 0;

    pedidos.forEach(p => {
      const d = new Date(p.created_at);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const mesKey = `${yyyy}-${mm}`;
      const mesNombreCorto = `${MESES_CORTOS[d.getMonth()]} ${yyyy}`;
      const mesNombreLargo = `${MESES_NOMBRES[d.getMonth()]} ${yyyy}`;

      if (!ventasPorMesMap[mesKey]) {
        ventasPorMesMap[mesKey] = {
          key: mesKey,
          nombreCorto: mesNombreCorto,
          nombreLargo: mesNombreLargo,
          total: 0,
          pedidosCount: 0,
          categorias: {}
        };
      }

      // Desglose de cada item del pedido
      let pedidoTotalValido = 0;
      let tieneItemValido = false;

      p.items.forEach(item => {
        const itemNom = (item.nombre || '').toLowerCase().trim();
        let catNombre = 'General';

        if (itemNom.startsWith('servicio:') || itemNom.includes('taller')) {
          catNombre = 'Taller';
        } else if (productoCategoriaMap[itemNom]) {
          catNombre = productoCategoriaMap[itemNom];
        }

        const itemSubtotal = (parseFloat(item.precio) || 0) * (parseInt(item.cantidad) || 1);

        // Si hay filtro por categoría, validar
        if (categoriaFiltro && catNombre.toLowerCase().trim() !== categoriaFiltro) {
          return;
        }

        tieneItemValido = true;
        pedidoTotalValido += itemSubtotal;

        // Sumar a categorías global
        ventasPorCategoriaMap[catNombre] = (ventasPorCategoriaMap[catNombre] || 0) + itemSubtotal;

        // Sumar a categorías del mes
        ventasPorMesMap[mesKey].categorias[catNombre] = (ventasPorMesMap[mesKey].categorias[catNombre] || 0) + itemSubtotal;

        // Top productos
        let prodKey = item.nombre;
        if (prodKey.startsWith('Servicio:')) prodKey = 'Servicio de Taller';
        productosMap[prodKey] = (productosMap[prodKey] || 0) + (parseInt(item.cantidad) || 1);
      });

      if (categoriaFiltro) {
        if (tieneItemValido) {
          ingresoNeto += pedidoTotalValido;
          ventasPorMesMap[mesKey].total += pedidoTotalValido;
          ventasPorMesMap[mesKey].pedidosCount += 1;

          const metodo = p.metodo_pago || 'Otro';
          pagosMap[metodo] = (pagosMap[metodo] || 0) + pedidoTotalValido;

          const canal = p.canal_venta || 'Otro';
          canalesMap[canal] = (canalesMap[canal] || 0) + pedidoTotalValido;
        }
      } else {
        ingresoNeto += p.total;
        ventasPorMesMap[mesKey].total += p.total;
        ventasPorMesMap[mesKey].pedidosCount += 1;

        const metodo = p.metodo_pago || 'Otro';
        pagosMap[metodo] = (pagosMap[metodo] || 0) + p.total;

        const canal = p.canal_venta || 'Otro';
        canalesMap[canal] = (canalesMap[canal] || 0) + p.total;
      }
    });

    // Ordenar meses cronológicamente
    const mesesKeysOrdenados = Object.keys(ventasPorMesMap).sort();
    const ventasMensualesLabels = mesesKeysOrdenados.map(k => ventasPorMesMap[k].nombreCorto);
    const ventasMensualesSeries = mesesKeysOrdenados.map(k => parseFloat(ventasPorMesMap[k].total.toFixed(2)));
    const pedidosMensualesSeries = mesesKeysOrdenados.map(k => ventasPorMesMap[k].pedidosCount);

    // Tabla consolidada mensual
    const tablaMensual = mesesKeysOrdenados.reverse().map(k => {
      const m = ventasPorMesMap[k];
      const categoriasList = Object.entries(m.categorias)
        .map(([nombre, totalCat]) => ({
          nombre,
          total: parseFloat(totalCat.toFixed(2)),
          porcentaje: m.total > 0 ? parseFloat(((totalCat / m.total) * 100).toFixed(1)) : 0
        }))
        .sort((a, b) => b.total - a.total);

      return {
        mes_key: m.key,
        mes: m.nombreLargo,
        pedidos: m.pedidosCount,
        total: parseFloat(m.total.toFixed(2)),
        ticket_promedio: m.pedidosCount > 0 ? parseFloat((m.total / m.pedidosCount).toFixed(2)) : 0,
        categorias: categoriasList
      };
    });

    // Ordenar categorías por monto de mayor a menor
    const categoriasOrdenadas = Object.entries(ventasPorCategoriaMap)
      .sort((a, b) => b[1] - a[1]);
    const ventasCategoriasLabels = categoriasOrdenadas.map(c => c[0]);
    const ventasCategoriasSeries = categoriasOrdenadas.map(c => parseFloat(c[1].toFixed(2)));

    // Top 5 productos
    const topProductos = Object.entries(productosMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Preparar filas para la tabla detallada de pedidos
    const rows = pedidos
      .filter(p => {
        if (!categoriaFiltro) return true;
        return p.items.some(item => {
          const itemNom = (item.nombre || '').toLowerCase().trim();
          const catNombre = (itemNom.startsWith('servicio:') || itemNom.includes('taller'))
            ? 'Taller'
            : (productoCategoriaMap[itemNom] || 'General');
          return catNombre.toLowerCase().trim() === categoriaFiltro;
        });
      })
      .reverse()
      .map(p => {
        const d = new Date(p.created_at);
        const fechaFormat = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
        
        let productoPrincipal = p.items.length > 0 ? p.items[0].nombre : 'Varios / Servicio';
        if (productoPrincipal.startsWith('Servicio:')) {
          productoPrincipal = 'Servicio de Taller';
        }
        
        return {
          fecha: fechaFormat,
          producto: p.items.length > 1 ? `${productoPrincipal} (+${p.items.length - 1} más)` : productoPrincipal,
          canal: p.canal_venta || 'Otro',
          pago: p.metodo_pago || 'Otro',
          total: p.total
        };
      });

    // --- EGRESOS (Gastos y Compras de Stock) ---
    const gastos = await prisma.gasto.findMany();
    const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);

    const comprasStock = await prisma.inventarioMovimiento.findMany({
      where: { tipo: 'entrada' }
    });
    
    let comprasEfectivo = 0;
    let comprasTarjeta = 0;
    let comprasTransferencia = 0;
    let comprasOtro = 0;

    comprasStock.forEach(c => {
      const costo = c.costo_unitario ? c.costo_unitario * c.cantidad : 0;
      const forma = (c.forma_pago || 'Otro').toLowerCase();
      if (forma === 'efectivo') comprasEfectivo += costo;
      else if (forma === 'tarjeta') comprasTarjeta += costo;
      else if (forma === 'transferencia' || forma === 'transf.') comprasTransferencia += costo;
      else comprasOtro += costo;
    });

    const totalCompras = comprasEfectivo + comprasTarjeta + comprasTransferencia + comprasOtro;
    const egresoTotal = totalGastos + totalCompras;

    const egresosDesgloseMap = {
      'Gastos': totalGastos,
      'Compras (Efectivo)': comprasEfectivo,
      'Compras (Tarjeta)': comprasTarjeta,
      'Compras (Transferencia)': comprasTransferencia,
    };
    if (comprasOtro > 0) egresosDesgloseMap['Compras (Otro)'] = comprasOtro;
    
    // Eliminar valores en 0
    Object.keys(egresosDesgloseMap).forEach(k => {
      if (egresosDesgloseMap[k] === 0) delete egresosDesgloseMap[k];
    });

    res.json({
      ingreso_neto: parseFloat(ingresoNeto.toFixed(2)),
      egreso_total: parseFloat(egresoTotal.toFixed(2)),
      ventas_mensuales: {
        labels: ventasMensualesLabels,
        series: ventasMensualesSeries,
        pedidos_series: pedidosMensualesSeries
      },
      ventas_por_categoria: {
        labels: ventasCategoriasLabels,
        series: ventasCategoriasSeries
      },
      tabla_mensual: tablaMensual,
      ingresos_forma_pago: {
        labels: Object.keys(pagosMap),
        series: Object.values(pagosMap).map(v => parseFloat(v.toFixed(2)))
      },
      ingresos_canal: {
        labels: Object.keys(canalesMap),
        series: Object.values(canalesMap).map(v => parseFloat(v.toFixed(2)))
      },
      egresos_desglose: {
        labels: Object.keys(egresosDesgloseMap),
        series: Object.values(egresosDesgloseMap).map(v => parseFloat(v.toFixed(2)))
      },
      top_productos: {
        labels: topProductos.map(t => t[0]),
        series: topProductos.map(t => t[1])
      },
      rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al generar reporte de ventas' });
  }
});

module.exports = router;
