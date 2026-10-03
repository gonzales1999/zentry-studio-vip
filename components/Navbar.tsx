'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, ADMIN_EMAIL, UserProfile, isAdminUser } from '../lib/supabase';
import { AuthModal } from './AuthModal';

type NavbarProps = {
  currentView?: 'landing' | 'editor';
  onSwitchView?: (view: 'landing' | 'editor') => void;
  userProfile?: UserProfile | null;
  onRefreshProfile?: () => void;
};

export const Navbar = ({ currentView = 'landing', onSwitchView, userProfile, onRefreshProfile }: NavbarProps) => {
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(userProfile ?? null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'recovery' | 'update_password'>('login');

  useEffect(() => {
    if (userProfile !== undefined) {
      setProfile(userProfile);
    }
  }, [userProfile]);

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      }
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSessionUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setProfile(null);
      }
      if (event === 'PASSWORD_RECOVERY') {
        setAuthMode('update_password');
        setAuthModalOpen(true);
      }
    });

    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      if (hash.includes('type=recovery') || search.includes('type=recovery')) {
        setAuthMode('update_password');
        setAuthModalOpen(true);
      }
    }

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, emailCandidate?: string) => {
    try {
      // Intentar primero sincronizar y renovar créditos VIP automáticamente si es nuevo día
      const { data: syncData, error: syncError } = await supabase.rpc('sync_user_profile', { target_user_id: userId });

      let data = syncData;
      if (!data || syncError) {
        const { data: directData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        data = directData;
      }

      if (!data) {
        const userEmail = emailCandidate || sessionUser?.email || '';
        const isDefaultAdmin = isAdminUser({ email: userEmail });
        const newProfile = {
          id: userId,
          email: userEmail,
          full_name: userEmail.split('@')[0] || 'Usuario',
          role: isDefaultAdmin ? 'admin' : 'user',
          is_vip: isDefaultAdmin,
          credits: isDefaultAdmin ? 999 : 3,
          daily_exports_count: 0,
          last_export_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        };
        const { data: upsertedData } = await supabase
          .from('profiles')
          .upsert(newProfile, { onConflict: 'id' })
          .select('*')
          .single();
        if (upsertedData) data = upsertedData;
      }

      if (data) {
        setProfile(data as UserProfile);
        if (onRefreshProfile) onRefreshProfile();
      }
    } catch {
      // Ignorar si aún no existe la fila
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSessionUser(null);
    setProfile(null);
    if (onRefreshProfile) onRefreshProfile();
  };

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const isAdmin = isAdminUser(sessionUser, profile);

  return (
    <>
      <header className="zentry-navbar">
        <div className="zentry-nav-container">
          {/* Brand Logo */}
          <div 
            className="zentry-logo" 
            onClick={() => onSwitchView ? onSwitchView('landing') : undefined}
            style={{ cursor: onSwitchView ? 'pointer' : 'default' }}
          >
            <div className="logo-badge">Z</div>
            <div className="logo-text">
              <span className="logo-title">ZENTRY <span className="logo-accent">STUDIO</span></span>
              <span className="logo-subtitle">VIP SUITE ACTIVA</span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="zentry-nav-links">
            <button 
              type="button" 
              className={`nav-link-btn ${currentView === 'landing' ? 'active' : ''}`}
              onClick={() => onSwitchView ? onSwitchView('landing') : undefined}
            >
              Inicio
            </button>
            <button 
              type="button" 
              className={`nav-link-btn ${currentView === 'editor' ? 'active' : ''}`}
              onClick={() => {
                if (sessionUser) {
                  if (onSwitchView) onSwitchView('editor');
                } else {
                  openAuth('login');
                }
              }}
            >
              Editor VIP
            </button>
            {isAdmin && (
              <a 
                href="/admin" 
                className="nav-link-btn admin-link"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/admin';
                }}
              >
                ⚙ Panel Admin
              </a>
            )}
          </nav>

          {/* User state / Auth actions */}
          <div className="zentry-nav-actions">
            {sessionUser ? (
              <div className="user-profile-badge">
                <div className="user-stats">
                  {profile?.is_vip ? (
                    <span className="badge-vip" title="Límite: 5 videos diarios">VIP ✦</span>
                  ) : (
                    <span className="badge-free">Plan Free</span>
                  )}
                  <span className="badge-credits" title="1 exportación = 1 crédito">
                    ⚡ {profile ? profile.credits : 3} créditos
                  </span>
                </div>
                <div className="user-dropdown-info">
                  {isAdmin && (
                    <a 
                      href="/admin" 
                      className="badge-admin-pill" 
                      title="Abrir Panel de Administración"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = '/admin';
                      }}
                    >
                      ⚙ Admin
                    </a>
                  )}
                  <span className="user-email-text" title={sessionUser.email}>
                    {sessionUser.email?.split('@')[0]}
                  </span>
                  <button type="button" onClick={handleSignOut} className="signout-btn" title="Cerrar Sesión">
                    Salir
                  </button>
                </div>
              </div>
            ) : (
              <div className="guest-actions">
                <button type="button" onClick={() => openAuth('login')} className="btn-secondary-nav">
                  Entrar
                </button>
                <button type="button" onClick={() => openAuth('register')} className="btn-primary-nav">
                  Registrarse (3 Créditos)
                </button>
              </div>
            )}

            {currentView === 'landing' && onSwitchView && (
              <button 
                type="button" 
                onClick={() => {
                  if (sessionUser) {
                    onSwitchView('editor');
                  } else {
                    openAuth('login');
                  }
                }} 
                className="btn-accent-launch"
              >
                Abrir Editor →
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
        onSuccess={() => {
          if (sessionUser?.id) fetchProfile(sessionUser.id);
          if (onSwitchView) onSwitchView('editor');
        }}
      />
    </>
  );
};
