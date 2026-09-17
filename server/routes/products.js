const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const upload = require('../utils/upload');
const { uploadToCloudinary } = require('../utils/cloudinary');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { variaciones: true },
      orderBy: { id: 'desc' }
    });
    res.json(products);
  } catch (error) {
    console.error('Error GET /products:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variaciones: true }
    });
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    console.error('Error GET /products/:id:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// Helper para procesar FormData y Cloudinary
const processUploads = async (req) => {
  const fileData = { imagen_url: null, galeria_urls: [], varImgs: {} };
  
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const url = (await uploadToCloudinary(file.buffer, 'productos')).secure_url;
      if (file.fieldname === 'imagen') {
        fileData.imagen_url = url;
      } else if (file.fieldname === 'galeria') {
        fileData.galeria_urls.push(url);
      } else if (file.fieldname.startsWith('varImg_')) {
        const index = file.fieldname.split('_')[1];
        fileData.varImgs[index] = url;
      }
    }
  }
  return fileData;
};

// POST /api/products
router.post('/', upload.any(), async (req, res) => {
  try {
    const { imagen_url, galeria_urls, varImgs } = await processUploads(req);
    
    const body = req.body;
    let atributos = [];
    if (body.atributos) {
      try { atributos = JSON.parse(body.atributos); } catch(e){}
    }
    
    let variacionesInput = [];
    if (body.variaciones) {
      try { variacionesInput = JSON.parse(body.variaciones); } catch(e){}
    }

    const variacionesToCreate = variacionesInput.map((v, i) => ({
      valor: v.valor,
      precio: parseFloat(v.precio) || 0,
      stock: parseInt(v.stock) || 0,
      color: v.color || '#000000',
      imagen_url: varImgs[i] || v.imagen_url || null,
      costo_real: parseFloat(v.costo_real) || null
    }));

    const product = await prisma.product.create({
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion || null,
        tienda: body.tienda || null,
        marca: body.marca || null,
        flag: body.flag || null,
        preventa_inicio: body.preventa_inicio ? new Date(body.preventa_inicio) : null,
        preventa_fin: body.preventa_fin ? new Date(body.preventa_fin) : null,
        precio: parseFloat(body.precio) || null,
        stock: parseInt(body.stock) || null,
        envio_especial: parseFloat(body.envio_especial) || null,
        peso: parseFloat(body.peso) || null,
        costo_real: parseFloat(body.costo_real) || null,
        numero_serie: body.numero_serie || null,
        codigo_barras: body.codigo_barras || null,
        es_variable: body.es_variable === 'true',
        es_servicio: body.es_servicio === 'true',
        es_publico: body.es_publico === 'true',
        es_publico_pos: body.es_publico_pos !== 'false',
        slug: body.slug,
        imagen_url: imagen_url,
        galeria_urls: galeria_urls,
        atributos: atributos,
        variaciones: {
          create: variacionesToCreate
        }
      },
      include: { variaciones: true }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error POST /products:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// PUT /api/products/:id
router.put('/:id', upload.any(), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { imagen_url, galeria_urls, varImgs } = await processUploads(req);
    
    const body = req.body;
    let atributos = [];
    if (body.atributos) {
      try { atributos = JSON.parse(body.atributos); } catch(e){}
    }
    
    let variacionesInput = [];
    if (body.variaciones) {
      try { variacionesInput = JSON.parse(body.variaciones); } catch(e){}
    }

    // Get existing product to preserve existing images if not overridden
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Producto no encontrado' });

    // For variations, Prisma doesn't have a simple "replace all" for relations,
    // so we delete existing variations and create new ones.
    await prisma.productVariation.deleteMany({ where: { product_id: id } });

    const variacionesToCreate = variacionesInput.map((v, i) => ({
      valor: v.valor,
      precio: parseFloat(v.precio) || 0,
      stock: parseInt(v.stock) || 0,
      color: v.color || '#000000',
      imagen_url: varImgs[i] || v.imagen_url || null,
      costo_real: parseFloat(v.costo_real) || null
    }));

    // For gallery, frontend should pass existing gallery urls or we just replace.
    // Wait, the frontend sends the full array? No, frontend sends only new files for gallery.
    // In our browser.ts hack, we appended new urls to existing ones. But here we are the real backend.
    // If the frontend does not send the existing gallery URLs in the body, they will be lost.
    // Let's check how frontend sends it. In ProductoNuevo.vue, it only sends `galeria` files. It does NOT send existing galeria URLs!
    // We need to merge existing galeria_urls with the new ones. But how do we know if user deleted an existing one?
    // Actually, `ProductoNuevo.vue` doesn't support deleting existing gallery images perfectly if it doesn't send the updated list.
    // But let's assume `galeria_urls` = existing.galeria_urls.concat(new ones). We'll handle it properly if `galeria_urls` is passed in body.
    let finalGaleria = existing.galeria_urls || [];
    if (body.existing_galeria) {
       try { finalGaleria = JSON.parse(body.existing_galeria); } catch(e){}
    }
    finalGaleria = finalGaleria.concat(galeria_urls);

    const product = await prisma.product.update({
      where: { id },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion || null,
        tienda: body.tienda || null,
        marca: body.marca || null,
        flag: body.flag || null,
        preventa_inicio: body.preventa_inicio ? new Date(body.preventa_inicio) : null,
        preventa_fin: body.preventa_fin ? new Date(body.preventa_fin) : null,
        precio: parseFloat(body.precio) || null,
        stock: parseInt(body.stock) || null,
        envio_especial: parseFloat(body.envio_especial) || null,
        peso: parseFloat(body.peso) || null,
        costo_real: parseFloat(body.costo_real) || null,
        numero_serie: body.numero_serie || null,
        codigo_barras: body.codigo_barras || null,
        es_variable: body.es_variable === 'true',
        es_servicio: body.es_servicio === 'true',
        es_publico: body.es_publico === 'true',
        es_publico_pos: body.es_publico_pos !== 'false',
        slug: body.slug,
        imagen_url: imagen_url || existing.imagen_url,
        galeria_urls: finalGaleria,
        atributos: atributos,
        variaciones: {
          create: variacionesToCreate
        }
      },
      include: { variaciones: true }
    });

    res.json(product);
  } catch (error) {
    console.error('Error PUT /products/:id:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.product.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error DELETE /products/:id:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// POST /api/products/:id/entrada-stock — Registrar entrada de inventario
router.post('/:id/entrada-stock', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { referencia, cantidad, costo_unitario, forma_pago } = req.body;

    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    // Registrar movimiento
    await prisma.inventarioMovimiento.create({
      data: {
        product_id: id,
        tipo: 'entrada',
        cantidad: parseInt(cantidad),
        costo_unitario: costo_unitario ? parseFloat(costo_unitario) : null,
        referencia: referencia || null,
        motivo: `Entrada manual de stock. Ref: ${referencia || 'N/A'}`,
        forma_pago: forma_pago || null,
      }
    });

    // Actualizar stock del producto
    const nuevoStock = (product.stock || 0) + parseInt(cantidad);
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { stock: nuevoStock },
      include: { variaciones: true }
    });

    res.json({ success: true, producto: updatedProduct });
  } catch (error) {
    console.error('Error POST /products/:id/entrada-stock:', error);
    res.status(500).json({ error: 'Error al registrar entrada de stock' });
  }
});

// PATCH /api/products/:id/barcode — Asignar código de barras a un producto existente
router.patch('/:id/barcode', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { codigo_barras } = req.body;

    if (!codigo_barras || !codigo_barras.trim()) {
      return res.status(400).json({ error: 'El código de barras es requerido' });
    }

    const cleanCode = codigo_barras.trim();

    // Validar que el código no pertenezca a otro producto
    const existing = await prisma.product.findFirst({
      where: {
        codigo_barras: cleanCode,
        NOT: { id }
      }
    });

    if (existing) {
      return res.status(400).json({
        error: `El código "${cleanCode}" ya está asignado a "${existing.nombre}"`
      });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { codigo_barras: cleanCode },
      include: { variaciones: true }
    });

    res.json({
      message: 'Código de barras asignado con éxito',
      product: updated
    });
  } catch (error) {
    console.error('Error PATCH /products/:id/barcode:', error);
    res.status(500).json({ error: 'Error al asignar código de barras' });
  }
});

module.exports = router;
