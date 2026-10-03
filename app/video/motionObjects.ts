import type {MotionGraphicItem} from './types';
export type MotionObjectTheme = 'technology' | 'finance' | 'conversation' | 'learning' | 'growth';
/** Deterministic local keyword selection, not paid AI. */
export const motionObjectTheme = (item:MotionGraphicItem):MotionObjectTheme => {
  if(item.objectSet && !['auto','icon','off'].includes(item.objectSet)) return item.objectSet as MotionObjectTheme;
  const text=(item.objectContext ?? `${item.title} ${item.subtitle || ''} ${(item.objects3d || []).join(' ')}`).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  if(/\b(dinero|venta\w*|precio\w*|credito\w*|negocio\w*|ingreso\w*|money|sales|profit)\b/.test(text)) return 'finance';
  if(/\b(curso\w*|aprend\w*|clase\w*|modulo\w*|leccion\w*|educa\w*|learn\w*|book)\b/.test(text)) return 'learning';
  if(/\b(comunidad\w*|mensaje\w*|comunic\w*|convers\w*|habl\w*|chat\w*|message\w*)\b/.test(text)) return 'conversation';
  if(/\b(crec\w*|resultado\w*|exito\w*|meta\w*|estadistic\w*|growth|success)\b/.test(text)) return 'growth';
  return 'technology';
};
export const motionObjectMode = (item:MotionGraphicItem) => item.objectSet ?? (item.textSource==='manual' ? 'icon' : 'auto');
