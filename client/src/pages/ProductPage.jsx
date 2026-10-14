import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useData } from '../context/DataContext';

const ProductPage = () => {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const { products, loading } = useData();
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [currentImage, setCurrentImage] = useState('');

  // Find product logic parsing ID explicitly
  const product = products.find(p => String(p.id) === String(productId));

  // Helper de normalización para coincidencia segura
  const normalize = (str) =>
    String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  const selectedValues = Object.values(selectedAttributes)
    .filter(Boolean)
    .map(v => normalize(v));

  // Búsqueda inteligente de la variación seleccionada
  const matchedVariation = product?.raw?.es_variable && product?.raw?.variaciones?.length > 0
    ? product.raw.variaciones.find(v => {
        if (!v || !v.valor) return false;
        const vNorm = normalize(v.valor);

        // 1. Coincidencia idéntica directa
        const fullSelectedStr = selectedValues.join(' - ');
        if (vNorm === fullSelectedStr || vNorm === selectedValues.join(' ')) {
          return true;
        }

        // 2. Si v.valor tiene formato de combinación separada por ' - '
        const vParts = v.valor.split(' - ').map(s => normalize(s));
        if (vParts.length === selectedValues.length && vParts.every((val, idx) => val === selectedValues[idx])) {
          return true;
        }

        // 3. Coincidencia inclusiva si todos los valores seleccionados están contenidos
        return selectedValues.length > 0 && selectedValues.every(val => vNorm.includes(val));
      })
    : null;

  useEffect(() => {
    if (product && product.raw && product.raw.atributos) {
      const initial = {};
      product.raw.atributos.forEach(attr => {
        const options = attr.opciones ? attr.opciones.split(',').map(o => o.trim()) : [];
        if (options.length > 0) {
          initial[attr.nombre] = options[0];
        }
      });
      setSelectedAttributes(initial);
    }
  }, [product]);

  // Actualización dinámica de imagen al cambiar variación/sabor
  useEffect(() => {
    if (matchedVariation && matchedVariation.imagen_url) {
      setCurrentImage(matchedVariation.imagen_url);
    } else if (product) {
      // Si la variación no tiene imagen_url individual, buscar en la galería del producto por nombre o índice
      let foundGalleryImg = null;
      if (matchedVariation && product.raw?.galeria_urls?.length > 0) {
        // Intentar coincidir por texto en la URL
        foundGalleryImg = product.raw.galeria_urls.find(url => {
          const urlClean = normalize(url);
          return selectedValues.some(val => val.length > 3 && urlClean.includes(val));
        });

        // O coincidir por índice posicional de la variación con la galería
        if (!foundGalleryImg) {
          const varIndex = product.raw.variaciones.findIndex(v => v.id === matchedVariation.id);
          if (varIndex >= 0 && product.raw.galeria_urls[varIndex]) {
            foundGalleryImg = product.raw.galeria_urls[varIndex];
          }
        }
      }

      setCurrentImage(foundGalleryImg || product.img);
    }
  }, [matchedVariation, selectedAttributes, product]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '150px', minHeight: '80vh', textAlign: 'center' }}>
        <p>Cargando producto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ paddingTop: '150px', minHeight: '80vh', textAlign: 'center' }}>
        <h2>Producto No Encontrado</h2>
        <p>El artículo que buscas no existe o fue retirado.</p>
        <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>Volver al Inicio</Link>
      </div>
    );
  }

  const gallery = [product.img, ...(product.raw.galeria_urls || [])].filter(Boolean);

  const handleAttributeSelect = (attrName, value) => {
    setSelectedAttributes(prev => ({ ...prev, [attrName]: value }));
  };

  const handleAddToCart = () => {
    const finalVariant = Object.values(selectedAttributes).join(' - ') || 'Única';
    const finalPrice = matchedVariation && matchedVariation.precio 
      ? `$${parseFloat(matchedVariation.precio).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
      : product.price;
    const finalImg = (matchedVariation && matchedVariation.imagen_url) || currentImage || product.img;

    addToCart({ 
      ...product, 
      size: finalVariant,
      price: finalPrice,
      img: finalImg,
      variationId: matchedVariation?.id || null,
      cartItemId: `${product.id}-${finalVariant}`
    }, quantity);
  };

  return (
    <div className="page-transition">
      <div className="container" style={{ paddingTop: '120px', minHeight: '80vh' }}>
        
        {/* Breadcrumb Navigation */}
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          <Link to="/" style={{ color: 'var(--brand-primary)', textDecoration: 'none', marginRight: '5px' }}>Inicio</Link> 
          / 
          <Link to={`/categoria/${product.category.toLowerCase().replace(/\s+/g, '-')}`} style={{ color: 'var(--brand-primary)', textDecoration: 'none', margin: '0 5px' }}>
            {product.category}
          </Link>
          / {product.title}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem', alignItems: 'flex-start' }}>
          {/* Image Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: '20px', padding: '3rem', position: 'relative', display: 'flex', justifyContent: 'center' }}>
              {product.badge && <span className="product-badge" style={{ position: 'absolute', top: '1.5rem', left: '1.5rem' }}>{product.badge}</span>}
              <img 
                src={currentImage || product.img} 
                alt={product.title} 
                style={{ width: '100%', maxWidth: '500px', objectFit: 'contain', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15))', transition: 'all 0.3s ease' }} 
              />
            </div>
            {/* Gallery Thumbnails */}
            {gallery.length > 1 && (
              <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {gallery.map((imgUrl, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setCurrentImage(imgUrl)}
                    style={{ 
                      width: '80px', height: '80px', borderRadius: '12px', background: 'var(--bg-secondary)', padding: '0.5rem', cursor: 'pointer',
                      border: currentImage === imgUrl ? '2px solid var(--brand-primary)' : '2px solid transparent',
                      transition: 'border 0.3s'
                    }}
                  >
                    <img src={imgUrl} alt={`Galeria ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <span style={{ color: 'var(--brand-primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>{product.category}</span>
              <h1 style={{ fontSize: '3rem', margin: '0.5rem 0', color: 'var(--text-accent)', lineHeight: '1.1' }}>{product.title}</h1>
              <p style={{ fontSize: '2rem', fontFamily: 'Jost', fontWeight: 'bold', color: 'var(--text-accent)' }}>
                {matchedVariation && matchedVariation.precio 
                  ? `$${parseFloat(matchedVariation.precio).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                  : product.price}
              </p>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
              {product.raw.descripcion || 'No hay descripción disponible para este producto.'}
            </p>

            {/* Dynamic Attributes Selector - Only show if product is variable */}
            {product.raw.es_variable && product.raw.atributos && product.raw.atributos.map(attr => {
              const options = attr.opciones ? attr.opciones.split(',').map(o => o.trim()) : [];
              if (options.length === 0) return null;
              
              return (
                <div key={attr.nombre} className="size-selector-container">
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-accent)', display: 'block', marginBottom: '0.8rem', textTransform: 'uppercase' }}>
                    {attr.nombre}
                  </span>
                  <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                    {options.map(opt => {
                      const hasColor = attr.colores && attr.colores[opt];
                      return (
                        <button 
                          key={opt}
                          title={opt}
                          onClick={() => handleAttributeSelect(attr.nombre, opt)}
                          className={`size-pill ${selectedAttributes[attr.nombre] === opt ? 'active' : ''}`}
                          style={
                            hasColor 
                              ? { 
                                  backgroundColor: attr.colores[opt], 
                                  color: 'transparent', 
                                  border: selectedAttributes[attr.nombre] === opt ? '3px solid var(--brand-primary)' : '1px solid var(--glass-border)', 
                                  width: '40px', 
                                  height: '40px', 
                                  borderRadius: '50%', 
                                  padding: 0,
                                  boxShadow: selectedAttributes[attr.nombre] === opt ? '0 0 10px rgba(232, 129, 30, 0.5)' : 'none'
                                }
                              : {}
                          }
                        >
                          {!hasColor && opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--glass-border)', borderRadius: '30px', padding: '0.5rem 1rem' }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '0 10px', color: 'var(--text-primary)' }}>-</button>
                <span style={{ fontWeight: 'bold', margin: '0 15px' }}>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '0 10px', color: 'var(--text-primary)' }}>+</button>
              </div>

              <button 
                className="btn-primary" 
                style={{ 
                  flex: 1, padding: '1rem', fontSize: '1.1rem', 
                  opacity: (matchedVariation ? matchedVariation.stock : (product.raw.stock === 0 ? 0 : 1)) > 0 ? 1 : 0.5, 
                  cursor: (matchedVariation ? matchedVariation.stock : (product.raw.stock === 0 ? 0 : 1)) > 0 ? 'pointer' : 'not-allowed' 
                }} 
                onClick={handleAddToCart}
                disabled={(matchedVariation ? matchedVariation.stock : (product.raw.stock === 0 ? 0 : 1)) <= 0}
              >
                {(matchedVariation ? matchedVariation.stock : (product.raw.stock === 0 ? 0 : 1)) > 0 ? 'Añadir al Carrito' : 'Agotado'}
              </button>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
              {product.raw.envio_especial ? (
                <p style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  Costo de envío especial: ${product.raw.envio_especial}
                </p>
              ) : (
                <p style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  Envío estándar (Gratis en zonas locales)
                </p>
              )}
              <p style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                Garantía SanSah (sujeta a términos de producto)
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductPage;
