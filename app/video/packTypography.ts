export const DEFAULT_TEXT_SIZE = 58;
export type PackStyle = 'viral' | 'minimal' | 'editorial' | 'neon' | 'kinetic';
/** Every pack has two distinct fonts; Mont/Play remains a deliberate upper-font override. */
export const packTypography = (style:PackStyle,variant:'montserrat'|'playfair') => ({
  fontSize:DEFAULT_TEXT_SIZE,
  dualFont:true,
  topFontFamily:variant==='playfair' ? 'Playfair Display' : 'Montserrat',
  bottomFontFamily:({viral:'Anton',minimal:'Inter',editorial:'Pacifico',neon:'Oswald',kinetic:'Bebas Neue'} as const)[style],
  textEffect:'editorial' as const,
  inheritCaptionStyle:true,
});
