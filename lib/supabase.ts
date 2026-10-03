import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wyswwptllfyaqabgkiap.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Jxd0-PpAfOyIFhmDhd8cXw_CvE9BwI5';

export const ADMIN_EMAIL = 'avilanorman115@gmail.com';
export const ADMIN_EMAILS = [
  'avilanorman115@gmail.com',
  'jose1998.pan@gmail.com',
];

export const isAdminUser = (user?: { email?: string | null } | null, profile?: UserProfile | null): boolean => {
  if (profile?.role === 'admin') return true;
  if (!user?.email) return false;
  const cleanEmail = user.email.toLowerCase().trim();
  return (
    ADMIN_EMAILS.some((adm) => adm.toLowerCase().trim() === cleanEmail) ||
    cleanEmail === (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').toLowerCase().trim()
  );
};

export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'user' | 'admin';
  is_vip: boolean;
  credits: number;
  daily_exports_count: number;
  last_export_date: string;
  created_at: string;
  updated_at: string;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
