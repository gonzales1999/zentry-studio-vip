-- ============================================================
-- ESQUEMA DE BASE DE DATOS PARA SUPABASE - ZENTRY VIDEO EDITOR
-- Ejecutar este script completo en el SQL Editor de Supabase:
-- https://wyswwptllfyaqabgkiap.supabase.co
-- ============================================================

-- 1. Crear tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user', -- 'user' o 'admin'
  is_vip BOOLEAN NOT NULL DEFAULT false,
  credits INTEGER NOT NULL DEFAULT 3, -- 3 créditos de bienvenida iniciales
  daily_exports_count INTEGER NOT NULL DEFAULT 0,
  last_export_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Función auxiliar y Políticas RLS sin recursión
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    lower(trim(auth.jwt() ->> 'email')) IN ('avilanorman115@gmail.com', 'jose1998.pan@gmail.com')
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Permitir lectura: usuario ve su perfil o admin ve todos
CREATE POLICY "Permitir lectura de perfiles"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id OR public.is_admin()
);

-- Permitir actualización: usuario actualiza su perfil (sin poder auto-asignarse admin, vip o más créditos) o admin actualiza cualquiera
CREATE POLICY "Permitir actualizacion de perfiles"
ON public.profiles FOR UPDATE
USING (
  auth.uid() = id OR public.is_admin()
)
WITH CHECK (
  public.is_admin() OR (
    auth.uid() = id
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    AND is_vip = (SELECT p.is_vip FROM public.profiles p WHERE p.id = auth.uid())
    AND credits <= (SELECT p.credits FROM public.profiles p WHERE p.id = auth.uid())
  )
);

-- Permitir inserción
CREATE POLICY "Permitir insercion de perfiles"
ON public.profiles FOR INSERT
WITH CHECK (
  auth.uid() = id OR public.is_admin()
);

-- 3. Función y Trigger automático al registrarse un nuevo usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT := 'user';
  is_admin_user BOOLEAN := false;
BEGIN
  -- Asignar rol de admin automáticamente únicamente a cuentas de administración exactas
  IF lower(trim(NEW.email)) IN ('avilanorman115@gmail.com', 'jose1998.pan@gmail.com') THEN
    user_role := 'admin';
    is_admin_user := true;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, is_vip, credits, daily_exports_count, last_export_date)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    user_role,
    is_admin_user,
    CASE WHEN is_admin_user THEN 999 ELSE 3 END,
    0,
    CURRENT_DATE
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = CASE 
      WHEN lower(trim(EXCLUDED.email)) IN ('avilanorman115@gmail.com', 'jose1998.pan@gmail.com') THEN 'admin' 
      ELSE public.profiles.role 
    END,
    is_vip = CASE
      WHEN lower(trim(EXCLUDED.email)) IN ('avilanorman115@gmail.com', 'jose1998.pan@gmail.com') THEN true
      ELSE public.profiles.is_vip
    END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger anterior si existe y recrear
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Función segura para procesar una exportación de video y descontar créditos
-- Regla general: Cada exportación consume 1 crédito de la cuenta.
CREATE OR REPLACE FUNCTION public.consume_export_credit(user_id UUID)
RETURNS JSON AS $$
DECLARE
  profile_rec public.profiles%ROWTYPE;
  today_date DATE := CURRENT_DATE;
  new_credits INTEGER;
BEGIN
  -- Validar autorización: el usuario autenticado solo puede consumir sus propios créditos (o ser admin)
  IF auth.uid() IS NULL OR (auth.uid() != user_id AND NOT public.is_admin()) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'No autorizado para consumir créditos de otro usuario.'
    );
  END IF;
  -- Obtener perfil actual con bloqueo para concurrencia
  SELECT * INTO profile_rec FROM public.profiles WHERE id = user_id FOR UPDATE;

  -- Si no existe en la tabla profiles, crear el registro con 2 créditos restantes (3 iniciales - 1 consumido)
  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, email, credits, daily_exports_count, last_export_date)
    VALUES (user_id, 'usuario@zentry.app', 2, 1, today_date)
    RETURNING * INTO profile_rec;

    RETURN json_build_object(
      'success', true, 
      'credits', 2,
      'daily_used', 1,
      'message', 'Primer video exportado. Se consumió 1 crédito (te quedan 2 créditos).'
    );
  END IF;

  -- Resetear contador diario si es un nuevo día
  IF profile_rec.last_export_date < today_date THEN
    profile_rec.daily_exports_count := 0;
    profile_rec.last_export_date := today_date;
  END IF;

  -- Validar créditos disponibles
  IF profile_rec.credits < 1 THEN
    RETURN json_build_object(
      'success', false, 
      'credits', 0,
      'message', 'Has agotado tus créditos disponibles (0 créditos). Recarga créditos para exportar tu video.'
    );
  END IF;

  new_credits := profile_rec.credits - 1;

  UPDATE public.profiles
  SET credits = new_credits,
      daily_exports_count = profile_rec.daily_exports_count + 1,
      last_export_date = today_date,
      updated_at = NOW()
  WHERE id = user_id;

  RETURN json_build_object(
    'success', true, 
    'credits', new_credits,
    'daily_used', profile_rec.daily_exports_count + 1,
    'message', format('Video exportado con éxito. Se consumió 1 crédito (te quedan %s créditos).', new_credits)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
REVOKE ALL ON FUNCTION public.consume_export_credit(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_export_credit(UUID) TO authenticated;
