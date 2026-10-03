// Contextual Sound Engine for Zentry Studio
// Automatically detects semantic triggers in speech and assigns appropriate SFX

export interface SfxTriggerEvent {
  id: string;
  timeSec: number;
  sfxSrc: string;
  label: string;
  category: 'hook' | 'keyword' | 'broll' | 'motion';
  volume: number;
}

export type ContextualSfxEvent = SfxTriggerEvent;

export interface SoundKeywordRule {
  keywords: string[];
  sfxSrc: string;
  label: string;
}

export interface GenerateContextualSfxOptions {
  transcriptText?: string;
  captions?: Array<{ text: string; startMs: number; endMs: number }>;
  customBrolls?: Array<{ start: number; duration: number }>;
  motionGraphicsItems?: Array<{ start: number; duration: number }>;
  hookSfxEnabled?: boolean;
  hookLeadDuration?: number;
}

export const SOUND_KEYWORD_RULES: SoundKeywordRule[] = [
  // Dinero / Finanzas / Negocios / Crecimiento
  {
    keywords: [
      'dinero', 'dólares', 'dolares', 'euros', 'pesos', 'ganar', 'ganancia', 'ventas',
      'facturar', 'facturación', 'negocio', 'empresa', 'crecimiento', 'riqueza',
      'millones', 'inversión', 'inversion', 'éxito', 'exito', 'rentable', 'cash', 'precio'
    ],
    sfxSrc: '/assets/sfx/cha-ching-cash.wav',
    label: 'Caja Registradora (Dinero)',
  },
  // Alerta / Error / Cuidado / Peligro
  {
    keywords: [
      'error', 'errores', 'alerta', 'cuidado', 'peligro', 'no cometas', 'no hagas',
      'problema', 'fallo', 'trampa', 'grave', 'prohibido', 'basta', 'peor', 'falso'
    ],
    sfxSrc: '/assets/sfx/glitch-static.wav',
    label: 'Glitch Alerta (Peligro/Error)',
  },
  // Notificación / Mensaje / Comunicación
  {
    keywords: [
      'notificación', 'notificacion', 'mensaje', 'whatsapp', 'celular', 'teléfono',
      'telefono', 'escribe', 'comenta', 'comentario', 'dm', 'chat', 'aviso', 'llamada'
    ],
    sfxSrc: '/assets/sfx/iphone-notification.wav',
    label: 'Notificación iPhone (Mensaje)',
  },
  // Secreto / Revelación / Descubrimiento / Clave
  {
    keywords: [
      'secreto', 'truco', 'clave', 'hack', 'estrategia', 'mira esto', 'descubrir',
      'método', 'metodo', 'fórmula', 'formula', 'paso a paso', 'revelar', 'magia'
    ],
    sfxSrc: '/assets/sfx/whoosh-hit.mp3',
    label: 'Whoosh Hit (Secreto/Revelación)',
  },
  // Pregunta / Curiosidad / Atención
  {
    keywords: [
      'sabías', 'sabias', 'alguna vez', 'por qué', 'porque', 'cómo', 'como',
      'pregunta', 'curioso', 'imagina', 'piensa', 'ojo', 'atención', 'atencion'
    ],
    sfxSrc: '/assets/sfx/bubble-pop.wav',
    label: 'Pop Pluck (Curiosidad/Pregunta)',
  },
  // Impacto / Potencia / Velocidad
  {
    keywords: [
      'impacto', 'fuerza', 'poder', 'velocidad', 'rápido', 'rapido', 'máximo',
      'maximo', 'explosión', 'explosion', 'brutal', 'masivo', 'gigante', 'locura'
    ],
    sfxSrc: '/assets/sfx/cinematic-thud.wav',
    label: 'Impacto Cinematográfico (Fuerza)',
  },
  // Logro / Solución / Victoria
  {
    keywords: [
      'listo', 'logrado', 'conseguido', 'fácil', 'facil', 'solución', 'solucion',
      'resuelto', 'victoria', 'perfecto', 'excelente', 'increíble', 'increible'
    ],
    sfxSrc: '/assets/sfx/success-chime.wav',
    label: 'Chime Victoria (Éxito)',
  },
];

const pickRandomIndex = (length: number, previousIndex: number) => {
  if (length <= 1) return 0;
  const candidate = Math.floor(Math.random() * length);
  return candidate === previousIndex ? (candidate + 1) % length : candidate;
};

export function generateContextualSfxEvents(
  inputOrTranscript: string | GenerateContextualSfxOptions,
  posCaptions?: Array<{ text: string; startMs: number; endMs: number }>,
  posCustomBrolls?: Array<{ start: number; duration: number }>,
  posMotionGraphics?: Array<{ start: number; duration: number }>,
  posHookLeadDuration?: number
): SfxTriggerEvent[] {
  let transcriptText = '';
  let captions: Array<{ text: string; startMs: number; endMs: number }> = [];
  let customBrolls: Array<{ start: number; duration: number }> = [];
  let motionGraphics: Array<{ start: number; duration: number }> = [];
  let hookLeadDuration = 1.8;

  let hookSfxEnabled = true;

  if (typeof inputOrTranscript === 'object' && inputOrTranscript !== null) {
    captions = inputOrTranscript.captions || [];
    transcriptText = inputOrTranscript.transcriptText || captions.map((c) => c.text).join(' ');
    customBrolls = inputOrTranscript.customBrolls || [];
    motionGraphics = inputOrTranscript.motionGraphicsItems || [];
    hookLeadDuration = inputOrTranscript.hookLeadDuration ?? 1.8;
    hookSfxEnabled = inputOrTranscript.hookSfxEnabled !== false;
  } else {
    transcriptText = inputOrTranscript || '';
    captions = posCaptions || [];
    customBrolls = posCustomBrolls || [];
    motionGraphics = posMotionGraphics || [];
    hookLeadDuration = posHookLeadDuration ?? 1.8;
  }
  const events: SfxTriggerEvent[] = [];
  const usedTimestamps = new Set<number>();

  const isTooClose = (timeSec: number, minDistanceSec: number = 1.2) => {
    for (const t of usedTimestamps) {
      if (Math.abs(t - timeSec) < minDistanceSec) return true;
    }
    return false;
  };

  // 1. Hook Viral Impact (0:00 - primer instante)
  if (hookSfxEnabled && transcriptText.trim().length > 0) {
    const firstWords = transcriptText.toLowerCase().slice(0, 80);
    let hookSfx = '/sfx/hooks/hook_01_dual_line.mp3';
    let hookLabel = 'Gancho Dual Line (Impacto)';

    if (firstWords.includes('sabías') || firstWords.includes('sabias') || firstWords.includes('cómo') || firstWords.includes('por qué')) {
      hookSfx = '/sfx/hooks/hook_03_question.mp3';
      hookLabel = 'Gancho Curiosidad / Pregunta';
    } else if (firstWords.includes('dinero') || firstWords.includes('ganar') || firstWords.includes('éxito') || firstWords.includes('millones')) {
      hookSfx = '/sfx/hooks/hook_04_number.mp3';
      hookLabel = 'Gancho Estadístico / Dinero';
    } else if (firstWords.includes('error') || firstWords.includes('cuidado') || firstWords.includes('no hagas')) {
      hookSfx = '/sfx/hooks/hook-glitch.mp3';
      hookLabel = 'Gancho Alerta (Glitch)';
    } else if (firstWords.includes('secreto') || firstWords.includes('clave') || firstWords.includes('truco')) {
      hookSfx = '/sfx/hooks/hook-reveal.mp3';
      hookLabel = 'Gancho Revelación';
    } else {
      hookSfx = '/assets/sfx/vine-boom.wav';
      hookLabel = 'Impacto Viral (Vine Boom)';
    }

    events.push({
      id: `sfx-hook-${Date.now()}`,
      timeSec: 0.05,
      sfxSrc: hookSfx,
      label: hookLabel,
      category: 'hook',
      volume: 0.75,
    });
    usedTimestamps.add(0.05);
  }

  // 2. Keywords Detection across Caption words
  for (const cap of captions) {
    const timeSec = Math.max(0, cap.startMs / 1000);
    if (timeSec < hookLeadDuration + 0.3) continue;
    if (isTooClose(timeSec, 1.4)) continue;

    const lower = cap.text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()¿?¡!"]/g, '');
    const tokens = lower.split(/\s+/).filter(Boolean);

    let matchedRule: SoundKeywordRule | null = null;
    for (const rule of SOUND_KEYWORD_RULES) {
      if (tokens.some((tok) => rule.keywords.includes(tok))) {
        matchedRule = rule;
        break;
      }
    }

    if (matchedRule) {
      events.push({
        id: `sfx-kw-${cap.startMs}`,
        timeSec,
        sfxSrc: matchedRule.sfxSrc,
        label: `${matchedRule.label} ("${cap.text.trim()}")`,
        category: 'keyword',
        volume: 0.55,
      });
      usedTimestamps.add(timeSec);
    }
  }

  // 3. B-Roll Transitions (Rotación variada de efectos de sonido)
  const brollSfxLibrary = [
    { src: '/sfx/broll/broll_center.mp3', label: 'B-Roll Impacto Centro' },
    { src: '/sfx/broll/broll_top.mp3', label: 'B-Roll Whoosh Superior' },
    { src: '/sfx/broll/broll_bottom.mp3', label: 'B-Roll Transición Inferior' },
    { src: '/assets/sfx/cinematic-swish-1.mp3', label: 'Cinematic Swish 1' },
    { src: '/assets/sfx/cinematic-swish-2.mp3', label: 'Cinematic Swish 2' },
    { src: '/assets/sfx/whoosh-fast.wav', label: 'Whoosh Rápido' },
    { src: '/assets/sfx/swish-short.wav', label: 'Swish Dinámico' },
  ];

  let previousBrollSfxIndex = -1;
  for (let idx = 0; idx < customBrolls.length; idx++) {
    const broll = customBrolls[idx];
    if (!isTooClose(broll.start, 0.8)) {
      const randomIndex = pickRandomIndex(brollSfxLibrary.length, previousBrollSfxIndex);
      previousBrollSfxIndex = randomIndex;
      const sfx = brollSfxLibrary[randomIndex];
      events.push({
        id: `sfx-broll-${broll.start}-${idx}`,
        timeSec: broll.start,
        sfxSrc: sfx.src,
        label: `${sfx.label} (Entrada)`,
        category: 'broll',
        volume: 0.45,
      });
      usedTimestamps.add(broll.start);
    }
  }

  // 4. Motion Graphics Transitions (Rotación variada de efectos 3D y cinemáticos)
  const motionSfxLibrary = [
    { src: '/sfx/motion-graphics/motion_01_hero_split.mp3', label: 'Hero Split 3D' },
    { src: '/sfx/motion-graphics/motion_02_kinetic_stack.mp3', label: 'Kinetic Stack' },
    { src: '/sfx/motion-graphics/motion_04_stat_punch.mp3', label: 'Stat Punch Impact' },
    { src: '/sfx/motion-graphics/motion_05_gradient_title.mp3', label: 'Gradient Title Hit' },
    { src: '/sfx/motion-graphics/motion_06_step_sequence.mp3', label: 'Step Sequence' },
    { src: '/sfx/motion-graphics/motion-pulse.mp3', label: 'Motion Pulse' },
    { src: '/assets/sfx/whoosh-cinematic.wav', label: 'Whoosh Cinematic' },
    { src: '/assets/sfx/whoosh-hit.mp3', label: 'Whoosh Hit' },
  ];

  let previousMotionSfxIndex = -1;
  for (let idx = 0; idx < motionGraphics.length; idx++) {
    const mg = motionGraphics[idx];
    if (!isTooClose(mg.start, 0.8)) {
      const randomIndex = pickRandomIndex(motionSfxLibrary.length, previousMotionSfxIndex);
      previousMotionSfxIndex = randomIndex;
      const sfx = motionSfxLibrary[randomIndex];
      events.push({
        id: `sfx-mg-${mg.start}-${idx}`,
        timeSec: mg.start,
        sfxSrc: sfx.src,
        label: `${sfx.label} (Entrada)`,
        category: 'motion',
        volume: 0.5,
      });
      usedTimestamps.add(mg.start);
    }
  }

  return events.sort((a, b) => a.timeSec - b.timeSec);
}
