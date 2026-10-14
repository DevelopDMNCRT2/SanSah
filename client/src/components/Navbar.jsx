import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useData } from '../context/DataContext';

const defaultIcon = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>;

const iconMap = {
  bicicletas: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>,
  zapatos: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16v-6c0-1.1.9-2 2-2h10l4 4v4H4z"/><path d="M4 16h16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2z"/><path d="M12 8v4"/><path d="M16 8v4"/></svg>,
  cascos: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  ropa: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>,
  accesorios: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3 3 3 0 0 0-3 3v4a5 5 0 0 0 10 0M12 13v7M9 18h6"/></svg>,
  llantas: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/></svg>,
  frenos: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 22a10 10 0 0 1-10-10"/></svg>,
  transmision: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M6 12l4-4 4 4-4 4z"/></svg>,
  ofertas: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
};

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useCart();
  const { products, categories } = useData();

  const dynamicCategoryGroups = React.useMemo(() => {
    if (!categories || categories.length === 0) return [];
    const columns = [];
    // Max 3 columns for layout
    const numCols = Math.min(3, Math.ceil(categories.length / 3));
    const itemsPerCol = Math.ceil(categories.length / numCols);
    
    let currentGroup = { title: "Catálogo", items: [] };
    
    categories.forEach((cat, index) => {
      const name = cat.title;
      const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const icon = iconMap[key] || defaultIcon;
      
      currentGroup.items.push({ name, icon });
      
      if (currentGroup.items.length >= itemsPerCol || index === categories.length - 1) {
        columns.push(currentGroup);
        currentGroup = { title: "Más Categorías", items: [] };
      }
    });
    
    const titles = ["Explorar", "Componentes", "Accesorios y Más"];
    columns.forEach((col, idx) => { col.title = titles[idx] || "Otras Categorías"; });
    return columns;
  }, [categories]);


  // Flatten categories for search and simple listing
  const flatCategories = categories ? categories.map(c => c.title) : [];

  // Filter Categories and Products based on search query
  const searchLower = searchQuery.toLowerCase().trim();
  const matchedCategories = searchLower ? flatCategories.filter(c => c.toLowerCase().includes(searchLower)).slice(0, 3) : [];
  const matchedProducts = searchLower ? products.filter(p => p.title.toLowerCase().includes(searchLower) || p.category.toLowerCase().includes(searchLower)).slice(0, 5) : [];

  return (
    <>
      <nav className="navbar">
        <div className="container nav-top-tier">
          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-btn" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>

          <div className="nav-brand">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>
              <img src="/logo.png" alt="SanSah Bikes" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              <div className="logo-fallback" style={{ display: 'none' }}>
                SANSAH<span style={{ color: '#D6D6D6', marginLeft: '5px' }}>BIKES</span>
              </div>
            </Link>
          </div>

          {/* New Navigation Structure */}
          <div className={`nav-main-menu ${isMenuOpen ? 'open' : ''}`}>
            <ul className="nav-links">
              <li>
                <Link to="/" className={currentPath === '/' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>
                  <span className="nav-icon"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></span>
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/nosotros" className={currentPath === '/nosotros' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>
                  <span className="nav-icon"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></span>
                  Nosotros
                </Link>
              </li>
              <li>
                <Link to="/contacto" className={currentPath === '/contacto' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>
                  <span className="nav-icon"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></span>
                  Contacto
                </Link>
              </li>
              <li 
                className={`shop-dropdown-parent highlight-categories ${isShopOpen ? 'active' : ''}`}
                onMouseEnter={() => window.innerWidth > 992 && setIsShopOpen(true)}
                onMouseLeave={() => window.innerWidth > 992 && setIsShopOpen(false)}
                onClick={() => setIsShopOpen(!isShopOpen)}
              >
                <div className="nav-shop-label">
                  <span className="nav-icon"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg></span>
                  Categorías <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: '8px', transform: isShopOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}><path d="M1 3.5L5 7.5L9 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div className={`shop-dropdown-menu mega-menu ${isShopOpen ? 'open' : ''}`}>
                  <div className="mega-menu-content">
                    {dynamicCategoryGroups.map((group, gIdx) => (
                      <div key={gIdx} className="mega-menu-column">
                        <h4 className="mega-menu-title">{group.title}</h4>
                        <div className="mega-menu-items">
                          {group.items.map((item, iIdx) => {
                            const catSlug = item.name.toLowerCase().replace(/\s+/g, '-');
                            return (
                              <Link 
                                key={iIdx}
                                to={`/categoria/${catSlug}`}
                                className="mega-menu-item"
                                onClick={() => {
                                  setIsMenuOpen(false);
                                  setIsShopOpen(false);
                                }}
                              >
                                <span className="item-icon">{item.icon}</span>
                                <span className="item-name">{item.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="nav-actions">
            
            {/* Search Trigger */}
            <button 
              className="nav-icon-btn"
              onClick={() => {setIsSearchOpen(true); setSearchQuery('')}} 
              aria-label="Abrir Búsqueda"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Fullscreen Search Overlay */}
      <div className={`search-fullscreen-overlay ${isSearchOpen ? 'open' : ''}`}>
        <button className="search-close-full" onClick={() => setIsSearchOpen(false)}>✕</button>
        
        <div className="search-full-content">
          <h2 className="search-full-title">BUSCAR</h2>
          <div className="search-input-wrapper-full">
            <input
              autoFocus={isSearchOpen}
              type="text"
              placeholder="¿Qué estás buscando?..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-full"
            />
            <div className="search-line-full"></div>
          </div>

          {searchQuery && (
            <div className="search-results-full">
              {matchedCategories.length > 0 && (
                <div className="results-group-full">
                  <h3>Categorías</h3>
                  <div className="results-grid-full">
                    {matchedCategories.map((cat, i) => (
                      <Link key={i} to={`/categoria/${cat.toLowerCase().replace(/\s+/g, '-')}`} onClick={() => {setIsSearchOpen(false); setSearchQuery('')}}>
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {matchedProducts.length > 0 && (
                <div className="results-group-full">
                  <h3>Productos</h3>
                  <div className="products-list-full">
                    {matchedProducts.map(p => (
                      <Link key={p.id} to={`/producto/${p.id}`} onClick={() => {setIsSearchOpen(false); setSearchQuery('')}} className="product-card-full">
                        <img src={p.img} alt={p.title} />
                        <div className="info">
                          <h4>{p.title}</h4>
                          <span>{p.price}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {matchedCategories.length === 0 && matchedProducts.length === 0 && (
                <p className="no-results-full">No encontramos resultados para "{searchQuery}"</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cart Drawer */}
      <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}></div>
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Tu Carrito {cartCount > 0 && `(${cartCount})`}</h2>
          <button className="close-btn" onClick={() => setIsCartOpen(false)}>✕</button>
        </div>
        
        <div className="cart-body">
          {cartItems.length === 0 ? (
            <p style={{textAlign: 'center', marginTop: '3rem', color: 'var(--text-secondary)'}}>
              Tu carrito está vacío por el momento.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {cartItems.map((item, idx) => (
                <div key={item.cartItemId || `${item.id}-${idx}`} style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                  <img 
                    src={item.img || item.raw?.imagen_url} 
                    alt={item.title} 
                    style={{ width: '64px', height: '64px', objectFit: 'contain', background: 'var(--bg-secondary)', borderRadius: '8px', padding: '4px', flexShrink: 0 }} 
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.9rem', lineHeight: '1.2' }}>{item.title}</h4>
                    {item.size && item.size !== 'Única' && (
                      <div style={{ margin: '0.15rem 0 0.35rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Sabor/Opción:</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-primary)', background: 'rgba(232, 129, 30, 0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                          {item.size}
                        </span>
                      </div>
                    )}
                    <span style={{ color: 'var(--brand-primary)', fontWeight: 'bold' }}>{item.price}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.5rem' }}>
                      <button style={{ border:'1px solid var(--glass-border)', background:'transparent', width:'24px', borderRadius:'4px', cursor:'pointer'}} onClick={() => updateQuantity(item.cartItemId || item.id, -1)}>-</button>
                      <span style={{ fontSize: '0.9rem' }}>{item.quantity}</span>
                      <button style={{ border:'1px solid var(--glass-border)', background:'transparent', width:'24px', borderRadius:'4px', cursor:'pointer'}} onClick={() => updateQuantity(item.cartItemId || item.id, 1)}>+</button>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.cartItemId || item.id)} style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }} title="Quitar">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cart-footer">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
            <span>Total:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <Link 
            to="/checkout"
            className="btn-primary" 
            style={{
              width: '100%', 
              padding: '1rem', 
              display: 'block', 
              textAlign: 'center', 
              textDecoration: 'none', 
              pointerEvents: cartItems.length === 0 ? 'none' : 'auto', 
              opacity: cartItems.length === 0 ? 0.5 : 1
            }} 
            onClick={() => setIsCartOpen(false)}
          >
            {cartItems.length === 0 ? 'Agrega Productos' : 'Proceder al Pago'}
          </Link>
        </div>
      </div>

      {/* Floating Cart Button */}
      <button 
        onClick={() => setIsCartOpen(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '60px',
          height: '60px',
          background: 'var(--brand-primary, #E8811E)',
          color: '#fff',
          borderRadius: '50%',
          boxShadow: '0 4px 20px rgba(232, 129, 30, 0.4)',
          border: 'none',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 8px 28px rgba(232, 129, 30, 0.5)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(232, 129, 30, 0.4)';
        }}
        aria-label="Abrir Carrito"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        {cartCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: '#ffffff',
            color: '#000000',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}>
            {cartCount}
          </span>
        )}
      </button>
    </>
  );
};

export default Navbar;
