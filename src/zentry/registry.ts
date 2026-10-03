import React, { ComponentType } from 'react';
import { ZENTRY_SFX_MAP, ZentrySfxId } from './audio/soundMap';

// Subtitle Components
import {
  Subtitle01CleanEditorial,
  Subtitle02YellowBubblePro,
  Subtitle03GradientEditorial,
  Subtitle04YellowMicroEditorial,
  Subtitle05DualFontLabel,
  Subtitle06TutorialCapsPro,
  Subtitle07MintEditorial,
  Subtitle08YellowGlowEditorial,
} from './subtitles/SubtitleTemplates';

// Hook Components
import {
  Hook01DualLine,
  Hook02LeftKeyword,
  Hook03Question,
  Hook04Number,
  Hook05Gradient,
  Hook06Editorial,
} from './hooks/HookTemplates';

// BRoll Components
import {
  BRollTop,
  BRollCenter,
  BRollBottom,
} from './broll/BRollTemplates';
import {
  BRoll01CenterKeyword,
  BRoll02CornerLabel,
  BRoll03Step,
  BRoll04Stat,
  BRoll05Callout,
  BRoll06QuoteStack,
} from '../../zentry_packs/Zentry_Video8_Broll/src/broll/BRollTemplates';

// Motion Graphic Components
import {
  Motion01HeroSplit,
  Motion02KineticStack,
  Motion03EditorialQuote,
  Motion04StatPunch,
  Motion05GradientTitle,
  Motion06StepSequence,
} from './motion-graphics/MotionGraphicTemplates';

// Typography Components & Presets
import { DualFontAnimation } from './animations/DualFontAnimation';
import { REFERENCE_ANIMATION_PRESETS } from './animations/presets';

export type ZentryCategory =
  | 'subtitles'
  | 'hooks'
  | 'typography'
  | 'broll'
  | 'motion-graphics';

export type ZentryBrollSubcategory = 'top' | 'center' | 'bottom';

export type ZentryFontVariant = 'montserrat' | 'playfair';

export type ZentryTemplateDefinition = {
  id: string;
  name: string;
  category: ZentryCategory;
  brollSubcategory?: ZentryBrollSubcategory;
  visualComponent: ComponentType<any>;
  fontVariants?: ZentryFontVariant[];
  sfxId: ZentrySfxId;
  defaultVolume: number;
  offsetFrames: number;
  preview: string;
  duration: number; // in seconds
  defaultProps?: Record<string, any>;
  hiddenInCatalog?: boolean;
};

// 1. Subtitles (8)
const SUBTITLE_PRESETS: ZentryTemplateDefinition[] = [
  {
    id: 'subtitle_01_clean_editorial',
    name: 'Clean Editorial',
    category: 'subtitles',
    visualComponent: Subtitle01CleanEditorial,
    sfxId: 'subtitle_01_clean_editorial',
    defaultVolume: ZENTRY_SFX_MAP['subtitle_01_clean_editorial'].volume,
    offsetFrames: ZENTRY_SFX_MAP['subtitle_01_clean_editorial'].offsetFrames,
    preview: '/zentry-previews/subtitles/S01.mp4',
    duration: 3,
    defaultProps: { top: 'La gente me sigue', main: 'preguntando' },
  },
  {
    id: 'subtitle_02_yellow_bubble_pro',
    name: 'Yellow Bubble Pro',
    category: 'subtitles',
    visualComponent: Subtitle02YellowBubblePro,
    sfxId: 'subtitle_02_yellow_bubble_pro',
    defaultVolume: ZENTRY_SFX_MAP['subtitle_02_yellow_bubble_pro'].volume,
    offsetFrames: ZENTRY_SFX_MAP['subtitle_02_yellow_bubble_pro'].offsetFrames,
    preview: '/zentry-previews/subtitles/S02.mp4',
    duration: 3,
    defaultProps: { top: 'cómo hago estas', main: 'animaciones' },
  },
  {
    id: 'subtitle_03_gradient_editorial',
    name: 'Gradient Editorial',
    category: 'subtitles',
    visualComponent: Subtitle03GradientEditorial,
    sfxId: 'subtitle_03_gradient_editorial',
    defaultVolume: ZENTRY_SFX_MAP['subtitle_03_gradient_editorial'].volume,
    offsetFrames: ZENTRY_SFX_MAP['subtitle_03_gradient_editorial'].offsetFrames,
    preview: '/zentry-previews/subtitles/S03.mp4',
    duration: 3,
    defaultProps: { top: 'dentro de', main: 'Premiere' },
  },
  {
    id: 'subtitle_04_yellow_micro_editorial',
    name: 'Yellow Micro Editorial',
    category: 'subtitles',
    visualComponent: Subtitle04YellowMicroEditorial,
    sfxId: 'subtitle_04_yellow_micro_editorial',
    defaultVolume: ZENTRY_SFX_MAP['subtitle_04_yellow_micro_editorial'].volume,
    offsetFrames: ZENTRY_SFX_MAP['subtitle_04_yellow_micro_editorial'].offsetFrames,
    preview: '/zentry-previews/subtitles/S04.mp4',
    duration: 3,
    defaultProps: { top: 'y la respuesta es', main: 'MUY SIMPLE' },
  },
  {
    id: 'subtitle_05_dual_font_label',
    name: 'Dual Font Label',
    category: 'subtitles',
    visualComponent: Subtitle05DualFontLabel,
    sfxId: 'subtitle_05_dual_font_label',
    defaultVolume: ZENTRY_SFX_MAP['subtitle_05_dual_font_label'].volume,
    offsetFrames: ZENTRY_SFX_MAP['subtitle_05_dual_font_label'].offsetFrames,
    preview: '/zentry-previews/subtitles/S05.mp4',
    duration: 3,
    defaultProps: { label: 'TUTORIAL', main: 'Paso a paso' },
  },
  {
    id: 'subtitle_06_tutorial_caps_pro',
    name: 'Tutorial Caps Pro',
    category: 'subtitles',
    visualComponent: Subtitle06TutorialCapsPro,
    sfxId: 'subtitle_06_tutorial_caps_pro',
    defaultVolume: ZENTRY_SFX_MAP['subtitle_06_tutorial_caps_pro'].volume,
    offsetFrames: ZENTRY_SFX_MAP['subtitle_06_tutorial_caps_pro'].offsetFrames,
    preview: '/zentry-previews/subtitles/S06.mp4',
    duration: 3,
    defaultProps: { step: '01', text: 'CREA EL PROYECTO' },
  },
  {
    id: 'subtitle_07_mint_editorial',
    name: 'Mint Editorial',
    category: 'subtitles',
    visualComponent: Subtitle07MintEditorial,
    sfxId: 'subtitle_07_mint_editorial',
    defaultVolume: ZENTRY_SFX_MAP['subtitle_07_mint_editorial'].volume,
    offsetFrames: ZENTRY_SFX_MAP['subtitle_07_mint_editorial'].offsetFrames,
    preview: '/zentry-previews/subtitles/S07.mp4',
    duration: 3,
    defaultProps: { top: 'ahora mira', main: 'este truco' },
  },
  {
    id: 'subtitle_08_yellow_glow_editorial',
    name: 'Yellow Glow Editorial',
    category: 'subtitles',
    visualComponent: Subtitle08YellowGlowEditorial,
    sfxId: 'subtitle_08_yellow_glow_editorial',
    defaultVolume: ZENTRY_SFX_MAP['subtitle_08_yellow_glow_editorial'].volume,
    offsetFrames: ZENTRY_SFX_MAP['subtitle_08_yellow_glow_editorial'].offsetFrames,
    preview: '/zentry-previews/subtitles/S08.mp4',
    duration: 3,
    defaultProps: { top: 'el secreto está en', main: 'EL RITMO' },
  },
];

// 2. Hooks (6)
const HOOK_PRESETS: ZentryTemplateDefinition[] = [
  {
    id: 'hook_01_dual_line',
    name: 'Dual Line (Esto Cambia Todo)',
    category: 'hooks',
    visualComponent: Hook01DualLine,
    sfxId: 'hook_01_dual_line',
    defaultVolume: ZENTRY_SFX_MAP['hook_01_dual_line'].volume,
    offsetFrames: ZENTRY_SFX_MAP['hook_01_dual_line'].offsetFrames,
    preview: '/zentry-previews/hooks/H01.mp4',
    duration: 2.5,
  },
  {
    id: 'hook_02_left_keyword',
    name: 'Left Keyword (No Hagas Esto)',
    category: 'hooks',
    visualComponent: Hook02LeftKeyword,
    sfxId: 'hook_02_left_keyword',
    defaultVolume: ZENTRY_SFX_MAP['hook_02_left_keyword'].volume,
    offsetFrames: ZENTRY_SFX_MAP['hook_02_left_keyword'].offsetFrames,
    preview: '/zentry-previews/hooks/H02.mp4',
    duration: 2.5,
  },
  {
    id: 'hook_03_question',
    name: 'Question (¿Por Qué Nadie Te Mira?)',
    category: 'hooks',
    visualComponent: Hook03Question,
    sfxId: 'hook_03_question',
    defaultVolume: ZENTRY_SFX_MAP['hook_03_question'].volume,
    offsetFrames: ZENTRY_SFX_MAP['hook_03_question'].offsetFrames,
    preview: '/zentry-previews/hooks/H03.mp4',
    duration: 2.5,
  },
  {
    id: 'hook_04_number',
    name: 'Number (3 Errores Retención)',
    category: 'hooks',
    visualComponent: Hook04Number,
    sfxId: 'hook_04_number',
    defaultVolume: ZENTRY_SFX_MAP['hook_04_number'].volume,
    offsetFrames: ZENTRY_SFX_MAP['hook_04_number'].offsetFrames,
    preview: '/zentry-previews/hooks/H04.mp4',
    duration: 2.5,
  },
  {
    id: 'hook_05_gradient',
    name: 'Gradient (Mira Hasta El Final)',
    category: 'hooks',
    visualComponent: Hook05Gradient,
    sfxId: 'hook_05_gradient',
    defaultVolume: ZENTRY_SFX_MAP['hook_05_gradient'].volume,
    offsetFrames: ZENTRY_SFX_MAP['hook_05_gradient'].offsetFrames,
    preview: '/zentry-previews/hooks/H05.mp4',
    duration: 2.5,
  },
  {
    id: 'hook_06_editorial',
    name: 'Editorial (El Secreto Que Funciona)',
    category: 'hooks',
    visualComponent: Hook06Editorial,
    sfxId: 'hook_06_editorial',
    defaultVolume: ZENTRY_SFX_MAP['hook_06_editorial'].volume,
    offsetFrames: ZENTRY_SFX_MAP['hook_06_editorial'].offsetFrames,
    preview: '/zentry-previews/hooks/H06.mp4',
    duration: 2.5,
  },
];

// 3. B-Roll (3 Categorías Separadas: Superior, Central, Inferior)
const BROLL_PRESETS: ZentryTemplateDefinition[] = [
  {
    id: 'broll_top',
    name: 'B-roll Superior (Paso 01 / Idea)',
    category: 'broll',
    brollSubcategory: 'top',
    visualComponent: BRollTop,
    sfxId: 'broll_top',
    defaultVolume: ZENTRY_SFX_MAP['broll_top'].volume,
    offsetFrames: ZENTRY_SFX_MAP['broll_top'].offsetFrames,
    preview: '/zentry-previews/broll/B01.mp4',
    duration: 3,
    hiddenInCatalog: true,
  },
  {
    id: 'broll_center',
    name: 'B-roll Central (10x Más Rápido)',
    category: 'broll',
    brollSubcategory: 'center',
    visualComponent: BRollCenter,
    sfxId: 'broll_center',
    defaultVolume: ZENTRY_SFX_MAP['broll_center'].volume,
    offsetFrames: ZENTRY_SFX_MAP['broll_center'].offsetFrames,
    preview: '/zentry-previews/broll/B02.mp4',
    duration: 3,
    hiddenInCatalog: true,
  },
  {
    id: 'broll_bottom',
    name: 'B-roll Inferior (Resultado Profesional)',
    category: 'broll',
    brollSubcategory: 'bottom',
    visualComponent: BRollBottom,
    sfxId: 'broll_bottom',
    defaultVolume: ZENTRY_SFX_MAP['broll_bottom'].volume,
    offsetFrames: ZENTRY_SFX_MAP['broll_bottom'].offsetFrames,
    preview: '/zentry-previews/broll/B03.mp4',
    duration: 3,
    hiddenInCatalog: true,
  },
  {
    id: 'broll_01_center_keyword',
    name: 'Center Keyword',
    category: 'broll',
    brollSubcategory: 'center',
    visualComponent: BRoll01CenterKeyword,
    sfxId: 'broll_center',
    defaultVolume: ZENTRY_SFX_MAP.broll_center.volume,
    offsetFrames: ZENTRY_SFX_MAP.broll_center.offsetFrames,
    preview: '/zentry-previews/broll/B04-center-keyword.mp4',
    duration: 3,
  },
  {
    id: 'broll_02_corner_label',
    name: 'Corner Label',
    category: 'broll',
    brollSubcategory: 'top',
    visualComponent: BRoll02CornerLabel,
    sfxId: 'broll_top',
    defaultVolume: ZENTRY_SFX_MAP.broll_top.volume,
    offsetFrames: ZENTRY_SFX_MAP.broll_top.offsetFrames,
    preview: '/zentry-previews/broll/B05-corner-label.mp4',
    duration: 3,
  },
  {
    id: 'broll_03_step',
    name: 'Step',
    category: 'broll',
    brollSubcategory: 'bottom',
    visualComponent: BRoll03Step,
    sfxId: 'broll_bottom',
    defaultVolume: ZENTRY_SFX_MAP.broll_bottom.volume,
    offsetFrames: ZENTRY_SFX_MAP.broll_bottom.offsetFrames,
    preview: '/zentry-previews/broll/B06-step.mp4',
    duration: 3,
  },
  {
    id: 'broll_04_stat',
    name: 'Stat',
    category: 'broll',
    brollSubcategory: 'top',
    visualComponent: BRoll04Stat,
    sfxId: 'broll_top',
    defaultVolume: ZENTRY_SFX_MAP.broll_top.volume,
    offsetFrames: ZENTRY_SFX_MAP.broll_top.offsetFrames,
    preview: '/zentry-previews/broll/B07-stat.mp4',
    duration: 3,
  },
  {
    id: 'broll_05_callout',
    name: 'Callout',
    category: 'broll',
    brollSubcategory: 'bottom',
    visualComponent: BRoll05Callout,
    sfxId: 'broll_bottom',
    defaultVolume: ZENTRY_SFX_MAP.broll_bottom.volume,
    offsetFrames: ZENTRY_SFX_MAP.broll_bottom.offsetFrames,
    preview: '/zentry-previews/broll/B08-callout.mp4',
    duration: 3,
  },
  {
    id: 'broll_06_quote_stack',
    name: 'Quote Stack',
    category: 'broll',
    brollSubcategory: 'center',
    visualComponent: BRoll06QuoteStack,
    sfxId: 'broll_center',
    defaultVolume: ZENTRY_SFX_MAP.broll_center.volume,
    offsetFrames: ZENTRY_SFX_MAP.broll_center.offsetFrames,
    preview: '/zentry-previews/broll/B09-quote-stack.mp4',
    duration: 3,
  },
];

// 4. Motion Graphics (6)
const MOTION_GRAPHIC_PRESETS: ZentryTemplateDefinition[] = [
  {
    id: 'motion_01_hero_split',
    name: 'Hero Split (Idea a Video)',
    category: 'motion-graphics',
    visualComponent: Motion01HeroSplit,
    sfxId: 'motion_01_hero_split',
    defaultVolume: ZENTRY_SFX_MAP['motion_01_hero_split'].volume,
    offsetFrames: ZENTRY_SFX_MAP['motion_01_hero_split'].offsetFrames,
    preview: '/zentry-previews/motion-graphics/M01.mp4',
    duration: 3,
  },
  {
    id: 'motion_02_kinetic_stack',
    name: 'Kinetic Stack (Guion · Imagen · Video)',
    category: 'motion-graphics',
    visualComponent: Motion02KineticStack,
    sfxId: 'motion_02_kinetic_stack',
    defaultVolume: ZENTRY_SFX_MAP['motion_02_kinetic_stack'].volume,
    offsetFrames: ZENTRY_SFX_MAP['motion_02_kinetic_stack'].offsetFrames,
    preview: '/zentry-previews/motion-graphics/M02.mp4',
    duration: 3,
  },
  {
    id: 'motion_03_editorial_quote',
    name: 'Editorial Quote (Cita Zentry)',
    category: 'motion-graphics',
    visualComponent: Motion03EditorialQuote,
    sfxId: 'motion_03_editorial_quote',
    defaultVolume: ZENTRY_SFX_MAP['motion_03_editorial_quote'].volume,
    offsetFrames: ZENTRY_SFX_MAP['motion_03_editorial_quote'].offsetFrames,
    preview: '/zentry-previews/motion-graphics/M03.mp4',
    duration: 3,
  },
  {
    id: 'motion_04_stat_punch',
    name: 'Stat Punch (3x Más Retención)',
    category: 'motion-graphics',
    visualComponent: Motion04StatPunch,
    sfxId: 'motion_04_stat_punch',
    defaultVolume: ZENTRY_SFX_MAP['motion_04_stat_punch'].volume,
    offsetFrames: ZENTRY_SFX_MAP['motion_04_stat_punch'].offsetFrames,
    preview: '/zentry-previews/motion-graphics/M04.mp4',
    duration: 3,
  },
  {
    id: 'motion_05_gradient_title',
    name: 'Gradient Title (Crea Impacto)',
    category: 'motion-graphics',
    visualComponent: Motion05GradientTitle,
    sfxId: 'motion_05_gradient_title',
    defaultVolume: ZENTRY_SFX_MAP['motion_05_gradient_title'].volume,
    offsetFrames: ZENTRY_SFX_MAP['motion_05_gradient_title'].offsetFrames,
    preview: '/zentry-previews/motion-graphics/M05.mp4',
    duration: 3,
  },
  {
    id: 'motion_06_step_sequence',
    name: 'Step Sequence (Pasos 01 / 02 / 03)',
    category: 'motion-graphics',
    visualComponent: Motion06StepSequence,
    sfxId: 'motion_06_step_sequence',
    defaultVolume: ZENTRY_SFX_MAP['motion_06_step_sequence'].volume,
    offsetFrames: ZENTRY_SFX_MAP['motion_06_step_sequence'].offsetFrames,
    preview: '/zentry-previews/motion-graphics/M06.mp4',
    duration: 3,
  },
];

// 5. Typography (27 Animaciones con selector Montserrat / Playfair)
const TYPOGRAPHY_PRESETS: ZentryTemplateDefinition[] = REFERENCE_ANIMATION_PRESETS.map((preset) => {
  const sfxConfig = ZENTRY_SFX_MAP[preset.id as ZentrySfxId] || {
    file: `sfx/typography/${preset.id}.mp3`,
    volume: 0.38,
    offsetFrames: 0,
    label: preset.label,
  };

  // Visual component wrapper that forwards fontLook ('montserrat' or 'playfair')
  const VisualComponent: React.FC<any> = ({
    text = preset.label.toUpperCase(),
    fontVariant = 'montserrat',
    ...props
  }) => React.createElement(DualFontAnimation, {
    text,
    animation: preset.animation as any,
    unit: preset.unit,
    fontLook: fontVariant,
    ...props,
  });
  VisualComponent.displayName = `ZentryTypography_${preset.id}`;

  return {
    id: preset.id,
    name: preset.label,
    category: 'typography' as const,
    visualComponent: VisualComponent,
    fontVariants: ['montserrat', 'playfair'] as ZentryFontVariant[],
    sfxId: preset.id as ZentrySfxId,
    defaultVolume: sfxConfig.volume,
    offsetFrames: sfxConfig.offsetFrames,
    preview: `/zentry-previews/typography/montserrat/${preset.id}.mp4`,
    duration: 2.5,
    defaultProps: { text: preset.label.toUpperCase(), fontVariant: 'montserrat' },
  };
});

// Central Registry Array
export const ZENTRY_CENTRAL_REGISTRY: ZentryTemplateDefinition[] = [
  ...SUBTITLE_PRESETS,
  ...HOOK_PRESETS,
  ...BROLL_PRESETS,
  ...MOTION_GRAPHIC_PRESETS,
  ...TYPOGRAPHY_PRESETS,
];

// The three legacy B-roll components remain addressable for saved projects,
// but their full-background equivalents already live in the dedicated B-roll
// panel. Keeping them out of the picker avoids showing the same choice twice.
export const ZENTRY_CATALOG_REGISTRY: ZentryTemplateDefinition[] =
  ZENTRY_CENTRAL_REGISTRY.filter((template) => !template.hiddenInCatalog);

// Map lookup by ID
export const ZENTRY_REGISTRY_MAP: Record<string, ZentryTemplateDefinition> = Object.fromEntries(
  ZENTRY_CENTRAL_REGISTRY.map((tpl) => [tpl.id, tpl])
);

export const getZentryTemplate = (id: string): ZentryTemplateDefinition | undefined => {
  return ZENTRY_REGISTRY_MAP[id];
};
