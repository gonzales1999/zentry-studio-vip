'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AuthModal } from './AuthModal';

type LandingPageProps = {
  onStartEditing: () => void;
  isLoggedIn?: boolean;
};

export const LandingPage = ({ onStartEditing, isLoggedIn }: LandingPageProps) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleEnterEditor = () => {
    if (isLoggedIn) {
      onStartEditing();
    } else {
      openAuth('login');
    }
  };

  const handleRegisterCta = () => {
    if (isLoggedIn) {
      onStartEditing();
    } else {
      openAuth('register');
    }
  };

  return (
    <div className="landing-wrapper">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-glow" />
        <div className="landing-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-pulse" />
              <span>NUEVO MOTOR 2026 • 100% EN TU NAVEGADOR</span>
            </div>

            <h1 className="hero-title">
              Crea Videos Virales en Segundos con <span className="highlight-text">ZENTRY STUDIO</span>
            </h1>

            <p className="hero-description">
              Sube tu video crudo y deja que la IA transcriba, sincronice subtítulos dinámicos estilo Hormozi, 
              corte silencios y renderice en 1080p con máxima velocidad y nitidez.
            </p>

            <div className="hero-cta-group">
              <button 
                type="button" 
                onClick={handleRegisterCta} 
                className="hero-primary-btn"
              >
                <span>⚡ {isLoggedIn ? 'Abrir Zentry Studio' : 'Comenzar a Crear Gratis'}</span>
                <span className="cta-subtext">{isLoggedIn ? 'Ir a tu mesa de trabajo' : 'Inicia sesión o regístrate para 3 créditos'}</span>
              </button>

              {!isLoggedIn && (
                <button 
                  type="button" 
                  onClick={() => openAuth('login')} 
                  className="hero-secondary-btn"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="hero-metrics-bar">
              <div className="metric-item">
                <span className="metric-value">0 s</span>
                <span className="metric-label">Tiempo de subida a servidores</span>
              </div>
              <div className="metric-divider" />
              <div className="metric-item">
                <span className="metric-value">16+</span>
                <span className="metric-label">Estilos de Subtítulos Virales</span>
              </div>
              <div className="metric-divider" />
              <div className="metric-item">
                <span className="metric-value">1080p</span>
                <span className="metric-label">Exportación WebCodecs HD</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Mockup */}
          <div className="hero-visual-frame">
            <div className="mockup-container">
              <img 
                src="/assets/zentry-hero-mockup.jpg" 
                alt="Zentry Studio Interfaz" 
                className="mockup-img"
              />
              <div className="mockup-overlay-badge">
                <span className="badge-icon">✦</span>
                <div>
                  <strong>Zentry Studio VIP</strong>
                  <p>Renderizado instantáneo en tu pantalla</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="features-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-kicker">HERRAMIENTAS PROFESIONALES</span>
            <h2 className="section-title">Todo lo que necesitas para dominar TikTok y Reels</h2>
            <p className="section-subtitle">
              Diseñado específicamente para creadores de contenido, marcas y agencias que buscan máxima retención de audiencia.
            </p>
          </div>

          <div className="features-banner-container">
            <img 
              src="/assets/zentry-features.jpg" 
              alt="Presets de Subtítulos y Detección de Voz" 
              className="features-banner-img"
            />
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Transcripción Automática y Precisa</h3>
              <p>
                Sincronización instantánea de palabras y tiempos exactos. Aviso importante: mantén el navegador abierto mientras se procesa para que la exportación finalice con éxito.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✂️</div>
              <h3>Corte Inteligente de Silencios</h3>
              <p>
                Detecta y elimina automáticamente las pausas muertas y respiraciones con un solo clic para mantener un ritmo dinámico y atrapante.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔥</div>
              <h3>Ganchos / Hooks Iniciales</h3>
              <p>
                Capas de títulos de alto impacto en los primeros 3 segundos con animaciones elásticas para evitar que los usuarios deslicen tu video.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎬</div>
              <h3>B-Roll y Overlays Cinemáticos</h3>
              <p>
                Superposiciones de Film Burn, Flash, Fireflies y B-rolls con transiciones de zoom, slide y efectos de sonido de tipeo sincronizados.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>WebCodecs Exportación Directa</h3>
              <p>
                El render de video utiliza la potencia de tu procesador y tarjeta gráfica con Remotion Web Renderer para generar tu MP4 en segundos.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🛡</div>
              <h3>Gestión de Membresías y Créditos</h3>
              <p>
                Sistema integrado con Supabase para control de cuotas diarias VIP, créditos de exportación y administración centralizada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing and Limits Section */}
      <section className="pricing-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-kicker">PLANES Y CRÉDITOS</span>
            <h2 className="section-title">Elige cómo quieres crear</h2>
            <p className="section-subtitle">
              Comienza gratis con 3 créditos de bienvenida. Pasa a VIP para exportar hasta 5 videos diarios.
            </p>
          </div>

          <div className="pricing-cards-grid">
            {/* Free Plan */}
            <div className="pricing-card">
              <div className="pricing-card-header">
                <h3>Plan Gratuito</h3>
                <p className="pricing-desc">Ideal para probar el potencial viral de Zentry.</p>
                <div className="pricing-price">
                  <span className="currency">$</span>
                  <span className="amount">0</span>
                  <span className="period">/ registro</span>
                </div>
              </div>

              <ul className="pricing-features">
                <li>✓ <strong>3 Créditos de regalo</strong> al crear tu cuenta</li>
                <li>✓ <strong>1 Exportación = 1 Crédito</strong></li>
                <li>✓ Acceso a todos los 16 presets de subtítulos</li>
                <li>✓ Transcripción rápida con IA</li>
                <li>✓ Corte de silencios automático</li>
                <li>✓ Exportación MP4 1080p (con marca de agua Zentry Studio VIP)</li>
              </ul>

              <button 
                type="button" 
                onClick={handleRegisterCta} 
                className="pricing-btn-secondary"
              >
                Comenzar con 3 Créditos
              </button>
            </div>

            {/* VIP Plan */}
            <div className="pricing-card featured">
              <div className="featured-badge">MÁS POPULAR</div>
              <div className="pricing-card-header">
                <h3>Membresía VIP</h3>
                <p className="pricing-desc">Para creadores activos y marcas que publican a diario.</p>
                <div className="pricing-price">
                  <span className="currency">✦</span>
                  <span className="amount">VIP</span>
                  <span className="period">/ Creador</span>
                </div>
              </div>

              <ul className="pricing-features">
                <li>✓ <strong>Exportaciones 1080p SIN marca de agua</strong></li>
                <li>✓ <strong>5 créditos diarios renovables</strong> (hasta 5 videos por día, no acumulables)</li>
                <li>✓ Si no consumes tus 5 videos en el día, se mantienen tus 5</li>
                <li>✓ <strong>1 Exportación = 1 Crédito</strong></li>
                <li>✓ Soporte prioritario del administrador</li>
                <li>✓ Todos los efectos de audio y B-roll desbloqueados</li>
                <li>✓ Activación y recargas directas desde el panel de control</li>
              </ul>

              <button 
                type="button" 
                onClick={() => openAuth('register')} 
                className="pricing-btn-primary"
              >
                Solicitar Acceso VIP
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section">
        <div className="landing-container">
          <div className="final-cta-box">
            <h2>¿Listo para que tus videos se vuelvan virales?</h2>
            <p>Únete a los creadores que ahorran horas de edición y aumentan su retención hasta un 400%.</p>
            <button 
              type="button" 
              onClick={handleEnterEditor} 
              className="final-cta-btn"
            >
              Abrir Zentry Studio Ahora →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container footer-content">
          <div className="footer-brand">
            <span className="brand-badge">Z</span>
            <strong>Zentry Studio</strong>
            <p>© 2026 Zentry Studio VIP. Todos los derechos reservados.</p>
          </div>
          <div className="footer-links">
            <button type="button" onClick={handleEnterEditor}>Editor</button>
            <button type="button" onClick={() => openAuth('login')}>Iniciar Sesión</button>
            <button type="button" onClick={() => openAuth('register')}>Registrarse</button>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
        onSuccess={onStartEditing}
      />
    </div>
  );
};
