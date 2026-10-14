import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';

// Inicializar Mercado Pago
// Reemplaza el string por tu PUBLIC_KEY real en el archivo .env o aquí directamente para pruebas
initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY || 'TEST-00000000-0000-0000-0000-000000000000', { locale: 'es-MX' });

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    ciudad: '',
    domicilio: '',
    notas: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentSubmit = async (paymentFormData) => {
    // Validar primero nuestros datos de envío
    if (!formData.nombre || !formData.correo || !formData.telefono || !formData.ciudad || !formData.domicilio) {
      setError('Por favor, completa todos los campos obligatorios de contacto y envío antes de procesar el pago.');
      return new Promise((resolve, reject) => reject());
    }

    if (cartItems.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    return new Promise(async (resolve, reject) => {
      try {
        const orderItems = cartItems.map(item => ({
          productoId: item.raw ? item.raw.id : item.id,
          variationId: item.variationId || null,
          nombre: item.title,
          cantidad: item.quantity,
          precio: parseFloat(item.price.replace(/[^0-9.-]+/g, "")),
          variante: item.size || 'Única',
          imagen: item.img
        }));

        const payloadData = {
          ...paymentFormData,
          payer: {
            ...paymentFormData.payer,
            email: formData.correo
          }
        };

        const API_URL = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${API_URL}/api/mercadopago/process_payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formData: payloadData,
            orderData: {
              nombre: formData.nombre,
              correo: formData.correo,
              telefono: formData.telefono,
              ciudad: formData.ciudad,
              domicilio: formData.domicilio,
              notas: formData.notas,
              total: cartTotal,
              envio: 0,
              items: orderItems
            }
          })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Error al procesar el pago. Revisa los datos de tu tarjeta.');
        
        clearCart();
        setIsSuccess(true);
        resolve();
      } catch (err) {
        console.error(err);
        setError(err.message);
        setIsSubmitting(false);
        reject();
      }
    });
  };

  const onError = (err) => {
    console.error('Error de Mercado Pago Brick:', err);
  };

  const onReady = () => {
    console.log('Mercado Pago Brick is ready');
  };

  if (isSuccess) {
    return (
      <div className="page-transition" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', background: 'var(--bg-secondary)', padding: '4rem', borderRadius: '20px', maxWidth: '600px', margin: '0 auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
          <div style={{ width: '80px', height: '80px', background: 'var(--brand-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--text-accent)', marginBottom: '1rem' }}>¡Pago Exitoso!</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '2rem' }}>
            Gracias por tu compra, <strong>{formData.nombre}</strong>. Hemos recibido tu pago y tu pedido. Pronto nos pondremos en contacto contigo para los detalles de envío.
          </p>
          <Link to="/" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', padding: '1rem 2rem' }}>
            Seguir Comprando
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="page-transition" style={{ minHeight: '80vh', paddingTop: '150px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--text-accent)', marginBottom: '1rem' }}>Tu carrito está vacío</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Aún no has agregado productos para procesar un pago.</p>
          <Link to="/categoria/ofertas" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>Explorar Productos</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition">
      <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px', minHeight: '80vh' }}>
        
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', color: 'var(--text-accent)'}}>Finalizar Compra</h1>
          <p style={{ color: 'var(--text-secondary)'}}>Completa tus datos y paga de forma segura</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem', alignItems: 'start' }}>
          
          {/* Columna Izquierda: Formulario */}
          <div style={{ background: 'var(--bg-secondary)', padding: '2.5rem', borderRadius: '20px' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-accent)', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              1. Datos de Contacto y Envío
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nombre Completo *</label>
                <input 
                  type="text" 
                  name="nombre" 
                  required 
                  value={formData.nombre} 
                  onChange={handleChange}
                  style={{ width: '100%', padding: '1rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none' }}
                  placeholder="Ej. Carlos Pérez"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Correo Electrónico *</label>
                  <input 
                    type="email" 
                    name="correo" 
                    required 
                    value={formData.correo} 
                    onChange={handleChange}
                    style={{ width: '100%', padding: '1rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none' }}
                    placeholder="tucorreo@ejemplo.com"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Teléfono *</label>
                  <input 
                    type="tel" 
                    name="telefono" 
                    required 
                    value={formData.telefono} 
                    onChange={handleChange}
                    style={{ width: '100%', padding: '1rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none' }}
                    placeholder="Ej. 55 1234 5678"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Ciudad / Estado *</label>
                <input 
                  type="text" 
                  name="ciudad" 
                  required 
                  value={formData.ciudad} 
                  onChange={handleChange}
                  style={{ width: '100%', padding: '1rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none' }}
                  placeholder="Ej. Guadalajara, Jalisco"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Domicilio Exacto *</label>
                <input 
                  type="text" 
                  name="domicilio" 
                  required 
                  value={formData.domicilio} 
                  onChange={handleChange}
                  style={{ width: '100%', padding: '1rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none' }}
                  placeholder="Calle, Número, Colonia, C.P."
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Notas del Pedido (Opcional)</label>
                <textarea 
                  name="notas" 
                  rows="3"
                  value={formData.notas} 
                  onChange={handleChange}
                  style={{ width: '100%', padding: '1rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
                  placeholder="Instrucciones especiales para la entrega, etc."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Resumen y Pago MP */}
          <div style={{ background: 'var(--bg-secondary)', padding: '2.5rem', borderRadius: '20px', position: 'sticky', top: '100px' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-accent)', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              2. Resumen de Compra
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {cartItems.map((item, idx) => (
                <div key={`${item.id}-${idx}`} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img src={item.img} alt={item.title} style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'contain', background: 'var(--bg-primary)', padding: '5px' }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: '0 0 0.2rem 0' }}>{item.title}</h4>
                    {item.size && item.size !== 'Única' && (
                      <div style={{ margin: '0.2rem 0' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-primary)', background: 'rgba(232, 129, 30, 0.1)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>
                          Sabor / Opción: {item.size}
                        </span>
                      </div>
                    )}
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Cant: {item.quantity}</p>
                  </div>
                  <div style={{ fontWeight: 'bold', color: 'var(--brand-primary)' }}>
                    ${(parseFloat(item.price.replace(/[^0-9.-]+/g, "")) * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>${cartTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-accent)', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                <span>Total a Pagar</span>
                <span>${cartTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(255,0,0,0.1)', color: '#ff4d4f', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-accent)', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              3. Pago Seguro
            </h2>

            {/* Brick de Mercado Pago Integrado */}
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '10px' }}>
              <CardPayment
                initialization={{ 
                  amount: cartTotal,
                  payer: { email: 'cliente@sansah.com' } // Se envía un dummy inicial para ocultar el campo en el iframe
                }}
                customization={{
                  paymentMethods: {
                    minInstallments: 1,
                    maxInstallments: 12
                  }
                }}
                onSubmit={handlePaymentSubmit}
                onReady={onReady}
                onError={onError}
              />
            </div>
            
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
