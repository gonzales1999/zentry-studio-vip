'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, ADMIN_EMAIL, UserProfile, isAdminUser } from '../../lib/supabase';
import { AuthModal } from '../../components/AuthModal';

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    checkAdminAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) {
        await verifyAndLoad(user);
      } else {
        setUserProfile(null);
        setProfiles([]);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const verifyAndLoad = async (user: any) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setUserProfile(profile as UserProfile);
      }

      const isAllowed = isAdminUser(user, profile);

      if (isAllowed) {
        if (profile && profile.role !== 'admin') {
          await supabase.from('profiles').update({ role: 'admin', is_vip: true }).eq('id', user.id);
          setUserProfile((prev) => prev ? { ...prev, role: 'admin', is_vip: true } : null);
        }
        await loadAllProfiles();
      }
    } catch (err) {
      console.error('Error al verificar permisos de administrador:', err);
    } finally {
      setLoading(false);
    }
  };

  const executeWithAuthRetry = async <T,>(
    action: () => PromiseLike<{ data: T | null; error: any }> | Promise<{ data: T | null; error: any }>
  ): Promise<{ data: T | null; error: any }> => {
    let result = await action();
    if (result.error && (result.error.message?.toLowerCase().includes('jwt') || result.error.message?.toLowerCase().includes('token'))) {
      console.warn('JWT expirado detectado en operación admin. Renovando sesión...');
      const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession();
      if (!refreshErr && refreshData?.session) {
        setCurrentUser(refreshData.session.user);
        result = await action();
      } else {
        setAuthModalOpen(true);
      }
    }
    return result;
  };

  const checkAdminAccess = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      let { data: { session } } = await supabase.auth.getSession();

      // Si el token está ausente o expirado, intentar refrescarlo automáticamente
      const now = Math.floor(Date.now() / 1000);
      if (session?.expires_at && session.expires_at <= now + 30) {
        console.log('Renovando token próximo a expirar en panel admin...');
        const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
        if (!refreshErr && refreshed?.session) {
          session = refreshed.session;
        }
      }

      const user = session?.user ?? null;
      setCurrentUser(user);

      if (user) {
        await verifyAndLoad(user);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const loadAllProfiles = async () => {
    try {
      const result = await executeWithAuthRetry(() =>
        supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
      );

      if (result.error) {
        if (result.error.message?.toLowerCase().includes('jwt')) {
          setStatusMessage({
            text: 'Tu sesión ha caducado. Haz clic en "Iniciar Sesión" para renovar tus permisos de administrador.',
            type: 'error',
          });
          setAuthModalOpen(true);
          return;
        }
        throw result.error;
      }

      setProfiles((result.data as UserProfile[]) || []);
      setStatusMessage(null);
    } catch (err: any) {
      setStatusMessage({ text: 'Error al cargar usuarios: ' + (err?.message || err), type: 'error' });
    }
  };

  const toggleVipStatus = async (userId: string, currentVip: boolean) => {
    setActionLoadingId(userId);
    setStatusMessage(null);
    try {
      const nextVip = !currentVip;
      const result = await executeWithAuthRetry(() =>
        supabase
          .from('profiles')
          .update({ is_vip: nextVip, updated_at: new Date().toISOString() })
          .eq('id', userId)
      );

      if (result.error) throw result.error;

      setProfiles((items) =>
        items.map((p) => (p.id === userId ? { ...p, is_vip: nextVip } : p))
      );
      setStatusMessage({
        text: `Estado VIP ${nextVip ? 'ACTIVADO' : 'DESACTIVADO'} correctamente.`,
        type: 'success',
      });
    } catch (err: any) {
      setStatusMessage({ text: 'Error al cambiar VIP: ' + err.message, type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const adjustCredits = async (userId: string, currentCredits: number, delta: number) => {
    setActionLoadingId(userId);
    setStatusMessage(null);
    try {
      const nextCredits = Math.max(0, currentCredits + delta);
      const result = await executeWithAuthRetry(() =>
        supabase
          .from('profiles')
          .update({ credits: nextCredits, updated_at: new Date().toISOString() })
          .eq('id', userId)
      );

      if (result.error) throw result.error;

      setProfiles((items) =>
        items.map((p) => (p.id === userId ? { ...p, credits: nextCredits } : p))
      );
      setStatusMessage({
        text: `Créditos actualizados: ahora tiene ${nextCredits} créditos.`,
        type: 'success',
      });
    } catch (err: any) {
      setStatusMessage({ text: 'Error al ajustar créditos: ' + err.message, type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const setManualCredits = async (userId: string, value: number) => {
    if (isNaN(value) || value < 0) return;
    setActionLoadingId(userId);
    try {
      const result = await executeWithAuthRetry(() =>
        supabase
          .from('profiles')
          .update({ credits: value, updated_at: new Date().toISOString() })
          .eq('id', userId)
      );

      if (result.error) throw result.error;

      setProfiles((items) =>
        items.map((p) => (p.id === userId ? { ...p, credits: value } : p))
      );
      setStatusMessage({ text: `Créditos fijados a ${value}.`, type: 'success' });
    } catch (err: any) {
      setStatusMessage({ text: 'Error al asignar créditos: ' + err.message, type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const isAdmin = isAdminUser(currentUser, userProfile);

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-spinner" />
        <p>Cargando panel...</p>
      </div>
    );
  }

  // Si no está autenticado o no es el correo de administración
  if (!currentUser || !isAdmin) {
    return (
      <div className="admin-unauthorized-wrapper">
        <div className="admin-unauthorized-card">
          <div className="unauth-icon">🔒</div>
          <h2>Acceso Restringido</h2>
          <p>
            {currentUser
              ? `Has iniciado sesión como ${currentUser.email}, pero esta cuenta no tiene permisos de administrador.`
              : 'Por favor, inicia sesión con tu cuenta para acceder a este panel.'}
          </p>

          <div className="unauth-actions">
            {!currentUser ? (
              <button
                type="button"
                className="admin-login-btn"
                onClick={() => setAuthModalOpen(true)}
              >
                Iniciar Sesión
              </button>
            ) : (
              <button
                type="button"
                className="admin-login-btn"
                onClick={handleSignOut}
              >
                Cerrar Sesión y Cambiar de Cuenta
              </button>
            )}
            <a href="/" className="admin-back-btn">
              ← Volver al Inicio
            </a>
          </div>
        </div>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          defaultMode="login"
          onSuccess={() => {
            checkAdminAccess();
          }}
        />
      </div>
    );
  }

  // Filtrado de usuarios
  const filteredProfiles = profiles.filter(
    (p) =>
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.full_name && p.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalUsers = profiles.length;
  const vipUsers = profiles.filter((p) => p.is_vip).length;
  const totalCredits = profiles.reduce((sum, p) => sum + (p.credits || 0), 0);

  return (
    <div className="admin-layout">
      {/* Top Header */}
      <header className="admin-header">
        <div className="admin-header-container">
          <div className="admin-brand">
            <div className="admin-badge">VIP ADMIN</div>
            <h1>Panel de Control Zentry Studio</h1>
          </div>
          <div className="admin-header-right">
            <span className="admin-account-tag">
              👤 <strong>{currentUser.email}</strong>
            </span>
            <a href="/" className="admin-exit-btn">
              ← Ir al Editor
            </a>
            <button
              type="button"
              onClick={handleSignOut}
              className="admin-signout-btn"
              title="Cerrar sesión"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="admin-container">
        {statusMessage && (
          <div className={`admin-toast ${statusMessage.type}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <span>{statusMessage.text}</span>
            {(statusMessage.text.toLowerCase().includes('sesión') || statusMessage.text.toLowerCase().includes('caducad') || statusMessage.text.toLowerCase().includes('jwt')) && (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                style={{
                  background: '#ffb703',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                🔑 Iniciar Sesión Aquí
              </button>
            )}
          </div>
        )}

        {/* Global Metrics */}
        <section className="admin-metrics-grid">
          <div className="admin-metric-card">
            <div className="metric-title">Usuarios Registrados</div>
            <div className="metric-number">{totalUsers}</div>
            <div className="metric-foot">En Supabase Auth</div>
          </div>
          <div className="admin-metric-card vip">
            <div className="metric-title">Usuarios VIP Activos</div>
            <div className="metric-number">{vipUsers}</div>
            <div className="metric-foot">Con 5 exportaciones/día</div>
          </div>
          <div className="admin-metric-card credits">
            <div className="metric-title">Créditos en Circulación</div>
            <div className="metric-number">{totalCredits}</div>
            <div className="metric-foot">1 exportación = 1 crédito</div>
          </div>
        </section>

        {/* User Management Section */}
        <section className="admin-table-section">
          <div className="table-toolbar">
            <h2>Gestión de Usuarios y Permisos</h2>
            <div className="table-search">
              <input
                type="text"
                placeholder="Buscar por correo o nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="button" 
                onClick={loadAllProfiles} 
                className="refresh-btn"
                title="Recargar datos"
              >
                ↻ Actualizar
              </button>
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Membresía VIP</th>
                  <th>Créditos</th>
                  <th>Límite Hoy</th>
                  <th>Fecha Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="no-data">
                      No se encontraron usuarios en la tabla `profiles`.
                    </td>
                  </tr>
                ) : (
                  filteredProfiles.map((p) => {
                    const isCurrentUserAdmin = p.email === ADMIN_EMAIL;
                    return (
                      <tr key={p.id} className={p.is_vip ? 'vip-row' : ''}>
                        <td>
                          <div className="user-cell">
                            <strong className="user-email">{p.email}</strong>
                            <span className="user-name">{p.full_name || 'Sin nombre'}</span>
                          </div>
                        </td>

                        <td>
                          <span className={`role-badge ${p.role}`}>
                            {p.role.toUpperCase()}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            onClick={() => toggleVipStatus(p.id, p.is_vip)}
                            disabled={actionLoadingId === p.id}
                            className={`vip-toggle-btn ${p.is_vip ? 'is-vip' : 'not-vip'}`}
                          >
                            {p.is_vip ? '✦ VIP ACTIVO' : 'DAR VIP'}
                          </button>
                        </td>

                        <td>
                          <div className="credits-cell">
                            <span className="credits-counter">⚡ {p.credits}</span>
                            <div className="credits-quick-actions">
                              <button
                                type="button"
                                onClick={() => adjustCredits(p.id, p.credits, 1)}
                                disabled={actionLoadingId === p.id}
                                title="Sumar 1 crédito"
                              >
                                +1
                              </button>
                              <button
                                type="button"
                                onClick={() => adjustCredits(p.id, p.credits, 5)}
                                disabled={actionLoadingId === p.id}
                                title="Sumar 5 créditos"
                              >
                                +5
                              </button>
                              <button
                                type="button"
                                onClick={() => adjustCredits(p.id, p.credits, 10)}
                                disabled={actionLoadingId === p.id}
                                title="Sumar 10 créditos"
                              >
                                +10
                              </button>
                              <button
                                type="button"
                                onClick={() => adjustCredits(p.id, p.credits, -1)}
                                disabled={actionLoadingId === p.id || p.credits <= 0}
                                title="Restar 1 crédito"
                              >
                                -1
                              </button>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="daily-usage">
                            {p.daily_exports_count} / {p.is_vip ? '5 (VIP)' : '0 (Free)'}
                          </span>
                        </td>

                        <td>
                          <span className="date-cell">
                            {new Date(p.created_at).toLocaleDateString()}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="btn-custom-credits"
                            onClick={() => {
                              const input = prompt(
                                `Ingresa la nueva cantidad de créditos para ${p.email}:`,
                                String(p.credits)
                              );
                              if (input !== null) {
                                setManualCredits(p.id, parseInt(input, 10));
                              }
                            }}
                          >
                            Fijar Créditos
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
