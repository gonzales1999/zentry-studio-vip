'use client';

import React, { useState } from 'react';
import { supabase, isAdminUser } from '../lib/supabase';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultMode?: 'login' | 'register' | 'recovery' | 'update_password';
};

export const AuthModal = ({ isOpen, onClose, onSuccess, defaultMode = 'login' }: AuthModalProps) => {
  const [mode, setMode] = useState<'login' | 'register' | 'recovery' | 'update_password'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === 'update_password') {
        if (!password || password.length < 6) {
          throw new Error('La nueva contraseña debe tener al menos 6 caracteres.');
        }
        if (password !== confirmPassword) {
          throw new Error('Las contraseñas ingresadas no coinciden.');
        }
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setSuccessMsg('¡Contraseña actualizada con éxito! Tu sesión ha sido iniciada.');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else if (mode === 'recovery') {
        const redirectUrl = typeof window !== 'undefined' 
          ? `${window.location.origin}` 
          : undefined;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        });
        if (error) throw error;
        setSuccessMsg('¡Enlace de recuperación enviado! Revisa tu bandeja de entrada o spam para restablecer tu contraseña.');
      } else if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          try {
            const isDefaultAdmin = isAdminUser({ email });
            await supabase.from('profiles').upsert({
              id: data.user.id,
              email,
              full_name: fullName || email.split('@')[0],
              role: isDefaultAdmin ? 'admin' : 'user',
              is_vip: isDefaultAdmin,
              credits: isDefaultAdmin ? 999 : 3,
              daily_exports_count: 0,
              last_export_date: new Date().toISOString().split('T')[0],
              updated_at: new Date().toISOString(),
            }, { onConflict: 'id' });
          } catch (profileErr) {
            console.warn('Error aprovisionando perfil en registro:', profileErr);
          }
        }

        if (data.session) {
          setSuccessMsg('¡Cuenta creada con éxito! Tienes 3 créditos de bienvenida.');
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1200);
        } else {
          setSuccessMsg('¡Registro exitoso! Revisa tu correo para confirmar tu cuenta o inicia sesión.');
        }
      } else {
        const { data: signInData, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (signInData?.user) {
          try {
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id, role')
              .eq('id', signInData.user.id)
              .maybeSingle();

            const isDefaultAdmin = isAdminUser({ email: signInData.user.email || email });

            if (!existingProfile) {
              await supabase.from('profiles').upsert({
                id: signInData.user.id,
                email: signInData.user.email || email,
                full_name: signInData.user.user_metadata?.full_name || email.split('@')[0],
                role: isDefaultAdmin ? 'admin' : 'user',
                is_vip: isDefaultAdmin,
                credits: isDefaultAdmin ? 999 : 3,
                daily_exports_count: 0,
                last_export_date: new Date().toISOString().split('T')[0],
                updated_at: new Date().toISOString(),
              }, { onConflict: 'id' });
            } else if (isDefaultAdmin && existingProfile.role !== 'admin') {
              await supabase.from('profiles').update({
                role: 'admin',
                is_vip: true,
                updated_at: new Date().toISOString(),
              }).eq('id', signInData.user.id);
            }
          } catch (profileErr) {
            console.warn('Error aprovisionando perfil en inicio de sesión:', profileErr);
          }
        }

        setSuccessMsg('¡Sesión iniciada correctamente!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error inesperado';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        
        <div className="auth-header">
          <div className="auth-badge">ZENTRY STUDIO VIP</div>
          <h2>
            {mode === 'login'
              ? 'Bienvenido de vuelta'
              : mode === 'register'
              ? 'Crea tu cuenta'
              : mode === 'update_password'
              ? 'Nueva Contraseña'
              : 'Recuperar contraseña'}
          </h2>
          <p>
            {mode === 'login'
              ? 'Inicia sesión para acceder a tus créditos y exportar tus videos.'
              : mode === 'register'
              ? 'Regístrate hoy y recibe 3 créditos de exportación gratuitos.'
              : mode === 'update_password'
              ? 'Ingresa tu nueva contraseña para actualizar tu cuenta de forma segura.'
              : 'Ingresa tu correo para enviarte un enlace de restablecimiento seguro.'}
          </p>
        </div>

        {(mode === 'login' || mode === 'register') && (
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); setErrorMsg(null); setSuccessMsg(null); }}
            >
              Registrarse (3 Créditos)
            </button>
          </div>
        )}

        {errorMsg && <div className="auth-alert error">{errorMsg}</div>}
        {successMsg && <div className="auth-alert success">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="auth-field">
              <label htmlFor="fullname">Nombre completo</label>
              <input
                id="fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej. José Creador"
                required
              />
            </div>
          )}

          {mode !== 'update_password' && (
            <div className="auth-field">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>
          )}

          {mode === 'update_password' ? (
            <>
              <div className="auth-field">
                <label htmlFor="new-password">Nueva contraseña</label>
                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                />
              </div>
              <div className="auth-field">
                <label htmlFor="confirm-password">Confirmar nueva contraseña</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  minLength={6}
                  required
                />
              </div>
            </>
          ) : mode !== 'recovery' && (
            <div className="auth-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="password">Contraseña</label>
                {mode === 'login' && (
                  <button 
                    type="button" 
                    onClick={() => { setMode('recovery'); setErrorMsg(null); setSuccessMsg(null); }}
                    style={{ background: 'none', border: 'none', color: '#ff7777', fontSize: '11px', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading 
              ? 'Procesando...' 
              : mode === 'login' 
              ? 'Entrar a Zentry' 
              : mode === 'register'
              ? 'Crear Cuenta y Recibir Créditos'
              : mode === 'update_password'
              ? 'Guardar Nueva Contraseña'
              : 'Enviar Enlace de Recuperación'}
          </button>
        </form>

        <div className="auth-footer-note">
          {mode === 'login' ? (
            <span>¿Aún no tienes cuenta? <button type="button" onClick={() => setMode('register')}>Regístrate gratis</button></span>
          ) : mode === 'register' ? (
            <span>¿Ya tienes cuenta? <button type="button" onClick={() => setMode('login')}>Inicia sesión</button></span>
          ) : mode === 'update_password' ? (
            <span>¿Ya recordaste tu clave anterior? <button type="button" onClick={() => setMode('login')}>Iniciar sesión</button></span>
          ) : (
            <span>¿Recordaste tu clave? <button type="button" onClick={() => setMode('login')}>Volver a Iniciar Sesión</button></span>
          )}
        </div>
      </div>
    </div>
  );
};
