export type CaptionStyleId =
  // --- Estilos de Zentry inspirados en referencias editoriales ---
  | 'estebanStyle'
  | 'editorialStory'
  | 'impactoStats'
  | 'motivacionalDual'
  | 'instagramOrange'
  | 'minimalistaClean'
  | 'magazineEditorial'
  | 'simpleBasic'
  | 'helveticaBold'
  | 'aniStyle'
  | 'boldCaps'
  // --- Estilos Clásicos Zentry & CapCut ---
  | 'personal'
  | 'hormozi'
  | 'editorial'
  | 'helvetica'
  | 'compact'
  | 'neon'
  | 'impact'
  | 'rounded'
  | 'minimal'
  | 'elegant'
  | 'yellow-box'
  | 'capcut-pop'
  | 'capcut-comic'
  | 'capcut-bubble'
  | 'capcut-hand'
  | 'capcut-story';

export type CaptionPreset = {
  id: CaptionStyleId;
  name: string;
  sample: [string, string];
  accent: string;
  className: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle?: 'normal' | 'italic';
  textTransform?: 'uppercase' | 'none';
  background?: string;
  description?: string;
  fontSecondary?: string;
  highlightStyle?: 'color' | 'background' | 'glow' | 'scale' | 'underline';
};

export const CAPTION_PRESETS: CaptionPreset[] = [
  // ==========================================
  // PRESETS ZENTRY: IDs estables para proyectos y plantillas guardadas
  // ==========================================
  {
    id: 'estebanStyle',
    name: 'Esteban Style',
    sample: ['Entiende tus emociones', 'DOMINA TU MENTE'],
    accent: '#00F5C8',
    className: 'style-esteban',
    fontFamily: 'Montserrat',
    fontSecondary: 'Great Vibes',
    fontSize: 98,
    fontWeight: 900,
    textTransform: 'uppercase',
    highlightStyle: 'color',
    description: 'Script cursivo con acento azul-limón. Elegancia viral de alto impacto.',
  },
  {
    id: 'editorialStory',
    name: 'Editorial Story',
    sample: ['Una sola idea', 'PUEDE CAMBIARLO TODO'],
    accent: '#00D4FF',
    className: 'style-editorial-story',
    fontFamily: 'Playfair Display',
    fontSecondary: 'Montserrat',
    fontSize: 88,
    fontWeight: 700,
    fontStyle: 'italic',
    textTransform: 'none',
    highlightStyle: 'glow',
    description: 'Serif elegante + cursiva narrativa con resplandor glow cinematográfico.',
  },
  {
    id: 'impactoStats',
    name: 'Impacto Stats',
    sample: ['+500%', 'CRECIMIENTO EXPONENCIAL'],
    accent: '#FFD700',
    className: 'style-impacto-stats',
    fontFamily: 'Anton',
    fontSecondary: 'Bebas Neue',
    fontSize: 110,
    fontWeight: 400,
    textTransform: 'uppercase',
    highlightStyle: 'scale',
    description: 'Números amarillos gigantes. Máximo impacto para métricas y datos.',
  },
  {
    id: 'motivacionalDual',
    name: 'Motivacional',
    sample: ['DESPIERTA TU', 'VERDADERO PODER'],
    accent: '#00FF66',
    className: 'style-motivacional',
    fontFamily: 'Montserrat',
    fontSecondary: 'Montserrat',
    fontSize: 96,
    fontWeight: 900,
    textTransform: 'uppercase',
    highlightStyle: 'color',
    description: 'Montserrat ultra bold con palabra destacada en verde neón 3D.',
  },
  {
    id: 'instagramOrange',
    name: 'Instagram Viral',
    sample: ['NO COMETAS', 'ESTE ERROR'],
    accent: '#FF6B00',
    className: 'style-instagram-orange',
    fontFamily: 'Anton',
    fontSecondary: 'Montserrat',
    fontSize: 104,
    fontWeight: 400,
    textTransform: 'uppercase',
    highlightStyle: 'scale',
    description: 'Tipografía condensada con palabra naranja viral estilo Alex Hormozi.',
  },
  {
    id: 'minimalistaClean',
    name: 'Minimal Clean',
    sample: ['CLARIDAD ABSOLUTA', 'SIN DISTRACCIONES'],
    accent: '#00BFFF',
    className: 'style-minimal-clean',
    fontFamily: 'Inter',
    fontSecondary: 'Inter',
    fontSize: 74,
    fontWeight: 800,
    textTransform: 'uppercase',
    highlightStyle: 'color',
    description: 'Limpio y profesional. Perfecto para marcas personales y contenido tech.',
  },
  {
    id: 'magazineEditorial',
    name: 'Magazine Editorial',
    sample: ['El arte de', 'SER DIFERENTE'],
    accent: '#FFFFFF',
    className: 'style-magazine',
    fontFamily: 'Playfair Display',
    fontSecondary: 'Montserrat',
    fontSize: 84,
    fontWeight: 700,
    fontStyle: 'italic',
    textTransform: 'none',
    highlightStyle: 'underline',
    description: 'Estilo revista de moda internacional con combinación tipográfica mixta.',
  },
  {
    id: 'simpleBasic',
    name: 'Simple Basic',
    sample: ['Todo comienza con', 'un primer paso'],
    accent: '#00D4FF',
    className: 'style-simple-basic',
    fontFamily: 'Nunito',
    fontSecondary: 'Nunito',
    fontSize: 82,
    fontWeight: 800,
    textTransform: 'none',
    highlightStyle: 'color',
    description: 'Tipografía redondeada, tamaño constante y lectura súper fluida.',
  },
  {
    id: 'helveticaBold',
    name: 'Helvetica Bold',
    sample: ['LA DISCIPLINA', 'CREA LIBERTAD'],
    accent: '#FFFFFF',
    className: 'style-helvetica-bold',
    fontFamily: 'Helvetica Neue',
    fontSecondary: 'Times New Roman',
    fontSize: 76,
    fontWeight: 900,
    textTransform: 'uppercase',
    highlightStyle: 'color',
    description: 'Doble tipografía: introducción clásica e impacto moderno en Helvetica.',
  },
  {
    id: 'aniStyle',
    name: 'Ani Style',
    sample: ['Encuentra tu ritmo', 'Y PERSISTE'],
    accent: '#FFFFFF',
    className: 'style-ani-style',
    fontFamily: 'Inter',
    fontSecondary: 'Playfair Display',
    fontSize: 80,
    fontWeight: 800,
    textTransform: 'none',
    highlightStyle: 'color',
    description: 'Inter limpio con acento ocasional en Playfair cursiva estética.',
  },
  {
    id: 'boldCaps',
    name: 'Bold Caps',
    sample: ['ESTO CAMBIA', 'EL JUEGO'],
    accent: '#FFD400',
    className: 'style-bold-caps',
    fontFamily: 'Montserrat',
    fontSecondary: 'Montserrat',
    fontSize: 84,
    fontWeight: 900,
    textTransform: 'uppercase',
    background: '#FFD400',
    highlightStyle: 'background',
    description: 'Mayúsculas en bloque compacto con resalte en caja amarilla sólida.',
  },

  // ==========================================
  // ESTILOS ADICIONALES CLÁSICOS ZENTRY & CAPCUT
  // ==========================================
  { id: 'personal', name: 'Zentry Viral', sample: ['DOMINA', 'TU MENSAJE'], accent: '#00f5c8', className: 'style-personal', fontFamily: 'Anton', fontSize: 112, fontWeight: 400, textTransform: 'uppercase' },
  { id: 'hormozi', name: 'Hormozi Classic', sample: ['NO HAGAS', 'ESTO'], accent: '#ff6b00', className: 'style-hormozi', fontFamily: 'Montserrat', fontSize: 96, fontWeight: 900, textTransform: 'uppercase' },
  { id: 'editorial', name: 'Editorial Serif', sample: ['Una idea puede', 'cambiarlo todo'], accent: '#c20000', className: 'style-editorial', fontFamily: 'Playfair Display', fontSize: 82, fontWeight: 700, fontStyle: 'italic', textTransform: 'none' },
  { id: 'helvetica', name: 'Helvetica Box', sample: ['CREA ALGO', 'MEMORABLE'], accent: '#fef4b4', className: 'style-helvetica', fontFamily: 'Helvetica Neue', fontSize: 72, fontWeight: 900, textTransform: 'uppercase' },
  { id: 'compact', name: 'Compact Bold', sample: ['MIRA ESTO', 'AHORA'], accent: '#ff3158', className: 'style-compact', fontFamily: 'Inter', fontSize: 82, fontWeight: 900, textTransform: 'uppercase' },
  { id: 'neon', name: 'Neon Punch', sample: ['HAZLO', 'DIFERENTE'], accent: '#d7ff27', className: 'style-neon', fontFamily: 'Bebas Neue', fontSize: 106, fontWeight: 400, textTransform: 'uppercase' },
  { id: 'impact', name: 'Impact Pro', sample: ['NUNCA', 'TE RINDAS'], accent: '#ffd400', className: 'style-impact', fontFamily: 'Anton', fontSize: 104, fontWeight: 400, textTransform: 'uppercase' },
  { id: 'rounded', name: 'Soft Creator', sample: ['Tu historia', 'importa'], accent: '#ff75c8', className: 'style-rounded', fontFamily: 'Nunito', fontSize: 80, fontWeight: 900, textTransform: 'none' },
  { id: 'minimal', name: 'Minimal Mono', sample: ['MENOS RUIDO', 'MÁS CLARIDAD'], accent: '#79a8ff', className: 'style-minimal', fontFamily: 'Inter', fontSize: 68, fontWeight: 800, textTransform: 'uppercase' },
  { id: 'elegant', name: 'Elegant Script', sample: ['Cuenta tu', 'historia'], accent: '#f6d79c', className: 'style-elegant', fontFamily: 'Great Vibes', fontSize: 92, fontWeight: 400, textTransform: 'none' },
  { id: 'yellow-box', name: 'Yellow Box', sample: ['ESTO ES', 'IMPORTANTE'], accent: '#111111', className: 'style-yellow-box', fontFamily: 'Montserrat', fontSize: 78, fontWeight: 900, textTransform: 'uppercase', background: '#ffd400' },
  { id: 'capcut-pop', name: 'CapCut Pop', sample: ['HAZ QUE', 'RESALTE'], accent: '#ffe24a', className: 'style-capcut-pop', fontFamily: 'DynaPuff', fontSize: 86, fontWeight: 600, textTransform: 'uppercase' },
  { id: 'capcut-comic', name: 'CapCut Comic', sample: ['MIRA ESTE', 'CAMBIO'], accent: '#ff7433', className: 'style-capcut-comic', fontFamily: 'Coiny', fontSize: 88, fontWeight: 400, textTransform: 'uppercase' },
  { id: 'capcut-bubble', name: 'CapCut Bubble', sample: ['NUEVA', 'IDEA'], accent: '#48e8ff', className: 'style-capcut-bubble', fontFamily: 'Sigmar One', fontSize: 82, fontWeight: 400, textTransform: 'uppercase' },
  { id: 'capcut-hand', name: 'CapCut Hand', sample: ['Una historia', 'real'], accent: '#ff4a55', className: 'style-capcut-hand', fontFamily: 'Amatic SC', fontSize: 108, fontWeight: 700, textTransform: 'none' },
  { id: 'capcut-story', name: 'CapCut Story', sample: ['Cuenta algo', 'memorable'], accent: '#ffd783', className: 'style-capcut-story', fontFamily: 'Corben', fontSize: 72, fontWeight: 700, textTransform: 'none' },
];

export const getCaptionPreset = (id: CaptionStyleId) =>
  CAPTION_PRESETS.find((preset) => preset.id === id) ?? CAPTION_PRESETS[0];
