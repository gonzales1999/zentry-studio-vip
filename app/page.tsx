'use client';
/* eslint-disable @next/next/no-img-element -- Blob URLs are local user files and cannot use the Next image optimizer. */

import type { Caption } from '@remotion/captions';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { ChangeEvent, DragEvent, Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cleanWhisperCaptions } from './video/cleanWhisperCaptions';
import { withFreshVideoCaptions, withProcessingTimeout } from './video/transcriptionRecovery';
import { AnimatedBrollText } from './video/AnimatedBrollText';
import { captionGroups as groupCaptions, brollOwnsAnimatedText, brollTextFontSize, resolveBrollCaptionStyle, wordPulse, resolveMotionText, motionHidesCaptions } from './video/captionTiming';
import { DEFAULT_HOOK_DURATION, hookLineOpacity } from './video/hookTiming';
import {DEFAULT_TEXT_SIZE,packTypography} from './video/packTypography';
import {AnimatedMotionText} from './video/AnimatedMotionText';
import {MotionSceneObjects} from './video/MotionSceneObjects';
import {ZentryTextSizeContext} from '../src/zentry/animations/ReferenceTextAnimation';
import { audioRate, audioSourceInterval, maxAudioDuration, remapAudioToOutput, changeAudioRate, audioUploadSlot } from './video/audioTimeline';
import { persistDraftMedia, restoreDraftMedia, releaseRestoredMedia, collectBlobUrls, releaseUnusedRestoredMedia } from './video/localMediaStore';
import { CAPTION_PRESETS, getCaptionPreset } from './video/presets';
import type { CaptionStyleId } from './video/presets';
import type { ZentryVideoProps, MotionGraphicItem, MotionGraphicCardType, MotionGraphicStyle, MotionGraphic3DStyle, CustomBrollItem, BrollTransitionEffect, ZentryTemplateItem, CaptionGroupStyleOverride } from './video/types';
import { generateContextualSfxEvents, ContextualSfxEvent } from './video/contextualSoundEngine';
import { remapIntervalToOutput, remapTimeToOutput } from './video/timeRemapper';
import { ZentryComposition } from './video/ZentryComposition';
import { getVisibleVisualLayer, getZentryVisualProps, getZentryLayout } from './video/visibleLayers';
import { Navbar } from '../components/Navbar';
import { LandingPage } from '../components/LandingPage';
import { AuthModal } from '../components/AuthModal';
import { supabase, ADMIN_EMAIL, UserProfile, isAdminUser } from '../lib/supabase';
import {
  ZENTRY_CATALOG_REGISTRY,
  ZENTRY_CENTRAL_REGISTRY,
  ZENTRY_REGISTRY_MAP,
  getZentryTemplate,
  ZentryCategory,
  ZentryFontVariant,
  ZentryTemplateDefinition,
} from '../src/zentry/registry';
import { ZENTRY_SFX_MAP, ZentrySfxId } from '../src/zentry/audio/soundMap';

const tools = [
  { id: 'timeline', icon: '⏱️', label: 'Timeline' },
  { id: 'subtitles', icon: 'CC', label: 'Subtítulos' },
  { id: 'zentry-motion', icon: '⚡', label: 'Zentry Motion' },
  { id: 'styles', icon: '🎨', label: 'Estilos' },
  { id: 'transitions', icon: '🔀', label: 'Transiciones' },
  { id: 'video', icon: '▶', label: 'Video' },
  { id: 'audio', icon: '♫', label: 'Audio' },
  { id: 'effects', icon: '✦', label: 'Efectos' },
  { id: 'broll', icon: '▣', label: 'B-roll' },
  { id: 'motion', icon: '⚡', label: 'Motion' },
  { id: 'brand', icon: 'VIP', label: 'Marca' },
];

const WHISPER_MODEL = 'tiny' as const;
// Audio uploads are usually shorter and need better Spanish word recognition
// than the fast video pass. The base model is cached once in the browser and
// is still small enough for local transcription of up to five clips.
const AUDIO_WHISPER_MODEL = 'base' as const;
const OVERLAY_EFFECTS = [
  { name:'Sin overlay', src:null, preview:'×' },
  { name:'Film Burn', src:'/assets/effects/film-burn.mp4', preview:'FB' },
  { name:'Fireflies', src:'/assets/effects/fireflies.mp4', preview:'✦' },
  { name:'Flash', src:'/assets/effects/flash.mp4', preview:'ϟ' },
  { name:'Glitch 2', src:'/assets/effects/glitch-2.mp4', preview:'G2' },
  { name:'Glitch 3', src:'/assets/effects/glitch-3.mp4', preview:'G3' },
] as const;

export type SfxCategory = 'all' | 'trans' | 'impact' | 'pop' | 'type' | 'notif' | 'success' | 'viral';

const SFX_EFFECTS = [
  // Transiciones
  { name:'Whoosh Rápido', src:'/assets/sfx/whoosh-fast.wav', cat:'trans' },
  { name:'Whoosh Cinemático', src:'/assets/sfx/whoosh-cinematic.wav', cat:'trans' },
  { name:'Swish Corto', src:'/assets/sfx/swish-short.wav', cat:'trans' },
  { name:'Deep Riser', src:'/assets/sfx/deep-riser.wav', cat:'trans' },
  { name:'Whoosh Hit', src:'/assets/sfx/whoosh-hit.mp3', cat:'trans' },
  { name:'Rising Swoosh', src:'/assets/sfx/rising-swoosh.mp3', cat:'trans' },
  { name:'Swish Cinemático 1', src:'/assets/sfx/cinematic-swish-1.mp3', cat:'trans' },
  { name:'Swish Cinemático 2', src:'/assets/sfx/cinematic-swish-2.mp3', cat:'trans' },
  // Impactos
  { name:'Bass Drop 808', src:'/assets/sfx/bass-drop-boom.wav', cat:'impact' },
  { name:'Impacto Thud', src:'/assets/sfx/cinematic-thud.wav', cat:'impact' },
  { name:'Vine Boom', src:'/assets/sfx/vine-boom.wav', cat:'impact' },
  { name:'Golpe Metálico', src:'/assets/sfx/metal-hit.wav', cat:'impact' },
  { name:'Boom Cinemático 1', src:'/assets/sfx/cinematic-boom-1.mp3', cat:'impact' },
  { name:'Boom Cinemático 2', src:'/assets/sfx/cinematic-boom-2.mp3', cat:'impact' },
  // Clics y Pops
  { name:'Pop Burbuja', src:'/assets/sfx/bubble-pop.wav', cat:'pop' },
  { name:'Pop Corcho', src:'/assets/sfx/cork-pop.wav', cat:'pop' },
  { name:'Clic Ratón', src:'/assets/sfx/mouse-click.wav', cat:'pop' },
  { name:'Toque UI', src:'/assets/sfx/ui-tap.wav', cat:'pop' },
  { name:'Obturador Cámara', src:'/assets/sfx/camera-shutter.wav', cat:'pop' },
  // Escritura
  { name:'Teclado CapCut', src:'/assets/sfx/typewriter-capcut.m4a', cat:'type' },
  { name:'Teclado Mecánico', src:'/assets/sfx/keyboard-mechanical.wav', cat:'type' },
  { name:'Tecla Única', src:'/assets/sfx/typewriter-single.wav', cat:'type' },
  // Notificaciones
  { name:'Notificación iPhone', src:'/assets/sfx/iphone-notification.wav', cat:'notif' },
  { name:'Campana Slack', src:'/assets/sfx/slack-chime.wav', cat:'notif' },
  { name:'Ding Alerta', src:'/assets/sfx/bell-ding.wav', cat:'notif' },
  // Éxito y Dinero
  { name:'Dinero Cha-Ching', src:'/assets/sfx/cha-ching-cash.wav', cat:'success' },
  { name:'Moneda Coin', src:'/assets/sfx/coin-whoosh.wav', cat:'success' },
  { name:'Éxito Logro', src:'/assets/sfx/success-chime.wav', cat:'success' },
  { name:'Aplauso Kids', src:'/assets/sfx/kids-yay.mp3', cat:'success' },
  // Viral y Efectos
  { name:'Freno de Cinta', src:'/assets/sfx/tape-stop.wav', cat:'viral' },
  { name:'Scratch Vinilo', src:'/assets/sfx/record-scratch.wav', cat:'viral' },
  { name:'Glitch Estático', src:'/assets/sfx/glitch-static.wav', cat:'viral' },
  { name:'Censor Beep', src:'/assets/sfx/censor-beep.mp3', cat:'viral' },
  { name:'Reverse Swoosh', src:'/assets/sfx/reverse.wav', cat:'viral' },
  { name:'Tic Tac Reloj', src:'/assets/sfx/analog-clock-tick.wav', cat:'viral' },
  { name:'Tensión Grave', src:'/assets/sfx/subtle-rumble.wav', cat:'viral' },
];
const BROLL_ASSETS = [
  { name:'Confianza', src:'/assets/broll/confident.png', keywords:['persona','personas','confianza','creer','éxito','lograr','creador','hablar'] },
  { name:'Tecnología', src:'/assets/broll/dark-grid.jpg', keywords:['tecnología','digital','inteligencia','artificial','ia','código','software','aplicación','app'] },
  { name:'Ideas', src:'/assets/broll/soft-grid.jpg', keywords:['idea','ideas','historia','contenido','crear','creación','mensaje','video'] },
  { name:'Estrategia', src:'/assets/broll/paper-grid.jpg', keywords:['plan','proceso','estructura','estrategia','paso','método','aprender','construir'] },
  { name:'Datos', src:'/assets/broll/fine-grid.png', keywords:['datos','resultado','resultados','número','negocio','ventas','análisis','sistema'] },
] as const;

const getCustomBrollIdentity = (item: CustomBrollItem) => {
  const visualIdentity = item.templateId || item.src || item.brollStyle || item.title || 'broll';
  const start = Math.round(item.start * 10);
  const duration = Math.round(item.duration * 10);
  return `${visualIdentity}|${start}|${duration}`;
};

const dedupeCustomBrolls = (items: CustomBrollItem[]) => {
  const positions = new Map<string, number>();
  const unique: CustomBrollItem[] = [];
  for (const item of items) {
    const key = getCustomBrollIdentity(item);
    const existingIndex = positions.get(key);
    if (existingIndex === undefined) {
      positions.set(key, unique.length);
      unique.push(item);
    } else {
      // Keep the most recent version so its current settings and id survive.
      unique[existingIndex] = item;
    }
  }
  return unique;
};
const replaceOverlappingBroll = (items: CustomBrollItem[], incoming: CustomBrollItem) =>
  dedupeCustomBrolls(items.filter((item) =>
    item.id === incoming.id || item.start >= incoming.start + incoming.duration || item.start + item.duration <= incoming.start
  ).filter((item) => item.id !== incoming.id).concat(incoming));
const FONT_OPTIONS = [
  'Anton','Bebas Neue','Montserrat','Inter','Inter Tight','Poppins','Oswald','Playfair Display','Instrument Serif','DynaPuff','Coiny','Sigmar One','Amatic SC','Corben',
  'Barlow','Lato','Raleway','Space Grotesk','Syne','Nunito','Great Vibes','Lobster','Pacifico','Clash Display',
] as const;
const HOOK_PRESETS = [
  { id:'viro', name:'Viro Cyan (Esteban)', sample:['Historia','IMPOSIBLE DE IGNORAR'], leadFont:'Great Vibes', mainFont:'Montserrat', accent:'#00f5c8' },
  { id:'editorial', name:'Editorial Story', sample:['Una idea','PUEDE CAMBIARLO TODO'], leadFont:'Playfair Display', mainFont:'Playfair Display', accent:'#00d4ff' },
  { id:'impact', name:'Impacto Stats', sample:['+500%','CRECIMIENTO REAL'], leadFont:'Anton', mainFont:'Anton', accent:'#ffd700' },
  { id:'motivacional', name:'Motivacional 3D', sample:['DESPIERTA TU','VERDADERO PODER'], leadFont:'Montserrat', mainFont:'Montserrat', accent:'#00ff66' },
  { id:'instagram', name:'Instagram Viral', sample:['NO COMETAS','ESTE ERROR'], leadFont:'Anton', mainFont:'Montserrat', accent:'#ff6b00' },
  { id:'clean', name:'Minimal Tech', sample:['CLARIDAD','EN 30 SEGUNDOS'], leadFont:'Inter', mainFont:'Inter', accent:'#00bfff' },
  { id:'boldcaps', name:'Bold Caps', sample:['ESTO CAMBIA','EL JUEGO'], leadFont:'Montserrat', mainFont:'Montserrat', accent:'#ffd400' },
] as const;

const VIRO_MASTER_TEMPLATES = [
  {
    id: 'storytelling' as const,
    badge: 'Viro 1',
    name: 'Storytelling Pro',
    desc: 'Playfair · Cyan/Blanco · Editorial 3D',
    icon: '📖',
    accent: '#00f5c8',
  },
  {
    id: 'marca-personal' as const,
    badge: 'Viro 2',
    name: 'Marca Personal',
    desc: 'Bold Caps · Mint · Black OLED',
    icon: '👑',
    accent: '#00f5c8',
  },
  {
    id: 'editorial' as const,
    badge: 'Viro 3',
    name: 'Editorial Aesthetic',
    desc: 'Magazine Luxury · Dorado · Photoreal',
    icon: '✨',
    accent: '#eab308',
  },
  {
    id: 'hormozi' as const,
    badge: 'Viro 4',
    name: 'Hormozi Viral',
    desc: 'Anton Impact · Amarillo Retención · Collage',
    icon: '🔥',
    accent: '#ffd400',
  },
] as const;

type JobState = 'idle' | 'working' | 'done' | 'error';
type AppStage = 'upload' | 'processing' | 'editor';
type CanvasPosition = { x: number; y: number };
type AnimatedBrollPage = { focus: string; context: string; index: number; style: 'impact' | 'script' | 'editorial' };
type HookStyleId = typeof HOOK_PRESETS[number]['id'];
type CaptionGroup = { startIndex:number; endIndex:number; startMs:number; endMs:number; text:string };
type CanvasLayer = 'captions' | 'hook';
type EditSegment = { id:string; start:number; end:number; src?:string; title?:string; timelineStart?:number; timelineEnd?:number; transitionToNext?: 'cut' | 'whip-pan' | 'zoom-punch' | 'fade' | 'glitch'; clipVolume?:number; clipMuted?:boolean; brightness?:number; contrast?:number; saturation?:number; sharpness?:number; processedAudioSrc?:string };
type MusicClip = {id:string; src:string; name:string; start:number; duration:number; sourceStart:number; sourceDuration:number; volume:number; playbackRate?:number};
type ManualSfxClip = {id:string; src:string; start:number; volume:number};
const placeMusicClip = (clip:MusicClip, wanted:number, clips:MusicClip[], timelineDuration:number) => {
  const occupied = clips.filter((item) => item.id !== clip.id).sort((a,b) => a.start-b.start);
  const gaps:{start:number;end:number}[] = [];
  let cursor = 0;
  for (const item of occupied) {
    if (item.start > cursor) gaps.push({start:cursor,end:item.start});
    cursor = Math.max(cursor,item.start+item.duration);
  }
  gaps.push({start:cursor,end:timelineDuration});
  const positions = gaps.filter((gap) => gap.end-gap.start >= clip.duration-0.001)
    .map((gap) => Math.max(gap.start,Math.min(wanted,gap.end-clip.duration)));
  return positions.length ? positions.sort((a,b) => Math.abs(a-wanted)-Math.abs(b-wanted))[0] : clip.start;
};
const rippleVisualItem = <T extends {start:number;duration:number}>(item:T, cutStart:number, cutDuration:number):T|null => {
  const cutEnd = cutStart + cutDuration;
  const itemEnd = item.start + item.duration;
  if (itemEnd <= cutStart) return item;
  if (item.start >= cutEnd) return {...item,start:Math.max(0,item.start-cutDuration)};
  const before = Math.max(0,cutStart-item.start);
  const after = Math.max(0,itemEnd-cutEnd);
  const newDuration = before+after;
  if (newDuration < 0.05) return null;
  return {...item,start:before > 0 ? item.start : cutStart,duration:newDuration};
};
const rippleMusicClips = (clips:MusicClip[], cutStart:number, cutDuration:number):MusicClip[] => {
  const cutEnd = cutStart+cutDuration;
  return clips.flatMap((clip) => {
    const end=clip.start+clip.duration;
    if (end <= cutStart) return [clip];
    if (clip.start >= cutEnd) return [{...clip,start:Math.max(0,clip.start-cutDuration)}];
    const before=Math.max(0,cutStart-clip.start);
    const after=Math.max(0,end-cutEnd);
    const result:MusicClip[]=[];
    if (before >= 0.05) result.push({...clip,duration:before});
    if (after >= 0.05) result.push({...clip,id:before >= 0.05 ? `${clip.id}-ripple` : clip.id,start:cutStart,duration:after,sourceStart:clip.sourceStart+(cutEnd-clip.start)*audioRate(clip)});
    return result;
  });
};
const rippleCaptions = (items:Caption[], cutStart:number, cutDuration:number):Caption[] => {
  const start = cutStart * 1000;
  const end = (cutStart + cutDuration) * 1000;
  const removed = cutDuration * 1000;
  return items.flatMap((caption) => {
    if (caption.endMs <= start) return [caption];
    if (caption.startMs >= end) return [{...caption,startMs:caption.startMs-removed,endMs:caption.endMs-removed,timestampMs:caption.timestampMs === null ? null : Math.max(0,caption.timestampMs-removed)}];
    const keptStart = caption.startMs < start ? caption.startMs : start;
    const keptEnd = caption.endMs > end ? caption.endMs-removed : start;
    return keptEnd-keptStart >= 1 ? [{...caption,startMs:keptStart,endMs:keptEnd,timestampMs:keptStart}] : [];
  });
};
type EditorSnapshot = {
  fileName:string; captions:Caption[]; activeStyle:CaptionStyleId; accentColor:string; fontSize:number; captionFontFamily:string;
  captionFontWeight:number; captionItalic:boolean; captionDualFont:boolean; captionTopFontFamily:string; captionBottomFontFamily:string; captionAlign:'left'|'center'|'right'; captionPosition:CanvasPosition; hookLeadText:string; hookMainText:string;
  hookPosition:CanvasPosition; hookLeadFontFamily:string; hookMainFontFamily:string; hookLeadFontSize:number; hookMainFontSize:number; hookLeadDuration:number; hookMainDuration:number; hookStyle:HookStyleId; editSegments:EditSegment[]; removeSilences:boolean; brollText:string; brollTypingSound:boolean; brollTransition:'fade'|'slide'|'zoom'|'flash'|'glitch'|'spin';
  zentryItems?: ZentryTemplateItem[];
  captionGroupStyles?: CaptionGroupStyleOverride[];
  customBrolls?: CustomBrollItem[];
  motionGraphicsItems?: MotionGraphicItem[];
  sfxVolumeMultiplier?: number;
  sfxTimeOverrides?: Record<string, number>;
  musicClips?: MusicClip[];
  manualSfxClips?: ManualSfxClip[];
  shadow?:boolean;
  popAnimation?:boolean;
  volume?:number;
};
type SavedDraft = Partial<EditorSnapshot> & { version:1; hookText?:string; hookFontFamily?:string; hookFontSize?:number; sourceDuration?:number; intentionalTrim?:boolean };
type SavedCaptionTemplate = Omit<CaptionGroupStyleOverride, 'id' | 'startMs' | 'endMs'> & { id:string; name:string };
type SavedBrollTemplate = { id:string; name:string; settings:Partial<CustomBrollItem> };
type PersonalPreset = Pick<EditorSnapshot,
  'activeStyle' | 'accentColor' | 'fontSize' | 'captionFontFamily' | 'captionFontWeight' | 'captionItalic' |
  'captionDualFont' | 'captionTopFontFamily' | 'captionBottomFontFamily' | 'captionAlign' | 'captionPosition' |
  'hookPosition' | 'hookLeadFontFamily' | 'hookMainFontFamily' | 'hookLeadFontSize' | 'hookMainFontSize' |
  'hookLeadDuration' | 'hookMainDuration' | 'hookStyle' | 'brollTypingSound' | 'brollTransition'> &
  { id:string; name:string; savedAt:string; shadow?:boolean; popAnimation?:boolean;
    timeline?: { sourceDuration:number; captionGroupStyles:CaptionGroupStyleOverride[];
      customBrolls:CustomBrollItem[]; motionGraphicsItems:MotionGraphicItem[]; zentryItems:ZentryTemplateItem[] } };
type PersonalPresetCollection = { version:2; defaultId:string | null; presets:PersonalPreset[] };

const STARTER_PERSONAL_PRESET: PersonalPreset = {
  id:'zentry-viral-starter', name:'Zentry Viral', savedAt:new Date(0).toISOString(),
  activeStyle:'personal', accentColor:'#00f5c8', fontSize:DEFAULT_TEXT_SIZE, captionFontFamily:'Anton',
  captionFontWeight:400, captionItalic:false, captionDualFont:false,
  captionTopFontFamily:'Great Vibes', captionBottomFontFamily:'Playfair Display',
  captionAlign:'center', captionPosition:{x:50,y:36}, hookPosition:{x:50,y:13},
  hookLeadFontFamily:'Great Vibes', hookMainFontFamily:'Anton', hookLeadFontSize:DEFAULT_TEXT_SIZE,
  hookMainFontSize:DEFAULT_TEXT_SIZE, hookLeadDuration:DEFAULT_HOOK_DURATION, hookMainDuration:DEFAULT_HOOK_DURATION,
  hookStyle:'viro', brollTypingSound:true, brollTransition:'fade',
};

const DEFAULT_CAPTION_POSITION: CanvasPosition = { x:50, y:36 };
const DEFAULT_HOOK_POSITION: CanvasPosition = { x:50, y:13 };
const getProjectStorageKey = (file: File) => `zentry-project:${file.name}:${file.size}:${file.lastModified}`;

const TimelineThumbnail = ({ src, time }: { src:string; time:number }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const seek = () => { video.currentTime=Math.min(Math.max(0,time),Math.max(0,video.duration-.05)); };
    video.addEventListener('loadedmetadata',seek,{once:true});
    if (video.readyState >= 1) seek();
    return () => video.removeEventListener('loadedmetadata',seek);
  },[src,time]);
  return <video ref={ref} src={src} muted playsInline preload="auto" aria-hidden="true" />;
};

const assignTimelineLanes = <T extends {id:string; start:number; duration:number}>(items:T[], totalDuration:number) => {
  const laneEnds:number[] = [];
  const lanes = new Map<string,number>();
  [...items].sort((a,b) => a.start-b.start || a.id.localeCompare(b.id)).forEach((item) => {
    const visibleEnd = item.start + Math.max(item.duration, totalDuration * .025);
    let lane = laneEnds.findIndex((end) => end <= item.start);
    if (lane < 0) lane = laneEnds.length;
    laneEnds[lane] = visibleEnd;
    lanes.set(item.id,lane);
  });
  return {lanes, count:Math.max(1,laneEnds.length)};
};

const getAutomaticHook = (items: Caption[]) => items
  .map((caption) => caption.text.trim())
  .filter(Boolean)
  .join(' ')
  .split(/\s+/)
  .slice(0,9)
  .join(' ');

const getAnimatedBrollPage = (event:ZentryVideoProps['brollEvents'][number], time:number): AnimatedBrollPage | null => {
  const words = event.words;
  if (!words.length) return null;
  const pageSize = 2;
  const exactIndex = words.findIndex((word) => time >= word.start && time < word.end);
  const latestIndex = words.reduce((result,word,index) => word.start <= time ? index : result,0);
  const activeIndex = exactIndex >= 0 ? exactIndex : latestIndex;
  const index = Math.floor(activeIndex/pageSize);
  const focusStart = index*pageSize;
  const styles: AnimatedBrollPage['style'][] = ['impact','impact','script','editorial'];
  return {
    focus:words.slice(focusStart,focusStart+pageSize).map((word) => word.text).join(' '),
    context:words.slice(Math.max(0,focusStart-3),focusStart).map((word) => word.text).join(' '),
    index,
    style:styles[index%styles.length],
  };
};

const getPreviewWordStyle = (styleId: CaptionStyleId, active: boolean, accentColor: string, shadow: boolean, popAnimation: boolean): CSSProperties => {
  const base: CSSProperties = { color:active ? accentColor : '#fff', WebkitTextStroke:'1.5px #050505', paintOrder:'stroke fill', textShadow:shadow ? '0 3px 0 #000, 0 7px 14px #000' : 'none', padding:0, borderRadius:0, background:'transparent', scale:active && popAnimation ? 1.14 : 1 };
  // ViroEdit Styles
  if (styleId === 'estebanStyle') return {...base,color:active ? (accentColor || '#00F5C8') : '#fff',WebkitTextStroke:active ? '0 transparent' : '1.5px #000',textShadow:active ? '0 0 10px rgba(0,245,200,0.8)' : '0 3px 8px #000',scale:active ? 1.12 : 1};
  if (styleId === 'editorialStory') return {...base,color:active ? (accentColor || '#00D4FF') : '#fff',WebkitTextStroke:'0 transparent',textShadow:active ? '0 0 14px rgba(0,212,255,0.85)' : '0 4px 10px #000',fontStyle:'italic',scale:active ? 1.08 : 1};
  if (styleId === 'impactoStats') return {...base,color:active ? (accentColor || '#FFD700') : '#fff',WebkitTextStroke:'2px #000',textShadow:'2px 3px 0 #000',scale:active ? 1.15 : 1};
  if (styleId === 'motivacionalDual') return {...base,color:active ? (accentColor || '#00FF66') : '#fff',WebkitTextStroke:'1.5px #000',textShadow:active ? '0 0 12px rgba(0,255,102,0.8)' : '0 3px 8px #000',scale:active ? 1.12 : 1};
  if (styleId === 'instagramOrange') return {...base,color:active ? (accentColor || '#FF6B00') : '#fff',WebkitTextStroke:'2px #000',textShadow:'0 4px 12px rgba(0,0,0,0.8)',scale:active ? 1.12 : 1};
  if (styleId === 'minimalistaClean') return {...base,color:active ? (accentColor || '#00BFFF') : '#fff',WebkitTextStroke:'0 transparent',textShadow:'0 3px 8px #000',letterSpacing:'.06em',scale:active ? 1.05 : 1};
  if (styleId === 'magazineEditorial') return {...base,color:active ? '#fff' : '#ccc',WebkitTextStroke:'0 transparent',textDecoration:active ? 'underline' : 'none',fontStyle:'italic',scale:active ? 1.06 : 1};
  if (styleId === 'simpleBasic') return {...base,color:active ? (accentColor || '#00D4FF') : '#fff',WebkitTextStroke:'1px #000',scale:active ? 1.08 : 1};
  if (styleId === 'helveticaBold') return {...base,color:active ? '#fff' : '#e0e0e0',background:active ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.4)',borderRadius:4,padding:'2px 5px'};
  if (styleId === 'aniStyle') return {...base,color:active ? '#fff' : '#ccc',WebkitTextStroke:'0 transparent',textShadow:'0 3px 8px #000',scale:active ? 1.06 : 1};
  if (styleId === 'boldCaps') return {...base,color:active ? '#000' : '#fff',background:active ? (accentColor || '#FFD400') : 'rgba(0,0,0,0.6)',borderRadius:3,padding:'2px 5px',WebkitTextStroke:'0 transparent',textShadow:'none'};

  // Classic Styles
  if (styleId === 'hormozi') return {...base,WebkitTextStroke:'2px #050505',scale:active ? 1.12 : 1};
  if (styleId === 'editorial') return {...base,color:active ? '#c20000' : '#fff8ee',WebkitTextStroke:'0 transparent',textShadow:'0 4px 10px #000',textDecoration:active ? 'underline' : 'none',textUnderlineOffset:3,scale:active ? 1.05 : 1};
  if (styleId === 'helvetica') return {...base,color:active ? '#fef4b4' : '#fff',background:'rgba(0,0,0,.8)',borderRadius:4,padding:'2px 5px',WebkitTextStroke:'0.5px #000'};
  if (styleId === 'compact') return {...base,color:'#fff',background:active ? '#ff3158' : 'rgba(0,0,0,.72)',borderRadius:5,padding:'2px 5px'};
  if (styleId === 'neon') return {...base,color:active ? '#d7ff27' : '#fff',textShadow:active ? '0 0 5px #d7ff27,0 0 12px #d7ff27,0 5px 10px #000' : '0 5px 10px #000'};
  if (styleId === 'impact') return {...base,color:active ? '#ffd400' : '#fff',WebkitTextStroke:'2px #000',textShadow:'2px 3px 0 #000'};
  if (styleId === 'rounded') return {...base,color:'#fff',background:active ? '#d82b94' : 'rgba(20,8,18,.72)',borderRadius:12,padding:'2px 6px',WebkitTextStroke:'0 transparent'};
  if (styleId === 'minimal') return {...base,color:active ? '#79a8ff' : '#fff',WebkitTextStroke:'0 transparent',textShadow:'0 3px 8px #000',letterSpacing:'.06em',scale:active ? 1.05 : 1};
  if (styleId === 'elegant') return {...base,color:active ? '#f6d79c' : '#fffaf0',WebkitTextStroke:'0 transparent',textShadow:'0 3px 9px #000',scale:active ? 1.05 : 1};
  if (styleId === 'yellow-box') return {...base,color:active ? '#111' : '#fff',background:active ? '#ffd400' : '#111',borderRadius:3,padding:'2px 5px',WebkitTextStroke:'0 transparent',textShadow:'none'};
  if (styleId === 'capcut-pop') return {...base,color:active ? '#ffe24a' : '#fff',WebkitTextStroke:'2px #271500',textShadow:'0 3px 0 #3a1d00,0 7px 12px #000'};
  if (styleId === 'capcut-comic') return {...base,color:active ? '#ff7433' : '#fff8e7',WebkitTextStroke:'2px #281006',textShadow:'2px 3px 0 #281006,0 7px 12px #000'};
  if (styleId === 'capcut-bubble') return {...base,color:active ? '#48e8ff' : '#fff',WebkitTextStroke:'2px #07262c',textShadow:'0 0 6px #48e8ff,0 4px 0 #07262c'};
  if (styleId === 'capcut-hand') return {...base,color:active ? '#ff4a55' : '#fff',WebkitTextStroke:'.5px #1c0909',textShadow:'0 4px 8px #000'};
  if (styleId === 'capcut-story') return {...base,color:active ? '#ffd783' : '#fffaf0',WebkitTextStroke:'.5px #251a0c',textShadow:'0 4px 9px #000'};
  return base;
};

let activeModelPromise: Promise<void> | null = null;
let activeModelKey: 'base' | 'tiny' | null = null;
let activeModelListeners: ((p: number) => void)[] = [];

function SyncedBrollPreview({src, localTime, playing, style}: {src:string; localTime:number; playing:boolean; style:CSSProperties}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sync = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 1) return;
    const target = Math.max(0, localTime) % (Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 1e9);
    if (Math.abs(video.currentTime - target) > (playing ? 0.3 : 0.05)) video.currentTime = target;
    if (playing) void video.play().catch(() => {});
    else video.pause();
  }, [localTime, playing]);
  useEffect(sync, [sync]);
  return <video ref={videoRef} src={src} loop muted playsInline preload="auto" onLoadedMetadata={sync} style={style} />;
}

export default function Home() {
  const [view, setView] = useState<'landing' | 'editor'>('landing');
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'recovery' | 'update_password'>('login');
  const isVipUser = Boolean(userProfile?.is_vip || isAdminUser(sessionUser, userProfile));
  const showWatermark = !isVipUser;
  const [stage, setStage] = useState<AppStage>('upload');
  const [activeTool, setActiveTool] = useState('subtitles');
  const [activeStyle, setActiveStyle] = useState<CaptionStyleId>('personal');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [exportDownloadUrl, setExportDownloadUrl] = useState<string | null>(null);
  const [sourceSize, setSourceSize] = useState({ width:1080, height:1920 });
  const [outputFormat, setOutputFormat] = useState<'original' | '9:16' | '16:9' | '1:1'>('original');
  const [outputFps, setOutputFps] = useState<24|30|60>(30);
  const outputAspect = outputFormat === 'original' ? sourceSize.width / sourceSize.height : outputFormat === '9:16' ? 9/16 : outputFormat === '16:9' ? 16/9 : 1;
  const outputSize = outputAspect > 1.01
    ? { width:1920, height:Math.max(2, Math.round(1920 / outputAspect / 2) * 2) }
    : outputAspect < 0.99
      ? { width:Math.max(2, Math.round(1920 * outputAspect / 2) * 2), height:1920 }
      : { width:1080, height:1080 };
  const [mainDuration, setMainDuration] = useState(0);
  const [secondaryVideoUrl, setSecondaryVideoUrl] = useState<string | null>(null);
  const [secondaryVideoFile, setSecondaryVideoFile] = useState<File | null>(null);
  const [secondaryDuration, setSecondaryDuration] = useState(0);
  const [bgTask, setBgTask] = useState<{ active:boolean; label:string; progress:number; done?:boolean } | null>(null);
  const [fileName, setFileName] = useState('Proyecto sin título');
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [credits, setCredits] = useState(3);
  const [zentryItems, setZentryItems] = useState<ZentryTemplateItem[]>([]);
  const [selectedZentryId, setSelectedZentryId] = useState<string | null>(null);
  const [sfxVolumeMultiplier, setSfxVolumeMultiplier] = useState<number>(1.0);
  const [zentryCategoryFilter, setZentryCategoryFilter] = useState<ZentryCategory>('subtitles');
  const [zentryBrollFilter, setZentryBrollFilter] = useState<'all' | 'top' | 'center' | 'bottom'>('all');
  const [zentryFontVariantMap, setZentryFontVariantMap] = useState<Record<string, ZentryFontVariant>>({});
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [selectedPackStyle, setSelectedPackStyle] = useState<'viral' | 'minimal' | 'editorial' | 'neon' | 'kinetic'>('viral');
  const [selectedPackFont, setSelectedPackFont] = useState<'montserrat' | 'playfair'>('montserrat');
  const [captionGroupStyles, setCaptionGroupStyles] = useState<CaptionGroupStyleOverride[]>([]);
  const [selectedCaptionGroupStartMs, setSelectedCaptionGroupStartMs] = useState<number | null>(null);
  const [savedCaptionTemplates, setSavedCaptionTemplates] = useState<SavedCaptionTemplate[]>([]);
  const [personalPresets, setPersonalPresets] = useState<PersonalPreset[]>([]);
  const [defaultPersonalPresetId, setDefaultPersonalPresetId] = useState<string | null>(null);
  const [personalPresetNameDraft, setPersonalPresetNameDraft] = useState('Mi plantilla');
  const [captionTemplateDialogOpen, setCaptionTemplateDialogOpen] = useState(false);
  const [captionTemplateNameDraft, setCaptionTemplateNameDraft] = useState('');

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
        else data = newProfile as any;
      }

      if (data) {
        setUserProfile(data as UserProfile);
        setCredits(typeof data.credits === 'number' ? data.credits : 3);
      }
    } catch {
      // Usar créditos locales si la tabla no está creada aún
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSessionUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setUserProfile(null);
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

  useEffect(() => {
    // Pre-cargar modelo Whisper en segundo plano para que la transcripción sea inmediata
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      const timer = setTimeout(() => {
        ensureWhisperModel(WHISPER_MODEL, () => {}).catch(() => {});
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);
  const [accentColor, setAccentColor] = useState('#00f5c8');
  const [fontSize, setFontSize] = useState(DEFAULT_TEXT_SIZE);
  const [captionFontFamily, setCaptionFontFamily] = useState('Anton');
  const [captionFontWeight, setCaptionFontWeight] = useState(400);
  const [captionItalic, setCaptionItalic] = useState(false);
  const [captionDualFont, setCaptionDualFont] = useState(false);
  const [captionTopFontFamily, setCaptionTopFontFamily] = useState('Great Vibes');
  const [captionBottomFontFamily, setCaptionBottomFontFamily] = useState('Playfair Display');
  const [captionAlign, setCaptionAlign] = useState<'left'|'center'|'right'>('center');
  const [shadow, setShadow] = useState(true);
  const [popAnimation, setPopAnimation] = useState(true);
  const [jobState, setJobState] = useState<JobState>('idle');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDetail, setJobDetail] = useState('');
  const [jobProgress, setJobProgress] = useState(0);
  useEffect(() => {
    if (jobState !== 'done' || jobTitle === 'Video viralizado con éxito') return;
    const timer = setTimeout(() => setJobState('idle'), 800);
    return () => clearTimeout(timer);
  }, [jobState, jobTitle]);
  const [silences, setSilences] = useState<{start:number;end:number}[]>([]);
  const [removeSilences, setRemoveSilences] = useState(false);
  const [hookLeadText, setHookLeadText] = useState('');
  const [hookMainText, setHookMainText] = useState('');
  const [hookLeadFontFamily, setHookLeadFontFamily] = useState('Great Vibes');
  const [hookMainFontFamily, setHookMainFontFamily] = useState('Anton');
  const [hookLeadFontSize, setHookLeadFontSize] = useState(DEFAULT_TEXT_SIZE);
  const [hookMainFontSize, setHookMainFontSize] = useState(DEFAULT_TEXT_SIZE);
  const [hookLeadDuration, setHookLeadDuration] = useState(DEFAULT_HOOK_DURATION);
  const [hookMainDuration, setHookMainDuration] = useState(DEFAULT_HOOK_DURATION);
  const [hookStyle, setHookStyle] = useState<HookStyleId>('viro');
  const [captionPosition, setCaptionPosition] = useState<CanvasPosition>(DEFAULT_CAPTION_POSITION);
  const [hookPosition, setHookPosition] = useState<CanvasPosition>(DEFAULT_HOOK_POSITION);
  const [selectedCanvasLayer, setSelectedCanvasLayer] = useState<CanvasLayer>('captions');
  const [zoomPunch, setZoomPunch] = useState(true);
  const [motionGraphics, setMotionGraphics] = useState(false);
  const [overlaySrc, setOverlaySrc] = useState<string | null>(null);
  const [brollUrl, setBrollUrl] = useState<string | null>(null);
  const [autoBroll, setAutoBroll] = useState(true);
  const [brollText, setBrollText] = useState('');
  const [brollTypingSound, setBrollTypingSound] = useState(true);
  const [brollTransition, setBrollTransition] = useState<'fade'|'slide'|'zoom'|'flash'|'glitch'|'spin'>('fade');
  const [editSegments, setEditSegments] = useState<EditSegment[]>([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [inspectorMode, setInspectorMode] = useState<'design'|'video'>('design');
  const [videoInspectorTab, setVideoInspectorTab] = useState<'video'|'audio'>('video');
  const [applyVideoToAll, setApplyVideoToAll] = useState(false);
  const [clipAudioProcessing,setClipAudioProcessing] = useState('');
  const [timelineZoom, setTimelineZoom] = useState(48);
  const [canvasZoom, setCanvasZoom] = useState(52);
  const [muted, setMuted] = useState(false);
  const [savedAt, setSavedAt] = useState('ahora');
  const [volume, setVolume] = useState(1);
  const [sfxSrc, setSfxSrc] = useState<string | null>(null);
  const [manualSfxClips,setManualSfxClips] = useState<ManualSfxClip[]>([]);
  const [musicClips, setMusicClips] = useState<MusicClip[]>([]);
  const musicUploadLockRef=useRef(false);
  const [musicUploading,setMusicUploading]=useState(false);
  const ownedMusicUrlsRef=useRef(new Set<string>());
  const draftSaveRevisionRef=useRef(0);
  const [selectedMusicId, setSelectedMusicId] = useState<string | null>(null);
  const [musicUploadVolume, setMusicUploadVolume] = useState(0.35);
  const [selectedSfxCat, setSelectedSfxCat] = useState<SfxCategory>('all');

  // Motion Graphics State
  const [motionGraphicsItems, setMotionGraphicsItems] = useState<MotionGraphicItem[]>([]);
  const [selectedMgId, setSelectedMgId] = useState<string | null>(null);

  // Custom B-Rolls State (Overlays on top of video)
  const [customBrolls, setCustomBrolls] = useState<CustomBrollItem[]>([]);
  const [selectedBrollId, setSelectedBrollId] = useState<string | null>(null);
  const [savedBrollTemplates, setSavedBrollTemplates] = useState<SavedBrollTemplate[]>([]);

  // Placement Modal State (choose currentTime or phrase)
  const [placementModal, setPlacementModal] = useState<{
    isOpen: boolean;
    type: 'broll' | 'motion';
    data: any;
  } | null>(null);

  // Hook Viral Impact Sound
  const [hookSfxEnabled, setHookSfxEnabled] = useState(true);
  const [hookSfxSrc, setHookSfxSrc] = useState<string | null>('/assets/sfx/vine-boom.wav');

  // Dynamic Contextual Sound Engine (Captura 2: audio viral inteligente por palabras clave, brolls y motion graphics)
  const [contextualSfxEvents, setContextualSfxEvents] = useState<ContextualSfxEvent[]>([]);
  const [contextualSfxDisabled, setContextualSfxDisabled] = useState(false);
  const [sfxTimeOverrides, setSfxTimeOverrides] = useState<Record<string,number>>({});
  const [selectedSfxId, setSelectedSfxId] = useState<string|null>(null);

  const syncContextualSfx = () => {
    const events = generateContextualSfxEvents({
      captions,
      customBrolls,
      motionGraphicsItems,
      hookSfxEnabled,
    });
    setContextualSfxEvents(events);
    return events;
  };

  // Pexels B-Roll State
  const [pexelsQuery, setPexelsQuery] = useState('tecnología');
  const [pexelsResults, setPexelsResults] = useState<any[]>([]);
  const [pexelsLoading, setPexelsLoading] = useState(false);
  const [pexelsWarning, setPexelsWarning] = useState('');
  const [pexelsFallback, setPexelsFallback] = useState(false);

  // Transcribed phrases for precision synchronization
  const transcribedPhrases = useMemo(() => {
    if (!captions || !captions.length) return [];
    const phrases: { text: string; start: number; end: number; duration: number }[] = [];
    let currentWords: Caption[] = [];
    for (let i = 0; i < captions.length; i++) {
      currentWords.push(captions[i]);
      const wordText = captions[i].text.trim();
      const isPunctuation = wordText.endsWith('.') || wordText.endsWith('?') || wordText.endsWith('!') || wordText.endsWith(',');
      if (currentWords.length >= 6 || isPunctuation || i === captions.length - 1) {
        const phraseStart = currentWords[0].startMs / 1000;
        const phraseEnd = currentWords[currentWords.length - 1].endMs / 1000;
        phrases.push({
          text: currentWords.map((w) => w.text.trim()).join(' '),
          start: phraseStart,
          end: phraseEnd,
          duration: Math.max(1.5, Math.round((phraseEnd - phraseStart) * 10) / 10),
        });
        currentWords = [];
      }
    }
    return phrases;
  }, [captions]);

  // AI Semantic Analysis: analyzes spoken words and matches 3D style, 3D objects, and punchy text
  const analyzePhraseContext = (phrase: string): {
    category: 'tech' | 'money' | 'fitness' | 'ai' | 'creative';
    style: MotionGraphic3DStyle;
    objects3d: string[];
    punchyText: string;
    highlightWord: string;
    subtitle: string;
  } => {
    const lower = phrase.toLowerCase();
    let category: 'tech' | 'money' | 'fitness' | 'ai' | 'creative' = 'tech';
    let style: MotionGraphic3DStyle = 'photoreal-3d';
    let objects3d: string[] = [];
    let subtitle = '';

    if (/dinero|dólar|dolar|precio|ventas|negocio|ganar|ingresos|rentable|rico|millón|millon|costo|pagar|moneda|cash/i.test(lower)) {
      category = 'money';
      style = 'cinematic-black';
    } else if (/ia|inteligencia artificial|robot|algoritmo|prompt|modelo|automatiz|red neuronal|gpt|claude|deep/i.test(lower)) {
      category = 'ai';
      style = 'editorial-bw';
    } else if (/fitness|entren|fuerza|cuerpo|velocidad|salud|ejercicio|hábito|habito|disciplina|músculo|musculo|gym/i.test(lower)) {
      category = 'fitness';
      style = 'cinematic-black';
    } else if (/creativ|viral|video|truco|atajo|secreto|edición|edicion|contenido|historias|redes|tiktok|reels/i.test(lower)) {
      category = 'creative';
      style = 'collage-vintage';
    }

    const rawWords = phrase.trim().split(/\s+/).filter(Boolean);
    const cleanWords = rawWords.map((w) => w.replace(/[.,/#!$%^&*;:{}=\-_`~()¿?¡!"]/g, ''));
    const segment = cleanWords.length > 5 ? cleanWords.slice(0, 5) : cleanWords;

    const stopWords = new Set(['el','la','los','las','un','una','unos','unas','de','del','a','en','por','para','con','que','es','y','o','no','si','se','te','me','al','su','sus','tu','tus','lo']);
    let highlightWord = segment[segment.length - 1] || 'CLAVE';
    for (let i = segment.length - 1; i >= 0; i--) {
      const w = segment[i].toLowerCase();
      if (!stopWords.has(w) && w.length >= 4) {
        highlightWord = segment[i];
        break;
      }
    }

    const punchyText = segment
      .map((w) => (w.toLowerCase() === highlightWord.toLowerCase() ? `[${w.toUpperCase()}]` : w))
      .join(' ');

    return {
      category,
      style,
      objects3d,
      punchyText: punchyText || 'CREANDO [CONTENIDO]',
      highlightWord,
      subtitle,
    };
  };

  const convertPhraseToMotion3D = (
    phraseText: string,
    startSec: number,
    durationSec: number = 3.5,
    customStyle?: MotionGraphic3DStyle,
    displayMode: 'full' | 'floating' = 'full'
  ) => {
    checkpoint();
    const analyzed = analyzePhraseContext(phraseText);
    const newId = `mg-3d-${Date.now()}`;
    const newItem: MotionGraphicItem = {
      id: newId,
      type: '3d-scene',
      textSource: phraseText.trim() ? 'transcript' : 'manual',
      style: customStyle || analyzed.style,
      start: Math.max(0, Math.round(startSec * 10) / 10),
      duration: Math.max(1.8, Math.round(durationSec * 10) / 10),
      title: analyzed.punchyText,
      subtitle: analyzed.subtitle,
      highlightWord: analyzed.highlightWord,
      displayMode,
      objects3d: analyzed.objects3d,
      sfxSrc: '/assets/sfx/whoosh-cinematic.wav',
    };
    setMotionGraphicsItems((prev) => [...prev, newItem]);
    setSelectedMgId(newId);
    setActiveTool('motion');
    seekTo(startSec);
  };

  const autoGenerateAiMotionGraphics = () => {
    if (!transcribedPhrases || transcribedPhrases.length === 0) {
      setJobState('error');
      setJobTitle('Sin subtítulos disponibles');
      setJobDetail('Primero sube un video y pulsa "Procesar video" para que la IA transcriba y analice tus palabras.');
      return;
    }

    checkpoint();
    const count = Math.min(4, Math.max(2, Math.floor(transcribedPhrases.length / 3)));
    const step = Math.floor(transcribedPhrases.length / count);
    const generated: MotionGraphicItem[] = [];

    for (let i = 0; i < count; i++) {
      const phraseIndex = Math.min(transcribedPhrases.length - 1, i * step + 1);
      const phrase = transcribedPhrases[phraseIndex];
      if (!phrase) continue;

      const analyzed = analyzePhraseContext(phrase.text);
      const displayMode: 'full' | 'floating' = i % 2 === 0 ? 'full' : 'floating';
      const newId = `mg-ai-${Date.now()}-${i}`;

      generated.push({
        id: newId,
        type: '3d-scene',
        style: analyzed.style,
        start: phrase.start,
        duration: phrase.duration,
        title: analyzed.punchyText,
        subtitle: analyzed.subtitle,
        highlightWord: analyzed.highlightWord,
        displayMode,
        objects3d: analyzed.objects3d,
        sfxSrc: [
          '/sfx/motion-graphics/motion_01_hero_split.mp3',
          '/sfx/motion-graphics/motion_02_kinetic_stack.mp3',
          '/sfx/motion-graphics/motion_04_stat_punch.mp3',
          '/sfx/motion-graphics/motion_05_gradient_title.mp3',
          '/sfx/motion-graphics/motion_06_step_sequence.mp3',
          '/assets/sfx/whoosh-cinematic.wav',
          '/assets/sfx/whoosh-hit.mp3',
        ][i % 7],
      });
    }

    setMotionGraphicsItems((prev) => [...prev, ...generated]);
    setActiveTool('motion');
    if (generated[0]) {
      setSelectedMgId(generated[0].id);
      seekTo(generated[0].start);
    }

    setBgTask({
      active: false,
      label: `✓ ${generated.length} Motion Graphics 3D generados con tus palabras reales`,
      progress: 1,
      done: true,
    });
    setTimeout(() => setBgTask(null), 4500);
  };

  const autoSuggestBrollForPhrase = async (phraseText: string, startSec: number, durationSec: number = 3.5) => {
    const analyzed = analyzePhraseContext(phraseText);
    const searchMap: Record<string, string> = {
      tech: 'tecnología',
      money: 'dinero negocios',
      ai: 'inteligencia artificial',
      fitness: 'fitness gym',
      creative: 'creatividad digital',
    };
    const query = searchMap[analyzed.category] || 'tecnología';
    setPexelsQuery(query);
    setActiveTool('broll');
    setBgTask({ active: true, label: `Buscando B-Roll para: "${query}"...`, progress: 0.4 });
    try {
      const res = await fetch(`/api/pexels?query=${encodeURIComponent(query)}&per_page=6`);
      if (res.ok) {
        const data: any = await res.json();
        if (data.videos && data.videos.length > 0) {
          setPexelsResults(data.videos);
          setPexelsWarning(data.warning || ''); setPexelsFallback(Boolean(data.fallback));
          const best = data.videos[0];
          addCustomBroll(best.videoUrl, true, `B-Roll IA: ${query}`, startSec, durationSec);
          setBgTask({ active: false, label: `✓ B-Roll añadido en ${startSec.toFixed(1)}s`, progress: 1, done: true });
        }
      }
    } catch {}
    setTimeout(() => setBgTask(null), 3500);
  };

  const addCustomBroll = (src: string, isVideo: boolean, title: string, startSec: number, durationSec: number = 3.5) => {
    checkpoint();
    const newId = `broll-${Date.now()}`;
    const newItem: CustomBrollItem = {
      id: newId,
      src,
      type: isVideo ? 'video' : 'image',
      start: Math.max(0, Math.round(startSec * 10) / 10),
      duration: durationSec,
      title,
      transitionIn: 'whip-pan',
      transitionOut: 'smooth-fade',
      fontFamily: 'Montserrat',
      fontSize: DEFAULT_TEXT_SIZE,
      textColor: '#ffffff',
      accentColor: '#00f5c8',
      backgroundColor: '#050505',
      textEffect: 'spring',
      sfxSrc: '/assets/sfx/keyboard-mechanical.wav',
      sfxVolume: 0.3,
      sfxEnabled: true,
    };
    setCustomBrolls((prev) => replaceOverlappingBroll(prev, newItem));
    setSelectedBrollId(newId);
    setActiveTool('broll');
    setPlacementModal(null);
  };

  const updateCustomBroll = (id: string, updates: Partial<CustomBrollItem>) => {
    if (['fontFamily','fontSize','accentColor','dualFont','topFontFamily','bottomFontFamily'].some(key=>key in updates) && updates.inheritCaptionStyle===undefined) updates={...updates,inheritCaptionStyle:false};
    if(updates.brollText!==undefined || updates.brollHeadline!==undefined) updates={...updates,textSource:'manual'};
    checkpoint();
    setCustomBrolls((prev) => {
      const original = prev.find((item) => item.id === id);
      return original ? replaceOverlappingBroll(prev, { ...original, ...updates }) : prev;
    });
  };

  const deleteCustomBroll = (id: string) => {
    checkpoint();
    setCustomBrolls((prev) => prev.filter((item) => item.id !== id));
    if (selectedBrollId === id) setSelectedBrollId(null);
  };

  const insertBrollTemplate = (style: 'white-minimal' | 'red-impact' | 'black-oled', settings?: Partial<CustomBrollItem>) => {
    checkpoint();
    const newId = `broll-tpl-${Date.now()}`;
    const startSec = Math.max(0, Math.round(currentTime * 10) / 10);
    const matchingCaps = captions.filter(
      (c) => (c.startMs / 1000) <= (startSec + 3.5) && (c.endMs / 1000) >= startSec
    );
    const spokenText = matchingCaps.map((c) => c.text).join(' ').trim();
    const defaultHeadline = style === 'white-minimal' ? 'ENFOQUE TOTAL' : style === 'red-impact' ? 'ALERTA MÁXIMA' : 'CLAVE DEFINITIVA';
    const headline = spokenText || defaultHeadline;
    const defaultIcon = style === 'white-minimal' ? '💡' : style === 'red-impact' ? '⚡' : '💎';

    const newItem: CustomBrollItem = {
      src: '',
      type: 'image',
      title:
        style === 'white-minimal'
          ? 'B-Roll Blanco Minimal'
          : style === 'red-impact'
          ? 'B-Roll Rojo Impacto'
          : 'B-Roll Negro OLED',
      brollStyle: style,
      brollHeadline: headline,
      brollText: spokenText,
      icon3d: defaultIcon,
      transitionDirection: 'slide-up',
      transitionIn: 'whip-pan',
      transitionOut: 'smooth-fade',
      fontFamily: 'Montserrat',
      fontSize: DEFAULT_TEXT_SIZE,
      textColor: style === 'white-minimal' ? '#111827' : '#ffffff',
      accentColor: style === 'red-impact' ? '#fef08a' : style === 'black-oled' ? '#00f5c8' : '#2563eb',
      backgroundColor: style === 'white-minimal' ? '#ffffff' : style === 'red-impact' ? '#991b1b' : '#050505',
      textEffect: 'editorial',
      dualFont: true,
      topFontFamily: 'Pacifico',
      bottomFontFamily: 'Anton',
      sfxSrc: '/assets/sfx/keyboard-mechanical.wav',
      sfxVolume: 0.3,
      sfxEnabled: true,
      ...settings,
      id: newId,
      start: startSec,
      duration: 3.5,
    };
    setCustomBrolls((prev) => replaceOverlappingBroll(prev, newItem));
    setSelectedBrollId(newId);
    setActiveTool('broll');
  };

  const insertBrollTemplateForPhrase = (
    style: 'white-minimal' | 'red-impact' | 'black-oled',
    text: string,
    startSec: number,
    durationSec: number = 3.5
  ) => {
    checkpoint();
    const newId = `broll-tpl-${Date.now()}`;
    const defaultIcon = style === 'white-minimal' ? '💡' : style === 'red-impact' ? '⚡' : '💎';
    const cleanWords = text.trim().split(/\s+/).filter(Boolean).slice(0, 8).join(' ');
    const newItem: CustomBrollItem = {
      id: newId,
      src: '',
      type: 'image',
      start: Math.max(0, Math.round(startSec * 10) / 10),
      duration: Math.max(2, Math.round(durationSec * 10) / 10),
      title:
        style === 'white-minimal'
          ? 'B-Roll Blanco Minimal'
          : style === 'red-impact'
          ? 'B-Roll Rojo Impacto'
          : 'B-Roll Negro OLED',
      brollStyle: style,
      brollHeadline: cleanWords.toUpperCase(),
      brollText: cleanWords,
      icon3d: defaultIcon,
      transitionDirection: 'slide-up',
      transitionIn: 'whip-pan',
      transitionOut: 'smooth-fade',
      fontFamily: 'Montserrat',
      fontSize: DEFAULT_TEXT_SIZE,
      textColor: style === 'white-minimal' ? '#111827' : '#ffffff',
      accentColor: style === 'red-impact' ? '#fef08a' : style === 'black-oled' ? '#00f5c8' : '#2563eb',
      backgroundColor: style === 'white-minimal' ? '#ffffff' : style === 'red-impact' ? '#991b1b' : '#050505',
      textEffect: 'spring',
      sfxSrc: '/assets/sfx/keyboard-mechanical.wav',
      sfxVolume: 0.3,
      sfxEnabled: true,
    };
    setCustomBrolls((prev) => replaceOverlappingBroll(prev, newItem));
    setSelectedBrollId(newId);
    setActiveTool('broll');
    seekTo(startSec);
  };

  const add3DMotionGraphic = (style: MotionGraphic3DStyle, startSec: number, durationSec: number = 3.5, displayMode: 'full' | 'floating' = 'full') => {
    checkpoint();
    const newId = `mg-3d-${Date.now()}`;
    const matchingCaps = captions.filter(
      (c) => (c.startMs / 1000) <= (startSec + durationSec) && (c.endMs / 1000) >= startSec
    );
    const combinedSpeech = matchingCaps.map((c) => c.text).join(' ').trim();

    let dynamicTitle = '';
    let dynamicSubtitle = '';
    let dynamicHighlight = '';
    let dynamicObjects = ['⚡ Impacto', '💡 Idea'];
    let icon3d = '⚡';

    if (combinedSpeech) {
      const analyzed = analyzePhraseContext(combinedSpeech);
      dynamicTitle = analyzed.punchyText;
      dynamicSubtitle = analyzed.subtitle;
      dynamicHighlight = analyzed.highlightWord;
      dynamicObjects = analyzed.objects3d;
      icon3d = analyzed.objects3d[0]?.split(' ')[0] || '⚡';
    } else {
      const defaults: Record<MotionGraphic3DStyle, { title: string; subtitle: string; highlightWord: string; objects3d: string[]; icon: string }> = {
        'editorial-bw': { title: 'PUNTO [CLAVE]', subtitle: '', highlightWord: 'CLAVE', objects3d: ['🧠 Cerebro'], icon: '🧠' },
        'cinematic-black': { title: 'MÁXIMA [VELOCIDAD]', subtitle: '', highlightWord: 'VELOCIDAD', objects3d: ['⚡ Rayo'], icon: '⚡' },
        'photoreal-3d': { title: 'IMPACTO [TOTAL]', subtitle: '', highlightWord: 'TOTAL', objects3d: ['💡 Luz'], icon: '💡' },
        'collage-vintage': { title: 'ATAJO [SECRETO]', subtitle: '', highlightWord: 'SECRETO', objects3d: ['✂️ Tijeras'], icon: '🚀' },
      };
      const d = defaults[style] || defaults['editorial-bw'];
      dynamicTitle = d.title;
      dynamicSubtitle = d.subtitle;
      dynamicHighlight = d.highlightWord;
      dynamicObjects = d.objects3d;
      icon3d = d.icon;
    }

    const newItem: MotionGraphicItem = {
      id: newId,
      type: '3d-scene',
      style,
      textSource: combinedSpeech ? 'transcript' : 'manual',
      start: Math.max(0, Math.round(startSec * 10) / 10),
      duration: durationSec,
      title: dynamicTitle,
      subtitle: dynamicSubtitle,
      highlightWord: dynamicHighlight,
      displayMode,
      objects3d: dynamicObjects,
      icon3d,
      entranceTransition: 'slide-up',
      sfxSrc: '/assets/sfx/whoosh-cinematic.wav',
    };
    setMotionGraphicsItems((prev) => [...prev, newItem]);
    setSelectedMgId(newId);
    setActiveTool('motion');
    setPlacementModal(null);
  };

  const applyMasterTemplate = (tmplId: 'storytelling' | 'marca-personal' | 'editorial' | 'hormozi') => {
    checkpoint();
    if (tmplId === 'storytelling') {
      setActiveStyle('editorialStory');
      setCaptionFontFamily('Playfair Display');
      setAccentColor('#00f5c8');
      setBrollTransition('fade');
      setHookStyle('editorial');
      setHookLeadFontFamily('Playfair Display');
      setHookMainFontFamily('Montserrat');
      setJobTitle('Plantilla Storytelling Pro aplicada');
    } else if (tmplId === 'marca-personal') {
      setActiveStyle('estebanStyle');
      setCaptionFontFamily('Montserrat');
      setAccentColor('#00f5c8');
      setBrollTransition('slide');
      setHookStyle('viro');
      setHookLeadFontFamily('Great Vibes');
      setHookMainFontFamily('Montserrat');
      setJobTitle('Plantilla Marca Personal aplicada');
    } else if (tmplId === 'editorial') {
      setActiveStyle('magazineEditorial');
      setCaptionFontFamily('Playfair Display');
      setAccentColor('#eab308');
      setBrollTransition('zoom');
      setHookStyle('editorial');
      setHookLeadFontFamily('Playfair Display');
      setHookMainFontFamily('Playfair Display');
      setJobTitle('Plantilla Editorial Aesthetic aplicada');
    } else if (tmplId === 'hormozi') {
      setActiveStyle('hormozi');
      setCaptionFontFamily('Anton');
      setAccentColor('#ffd400');
      setBrollTransition('glitch');
      setHookStyle('impact');
      setHookLeadFontFamily('Inter');
      setHookMainFontFamily('Anton');
      setHookSfxEnabled(true);
      setJobTitle('Plantilla Hormozi Viral aplicada');
    }
    setJobState('done');
    setJobDetail('Tipografía, estilo, colores y hook configurados con 1 clic.');
  };

  const addMotionGraphic = (type: MotionGraphicCardType) => {
    checkpoint();
    const startSec = Math.max(0, Math.round(currentTime * 10) / 10);
    const durationSec = 3.5;
    const matchingCaps = captions.filter(
      (c) => (c.startMs / 1000) <= (startSec + durationSec) && (c.endMs / 1000) >= startSec
    );
    const combinedSpeech = matchingCaps.map((c) => c.text).join(' ').trim();

    let dynamicTitle = 'DATO CLAVE';
    let dynamicValue = '+100%';
    let dynamicSubtitle = '';
    let icon3d = '⚡';

    if (combinedSpeech) {
      const analyzed = analyzePhraseContext(combinedSpeech);
      dynamicTitle = type === 'pill' ? `TIP: ${analyzed.highlightWord}` : analyzed.punchyText;
      dynamicSubtitle = analyzed.subtitle;
      dynamicValue = type === 'stat' ? '+340%' : combinedSpeech;
      icon3d = analyzed.objects3d[0]?.split(' ')[0] || '💡';
    }

    const newId = `mg-${Date.now()}`;
    const newItem: MotionGraphicItem = {
      id: newId,
      type,
      style: 'apple',
      start: startSec,
      duration: durationSec,
      title: dynamicTitle,
      value: dynamicValue,
      subtitle: dynamicSubtitle,
      positionX: 50,
      positionY: 50,
      icon3d,
      entranceTransition: 'slide-up',
    };
    setMotionGraphicsItems((prev) => [...prev, newItem]);
    setSelectedMgId(newId);
    setActiveTool('motion');
  };

  const updateMotionGraphic = (id: string, updates: Partial<MotionGraphicItem>) => {
    if(updates.title!==undefined || updates.subtitle!==undefined) updates={...updates,textSource:'manual'};
    checkpoint();
    setMotionGraphicsItems((prev) => prev.map((item) => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteMotionGraphic = (id: string) => {
    checkpoint();
    setMotionGraphicsItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedMgId === id) setSelectedMgId(null);
  };

  const playSfxPreview = (sfxId: string) => {
    try {
      const sfx = ZENTRY_SFX_MAP[sfxId as ZentrySfxId];
      if (sfx) {
        const audio = new window.Audio('/' + (sfx.file.startsWith('/') ? sfx.file.slice(1) : sfx.file));
        audio.volume = Math.min(1, Math.max(0, sfx.volume * sfxVolumeMultiplier));
        audio.play().catch(() => {});
      }
    } catch {}
  };

  const applyZentryTemplate = (
    tplId: string,
    fontVariant?: ZentryFontVariant,
    mode: 'default' | 'all' = 'default'
  ) => {
    const tpl = getZentryTemplate(tplId);
    if (!tpl) return;
    const fVariant = fontVariant || zentryFontVariantMap[tplId] || (tpl.fontVariants ? tpl.fontVariants[0] : undefined);
    checkpoint();

    // 1. SUBTITLES CATEGORY (APPLY TO GLOBAL CAPTIONS STYLE)
    if (tpl.category === 'subtitles') {
      setCaptionFontFamily(fVariant === 'playfair' ? '"Playfair Display", serif' : 'Montserrat, sans-serif');
      setFontSize(DEFAULT_TEXT_SIZE);
      setPopAnimation(true);
      const sfxFile = ZENTRY_SFX_MAP[tpl.sfxId]?.file;
      if (sfxFile) {
        setSfxSrc('/' + (sfxFile.startsWith('/') ? sfxFile.slice(1) : sfxFile));
      }
      if (tpl.id.includes('yellow') || tpl.id.includes('bubble') || tpl.id.includes('micro')) {
        setActiveStyle('impactoStats');
        setAccentColor('#FFE600');
        setCaptionItalic(false);
      } else if (tpl.id.includes('gradient') || tpl.id.includes('editorial') || tpl.id.includes('clean')) {
        setActiveStyle('editorialStory');
        setAccentColor(tpl.id.includes('clean') ? '#FFFFFF' : '#00D4FF');
        setCaptionItalic(true);
      } else if (tpl.id.includes('mint')) {
        setActiveStyle('motivacionalDual');
        setAccentColor('#00FF66');
        setCaptionItalic(true);
      } else if (tpl.id.includes('caps')) {
        setActiveStyle('boldCaps');
        setAccentColor('#FFD400');
        setCaptionItalic(false);
      } else {
        setActiveStyle('estebanStyle');
        setAccentColor('#00F5C8');
        setCaptionItalic(false);
      }
      playSfxPreview(tpl.sfxId);

      if (mode === 'all') {
        const subtitleItems: ZentryTemplateItem[] = previewCaptionGroups.map((group, index) => {
          const text = captions
            .slice(group.startIndex, group.endIndex)
            .map((caption) => caption.text.trim())
            .filter(Boolean)
            .join(' ');
          return {
            id: `zentry-subtitle-${tpl.id}-${group.startMs}-${index}`,
            presetId: tpl.id,
            category: 'subtitles',
            fontVariant: fVariant,
            start: group.startMs / 1000,
            duration: Math.max(0.12, (group.endMs - group.startMs) / 1000),
            sfxEnabled: false,
            sfxVolume: 1,
            sfxId: tpl.sfxId,
            offsetFrames: tpl.offsetFrames,
            sfxLinked: true,
            customProps: { text: text || 'SUBTÍTULO', animation: tpl.id, fontVariant: fVariant },
          };
        });
        setZentryItems((previous) => [
          ...previous.filter((item) => item.category !== 'subtitles'),
          ...subtitleItems,
        ]);
        setJobState('done');
        setJobTitle(`Plantilla ${tpl.name} aplicada a ${subtitleItems.length} grupos reales`);
        setTimeout(() => setJobState('idle'), 2000);
        return;
      }
    }

    // 2. Find spoken words from actual transcribed audio
    const activeGroup =
      previewCaptionGroups.find((g) => currentTime * 1000 >= g.startMs && currentTime * 1000 < g.endMs) ||
      previewCaptionGroups.find((g) => Math.abs(currentTime * 1000 - g.startMs) < 2000) ||
      (previewCaptionGroups.length > 0
        ? [...previewCaptionGroups].sort((a, b) => Math.abs(currentTime * 1000 - a.startMs) - Math.abs(currentTime * 1000 - b.startMs))[0]
        : null);

    const groupWords = activeGroup ? captions.slice(activeGroup.startIndex, activeGroup.endIndex) : [];
    const groupText = groupWords.map((c) => c.text.trim()).filter(Boolean).join(' ');

    const activePhrase = transcribedPhrases.find(
      (p) => currentTime >= p.start && currentTime < p.end
    );
    const spokenText = groupText || (activePhrase ? activePhrase.text.trim() : '') || (captions[0]?.text.trim() ?? '');
    const words = spokenText.split(/\s+/).filter(Boolean);

    const itemStart = activeGroup
      ? Math.round((activeGroup.startMs / 1000) * 10) / 10
      : Math.max(0, Math.round(currentTime * 10) / 10);
    const itemDuration = activeGroup
      ? Math.max(tpl.category === 'subtitles' ? 0.12 : 2.0, Math.round(((activeGroup.endMs - activeGroup.startMs) / 1000) * 10) / 10)
      : tpl.duration;

    // 3. HOOKS CATEGORY
    if (tpl.category === 'hooks') {
      setHookLeadFontSize(DEFAULT_TEXT_SIZE);
      setHookMainFontSize(DEFAULT_TEXT_SIZE);
      setHookLeadDuration(DEFAULT_HOOK_DURATION);
      setHookMainDuration(DEFAULT_HOOK_DURATION);
      const hookStyles:Record<string,HookStyleId>={hook_01_dual_line:'viro',hook_02_left_keyword:'boldcaps',hook_03_question:'clean',hook_04_number:'impact',hook_05_gradient:'motivacional',hook_06_editorial:'editorial'};
      setHookStyle(hookStyles[tpl.id] ?? 'viro');
      if (words.length > 0) {
        setHookLeadText(words[0] || 'ESTO CAMBIA');
        setHookMainText(words.slice(1, 5).join(' ') || 'TODO');
      } else if (!hookLeadText.trim() && captions.length > 0) {
        const autoWords = getAutomaticHook(captions).split(/\s+/).filter(Boolean);
        setHookLeadText(autoWords[0] || 'ESTO CAMBIA');
        setHookMainText(autoWords.slice(1, 5).join(' ') || 'TODO');
      }
      if (fVariant === 'playfair') {
        setHookMainFontFamily('"Playfair Display", serif');
      } else {
        setHookMainFontFamily('Montserrat, sans-serif');
      }
      setHookSfxSrc('/' + (ZENTRY_SFX_MAP[tpl.sfxId]?.file.startsWith('/') ? ZENTRY_SFX_MAP[tpl.sfxId].file.slice(1) : ZENTRY_SFX_MAP[tpl.sfxId]?.file));
      setHookSfxEnabled(true);
      seekTo(0);
      setJobState('done');
      setJobTitle(`Hook ${tpl.name} aplicado`);
      setTimeout(() => setJobState('idle'), 2000);
      playSfxPreview(tpl.sfxId);
      return;
    }

    // 4. BROLL CATEGORY (UPDATE IF SELECTED, OR CREATE NEW CUSTOM BROLL)
    if (tpl.category === 'broll') {
      const bStyle = tpl.brollSubcategory === 'center' ? 'red-impact' : tpl.brollSubcategory === 'top' ? 'white-minimal' : 'black-oled';
      const bIcon = tpl.brollSubcategory === 'center' ? '⚡' : tpl.brollSubcategory === 'top' ? '💡' : '💎';

      if (selectedBrollId) {
        setCustomBrolls((prev) =>
          prev.map((b) =>
            b.id === selectedBrollId
              ? {
                  ...b,
                  brollStyle: bStyle,
                  title: spokenText || b.title || tpl.name,
                  brollHeadline: (spokenText || b.title || tpl.name).toUpperCase(),
                   brollText: spokenText,
                   icon3d: bIcon,
                   templateId: tpl.id,
                  templateFontVariant: fVariant,
                  templateSfxEnabled: true,
                  dualFont: false,
                   fontFamily: b.fontFamily || 'Montserrat',
                   fontSize: b.fontSize || DEFAULT_TEXT_SIZE,
                   textColor: bStyle === 'white-minimal' ? '#111827' : '#ffffff',
                   accentColor: bStyle === 'red-impact' ? '#fef08a' : bStyle === 'black-oled' ? '#00f5c8' : '#2563eb',
                   backgroundColor: bStyle === 'white-minimal' ? '#ffffff' : bStyle === 'red-impact' ? '#991b1b' : '#050505',
                   textEffect: b.textEffect || 'spring',
                   sfxSrc: b.sfxSrc || '/assets/sfx/keyboard-mechanical.wav',
                   sfxVolume: b.sfxVolume ?? 0.3,
                   sfxEnabled: b.sfxEnabled ?? true,
                   transitionIn: 'whip-pan',
                  transitionOut: 'smooth-fade',
                }
              : b
          )
        );
      } else {
        const newBrollId = `broll-zentry-${Date.now()}`;
        const newBroll: CustomBrollItem = {
          id: newBrollId,
          src: '',
          type: 'image',
          start: itemStart,
          duration: 3.5,
          title: spokenText || tpl.name,
          brollStyle: bStyle,
          brollHeadline: (spokenText || tpl.name).toUpperCase(),
          brollText: spokenText,
          icon3d: bIcon,
          templateId: tpl.id,
          templateFontVariant: fVariant,
          templateSfxEnabled: true,
          fontFamily: 'Montserrat',
          fontSize: DEFAULT_TEXT_SIZE,
          textColor: bStyle === 'white-minimal' ? '#111827' : '#ffffff',
          accentColor: bStyle === 'red-impact' ? '#fef08a' : bStyle === 'black-oled' ? '#00f5c8' : '#2563eb',
          backgroundColor: bStyle === 'white-minimal' ? '#ffffff' : bStyle === 'red-impact' ? '#991b1b' : '#050505',
          textEffect: 'spring',
          sfxSrc: '/assets/sfx/keyboard-mechanical.wav',
          sfxVolume: 0.3,
          sfxEnabled: true,
          transitionIn: 'whip-pan',
          transitionOut: 'smooth-fade',
        };
        setCustomBrolls((prev) => replaceOverlappingBroll(prev, newBroll));
        setSelectedBrollId(newBrollId);
      }
      setActiveTool('broll');
      seekTo(itemStart);
      setJobState('done');
      setJobTitle(`B-roll ${tpl.name} aplicado con audio`);
      setTimeout(() => setJobState('idle'), 2000);
      playSfxPreview(tpl.sfxId);
      return;
    }

    // 5. MOTION GRAPHICS CATEGORY: mount the real Remotion template.
    // Preview MP4s are catalog thumbnails only and must never become production layers.
    if (tpl.category === 'motion-graphics') {
      const motionWords = spokenText.split(/\s+/).filter(Boolean);
      const motionSplitAt = motionWords.length <= 4 ? Math.max(1,Math.ceil(motionWords.length / 2)) : 4;
      const motionTitle = motionWords.slice(0, motionSplitAt).join(' ').toUpperCase() || tpl.name.toUpperCase();
      const motionSubtitle = motionWords.slice(motionSplitAt).join(' ') || 'Zentry Motion 3D';
      const customProps = {
        text: spokenText || motionTitle,
        title: motionTitle,
        subtitle: motionSubtitle,
        top: motionTitle,
        main: motionSubtitle,
        lines: motionWords.length ? motionWords.slice(0, 3) : [motionTitle],
      };
      const selectedMotionTemplate = selectedZentryId
        ? zentryItems.find((item) => item.id === selectedZentryId && item.category === 'motion-graphics')
        : null;
      if (selectedMotionTemplate) {
        updateZentryItem(selectedMotionTemplate.id, {
          presetId: tpl.id,
          sfxId: tpl.sfxId,
          offsetFrames: tpl.offsetFrames,
          customProps,
        });
      } else {
        const newItem: ZentryTemplateItem = {
          id: `zentry-motion-${Date.now()}`,
          presetId: tpl.id,
          category: 'motion-graphics',
          start: itemStart,
          duration: Math.max(2, tpl.duration),
          sfxEnabled: true,
          sfxVolume: 1,
          sfxId: tpl.sfxId,
          offsetFrames: tpl.offsetFrames,
          sfxLinked: true,
          customProps,
        };
        setZentryItems((prev) => [...prev, newItem]);
        setSelectedZentryId(newItem.id);
      }
      setSelectedMgId(null);
      setActiveTool('zentry-motion');
      seekTo(itemStart);
      setJobState('done');
      setJobTitle(`Motion Graphic ${tpl.name} aplicado con audio`);
      setTimeout(() => setJobState('idle'), 2000);
      playSfxPreview(tpl.sfxId);
      return;
    }

    // 6. TYPOGRAPHY & POSITIONED ZENTRY TEMPLATES
    const customProps: Record<string, any> = {
      text: (spokenText || 'PALABRA CLAVE').toUpperCase(),
      animation: tpl.id,
      fontVariant: fVariant,
    };

    // “En posición” siempre crea un subtítulo nuevo. Mantener un clip seleccionado
    // no debe convertir accidentalmente la siguiente inserción en un reemplazo.
    const selectedItem = tpl.category !== 'subtitles' && selectedZentryId
      ? zentryItems.find((z) => z.id === selectedZentryId && z.category === tpl.category)
      : null;
    if (selectedItem) {
      updateZentryItem(selectedItem.id, {
        presetId: tpl.id,
        category: tpl.category,
        fontVariant: fVariant,
        sfxId: tpl.sfxId,
        offsetFrames: tpl.offsetFrames,
        customProps,
      });
      playSfxPreview(tpl.sfxId);
      setJobState('done');
      setJobTitle(`Tipografía cambiada a ${tpl.name}`);
      setTimeout(() => setJobState('idle'), 2000);
      return;
    }

    const newItem: ZentryTemplateItem = {
      id: `zentry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      presetId: tpl.id,
      category: tpl.category,
      brollSubcategory: tpl.brollSubcategory,
      fontVariant: fVariant,
      start: itemStart,
      duration: itemDuration,
      sfxEnabled: true,
      sfxVolume: 1.0,
      sfxId: tpl.sfxId,
      offsetFrames: tpl.offsetFrames,
      sfxLinked: true,
      customProps,
    };

    setZentryItems((prev) => [...prev, newItem]);
    setSelectedZentryId(newItem.id);
    seekTo(itemStart);
    setActiveTool('zentry-motion');
    playSfxPreview(tpl.sfxId);
    setJobState('done');
    setJobTitle(`Tipografía ${tpl.name} aplicada`);
    setTimeout(() => setJobState('idle'), 2000);
  };

  const handleDeleteSelectedObject = () => {
    checkpoint();
    let deleted = false;
    if (selectedMusicId) {
      setMusicClips((clips) => clips.filter((clip) => clip.id !== selectedMusicId));
      setSelectedMusicId(null);
      deleted = true;
    } else if (selectedZentryId) {
      setZentryItems((prev) => prev.filter((z) => z.id !== selectedZentryId));
      setSelectedZentryId(null);
      deleted = true;
    } else if (selectedBrollId) {
      setCustomBrolls((prev) => prev.filter((b) => b.id !== selectedBrollId));
      setSelectedBrollId(null);
      deleted = true;
    } else if (selectedMgId) {
      setMotionGraphicsItems((prev) => prev.filter((m) => m.id !== selectedMgId));
      setSelectedMgId(null);
      deleted = true;
    } else if (selectedCaptionGroup) {
      setCaptions((prev) => [...prev.slice(0, selectedCaptionGroup.startIndex), ...prev.slice(selectedCaptionGroup.endIndex)]);
      setCaptionGroupStyles((prev) => prev.filter((style) => style.startMs !== selectedCaptionGroup.startMs));
      setSelectedCaptionGroupStartMs(null);
      deleted = true;
    } else if (selectedSegmentId && editSegments.length > 1) {
      deleteSegment(selectedSegmentId, true);
      deleted = true;
    } else {
      // Buscar objeto activo en el playhead
      const activeZentry = zentryItems.find((z) => currentTime >= z.start && currentTime < z.start + z.duration);
      if (activeZentry) {
        setZentryItems((prev) => prev.filter((z) => z.id !== activeZentry.id));
        deleted = true;
      } else {
        const activeBroll = customBrolls.find((b) => currentTime >= b.start && currentTime < b.start + b.duration);
        if (activeBroll) {
          setCustomBrolls((prev) => prev.filter((b) => b.id !== activeBroll.id));
          deleted = true;
        } else {
          const activeMg = motionGraphicsItems.find((m) => currentTime >= m.start && currentTime < m.start + m.duration);
          if (activeMg) {
            setMotionGraphicsItems((prev) => prev.filter((m) => m.id !== activeMg.id));
            deleted = true;
          }
        }
      }
    }
    if (deleted) {
      setJobState('done');
      setJobTitle('Objeto eliminado');
      setTimeout(() => setJobState('idle'), 2000);
    }
  };

  const handleUpdateSelectedObject = (targetBrollId?: string, targetZentryId?: string) => {
    checkpoint();
    let updated = false;
    let updateMsg = '';

    // Buscar B-roll seleccionado o activo en el playhead
    const activeBroll = targetBrollId
      ? customBrolls.find((b) => b.id === targetBrollId)
      : selectedBrollId
      ? customBrolls.find((b) => b.id === selectedBrollId)
      : customBrolls.find((b) => currentTime >= b.start && currentTime < b.start + b.duration);

    // Buscar Motion Graphic seleccionado o activo en el playhead
    const activeMg = selectedMgId
      ? motionGraphicsItems.find((m) => m.id === selectedMgId)
      : motionGraphicsItems.find((m) => currentTime >= m.start && currentTime < m.start + m.duration);

    // Buscar Zentry item seleccionado o activo en el playhead
    const activeZentry = targetZentryId
      ? zentryItems.find((z) => z.id === targetZentryId)
      : selectedZentryId
      ? zentryItems.find((z) => z.id === selectedZentryId)
      : zentryItems.find((z) => currentTime >= z.start && currentTime < z.start + z.duration);

    if (activeBroll) {
      setSelectedBrollId(activeBroll.id);
      const matchingCaps = captions.filter(
        (c) => (c.startMs / 1000) <= (activeBroll.start + activeBroll.duration) && (c.endMs / 1000) >= activeBroll.start
      );
      const spokenText = matchingCaps.map((c) => c.text).join(' ').trim();
      const firstWords = spokenText ? spokenText.split(' ').slice(0, 4).join(' ').toUpperCase() : '';
      const activeTrans = brollTransition === 'fade' ? 'smooth-fade' : brollTransition === 'glitch' ? 'rgb-glitch' : brollTransition === 'zoom' ? 'zoom-punch' : 'whip-pan';

      setCustomBrolls((prev) =>
        dedupeCustomBrolls(prev.map((b) =>
          b.id === activeBroll.id
            ? {
                ...b,
                brollText: spokenText || b.brollText,
                brollHeadline: firstWords || b.brollHeadline,
                transitionIn: activeTrans,
                transitionOut: 'smooth-fade',
              }
            : b
        ))
      );
      updated = true;
      updateMsg = `B-roll actualizado (Transición: ${activeTrans})`;
    } else if (activeMg) {
      setSelectedMgId(activeMg.id);
      const matchingCaps = captions.filter(
        (c) => (c.startMs / 1000) <= (activeMg.start + activeMg.duration) && (c.endMs / 1000) >= activeMg.start
      );
      const spokenText = matchingCaps.map((c) => c.text).join(' ').trim();
      const motionWords = spokenText.split(/\s+/).filter(Boolean);
      setMotionGraphicsItems((prev) =>
        prev.map((m) =>
          m.id === activeMg.id
              ? {
                  ...m,
                  title: motionWords.length ? motionWords.slice(0, 4).join(' ').toUpperCase() : m.title,
                  subtitle: motionWords.length > 4 ? motionWords.slice(4).join(' ') : m.subtitle,
                entranceTransition: 'slide-up',
              }
            : m
        )
      );
      updated = true;
      updateMsg = 'Motion Graphic actualizado con audio y tipografía';
    } else if (activeZentry) {
      setSelectedZentryId(activeZentry.id);
      const matchingCaps = captions.filter(
        (c) => (c.startMs / 1000) <= (activeZentry.start + activeZentry.duration) && (c.endMs / 1000) >= activeZentry.start
      );
      const spokenText = matchingCaps.map((c) => c.text).join(' ').trim();
      const tpl = getZentryTemplate(activeZentry.presetId);
      setZentryItems((prev) =>
        prev.map((z) =>
          z.id === activeZentry.id
            ? {
                ...z,
                customProps: {
                  ...(z.customProps || {}),
                  spokenText: spokenText || z.customProps?.spokenText,
                  title: spokenText ? spokenText.slice(0, 30) : z.customProps?.title,
                  text: spokenText ? spokenText.toUpperCase() : z.customProps?.text,
                },
              }
            : z
        )
      );
      if (tpl?.sfxId) playSfxPreview(tpl.sfxId);
      updated = true;
      updateMsg = 'Tipografía Zentry actualizada con audio actual';
    } else {
      // Subtítulos o actualización general de estilos
      setJobState('done');
      setJobTitle('Subtítulos y estilos del reproductor actualizados');
      setTimeout(() => setJobState('idle'), 2000);
      return;
    }

    if (updated) {
      setJobState('done');
      setJobTitle(updateMsg || 'Elemento actualizado');
      setTimeout(() => setJobState('idle'), 2000);
    }
  };

  const autoGenerateZentryPack = (
    packType: 'viral' | 'minimal' | 'editorial' | 'neon' | 'kinetic',
    fontVariant: 'montserrat' | 'playfair' = 'montserrat'
  ) => {
    if (!videoFile || captions.length === 0) {
      setJobState('error'); setJobTitle('Primero sube y procesa un video');
      setJobDetail('El pack necesita los subtítulos reales para sincronizar sus escenas.'); return;
    }
    checkpoint();
    const fFamily = fontVariant === 'playfair' ? '"Playfair Display", serif' : 'Montserrat, sans-serif';
    const typography=packTypography(packType,fontVariant);
    setFontSize(DEFAULT_TEXT_SIZE);
    setHookLeadFontSize(DEFAULT_TEXT_SIZE);
    setHookMainFontSize(DEFAULT_TEXT_SIZE);
    setHookLeadDuration(DEFAULT_HOOK_DURATION);
    setHookMainDuration(DEFAULT_HOOK_DURATION);
    setCaptionDualFont(true);
    setCaptionTopFontFamily(typography.topFontFamily);
    setCaptionBottomFontFamily(typography.bottomFontFamily);
    setCaptionItalic(false);
    const colors = {
      viral:{accent:'#FFE600',background:'#991b1b',text:'#ffffff',style:'red-impact' as const,motion:'collage-vintage' as const},
      minimal:{accent:'#111827',background:'#ffffff',text:'#111827',style:'white-minimal' as const,motion:'editorial-bw' as const},
      editorial:{accent:'#00D4FF',background:'#050505',text:'#ffffff',style:'black-oled' as const,motion:'photoreal-3d' as const},
      neon:{accent:'#00F5C8',background:'#050505',text:'#ffffff',style:'black-oled' as const,motion:'photoreal-3d' as const},
      kinetic:{accent:'#FF3B30',background:'#991b1b',text:'#ffffff',style:'red-impact' as const,motion:'cinematic-black' as const},
    }[packType];

    // 1. Hook
    if (captions.length > 0 && (!hookLeadText.trim() || !hookMainText.trim())) {
      const autoWords = getAutomaticHook(captions).split(/\s+/).filter(Boolean);
      setHookLeadText(autoWords[0] || 'ESTO CAMBIA');
      setHookMainText(autoWords.slice(1, 5).join(' ') || 'TODO');
    }
    setHookMainFontFamily(typography.bottomFontFamily);
    setHookLeadFontFamily(typography.topFontFamily);
    setHookSfxEnabled(true);
    setCaptionGroupStyles([]);
    setZentryItems((items) => items.filter((item) => item.category !== 'subtitles'));

    if (packType === 'viral') {
      setHookStyle('boldcaps');
      setHookSfxSrc('/sfx/hooks/hook_01_dual_line.mp3');
      setActiveStyle('impactoStats');
      setAccentColor('#FFE600');
      setCaptionFontFamily(fFamily);
      setPopAnimation(true);
      setSfxSrc('/sfx/subtitles/subtitle_02_yellow_bubble_pro.mp3');
    } else if (packType === 'minimal') {
      setHookStyle('clean');
      setHookSfxSrc('/sfx/hooks/hook_03_question.mp3');
      setActiveStyle('minimalistaClean');
      setAccentColor('#FFFFFF');
      setCaptionFontFamily(fFamily);
      setPopAnimation(false);
      setSfxSrc('/sfx/subtitles/subtitle_01_clean_editorial.mp3');
    } else if (packType === 'editorial') {
      setHookStyle('editorial');
      setHookSfxSrc('/sfx/hooks/hook_06_editorial.mp3');
      setActiveStyle('editorialStory');
      setAccentColor('#00D4FF');
      setCaptionFontFamily(fFamily);
      setCaptionItalic(true);
      setPopAnimation(true);
      setSfxSrc('/sfx/subtitles/subtitle_03_gradient_editorial.mp3');
    } else if (packType === 'neon') {
      setHookStyle('viro');
      setHookSfxSrc('/sfx/hooks/hook_05_gradient.mp3');
      setActiveStyle('estebanStyle');
      setAccentColor('#00F5C8');
      setCaptionFontFamily(fFamily);
      setPopAnimation(true);
      setSfxSrc('/sfx/subtitles/subtitle_07_mint_editorial.mp3');
    } else {
      // kinetic
      setHookStyle('impact');
      setHookSfxSrc('/sfx/hooks/hook_04_number.mp3');
      setActiveStyle('impactoStats');
      setAccentColor('#FF3B30');
      setCaptionFontFamily(fFamily);
      setPopAnimation(true);
      setSfxSrc('/sfx/subtitles/subtitle_08_yellow_glow_editorial.mp3');
    }

    const groups = groupCaptions(captions);
    const sceneCandidates = groups.filter((group) => group.startMs/1000 > 2 && group.startMs/1000 < duration-1.8);
    const existingVisuals = [...customBrolls.filter((item) => !item.id.startsWith('pack-')),...motionGraphicsItems.filter((item) => !item.id.startsWith('pack-')),...zentryItems.filter(item=>item.category!=='subtitles')];
    const isFree = (start:number,length:number) => !existingVisuals.some((item) => item.start < start+length && item.start+item.duration > start);
    const pick = (fraction:number,length:number) => sceneCandidates
      .slice().sort((a,b) => Math.abs(a.startMs/1000-duration*fraction)-Math.abs(b.startMs/1000-duration*fraction))
      .find((group) => isFree(group.startMs/1000,Math.min(length,duration-group.startMs/1000)));
    const motionGroup = pick(0.55,2.2);
    const generatedMotion:MotionGraphicItem[] = motionGroup ? [{
      id:'pack-motion-1',type:'3d-scene',style:colors.motion,start:motionGroup.startMs/1000,duration:Math.min(2.2,duration-motionGroup.startMs/1000),
      title:analyzePhraseContext(motionGroup.text).punchyText,subtitle:'',displayMode:'floating',sfxSrc:'/assets/sfx/whoosh-cinematic.wav',
      ...typography,textSource:'transcript',wordAnimationMode:'spring',entranceTransition:'slide-right',
    }] : [];
    existingVisuals.push(...generatedMotion);
    setMotionGraphicsItems((items) => [...items.filter((item) => !item.id.startsWith('pack-')).map(item=>item.type==='3d-scene' && item.textSource!=='manual' ? {...item,...typography} : item), ...generatedMotion]);
    const existingAuto = customBrolls.filter((item) => item.autoGenerated && !item.id.startsWith('pack-'));
    const generatedBrolls:CustomBrollItem[] = existingAuto.length ? [] : [0.3,0.8].map(fraction=>{
      const group=pick(fraction,2.5);
      if(group) existingVisuals.push({id:`reserved-${fraction}`,src:'',type:'image',start:group.startMs/1000,duration:Math.min(2.5,duration-group.startMs/1000)});
      return group;
    })
      .filter((group):group is CaptionGroup => Boolean(group))
      .filter((group,index,array) => array.findIndex((other) => other.startMs === group.startMs) === index)
      .map((group,index) => ({
        id:`pack-broll-${index}`,src:'',type:'image',start:group.startMs/1000,duration:Math.min(2.5,duration-group.startMs/1000),
        title:`Pack ${packType} ${index+1}`,brollStyle:colors.style,brollText:group.text,brollHeadline:group.text.toUpperCase(),
        fontFamily:fFamily,...typography,textColor:colors.text,accentColor:colors.accent,backgroundColor:colors.background,
        textEffect:'editorial',sfxSrc:'/assets/sfx/keyboard-mechanical.wav',sfxVolume:0.3,sfxEnabled:true,autoGenerated:true,
      }));
    setCustomBrolls((items) => [...items.filter((item) => !item.id.startsWith('pack-')).map((item) => item.autoGenerated ? {
      ...item,...typography,fontFamily:fFamily,textColor:colors.text,accentColor:colors.accent,backgroundColor:colors.background,
    } : item),...generatedBrolls]);
    const previewStart = existingAuto.find((item) => isFree(item.start+0.3,0.2))?.start ?? generatedBrolls[0]?.start ?? generatedMotion[0]?.start;
    if (previewStart !== undefined) seekTo(previewStart+0.3);
    setBgTask({active:false,label:`✓ Pack ${packType} aplicado: subtítulos, ${existingAuto.length+generatedBrolls.length} B-roll y ${generatedMotion.length} motion`,progress:1,done:true});
    setTimeout(() => setBgTask(null),4500);
  };

  const updateZentryItem = (id: string, updates: Partial<ZentryTemplateItem>) => {
    checkpoint();
    setZentryItems((prev) => prev.map((item) => item.id === id ? { ...item, ...updates } : item));
  };

  const duplicateZentryItem = (id: string) => {
    const item = zentryItems.find((z) => z.id === id);
    if (!item) return;
    checkpoint();
    const cloned: ZentryTemplateItem = {
      ...item,
      id: `zentry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      start: Math.round((item.start + item.duration) * 10) / 10,
    };
    setZentryItems((prev) => [...prev, cloned]);
    setSelectedZentryId(cloned.id);
  };

  const startZentryCanvasDrag = (event: ReactPointerEvent<HTMLDivElement>, item: ZentryTemplateItem) => {
    if (event.button !== 0) return;
    const canvas = phoneCanvasRef.current;
    if (!canvas) return;
    event.preventDefault();
    event.stopPropagation();
    checkpoint();
    setSelectedZentryId(item.id);
    setActiveTool('zentry-motion');
    setPlaying(false);
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    const bounds = canvas.getBoundingClientRect();
    const initialX = event.clientX;
    const initialY = event.clientY;
    const pointerId = event.pointerId;
    const move = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;
      const positionX = Math.max(0, Math.min(100, (item.positionX ?? 50) + (moveEvent.clientX-initialX)*100/bounds.width));
      const positionY = Math.max(0, Math.min(100, (item.positionY ?? 50) + (moveEvent.clientY-initialY)*100/bounds.height));
      setZentryItems(current => current.map(layer => layer.id === item.id ? {...layer,positionX,positionY} : layer));
    };
    const stop = (stopEvent: PointerEvent) => {
      if (stopEvent.pointerId !== pointerId) return;
      if (target.hasPointerCapture(pointerId)) target.releasePointerCapture(pointerId);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
  };

  const deleteZentryItem = (id: string) => {
    checkpoint();
    setZentryItems((prev) => prev.filter((z) => z.id !== id));
    if (selectedZentryId === id) setSelectedZentryId(null);
  };

  const startZentryTrim = (event: ReactPointerEvent<HTMLButtonElement>, id: string, handle: 'start' | 'end') => {
    event.stopPropagation();
    event.preventDefault();
    const targetItem = zentryItems.find((z) => z.id === id);
    if (!targetItem) return;
    const startX = event.clientX;
    const initialStart = targetItem.start;
    const initialDur = targetItem.duration;

    const onPointerMove = (e: PointerEvent) => {
      const trackEl = timelineTrackRef.current;
      if (!trackEl) return;
      const trackWidth = trackEl.getBoundingClientRect().width;
      const deltaSec = ((e.clientX - startX) / trackWidth) * Math.max(0.1, duration);
      if (handle === 'start') {
        const nextStart = Math.max(0, Math.min(initialStart + deltaSec, initialStart + initialDur - 0.5));
        const nextDur = initialDur - (nextStart - initialStart);
        setZentryItems((prev) => prev.map((z) => z.id === id ? { ...z, start: Math.round(nextStart * 10) / 10, duration: Math.max(0.5, Math.round(nextDur * 10) / 10) } : z));
      } else {
        const nextDur = Math.max(0.5, initialDur + deltaSec);
        setZentryItems((prev) => prev.map((z) => z.id === id ? { ...z, duration: Math.round(nextDur * 10) / 10 } : z));
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      checkpoint();
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const startZentryDrag = (event: ReactPointerEvent<HTMLDivElement>, id: string) => {
    event.stopPropagation();
    event.preventDefault();
    const targetItem = zentryItems.find((z) => z.id === id);
    if (!targetItem) return;
    setSelectedZentryId(id);
    setSelectedSegmentId(null); setSelectedMusicId(null); setSelectedBrollId(null); setSelectedMgId(null);
    const startX = event.clientX;
    const initialStart = targetItem.start;

    const onPointerMove = (e: PointerEvent) => {
      const trackEl = timelineTrackRef.current;
      if (!trackEl) return;
      const trackWidth = trackEl.getBoundingClientRect().width;
      const deltaSec = ((e.clientX - startX) / trackWidth) * Math.max(0.1, duration);
      const nextStart = Math.max(0, Math.round((initialStart + deltaSec) * 10) / 10);
      setZentryItems((prev) => prev.map((z) => z.id === id ? { ...z, start: nextStart } : z));
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      checkpoint();
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const searchPexels = async (term?: string) => {
    const q = term !== undefined ? term : pexelsQuery;
    if (!q.trim()) return;
    setPexelsLoading(true);
    try {
      const res = await fetch(`/api/pexels?query=${encodeURIComponent(q)}&per_page=12`);
      const data: any = await res.json();
      if (data.videos) {
        setPexelsResults(data.videos);
        setPexelsWarning(data.warning || ''); setPexelsFallback(Boolean(data.fallback));
      }
    } catch (err) {
      console.warn('Error buscando en Pexels:', err);
      setPexelsWarning('No se pudo conectar con Pexels. Revisa la conexión del servidor y vuelve a buscar.');
    } finally {
      setPexelsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTool === 'broll' && pexelsResults.length === 0) {
      void searchPexels('tecnología');
    }
  }, [activeTool]);

  const inputRef = useRef<HTMLInputElement>(null);
  const secondaryInputRef = useRef<HTMLInputElement>(null);
  const brollInputRef = useRef<HTMLInputElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);
  const musicPreviewRef = useRef<HTMLAudioElement>(null);
  const auditionAudioRef = useRef<HTMLAudioElement>(null);
  const [audioSettingsNotice,setAudioSettingsNotice]=useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoUrlRef = useRef<string | null>(null);
  const secondaryVideoRef = useRef<HTMLVideoElement>(null);
  const segmentVideoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const segmentAudioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const phoneCanvasRef = useRef<HTMLDivElement>(null);
  const hookInputRef = useRef<HTMLInputElement>(null);
  const typingAudioRef = useRef<HTMLAudioElement | null>(null);
  const timelineTrackRef = useRef<HTMLDivElement>(null);
  const timelineBodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!selectedMusicId) return;
    const body = timelineBodyRef.current;
    const row = timelineTrackRef.current?.querySelector<HTMLElement>('.music-track');
    if (body && row) body.scrollTo({top:Math.max(0,row.offsetTop + row.offsetHeight + 12 - body.clientHeight),behavior:'smooth'});
  },[selectedMusicId,musicClips.length]);
  const selectedMusicClip = musicClips.find((clip) => clip.id === selectedMusicId) || null;
  useEffect(()=>{
    const audio=auditionAudioRef.current;
    if(audio && selectedMusicClip) {audio.playbackRate=audioRate(selectedMusicClip);audio.volume=selectedMusicClip.volume;}
  },[selectedMusicClip]);
  const setSelectedAudioRate=(rate:number)=>{
    if(!selectedMusicClip) return;
    try {
      const updated=changeAudioRate(selectedMusicClip,rate,musicClips,duration);
      checkpoint();setMusicClips(clips=>clips.map(clip=>clip.id===updated.id ? updated : clip));
      setAudioSettingsNotice('Velocidad actualizada. Pulsa «Sincronizar subtítulos con audio» para actualizar los textos y capas a estos tiempos.');
    } catch(error) {setAudioSettingsNotice(error instanceof Error ? error.message : 'No se pudo cambiar la velocidad.');}
  };
  const sfxTimelineItems = [
    ...(sfxSrc ? [{id:'manual-sfx',timeSec:0.35,label:'SFX manual',src:sfxSrc,volume:.55}] : []),
    ...manualSfxClips.map((clip) => ({id:clip.id,timeSec:clip.start,label:'SFX manual',src:clip.src,volume:clip.volume})),
    ...contextualSfxEvents.map((event) => ({id:event.id,timeSec:event.timeSec,label:event.label,src:event.sfxSrc,volume:event.volume})),
    ...customBrolls.filter((broll) => broll.sfxEnabled !== false && broll.sfxSrc).map((broll) => ({id:`broll-sfx-${broll.id}`,timeSec:broll.start,label:`B-roll · ${broll.title || 'SFX'}`,src:broll.sfxSrc!,volume:broll.sfxVolume ?? .3})),
    ...zentryItems.filter((item) => item.sfxEnabled).map((item) => {const sound=ZENTRY_SFX_MAP[(item.sfxId || getZentryTemplate(item.presetId)?.sfxId) as ZentrySfxId];return {id:`zentry-sfx-${item.id}`,timeSec:item.start,label:`Zentry · ${getZentryTemplate(item.presetId)?.name || item.presetId}`,src:sound?.file || '',volume:(sound?.volume ?? 0)*(item.sfxVolume ?? 1)};}),
  ].map((item) => ({...item,timeSec:sfxTimeOverrides[item.id] ?? item.timeSec}));
  const selectedSfxItem = sfxTimelineItems.find((item) => item.id === selectedSfxId) || null;
  const lastSfxPreviewTimeRef = useRef(0);
  const activeSfxPreviewsRef = useRef<HTMLAudioElement[]>([]);
  useEffect(() => {
    if (!playing) {
      lastSfxPreviewTimeRef.current=currentTime;
      activeSfxPreviewsRef.current.forEach((audio) => audio.pause());
      activeSfxPreviewsRef.current=[];
      return;
    }
    const previous=lastSfxPreviewTimeRef.current;
    lastSfxPreviewTimeRef.current=currentTime;
    if (currentTime < previous || currentTime-previous > 0.6) return;
    sfxTimelineItems.filter((item) => item.src && item.timeSec > previous && item.timeSec <= currentTime).forEach((item) => {
      const audio=new Audio(item.src);
      audio.volume=Math.max(0,Math.min(1,item.volume*sfxVolumeMultiplier));
      activeSfxPreviewsRef.current.push(audio);
      void audio.play().catch(() => undefined);
      audio.onended=() => {activeSfxPreviewsRef.current=activeSfxPreviewsRef.current.filter((active) => active !== audio);};
    });
  },[currentTime,playing,sfxTimeOverrides,contextualSfxEvents,customBrolls,zentryItems,sfxSrc,manualSfxClips,sfxVolumeMultiplier]);
  useEffect(() => {
    const audio = musicPreviewRef.current;
    if (!audio) return;
    if(playing) auditionAudioRef.current?.pause();
    const activeClip = musicClips.find((clip) => currentTime >= clip.start && currentTime < clip.start + clip.duration);
    if (!playing || !activeClip) {
      audio.pause();
      return;
    }
    audio.volume = activeClip.volume;
    if (audio.src !== activeClip.src) { audio.src = activeClip.src; audio.load(); }
    audio.playbackRate=audioRate(activeClip);
    const offset = activeClip.sourceStart + (currentTime - activeClip.start)*audioRate(activeClip);
    if (Math.abs(audio.currentTime - offset) > 0.35) audio.currentTime = Math.max(0, offset);
    if (audio.paused) void audio.play().catch(() => {});
  }, [musicClips, currentTime, playing]);
  const uploadMusic = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if(musicUploadLockRef.current) return;
    if (!files.length) return;
    if (musicClips.length + files.length > 14) { setJobState('error'); setJobTitle('Límite de 14 audios'); setJobDetail(`Puedes añadir ${14-musicClips.length} audio(s) más.`); return; }
    const invalid = files.find((file) => (!file.type.startsWith('audio/') && !/\.(mp3|wav|m4a|aac|ogg)$/i.test(file.name)) || file.size > 50*1024*1024);
    if (invalid) { setJobState('error'); setJobTitle('Audio no compatible'); setJobDetail(`${invalid.name}: usa MP3, WAV, M4A, AAC u OGG de hasta 50 MB.`); return; }
    musicUploadLockRef.current=true;setMusicUploading(true);
    const batchUrls:string[]=[];
    const readAudio = (file:File) => new Promise<{src:string;duration:number}>((resolve,reject) => {
      const probeUrl=URL.createObjectURL(file);
      batchUrls.push(probeUrl);
      const probe=new window.Audio();
      probe.preload='metadata';
      const timeout=window.setTimeout(()=>{probe.removeAttribute('src');probe.load();reject(new Error(`No se pudo leer la duración de ${file.name}.`));},15000);
      probe.onloadedmetadata=() => {
        window.clearTimeout(timeout);
        if(!Number.isFinite(probe.duration) || probe.duration<=0) {reject(new Error(`${file.name} no tiene duración válida.`));return;}
        const audioDuration=probe.duration;
        probe.removeAttribute('src');probe.load();
        resolve({src:probeUrl,duration:audioDuration});
      };
      probe.onerror=() => {window.clearTimeout(timeout);URL.revokeObjectURL(probeUrl);reject(new Error(`No se pudo abrir ${file.name}.`));};
      probe.src=probeUrl;
    });
    try {
      const added:MusicClip[]=[];
      const decoded: Array<{file:File;audio:{src:string;duration:number}}>=[];
      for(const file of files) decoded.push({file,audio:await readAudio(file)});
      for (const { file, audio } of decoded) {
        const slot=audioUploadSlot(audio.duration,[...musicClips,...added],duration);
        if (!slot) throw new Error('No queda espacio libre en la línea de tiempo. Recorta o mueve un audio antes de añadir otro.');
        added.push({id:`music-${crypto.randomUUID()}`,src:audio.src,name:file.name,...slot,sourceStart:0,sourceDuration:audio.duration,volume:musicUploadVolume,playbackRate:1});
      }
      checkpoint();
      batchUrls.forEach(url=>ownedMusicUrlsRef.current.add(url));
      setMusicClips((items)=>[...items,...added]);
      setSelectedMusicId(added.at(-1)?.id ?? null);
      const trimmed=added.filter(clip=>clip.duration<clip.sourceDuration-.001).length;
      setAudioSettingsNotice(trimmed ? `${trimmed} audio(s) recortado(s) al tiempo disponible del video. Velocidad original (1×); los archivos originales se conservan.` : 'Audios cargados completos a velocidad original (1×), sin aceleración automática.');
    } catch(error) {batchUrls.forEach(url=>URL.revokeObjectURL(url));setJobState('error');setJobTitle('No se pudo añadir el audio');setJobDetail(error instanceof Error ? error.message : 'Archivo no compatible.');}
    finally {musicUploadLockRef.current=false;setMusicUploading(false);}
  };
  const activeProjectKeyRef = useRef<string | null>(null);
  const autoBrollMaterializedKeyRef = useRef('');
  const undoStackRef = useRef<EditorSnapshot[]>([]);
  const redoStackRef = useRef<EditorSnapshot[]>([]);
  const [historyState,setHistoryState] = useState({undo:0,redo:0});
  useEffect(()=>{
    const retained=new Set([...musicClips,...undoStackRef.current.flatMap(item=>item.musicClips ?? []),...redoStackRef.current.flatMap(item=>item.musicClips ?? [])].map(item=>item.src));
    for(const url of ownedMusicUrlsRef.current) if(!retained.has(url)) {URL.revokeObjectURL(url);ownedMusicUrlsRef.current.delete(url);}
    releaseUnusedRestoredMedia(collectBlobUrls([captureSnapshot(),undoStackRef.current,redoStackRef.current]));
  },[musicClips,historyState,editSegments,customBrolls,motionGraphicsItems]);
  const mediaCleanupTimerRef=useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(()=>{
    // StrictMode and Fast Refresh replay effects without discarding editor state.
    // Cancel that provisional cleanup; release only after a real unmount.
    if(mediaCleanupTimerRef.current!==null) clearTimeout(mediaCleanupTimerRef.current);
    return ()=>{mediaCleanupTimerRef.current=setTimeout(()=>{
      for(const url of ownedMusicUrlsRef.current) URL.revokeObjectURL(url);
      ownedMusicUrlsRef.current.clear();releaseRestoredMedia();
    },0);};
  },[]);
  const [canvasWidth, setCanvasWidth] = useState(240);
  const personalPresetsKey = `zentry-personal-presets:${sessionUser?.id || 'local'}`;
  const legacyPersonalPresetKey = `zentry-personal-preset:${sessionUser?.id || 'local'}`;
  const brollTemplatesKey = `zentry-broll-templates:${sessionUser?.id || 'local'}`;
  useEffect(() => {
    try {
      const stored = localStorage.getItem(brollTemplatesKey);
      const parsed = stored ? JSON.parse(stored) : null;
      if (Array.isArray(parsed)) { setSavedBrollTemplates(parsed.slice(0,3)); return; }
    } catch {}
    const starter: SavedBrollTemplate = {id:'viral-pacifico-anton',name:'Viral Pacifico + Anton',settings:{title:'Viral Pacifico + Anton',brollStyle:'white-minimal',dualFont:true,topFontFamily:'Pacifico',bottomFontFamily:'Anton',fontFamily:'Anton',fontSize:68,textColor:'#17202a',accentColor:'#e11d48',backgroundColor:'#ffffff',textEffect:'spring',transitionIn:'smooth-fade',transitionOut:'smooth-fade',sfxEnabled:true,sfxSrc:'/assets/sfx/keyboard-mechanical.wav'}};
    setSavedBrollTemplates([starter]);
    localStorage.setItem(brollTemplatesKey,JSON.stringify([starter]));
  }, [brollTemplatesKey]);
  const saveSelectedBrollTemplate = () => {
    if (!selectedBroll || savedBrollTemplates.length >= 3) return;
    const {brollStyle,icon3d,fontFamily,fontSize,textColor,accentColor,backgroundColor,textEffect,topFontFamily,bottomFontFamily,dualFont,inheritCaptionStyle,transitionIn,transitionOut,transitionDirection,sfxEnabled,sfxSrc,sfxVolume} = selectedBroll;
    const saved: SavedBrollTemplate = {id:`custom-broll-${Date.now()}`,name:`Mi B-roll ${savedBrollTemplates.length+1}`,settings:{brollStyle:['white-minimal','red-impact','black-oled'].includes(brollStyle || '') ? brollStyle : 'black-oled',icon3d,fontFamily,fontSize,textColor,accentColor,backgroundColor,textEffect,topFontFamily,bottomFontFamily,dualFont,inheritCaptionStyle,transitionIn,transitionOut,transitionDirection,sfxEnabled,sfxSrc,sfxVolume}};
    const next = [...savedBrollTemplates,saved];
    setSavedBrollTemplates(next);
    localStorage.setItem(brollTemplatesKey,JSON.stringify(next));
    setBgTask({active:false,label:`✓ ${saved.name} guardada`,progress:1,done:true});
    setTimeout(() => setBgTask(null),3000);
  };

  const readPersonalPresetCollection = (): PersonalPresetCollection => {
    const stored = localStorage.getItem(personalPresetsKey);
    if (stored) {
      const parsed = JSON.parse(stored) as PersonalPresetCollection;
      if (parsed.version === 2 && Array.isArray(parsed.presets)) {
        const presets = parsed.presets.slice(0, 3);
        return {version:2, presets, defaultId:presets.some((preset) => preset.id === parsed.defaultId) ? parsed.defaultId : null};
      }
    }
    const legacy = localStorage.getItem(legacyPersonalPresetKey);
    if (legacy) {
      const preset = JSON.parse(legacy) as Omit<PersonalPreset, 'id'>;
      return {version:2, defaultId:'migrated-personal-preset', presets:[{...preset, id:'migrated-personal-preset'}]};
    }
    return {version:2, defaultId:STARTER_PERSONAL_PRESET.id, presets:[STARTER_PERSONAL_PRESET]};
  };

  const persistPersonalPresets = (collection: PersonalPresetCollection) => {
    try { localStorage.setItem(personalPresetsKey, JSON.stringify(collection)); }
    catch {
      setBgTask({active:false,label:'No se pudo guardar la plantilla: almacenamiento lleno',progress:1,done:true});
      return false;
    }
    setPersonalPresets(collection.presets);
    setDefaultPersonalPresetId(collection.defaultId);
    return true;
  };

  useEffect(() => {
    try {
      const collection = readPersonalPresetCollection();
      persistPersonalPresets(collection);
    } catch {
      persistPersonalPresets({version:2, defaultId:STARTER_PERSONAL_PRESET.id, presets:[STARTER_PERSONAL_PRESET]});
    }
  }, [personalPresetsKey]);

  const applyPersonalPreset = (preset: PersonalPreset, targetCaptions:Caption[] = captions, targetDuration = duration, sourceFile: File | null = videoFile) => {
    setActiveStyle(preset.activeStyle); setAccentColor(preset.accentColor); setFontSize(preset.fontSize);
    setCaptionFontFamily(preset.captionFontFamily); setCaptionFontWeight(preset.captionFontWeight);
    setCaptionItalic(preset.captionItalic); setCaptionDualFont(preset.captionDualFont);
    setCaptionTopFontFamily(preset.captionTopFontFamily); setCaptionBottomFontFamily(preset.captionBottomFontFamily);
    setCaptionAlign(preset.captionAlign); setCaptionPosition(preset.captionPosition);
    setHookPosition(preset.hookPosition); setHookLeadFontFamily(preset.hookLeadFontFamily);
    setHookMainFontFamily(preset.hookMainFontFamily); setHookLeadFontSize(preset.hookLeadFontSize);
    setHookMainFontSize(preset.hookMainFontSize); setHookLeadDuration(preset.hookLeadDuration);
    setHookMainDuration(preset.hookMainDuration); setHookStyle(preset.hookStyle);
    setBrollTypingSound(preset.brollTypingSound); setBrollTransition(preset.brollTransition);
    if (typeof preset.shadow === 'boolean') setShadow(preset.shadow);
    if (typeof preset.popAnimation === 'boolean') setPopAnimation(preset.popAnimation);
    const groups = groupCaptions(targetCaptions);
    if (preset.timeline) {
      if (sourceFile) autoBrollMaterializedKeyRef.current = `${sourceFile.name}:${sourceFile.size}:${sourceFile.lastModified}`;
      const factor = targetDuration > 0 && preset.timeline.sourceDuration > 0 ? targetDuration / preset.timeline.sourceDuration : 1;
      setCaptionGroupStyles(preset.timeline.captionGroupStyles.map((style,index) => {
        const group = groups[index];
        return group ? {...style,id:`caption-style-${group.startMs}`,startMs:group.startMs,endMs:group.endMs} : null;
      }).filter((style):style is CaptionGroupStyleOverride => style !== null));
      setCustomBrolls(preset.timeline.customBrolls.map((item) => ({...item,start:item.start*factor,duration:item.duration*factor})).reduce(replaceOverlappingBroll,[] as CustomBrollItem[]));
      setMotionGraphicsItems(preset.timeline.motionGraphicsItems.map((item) => ({...item,start:item.start*factor,duration:item.duration*factor})));
      setZentryItems(preset.timeline.zentryItems.map((item) => ({...item,start:item.start*factor,duration:item.duration*factor})));
    } else {
      setCaptionGroupStyles([]);
    }
  };

  const capturePersonalPreset = (id: string, name: string): PersonalPreset => {
    const snapshot = captureSnapshot();
    return {
      id, name, savedAt: new Date().toISOString(),
      activeStyle:snapshot.activeStyle, accentColor:snapshot.accentColor, fontSize:snapshot.fontSize,
      captionFontFamily:snapshot.captionFontFamily, captionFontWeight:snapshot.captionFontWeight,
      captionItalic:snapshot.captionItalic, captionDualFont:snapshot.captionDualFont,
      captionTopFontFamily:snapshot.captionTopFontFamily, captionBottomFontFamily:snapshot.captionBottomFontFamily,
      captionAlign:snapshot.captionAlign, captionPosition:snapshot.captionPosition,
      hookPosition:snapshot.hookPosition, hookLeadFontFamily:snapshot.hookLeadFontFamily,
      hookMainFontFamily:snapshot.hookMainFontFamily, hookLeadFontSize:snapshot.hookLeadFontSize,
      hookMainFontSize:snapshot.hookMainFontSize, hookLeadDuration:snapshot.hookLeadDuration,
      hookMainDuration:snapshot.hookMainDuration, hookStyle:snapshot.hookStyle,
       brollTypingSound:snapshot.brollTypingSound, brollTransition:snapshot.brollTransition,
       shadow, popAnimation,
       timeline:{sourceDuration:duration,
         captionGroupStyles:[...captionGroupStyles].sort((a,b) => a.startMs-b.startMs),
         customBrolls:customBrolls.filter((item) => !/^(blob:|data:)/i.test(item.src)),
         motionGraphicsItems, zentryItems},
    };
  };

  const savePersonalPreset = () => {
    if (personalPresets.length >= 3) {
      setJobState('error'); setJobTitle('Máximo de 3 plantillas');
      setJobDetail('Actualiza una plantilla existente o elimina una para guardar otra.');
      return;
    }
    const name = personalPresetNameDraft.trim() || `Mi plantilla ${personalPresets.length + 1}`;
    const preset = capturePersonalPreset(`personal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name);
    if (persistPersonalPresets({version:2, presets:[...personalPresets, preset], defaultId:defaultPersonalPresetId || preset.id})) {
      setBgTask({active:false,label:`✓ «${name}» guardada con sus capas`,progress:1,done:true});
      setTimeout(() => setBgTask(null),3500);
    }
  };

  const updatePersonalPreset = (preset: PersonalPreset) => {
    checkpoint();
    const updated = capturePersonalPreset(preset.id, preset.name);
    persistPersonalPresets({version:2, presets:personalPresets.map((item) => item.id === preset.id ? updated : item), defaultId:defaultPersonalPresetId});
  };

  const removePersonalPreset = (id: string) => {
    const nextPresets = personalPresets.filter((preset) => preset.id !== id);
    persistPersonalPresets({version:2, presets:nextPresets, defaultId:defaultPersonalPresetId === id ? (nextPresets[0]?.id || null) : defaultPersonalPresetId});
  };

  const setDefaultPersonalPreset = (id: string) => {
    persistPersonalPresets({version:2, presets:personalPresets, defaultId:id});
  };

  useEffect(() => {
    const updateSize = () => {
      if (phoneCanvasRef.current) {
        const rect = phoneCanvasRef.current.getBoundingClientRect();
        if (rect.width > 0) setCanvasWidth(rect.width);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [canvasZoom]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('zentry-custom-caption-templates');
      if (stored) {
        const parsed = JSON.parse(stored) as SavedCaptionTemplate[];
        const unique = parsed.filter((template, index, items) =>
          items.findIndex((item) => item.name.trim().toLowerCase() === template.name.trim().toLowerCase()) === index
        );
        setSavedCaptionTemplates(unique);
        if (unique.length !== parsed.length) {
          localStorage.setItem('zentry-custom-caption-templates', JSON.stringify(unique));
        }
      }
    } catch {}
  }, []);

  const selectedStyle = useMemo(() => getCaptionPreset(activeStyle), [activeStyle]);
  const selectedMg = motionGraphicsItems.find((item) => item.id === selectedMgId) || motionGraphicsItems[0] || null;
  const selectedBroll = customBrolls.find((b) => b.id === selectedBrollId) || null;
  const captionGroups = useMemo(() => groupCaptions(captions),[captions]);
  const selectedCaptionGroup = selectedCaptionGroupStartMs === null
    ? null
    : captionGroups.find((group) => group.startMs === selectedCaptionGroupStartMs) || null;
  const activeCaptionGroupStyle = selectedCaptionGroup
    ? captionGroupStyles.find((style) => style.startMs === selectedCaptionGroup.startMs) || null
    : null;
  const automaticHookText = useMemo(() => getAutomaticHook(captions),[captions]);
  const automaticHookWords = automaticHookText.split(/\s+/).filter(Boolean);
  const automaticHookLead = automaticHookWords[0] ?? '';
  const automaticHookMain = automaticHookWords.slice(1).join(' ');
  const effectiveHookLead = hookLeadText.trim() || automaticHookLead;
  const effectiveHookMain = hookMainText.trim() || automaticHookMain;
  const previewCaptionGroups = useMemo(() => groupCaptions(captions),[captions]);
  const activePreviewCaptionGroup = previewCaptionGroups.find((group) => currentTime * 1000 >= group.startMs && currentTime * 1000 < group.endMs);
  const previewCaptions = activePreviewCaptionGroup ? captions.slice(activePreviewCaptionGroup.startIndex,activePreviewCaptionGroup.endIndex) : [];
  const activePreviewGroupStyle = activePreviewCaptionGroup
    ? captionGroupStyles.find((style) => style.startMs === activePreviewCaptionGroup.startMs) || null
    : null;
  const previewCaptionSettings = activePreviewGroupStyle || {
    styleId: activeStyle,
    accentColor,
    fontSize,
    captionFontFamily,
    captionFontWeight,
    captionItalic,
    dualFontEnabled: captionDualFont,
    topFontFamily: captionTopFontFamily,
    bottomFontFamily: captionBottomFontFamily,
    captionAlign,
    shadow,
    popAnimation,
    positionX: captionPosition.x,
    positionY: captionPosition.y,
  };
  const keepSegments = useMemo(() => {
    const source = editSegments.length 
      ? editSegments 
      : [{ id:'source', start:0, end:duration, timelineStart:0, timelineEnd:duration, src:videoUrl || undefined }];
    if (!removeSilences || !silences.length) {
      return source.map((s) => ({
        start: s.start,
        end: s.end,
        src: s.src || videoUrl || undefined,
        clipVolume:s.clipVolume, clipMuted:s.clipMuted, brightness:s.brightness, contrast:s.contrast, saturation:s.saturation, sharpness:s.sharpness,
        processedAudioSrc:s.processedAudioSrc,
        timelineStart: s.timelineStart !== undefined ? s.timelineStart : s.start,
        timelineEnd: s.timelineEnd !== undefined ? s.timelineEnd : s.end,
      }));
    }
    return source.flatMap((segment) => {
      const segTStart = segment.timelineStart !== undefined ? segment.timelineStart : segment.start;
      const segTEnd = segment.timelineEnd !== undefined ? segment.timelineEnd : segment.end;
      type TimelinePart = EditSegment & {timelineStart:number;timelineEnd:number};
      let parts: TimelinePart[] = [{ ...segment, start:segment.start, end:segment.end, src:segment.src || videoUrl || undefined, timelineStart:segTStart, timelineEnd:segTEnd }];
      for (const silence of silences) {
        parts = parts.flatMap((part) => {
          if (silence.end <= part.start || silence.start >= part.end) return [part];
          const next: TimelinePart[] = [];
          if (silence.start > part.start) {
            next.push({
              ...part,
              end: Math.min(part.end, silence.start),
              src: part.src,
              timelineStart: part.timelineStart,
              timelineEnd: (part.timelineStart ?? part.start) + (Math.min(part.end, silence.start) - part.start),
            });
          }
          if (silence.end < part.end) {
            next.push({
              ...part,
              start: Math.max(part.start, silence.end),
              src: part.src,
              timelineStart: (part.timelineStart ?? part.start) + (Math.max(part.start, silence.end) - part.start),
              timelineEnd: part.timelineEnd,
            });
          }
          return next;
        });
      }
      return parts.filter((part) => part.end-part.start > .04);
    });
  },[duration,editSegments,removeSilences,silences,videoUrl]);
  const outputDuration = keepSegments.reduce((sum,segment) => sum + Math.max(0,segment.end-segment.start),0);
  const createBrollEvents = (timelineDuration:number, timelineCaptions:Caption[]) => {
    if (!autoBroll || !Number.isFinite(timelineDuration) || timelineDuration < 1.8) return [];
    const cueDuration = Math.min(4.5,Math.max(1.8,timelineDuration*.28));
    const firstStart = timelineDuration <= 7 ? Math.min(.72,timelineDuration*.2) : 2.4;
    const interval = timelineDuration <= 15 ? 5.5 : 8.5;
    const groups = groupCaptions(timelineCaptions);
    const events: ZentryVideoProps['brollEvents'] = [];
    let unavailableBefore = 0;
    for (let target=firstStart; target < timelineDuration-.45 && events.length < 22; target+=interval) {
      const group = groups.find((item) => item.startMs/1000 >= Math.max(target,unavailableBefore));
      if (!group) break;
      const start = group.startMs/1000;
      const spokenCaptions = timelineCaptions
        .slice(group.startIndex)
        .filter((caption) => caption.startMs/1000 < Math.min(timelineDuration,start+cueDuration))
        .slice(0,12);
      if (!spokenCaptions.length) continue;
      const naturalEnd = spokenCaptions[spokenCaptions.length-1].endMs/1000;
      const end = Math.min(timelineDuration,Math.max(start+.8,naturalEnd));
      const automaticWords = spokenCaptions.map((caption) => ({
        text:caption.text.trim(),
        start:Math.max(start,caption.startMs/1000),
        end:Math.min(end,caption.endMs/1000),
      })).filter((word) => word.text && word.end > word.start);
      const customWords = brollText.trim().split(/\s+/).filter(Boolean);
      const words = customWords.length ? customWords.map((text,index) => ({
        text,
        start:start+((end-start)*index)/customWords.length,
        end:start+((end-start)*(index+1))/customWords.length,
      })) : automaticWords;
      if (!words.length) continue;
      const text = words.map((word) => word.text).join(' ');
      const normalizedText = text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
      const normalizedWords = new Set(normalizedText.split(/[^a-z0-9]+/).filter(Boolean));
      const rankedAssets = BROLL_ASSETS.map((asset,index) => ({
        asset,
        index,
        score:asset.keywords.reduce((score,keyword) => score+(normalizedWords.has(keyword.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()) ? 1 : 0),0),
      })).sort((a,b) => b.score-a.score || a.index-b.index);
      const automaticSource = rankedAssets[0].score > 0 ? rankedAssets[0].asset.src : BROLL_ASSETS[2].src;
      events.push({src:brollUrl ?? automaticSource,start,end,text,words});
      unavailableBefore=end+.35;
    }
    return events;
  };
  const previewBrollEvents = createBrollEvents(duration,captions);

  useEffect(() => {
    if (!autoBroll || !videoFile || previewBrollEvents.length === 0) return;
    const materializationKey = `${videoFile.name}:${videoFile.size}:${videoFile.lastModified}`;
    if (autoBrollMaterializedKeyRef.current === materializationKey) return;
    autoBrollMaterializedKeyRef.current = materializationKey;
    const editableAutomaticBrolls: CustomBrollItem[] = previewBrollEvents.map((event, index) => ({
      id: `auto-broll-${Math.round(event.start * 1000)}-${index}`,
      src: event.src,
      type: event.src.match(/\.(mp4|webm)(\?|$)/i) ? 'video' : 'image',
      start: event.start,
      duration: Math.max(0.8, event.end - event.start),
      title: `B-roll automático ${index + 1}`,
      brollStyle: event.src.match(/\.(mp4|webm)(\?|$)/i) ? 'video' : 'image',
      brollHeadline: event.text.toUpperCase(),
      brollText: event.text,
      transitionIn: 'whip-pan',
      transitionOut: 'smooth-fade',
      fontFamily: 'Montserrat',
      fontSize: DEFAULT_TEXT_SIZE,
      textColor: '#ffffff',
      accentColor: '#00f5c8',
      backgroundColor: '#050505',
      textEffect: 'editorial',
      sfxSrc: '/assets/sfx/keyboard-mechanical.wav',
      sfxVolume: 0.3,
      sfxEnabled: true,
      autoGenerated: true,
    }));
    setCustomBrolls((current) => editableAutomaticBrolls.reduce(replaceOverlappingBroll, current));
  }, [autoBroll, captions.length, duration, previewBrollEvents, videoFile]);

  // The editable clips are authoritative. Generated suggestions must not reappear after deletion.
  const activeBroll = null as ZentryVideoProps['brollEvents'][number] | null;
  const visibleVisualLayer = getVisibleVisualLayer(currentTime,customBrolls,motionGraphicsItems,zentryItems);
  const activeBrollPage = activeBroll ? getAnimatedBrollPage(activeBroll,currentTime) : null;
  const activeBrollOpacity = activeBroll ? Math.max(0,Math.min(1,(currentTime-activeBroll.start)/.18,(activeBroll.end-currentTime)/.18)) : 0;
  const activeBrollSoundKey = activeBroll && activeBrollPage ? `${activeBroll.start}-${activeBrollPage.index}` : '';
  const outputCaptions = useMemo(() => {
    return captions.flatMap((caption) => {
      const middle = (caption.startMs+caption.endMs)/2000;
      const segmentIndex = keepSegments.findIndex((segment) => {
        const segTStart = segment.timelineStart !== undefined ? segment.timelineStart : segment.start;
        const segTEnd = segment.timelineEnd !== undefined ? segment.timelineEnd : segment.end;
        return middle >= segTStart && middle < segTEnd;
      });
      if (segmentIndex < 0) return [];
      const segment = keepSegments[segmentIndex];
      const segTStart = segment.timelineStart !== undefined ? segment.timelineStart : segment.start;
      const outputOffset = keepSegments.slice(0,segmentIndex).reduce((sum,item) => sum+item.end-item.start,0);
      const start = outputOffset + Math.max(0,caption.startMs/1000-segTStart);
      const end = outputOffset + Math.min(segment.end-segment.start,caption.endMs/1000-segTStart);
      return [{...caption,startMs:Math.round(start*1000),endMs:Math.max(Math.round(start*1000)+1,Math.round(end*1000)),timestampMs:caption.timestampMs === null ? null : Math.round((outputOffset+Math.max(0,caption.timestampMs/1000-segTStart))*1000)}];
    });
  },[captions,keepSegments]);
  const outputBrollEvents: ZentryVideoProps['brollEvents'] = [];
  const selectedSegment = editSegments.find((segment) => segment.id === selectedSegmentId) ?? editSegments[0] ?? null;
  const updateSelectedVideo = (changes:Partial<EditSegment>) => {
    setEditSegments((items) => items.map((item) => applyVideoToAll || item.id === selectedSegmentId ? {...item,...changes} : item));
  };
  const processSelectedVideoAudio = async () => {
    const targets=editSegments.filter((item) => applyVideoToAll || item.id === selectedSegmentId);
    if (!targets.length) return;
    checkpoint();
    try {
      const {reduceClipNoise}=await import('./video/processClipAudio');
      const results=new Map<string,string>();
      for(const target of targets){
        const src=target.src || videoUrl;
        if(!src || results.has(src)) continue;
        results.set(src,await reduceClipNoise(src,(label)=>setClipAudioProcessing(label)));
      }
      setEditSegments((items)=>items.map((item)=>{
        if(!applyVideoToAll && item.id !== selectedSegmentId) return item;
        return {...item,processedAudioSrc:results.get(item.src || videoUrl || '') || item.processedAudioSrc};
      }));
      setClipAudioProcessing('Reducción terminada · vista previa y exportación actualizadas.');
    } catch(error) {
      setClipAudioProcessing(`No se pudo procesar este audio: ${error instanceof Error ? error.message : 'formato incompatible'}`);
    }
  };

  const captureSnapshot = (): EditorSnapshot => ({
    fileName,
    captions,
    activeStyle,
    accentColor,
    fontSize,
    captionFontFamily,
    captionFontWeight,
    captionItalic,
    captionDualFont,
    captionTopFontFamily,
    captionBottomFontFamily,
    captionAlign,
    captionPosition,
    hookLeadText,
    hookMainText,
    hookPosition,
    hookLeadFontFamily,
    hookMainFontFamily,
    hookLeadFontSize,
    hookMainFontSize,
    hookLeadDuration,
    hookMainDuration,
    hookStyle,
    editSegments: editSegments.map((segment) => ({ ...segment })),
    removeSilences,
    brollText,
    brollTypingSound,
    brollTransition,
    zentryItems,
    captionGroupStyles,
    customBrolls,
    motionGraphicsItems,
    sfxVolumeMultiplier,
    sfxTimeOverrides,
    musicClips,
    manualSfxClips,
    shadow,popAnimation,volume,
  });

  const restoreSnapshot = (snapshot: EditorSnapshot) => {
    if(typeof snapshot.shadow==='boolean') setShadow(snapshot.shadow);
    if(typeof snapshot.popAnimation==='boolean') setPopAnimation(snapshot.popAnimation);
    if(typeof snapshot.volume==='number') setVolume(snapshot.volume);
    setFileName(snapshot.fileName); setCaptions(snapshot.captions); setActiveStyle(snapshot.activeStyle); setAccentColor(snapshot.accentColor); setFontSize(snapshot.fontSize > 84 ? 72 : Math.max(28, snapshot.fontSize));
    setCaptionFontFamily(snapshot.captionFontFamily); setCaptionFontWeight(snapshot.captionFontWeight); setCaptionItalic(snapshot.captionItalic); setCaptionDualFont(snapshot.captionDualFont ?? false); setCaptionTopFontFamily(snapshot.captionTopFontFamily || 'Great Vibes'); setCaptionBottomFontFamily(snapshot.captionBottomFontFamily || 'Playfair Display'); setCaptionAlign(snapshot.captionAlign);
    setCaptionPosition(snapshot.captionPosition); setHookLeadText(snapshot.hookLeadText); setHookMainText(snapshot.hookMainText); setHookPosition(snapshot.hookPosition); setHookLeadFontFamily(snapshot.hookLeadFontFamily); setHookMainFontFamily(snapshot.hookMainFontFamily); setHookLeadFontSize(snapshot.hookLeadFontSize); setHookMainFontSize(snapshot.hookMainFontSize); setHookLeadDuration(snapshot.hookLeadDuration); setHookMainDuration(snapshot.hookMainDuration); setHookStyle(snapshot.hookStyle);
    if (snapshot.zentryItems) setZentryItems(snapshot.zentryItems);
    if (snapshot.captionGroupStyles) setCaptionGroupStyles(snapshot.captionGroupStyles);
    if (snapshot.customBrolls) setCustomBrolls(snapshot.customBrolls.reduce(replaceOverlappingBroll, [] as CustomBrollItem[]));
    if (snapshot.motionGraphicsItems) setMotionGraphicsItems(snapshot.motionGraphicsItems);
    if (typeof snapshot.sfxVolumeMultiplier === 'number') setSfxVolumeMultiplier(snapshot.sfxVolumeMultiplier);
    setSfxTimeOverrides(snapshot.sfxTimeOverrides || {});
    if (snapshot.musicClips) setMusicClips(snapshot.musicClips);
    setManualSfxClips(snapshot.manualSfxClips || []);
    const restoredWithSrc = recomputeTimeline(snapshot.editSegments.map((s, idx) => ({
      ...s,
      src: s.src || (idx === 0 ? (videoUrl || videoUrlRef.current || undefined) : undefined),
    })));
    setEditSegments(restoredWithSrc);
    setDuration(restoredWithSrc.reduce((sum, segment) => sum + segment.end - segment.start, 0));
    setPlaying(false);
    setCurrentTime(0);
    setSelectedMusicId(null); setSelectedBrollId(null); setSelectedMgId(null); setSelectedZentryId(null);
    setSelectedSegmentId(restoredWithSrc[0]?.id ?? null); setRemoveSilences(snapshot.removeSilences); setBrollText(snapshot.brollText); setBrollTypingSound(snapshot.brollTypingSound); setBrollTransition(snapshot.brollTransition);
  };
  const checkpoint = () => {
    undoStackRef.current.push(captureSnapshot());
    if (undoStackRef.current.length > 80) undoStackRef.current.shift();
    redoStackRef.current=[]; setHistoryState({undo:undoStackRef.current.length,redo:0});
  };
  const undo = () => {
    const snapshot = undoStackRef.current.pop();
    if (!snapshot) return;
    redoStackRef.current.push(captureSnapshot()); restoreSnapshot(snapshot); setHistoryState({undo:undoStackRef.current.length,redo:redoStackRef.current.length});
  };
  const redo = () => {
    const snapshot = redoStackRef.current.pop();
    if (!snapshot) return;
    undoStackRef.current.push(captureSnapshot()); restoreSnapshot(snapshot); setHistoryState({undo:undoStackRef.current.length,redo:redoStackRef.current.length});
  };
  const applyDraft = (draft: SavedDraft, fallbackCaptions: Caption[], currentUrl?: string, measuredDuration?: number, sourceFile: File | null = videoFile) => {
    if(typeof draft.shadow==='boolean') setShadow(draft.shadow);
    if(typeof draft.popAnimation==='boolean') setPopAnimation(draft.popAnimation);
    if(typeof draft.volume==='number') setVolume(draft.volume);
    if (draft.customBrolls && sourceFile) autoBrollMaterializedKeyRef.current = `${sourceFile.name}:${sourceFile.size}:${sourceFile.lastModified}`;
    const activeUrl = currentUrl || videoUrlRef.current || videoUrl;
    setCaptions(draft.captions ?? fallbackCaptions);
    if (draft.fileName) setFileName(draft.fileName);
    if (draft.activeStyle) setActiveStyle(draft.activeStyle);
    if (draft.accentColor) setAccentColor(draft.accentColor);
    if (draft.fontSize) setFontSize(draft.fontSize > 84 ? 72 : Math.max(28, draft.fontSize));
    if (draft.captionFontFamily) setCaptionFontFamily(draft.captionFontFamily);
    if (draft.captionFontWeight) setCaptionFontWeight(draft.captionFontWeight);
    if (typeof draft.captionItalic === 'boolean') setCaptionItalic(draft.captionItalic);
    if (typeof draft.captionDualFont === 'boolean') setCaptionDualFont(draft.captionDualFont);
    if (draft.captionTopFontFamily) setCaptionTopFontFamily(draft.captionTopFontFamily);
    if (draft.captionBottomFontFamily) setCaptionBottomFontFamily(draft.captionBottomFontFamily);
    if (draft.captionAlign) setCaptionAlign(draft.captionAlign);
    if (draft.captionPosition) setCaptionPosition(draft.captionPosition);
    if (typeof draft.hookLeadText === 'string') setHookLeadText(draft.hookLeadText);
    if (typeof draft.hookMainText === 'string') setHookMainText(draft.hookMainText);
    if (typeof draft.hookText === 'string' && draft.hookLeadText === undefined && draft.hookMainText === undefined) {
      const legacyWords=draft.hookText.trim().split(/\s+/).filter(Boolean); setHookLeadText(legacyWords[0] ?? ''); setHookMainText(legacyWords.slice(1).join(' '));
    }
    if (draft.hookPosition) setHookPosition(draft.hookPosition);
    if (draft.hookLeadFontFamily) setHookLeadFontFamily(draft.hookLeadFontFamily);
    if (draft.hookMainFontFamily ?? draft.hookFontFamily) setHookMainFontFamily(draft.hookMainFontFamily ?? draft.hookFontFamily!);
    if (draft.hookLeadFontSize) setHookLeadFontSize(draft.hookLeadFontSize);
    if (draft.hookMainFontSize ?? draft.hookFontSize) setHookMainFontSize(draft.hookMainFontSize ?? draft.hookFontSize!);
    if (draft.hookLeadDuration) setHookLeadDuration(draft.hookLeadDuration);
    if (draft.hookMainDuration) setHookMainDuration(draft.hookMainDuration);
    if (draft.hookStyle) setHookStyle(draft.hookStyle);
    if (draft.zentryItems) setZentryItems(draft.zentryItems);
    if (draft.captionGroupStyles) setCaptionGroupStyles(draft.captionGroupStyles);
    if (draft.customBrolls) setCustomBrolls(draft.customBrolls.map(item=>!item.src && item.autoGenerated ? {...item,src:activeUrl || ''} : item).filter(item=>Boolean(item.src)).reduce(replaceOverlappingBroll, [] as CustomBrollItem[]));
    if (draft.motionGraphicsItems) setMotionGraphicsItems(draft.motionGraphicsItems);
    if (typeof draft.sfxVolumeMultiplier === 'number') setSfxVolumeMultiplier(draft.sfxVolumeMultiplier);
    setSfxTimeOverrides(draft.sfxTimeOverrides || {});
    setManualSfxClips(draft.manualSfxClips || []);
    setMusicClips(draft.musicClips || []);
    if (draft.editSegments?.length) {
      // Filtrar clips secundarios fantasma de sesiones previas cuyo blob ya no existe,
      // y forzar el videoUrl activo y válido en el segmento principal
      const validSegments = draft.editSegments
        .filter((seg, idx) => idx === 0 || Boolean(seg.src) || (!seg.id.startsWith('clip-seq-') && !seg.id.startsWith('clip-secondary-')))
        .map((seg) => ({
          ...seg,
          src: seg.src || activeUrl || undefined,
        }));
       if (validSegments.length > 0) {
         const restored = validSegments.length === 1 && draft.intentionalTrim !== true && measuredDuration && validSegments[0].end < measuredDuration - .05
           ? [{...validSegments[0],start:0,end:measuredDuration,timelineStart:0,timelineEnd:measuredDuration}]
           : recomputeTimeline(validSegments);
         setEditSegments(restored);
         setDuration(restored.reduce((sum,segment) => sum + segment.end-segment.start,0));
         setSelectedSegmentId(restored[0].id);
      }
    }
    if (typeof draft.removeSilences === 'boolean') setRemoveSilences(draft.removeSilences);
    if (typeof draft.brollText === 'string') setBrollText(draft.brollText);
    if (typeof draft.brollTypingSound === 'boolean') setBrollTypingSound(draft.brollTypingSound);
    if (draft.brollTransition) setBrollTransition(draft.brollTransition);
  };

  useEffect(() => {
    if (stage !== 'editor' || !activeProjectKeyRef.current) return;
    const timer = window.setTimeout(() => {
      const draft: SavedDraft = {
        version: 1,
        sourceDuration:mainDuration,
        intentionalTrim:editSegments.length === 1 && (editSegments[0].start > .05 || editSegments[0].end < mainDuration - .05),
        fileName,
        captions,
        activeStyle,
        accentColor,
        fontSize,
        captionFontFamily,
        captionFontWeight,
        captionItalic,
        captionDualFont,
        captionTopFontFamily,
        captionBottomFontFamily,
        captionAlign,
        captionPosition,
        hookLeadText,
        hookMainText,
        hookPosition,
        hookLeadFontFamily,
        hookMainFontFamily,
        hookLeadFontSize,
        hookMainFontSize,
        hookLeadDuration,
        hookMainDuration,
        hookStyle,
        editSegments,
        removeSilences,
        brollText,
        brollTypingSound,
        brollTransition,
        zentryItems,
        captionGroupStyles,
        customBrolls,
        motionGraphicsItems,
        sfxTimeOverrides,
        manualSfxClips,
        musicClips,
        sfxVolumeMultiplier,
        shadow,popAnimation,volume,
      };
      const key=activeProjectKeyRef.current!;
      const revision=++draftSaveRevisionRef.current;
      void persistDraftMedia(draft).then(saved=>{
        if(revision!==draftSaveRevisionRef.current || key!==activeProjectKeyRef.current) return;
        localStorage.setItem(key,JSON.stringify(saved));
        setSavedAt(new Date().toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit'}));
      }).catch(error=>{console.error('No se pudo autoguardar el proyecto:',error);setSavedAt('Error al guardar');});
    }, 450);
    return () => window.clearTimeout(timer);
  }, [stage, fileName, captions, activeStyle, accentColor, fontSize, captionFontFamily, captionFontWeight, captionItalic, captionDualFont, captionTopFontFamily, captionBottomFontFamily, captionAlign, captionPosition, hookLeadText, hookMainText, hookPosition, hookLeadFontFamily, hookMainFontFamily, hookLeadFontSize, hookMainFontSize, hookLeadDuration, hookMainDuration, hookStyle, editSegments, removeSilences, brollText, brollTypingSound, brollTransition, zentryItems, captionGroupStyles, customBrolls, motionGraphicsItems, sfxTimeOverrides, manualSfxClips,musicClips,sfxVolumeMultiplier,shadow,popAnimation,volume]);

  useEffect(() => {
    if (!playing || !brollTypingSound || !activeBrollSoundKey) return;
    const audio=typingAudioRef.current ?? new Audio('/assets/sfx/keyboard-mechanical.wav');
    typingAudioRef.current=audio; audio.volume=Math.min(1,.22*sfxVolumeMultiplier); audio.currentTime=0; void audio.play().catch(() => undefined);
  },[activeBrollSoundKey,brollTypingSound,playing,sfxVolumeMultiplier]);

  const safePlayVideo = (el: HTMLVideoElement | null | undefined) => {
    if (!el) return;
    try {
      const p = el.play();
      if (p !== undefined) {
        p.catch(() => {});
      }
    } catch {}
  };

  const safePauseVideo = (el: HTMLVideoElement | null | undefined) => {
    if (!el) return;
    try {
      el.pause();
    } catch {}
  };

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event?.reason;
      const msg = reason?.message || String(reason || '');
      if (reason?.name === 'AbortError' || msg.includes('interrupted by a call to pause')) {
        event.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  const uploadVideo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    void beginVideo(file);
  };

  const dropVideo = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) void beginVideo(file);
  };

  const uploadBroll = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Permite volver a elegir el mismo recurso después de eliminarlo de la línea de tiempo.
    event.currentTarget.value = '';
    if (!file) return;
    if (brollUrl) URL.revokeObjectURL(brollUrl);
    setBrollUrl(URL.createObjectURL(file));
  };

  const detectSilences = async () => {
    if (!videoFile) { setJobState('error'); setJobTitle('Primero sube un video'); setJobDetail('Necesito analizar el audio del archivo local.'); return; }
    setJobState('working'); setJobTitle('Analizando silencios'); setJobDetail('Midiendo el nivel de voz sin subir el audio.'); setJobProgress(.08);
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & {webkitAudioContext:typeof AudioContext}).webkitAudioContext;
      const context = new AudioContextClass();
      const decoded = await context.decodeAudioData(await videoFile.arrayBuffer());
      const windowSize = Math.max(1,Math.floor(decoded.sampleRate*.1));
      const quiet: {start:number;end:number}[] = [];
      let silenceStart: number | null = null;
      for (let sample=0; sample<decoded.length; sample+=windowSize) {
        let sum=0; let count=0;
        for (let channel=0; channel<decoded.numberOfChannels; channel++) {
          const data=decoded.getChannelData(channel); const end=Math.min(sample+windowSize,data.length);
          for (let index=sample; index<end; index+=4) { sum+=data[index]*data[index]; count++; }
        }
        const rms=Math.sqrt(sum/Math.max(1,count)); const time=sample/decoded.sampleRate;
        if (rms < .014 && silenceStart === null) silenceStart=time;
        if (rms >= .014 && silenceStart !== null) { if(time-silenceStart>=.5) quiet.push({start:silenceStart,end:time}); silenceStart=null; }
        if (sample % (windowSize*35) === 0) setJobProgress(Math.min(.94,sample/decoded.length));
      }
      if (silenceStart !== null && decoded.duration-silenceStart>=.5) quiet.push({start:silenceStart,end:decoded.duration});
      await context.close(); setSilences(quiet); setRemoveSilences(quiet.length>0); setJobProgress(1); setJobState('done'); setJobTitle(quiet.length ? `${quiet.length} silencios detectados` : 'No encontré pausas largas'); setJobDetail(quiet.length ? `Se eliminarán ${quiet.reduce((sum,item)=>sum+item.end-item.start,0).toFixed(1)} segundos al exportar.` : 'El audio mantiene un nivel de voz continuo.');
    } catch (error) { setJobState('error'); setJobTitle('No pude analizar el audio'); setJobDetail(error instanceof Error ? error.message : 'Formato no compatible con el navegador.'); }
  };

  const chooseSfx = (url: string) => {
    checkpoint();
    const nearby=manualSfxClips.filter((item)=>item.start>=currentTime-.01 && item.start<=currentTime+1.01).length;
    const clip:ManualSfxClip={id:`manual-sfx-${crypto.randomUUID()}`,src:url,start:Math.max(0,Math.min(duration,currentTime+nearby*.16)),volume:.55};
    setManualSfxClips((items)=>[...items,clip]);
    setSelectedSfxId(clip.id);
    const audio = new Audio(url); audio.volume=.45; void audio.play().catch(() => undefined);
  };

  const selectStyle = (id: CaptionStyleId) => {
    checkpoint();
    const preset = getCaptionPreset(id);
    if (selectedCaptionGroup) {
      setCaptionGroupStyles((current) => {
        const previous = current.find((style) => style.startMs === selectedCaptionGroup.startMs);
        const next: CaptionGroupStyleOverride = {
          id: previous?.id || `caption-style-${selectedCaptionGroup.startMs}`,
          startMs: selectedCaptionGroup.startMs,
          endMs: selectedCaptionGroup.endMs,
          styleId: id,
          accentColor: preset.accent,
          fontSize: previous?.fontSize ?? fontSize,
          captionFontFamily: preset.fontFamily,
          captionFontWeight: preset.fontWeight,
          captionItalic: preset.fontStyle === 'italic',
          dualFontEnabled: previous?.dualFontEnabled ?? captionDualFont,
          topFontFamily: previous?.topFontFamily ?? captionTopFontFamily,
          bottomFontFamily: previous?.bottomFontFamily ?? captionBottomFontFamily,
          captionAlign: previous?.captionAlign ?? captionAlign,
          shadow: previous?.shadow ?? shadow,
          popAnimation: previous?.popAnimation ?? true,
          positionX: previous?.positionX ?? captionPosition.x,
          positionY: previous?.positionY ?? captionPosition.y,
        };
        return [...current.filter((style) => style.startMs !== selectedCaptionGroup.startMs), next];
      });
      return;
    }
    setActiveStyle(id);
    setAccentColor(preset.accent);
    setFontSize(Math.min(84, preset.fontSize));
    setCaptionFontFamily(preset.fontFamily);
    setCaptionFontWeight(preset.fontWeight);
    setCaptionItalic(preset.fontStyle === 'italic');
    setPopAnimation(true);
  };

  const currentCaptionTemplateValues = (): Omit<CaptionGroupStyleOverride, 'id' | 'startMs' | 'endMs'> => ({
    styleId: activeStyle,
    accentColor,
    fontSize,
    captionFontFamily,
    captionFontWeight,
    captionItalic,
    dualFontEnabled: captionDualFont,
    topFontFamily: captionTopFontFamily,
    bottomFontFamily: captionBottomFontFamily,
    captionAlign,
    shadow,
    popAnimation,
    positionX: captionPosition.x,
    positionY: captionPosition.y,
  });

  const applyCaptionTemplateValues = (values: Omit<CaptionGroupStyleOverride, 'id' | 'startMs' | 'endMs'>) => {
    checkpoint();
    if (selectedCaptionGroup) {
      setCaptionGroupStyles((current) => [
        ...current.filter((style) => style.startMs !== selectedCaptionGroup.startMs),
        {
          ...values,
          id: `caption-style-${selectedCaptionGroup.startMs}`,
          startMs: selectedCaptionGroup.startMs,
          endMs: selectedCaptionGroup.endMs,
        },
      ]);
      return;
    }
    setCaptionGroupStyles([]);
    setActiveStyle(values.styleId);
    setAccentColor(values.accentColor);
    setFontSize(values.fontSize);
    setCaptionFontFamily(values.captionFontFamily);
    setCaptionFontWeight(values.captionFontWeight);
    setCaptionItalic(values.captionItalic);
    setCaptionDualFont(values.dualFontEnabled ?? false);
    setCaptionTopFontFamily(values.topFontFamily || 'Great Vibes');
    setCaptionBottomFontFamily(values.bottomFontFamily || 'Playfair Display');
    setCaptionAlign(values.captionAlign);
    setShadow(values.shadow);
    setPopAnimation(values.popAnimation);
    setCaptionPosition({ x: values.positionX, y: values.positionY });
  };

  const captionEditorValues = activeCaptionGroupStyle || currentCaptionTemplateValues();

  const updateCaptionEditorValues = (
    updates: Partial<Omit<CaptionGroupStyleOverride, 'id' | 'startMs' | 'endMs'>>
  ) => {
    checkpoint();
    if (selectedCaptionGroup) {
      setCaptionGroupStyles((current) => {
        const previous = current.find((style) => style.startMs === selectedCaptionGroup.startMs);
        const base = previous || {
          ...currentCaptionTemplateValues(),
          id: `caption-style-${selectedCaptionGroup.startMs}`,
          startMs: selectedCaptionGroup.startMs,
          endMs: selectedCaptionGroup.endMs,
        };
        return [
          ...current.filter((style) => style.startMs !== selectedCaptionGroup.startMs),
          { ...base, ...updates },
        ];
      });
      return;
    }
    if (updates.styleId) setActiveStyle(updates.styleId);
    if (updates.accentColor) setAccentColor(updates.accentColor);
    if (typeof updates.fontSize === 'number') setFontSize(updates.fontSize);
    if (updates.captionFontFamily) setCaptionFontFamily(updates.captionFontFamily);
    if (typeof updates.captionFontWeight === 'number') setCaptionFontWeight(updates.captionFontWeight);
    if (typeof updates.captionItalic === 'boolean') setCaptionItalic(updates.captionItalic);
    if (typeof updates.dualFontEnabled === 'boolean') setCaptionDualFont(updates.dualFontEnabled);
    if (updates.topFontFamily) setCaptionTopFontFamily(updates.topFontFamily);
    if (updates.bottomFontFamily) setCaptionBottomFontFamily(updates.bottomFontFamily);
    if (updates.captionAlign) setCaptionAlign(updates.captionAlign);
    if (typeof updates.shadow === 'boolean') setShadow(updates.shadow);
    if (typeof updates.popAnimation === 'boolean') setPopAnimation(updates.popAnimation);
    if (typeof updates.positionX === 'number' || typeof updates.positionY === 'number') {
      setCaptionPosition((current) => ({
        x: updates.positionX ?? current.x,
        y: updates.positionY ?? current.y,
      }));
    }
  };

  const applyCurrentStyleToSelectedGroup = () => {
    if (!selectedCaptionGroup) return;
    applyCaptionTemplateValues(currentCaptionTemplateValues());
  };

  const saveCurrentCaptionTemplate = () => {
    setCaptionTemplateNameDraft(`Mi estilo ${savedCaptionTemplates.length + 1}`);
    setCaptionTemplateDialogOpen(true);
  };

  const confirmSaveCurrentCaptionTemplate = () => {
    const name = captionTemplateNameDraft.trim();
    if (!name) return;
    const template: SavedCaptionTemplate = {
      id: `custom-caption-${Date.now()}`,
      name,
      ...(activeCaptionGroupStyle
        ? (({ id: _id, startMs: _startMs, endMs: _endMs, ...values }) => values)(activeCaptionGroupStyle)
        : currentCaptionTemplateValues()),
    };
    const next = [
      ...savedCaptionTemplates.filter((saved) => saved.name.trim().toLowerCase() !== name.toLowerCase()),
      template,
    ];
    try { localStorage.setItem('zentry-custom-caption-templates', JSON.stringify(next)); }
    catch {
      setBgTask({active:false,label:'No se pudo guardar: almacenamiento lleno',progress:1,done:true});
      return;
    }
    setSavedCaptionTemplates(next);
    setCaptionTemplateDialogOpen(false);
    setCaptionTemplateNameDraft('');
    setBgTask({active:false,label:`✓ Plantilla «${name}» guardada`,progress:1,done:true});
    setTimeout(() => setBgTask(null),3500);
  };

  const deleteSavedCaptionTemplate = (id: string) => {
    const next = savedCaptionTemplates.filter((template) => template.id !== id);
    setSavedCaptionTemplates(next);
    localStorage.setItem('zentry-custom-caption-templates', JSON.stringify(next));
  };

  const startLayerDrag = (event: ReactPointerEvent<HTMLElement>, layer: CanvasLayer) => {
    const canvas = phoneCanvasRef.current;
    if (!canvas) return;
    const draggedElement = event.currentTarget;
    const pointerId = event.pointerId;
    event.preventDefault();
    event.stopPropagation();
    try {
      draggedElement.setPointerCapture(pointerId);
    } catch {}
    checkpoint();
    setSelectedCanvasLayer(layer);

    const updatePosition = (clientX: number, clientY: number) => {
      const bounds = canvas.getBoundingClientRect();
      const elementBounds = draggedElement.getBoundingClientRect();
      const paddingX = Math.min(46,Math.max(8,(elementBounds.width/bounds.width)*50+2));
      const paddingY = Math.min(45,Math.max(5,(elementBounds.height/bounds.height)*50+2));
      const x = Math.min(100-paddingX,Math.max(paddingX,((clientX-bounds.left)/bounds.width)*100));
      const y = Math.min(100-paddingY,Math.max(paddingY,((clientY-bounds.top)/bounds.height)*100));
      const next = {x:Number(x.toFixed(1)),y:Number(y.toFixed(1))};
      if (layer === 'hook') setHookPosition(next);
      else if (selectedCaptionGroup) {
        setCaptionGroupStyles((current) => {
          const previous = current.find((style) => style.startMs === selectedCaptionGroup.startMs);
          const base = previous || {
            id: `caption-style-${selectedCaptionGroup.startMs}`,
            startMs: selectedCaptionGroup.startMs,
            endMs: selectedCaptionGroup.endMs,
            ...currentCaptionTemplateValues(),
          };
          return [
            ...current.filter((style) => style.startMs !== selectedCaptionGroup.startMs),
            { ...base, positionX: next.x, positionY: next.y },
          ];
        });
      } else setCaptionPosition(next);
    };

    updatePosition(event.clientX,event.clientY);
    const move = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      updatePosition(moveEvent.clientX,moveEvent.clientY);
    };
    const stop = () => {
      try {
        draggedElement.releasePointerCapture(pointerId);
      } catch {}
      window.removeEventListener('pointermove',move);
      window.removeEventListener('pointerup',stop);
      window.removeEventListener('pointercancel',stop);
    };
    window.addEventListener('pointermove',move);
    window.addEventListener('pointerup',stop);
    window.addEventListener('pointercancel',stop);
  };

  const editHook = () => {
    setActiveTool('effects');
    setSelectedCanvasLayer('hook');
    window.setTimeout(() => hookInputRef.current?.focus(),0);
  };

  const updateCaptionGroup = (groupIndex: number, value: string) => {
    const group = captionGroups[groupIndex];
    if (!group) return;
    const words = value.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return;
    checkpoint();
    const wordDuration = Math.max(80,(group.endMs-group.startMs)/words.length);
    const replacement: Caption[] = words.map((word,index) => ({ text:`${index === 0 ? '' : ' '}${word}`, startMs:Math.round(group.startMs+index*wordDuration), endMs:Math.round(group.startMs+(index+1)*wordDuration), timestampMs:Math.round(group.startMs+index*wordDuration), confidence:1 }));
    setCaptions((current) => [...current.slice(0,group.startIndex),...replacement,...current.slice(group.endIndex)]);
  };

  const addCaption = () => {
    checkpoint();
    const startMs = Math.round(currentTime*1000);
    const words = ['Nuevo','subtítulo'];
    const durationPerWord = 700;
    const additions: Caption[] = words.map((word,index) => ({ text:`${index === 0 ? '' : ' '}${word}`, startMs:startMs+index*durationPerWord, endMs:startMs+(index+1)*durationPerWord, timestampMs:startMs+index*durationPerWord, confidence:1 }));
    setCaptions((current) => [...current,...additions].sort((a,b) => a.startMs-b.startMs));
    setSelectedCanvasLayer('captions');
  };

  const recomputeTimeline = (segments: EditSegment[]) => {
    let cursor = 0;
    return segments.map((seg) => {
      const dur = Math.max(0.08, seg.end - seg.start);
      const updated = {
        ...seg,
        timelineStart: cursor,
        timelineEnd: cursor + dur,
      };
      cursor += dur;
      return updated;
    });
  };

  const seekTo = (time: number) => {
    const next = Math.max(0, Math.min(duration, time));
    setCurrentTime(next);

    let targetIndex = editSegments.findIndex((seg) => {
      const sStart = seg.timelineStart !== undefined ? seg.timelineStart : seg.start;
      const sEnd = seg.timelineEnd !== undefined ? seg.timelineEnd : seg.end;
      return next >= sStart && next < sEnd;
    });
    if (targetIndex < 0 && editSegments.length > 0) {
      targetIndex = next >= duration ? editSegments.length - 1 : 0;
    }

    editSegments.forEach((seg, idx) => {
      const el = segmentVideoRefs.current[seg.id];
      if (!el) return;
      if (idx === targetIndex) {
        const sStart = seg.timelineStart !== undefined ? seg.timelineStart : seg.start;
        const offset = next - sStart;
        el.currentTime = Math.min(seg.end, Math.max(seg.start, seg.start + offset));
        const audio=segmentAudioRefs.current[seg.id];
        if(audio) audio.currentTime=el.currentTime;
        if (playing) safePlayVideo(el);
      } else {
        safePauseVideo(el);
        segmentAudioRefs.current[seg.id]?.pause();
      }
    });
  };

  const startPlayheadDrag = (event:ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    const track=timelineTrackRef.current;
    if (!track) return;
    event.preventDefault(); event.stopPropagation();
    const update=(clientX:number) => {
      const bounds=track.getBoundingClientRect();
      seekTo(((clientX-bounds.left)/bounds.width)*duration);
    };
    update(event.clientX);
    const move=(next:PointerEvent) => update(next.clientX);
    const stop=() => {window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',stop);};
    window.addEventListener('pointermove',move);
    window.addEventListener('pointerup',stop);
  };

  const selectMusicClip = (clip:MusicClip) => {
    setSelectedMusicId(clip.id); setSelectedSegmentId(null); setSelectedBrollId(null);
    setSelectedMgId(null); setSelectedZentryId(null); setSelectedCaptionGroupStartMs(null);
    setActiveTool('audio'); seekTo(clip.start);
  };

  const startSfxDrag = (event:ReactPointerEvent<HTMLButtonElement>, id:string, initialTime:number) => {
    const track = timelineTrackRef.current;
    if (!track) return;
    event.preventDefault(); event.stopPropagation(); checkpoint(); setSelectedSfxId(id); setActiveTool('audio');
    const startX=event.clientX;
    const width=track.getBoundingClientRect().width;
    const move=(next:PointerEvent) => {
      const time=Math.max(0,Math.min(duration-.05,initialTime+(next.clientX-startX)/width*duration));
      setSfxTimeOverrides((items) => ({...items,[id]:Math.round(time*100)/100}));
    };
    const stop=() => {window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',stop);};
    window.addEventListener('pointermove',move);window.addEventListener('pointerup',stop);
  };

  const startMusicDrag = (event:ReactPointerEvent<HTMLDivElement>, id:string) => {
    if ((event.target as HTMLElement).closest('button')) return;
    const track = timelineTrackRef.current;
    const clip = musicClips.find((item) => item.id === id);
    if (!track || !clip) return;
    event.preventDefault(); event.stopPropagation(); selectMusicClip(clip); checkpoint();
    const startX = event.clientX;
    const width = track.getBoundingClientRect().width;
    const move = (next:PointerEvent) => {
      const wanted = clip.start + (next.clientX-startX)/width*duration;
      const placed = placeMusicClip(clip,Math.max(0,Math.min(duration-clip.duration,wanted)),musicClips,duration);
      setMusicClips((items) => items.map((item) => item.id === id ? {...item,start:Math.round(placed*100)/100} : item));
    };
    const stop = () => { window.removeEventListener('pointermove',move); window.removeEventListener('pointerup',stop); };
    window.addEventListener('pointermove',move); window.addEventListener('pointerup',stop);
  };

  const startMusicTrim = (event:ReactPointerEvent<HTMLButtonElement>, id:string, edge:'start'|'end') => {
    const track = timelineTrackRef.current;
    const clip = musicClips.find((item) => item.id === id);
    if (!track || !clip) return;
    event.preventDefault(); event.stopPropagation(); selectMusicClip(clip); checkpoint();
    const startX = event.clientX;
    const width = track.getBoundingClientRect().width;
    const move = (next:PointerEvent) => {
      const delta = (next.clientX-startX)/width*duration;
      setMusicClips((items) => items.map((item) => {
        if (item.id !== id) return item;
        const others = items.filter((other) => other.id !== id);
        const previousEnd = Math.max(0,...others.filter((other) => other.start+other.duration <= clip.start+0.001).map((other) => other.start+other.duration));
        const nextStart = Math.min(duration,...others.filter((other) => other.start >= clip.start+clip.duration-0.001).map((other) => other.start));
        if (edge === 'start') {
          const trim = Math.max(previousEnd-clip.start,-clip.start,-clip.sourceStart/audioRate(clip),Math.min(clip.duration-0.1,delta));
          const nextStart = Math.max(0,clip.start+trim);
          const actualTrim = nextStart-clip.start;
          return {...item,start:Math.round(nextStart*100)/100,sourceStart:clip.sourceStart+actualTrim*audioRate(clip),duration:Math.round((clip.duration-actualTrim)*100)/100};
        }
        const nextDuration = Math.max(0.1,Math.min(nextStart-clip.start,maxAudioDuration(clip,items,duration),clip.duration+delta));
        return {...item,duration:Math.round(nextDuration*100)/100};
      }));
    };
    const stop = () => { window.removeEventListener('pointermove',move); window.removeEventListener('pointerup',stop); };
    window.addEventListener('pointermove',move); window.addEventListener('pointerup',stop);
  };

  const cutAtPlayhead = () => {
    const selectedMusic = musicClips.find((clip) => clip.id === selectedMusicId);
    if (selectedMusic && currentTime > selectedMusic.start+0.1 && currentTime < selectedMusic.start+selectedMusic.duration-0.1) {
      checkpoint();
      const offset = currentTime-selectedMusic.start;
      const right:MusicClip = {...selectedMusic,id:`music-${crypto.randomUUID()}`,start:currentTime,sourceStart:selectedMusic.sourceStart+offset*audioRate(selectedMusic),duration:selectedMusic.duration-offset};
      setMusicClips((items) => items.flatMap((item) => item.id === selectedMusic.id ? [{...item,duration:offset},right] : [item]));
      setSelectedMusicId(right.id);
      return;
    }
    if (selectedMusicId) {
      setJobState('error'); setJobTitle('Corte fuera de la música');
      setJobDetail('Mueve el cabezal dentro del fragmento seleccionado.'); return;
    }
    // 1. Si hay un Motion Graphic seleccionado o bajo el cabezal, cortarlo
    const activeMg = !selectedSegmentId && !selectedMusicId ? motionGraphicsItems.find((m) => (selectedMgId ? m.id === selectedMgId : currentTime >= m.start && currentTime <= m.start + m.duration)) : null;
    if (activeMg && currentTime > activeMg.start + 0.1 && currentTime < activeMg.start + activeMg.duration - 0.1) {
      checkpoint();
      const splitOffset = currentTime - activeMg.start;
      const mg1: MotionGraphicItem = {
        ...activeMg,
        duration: Math.round(splitOffset * 10) / 10,
      };
      const mg2: MotionGraphicItem = {
        ...activeMg,
        id: `mg-${Date.now()}`,
        start: Math.round(currentTime * 10) / 10,
        duration: Math.round((activeMg.duration - splitOffset) * 10) / 10,
      };
      setMotionGraphicsItems((prev) => prev.map((m) => (m.id === activeMg.id ? mg1 : m)).concat(mg2));
      setSelectedMgId(mg2.id);
      setJobState('done');
      setJobTitle('Motion Graphic dividido');
      setJobDetail(`Dividido con éxito en ${currentTime.toFixed(1)}s.`);
      return;
    }
    if (selectedMgId) {
      setJobState('error'); setJobTitle('Corte fuera del motion'); setJobDetail('Mueve el cabezal dentro del elemento seleccionado.'); return;
    }

    // 2. Si hay un B-Roll bajo el cabezal, cortarlo
    const activeBroll = !selectedSegmentId && !selectedMusicId ? customBrolls.find((b) => selectedBrollId ? b.id === selectedBrollId : currentTime >= b.start && currentTime <= b.start + b.duration) : null;
    if (activeBroll && currentTime > activeBroll.start + 0.1 && currentTime < activeBroll.start + activeBroll.duration - 0.1) {
      checkpoint();
      const splitOffset = currentTime - activeBroll.start;
      const b1: CustomBrollItem = { ...activeBroll, duration: Math.round(splitOffset * 10) / 10 };
      const b2: CustomBrollItem = { ...activeBroll, id: `broll-${Date.now()}`, start: Math.round(currentTime * 10) / 10, duration: Math.round((activeBroll.duration - splitOffset) * 10) / 10 };
      setCustomBrolls((prev) => dedupeCustomBrolls(prev.map((b) => (b.id === activeBroll.id ? b1 : b)).concat(b2)));
      setSelectedBrollId(b2.id);
      setJobState('done');
      setJobTitle('B-Roll dividido');
      setJobDetail(`Dividido con éxito en ${currentTime.toFixed(1)}s.`);
      return;
    }
    if (selectedBrollId) {
      setJobState('error'); setJobTitle('Corte fuera del B-roll'); setJobDetail('Mueve el cabezal dentro del B-roll seleccionado.'); return;
    }

    // 3. Cortar clip de video
    const index = editSegments.findIndex((segment) => {
      const segTStart = segment.timelineStart !== undefined ? segment.timelineStart : segment.start;
      const segTEnd = segment.timelineEnd !== undefined ? segment.timelineEnd : segment.end;
      return currentTime > segTStart + 0.06 && currentTime < segTEnd - 0.06;
    });
    if (index < 0) {
      setJobState('error');
      setJobTitle('Mueve el cabezal dentro de un clip');
      setJobDetail('El corte necesita al menos unas décimas a cada lado.');
      return;
    }
    checkpoint();
    const segment = editSegments[index];
    const segTStart = segment.timelineStart !== undefined ? segment.timelineStart : segment.start;
    const cutId = currentTime.toFixed(3).replace('.', '-');
    const offsetInClip = currentTime - segTStart;
    const left: EditSegment = {
      ...segment,
      id: `${segment.id}-a-${cutId}`,
      end: segment.start + offsetInClip,
    };
    const right: EditSegment = {
      ...segment,
      id: `${segment.id}-b-${cutId}`,
      start: segment.start + offsetInClip,
    };
    const updated = [...editSegments.slice(0, index), left, right, ...editSegments.slice(index + 1)];
    const recomputed = recomputeTimeline(updated);
    setEditSegments(recomputed);
    setSelectedSegmentId(right.id);
  };

  const removeTimelineRange = (start:number, length:number) => {
    if (length <= 0) return;
    setCaptions((items) => rippleCaptions(items,start,length));
    setCustomBrolls((items) => items.map((item) => rippleVisualItem(item,start,length)).filter((item):item is CustomBrollItem => item !== null));
    setMotionGraphicsItems((items) => items.map((item) => rippleVisualItem(item,start,length)).filter((item):item is MotionGraphicItem => item !== null));
    setZentryItems((items) => items.map((item) => rippleVisualItem(item,start,length)).filter((item):item is ZentryTemplateItem => item !== null));
    setMusicClips((items) => rippleMusicClips(items,start,length));
    setManualSfxClips((items)=>items.filter((item)=>item.start<start || item.start>=start+length).map((item)=>item.start>=start+length ? {...item,start:item.start-length} : item));
    setCaptionGroupStyles((items) => items.flatMap((item) => {
      const shifted = rippleVisualItem({start:item.startMs/1000,duration:(item.endMs-item.startMs)/1000},start,length);
      return shifted ? [{...item,startMs:Math.round(shifted.start*1000),endMs:Math.round((shifted.start+shifted.duration)*1000)}] : [];
    }));
    setContextualSfxEvents((items) => items.filter((item) => item.timeSec < start || item.timeSec >= start+length).map((item) => item.timeSec >= start+length ? {...item,timeSec:item.timeSec-length} : item));
    setSfxTimeOverrides((items) => Object.fromEntries(Object.entries(items).flatMap(([key,time]) => time >= start && time < start+length ? [] : [[key,time >= start+length ? time-length : time]])));
    setSelectedCaptionGroupStartMs(null);
  };

  const deleteSegment = (id: string, alreadyCheckpointed = false) => {
    if (editSegments.length <= 1) {
      setJobState('error');
      setJobTitle('Debe quedar al menos un clip');
      setJobDetail('Recorta sus bordes en vez de eliminar el único video.');
      return;
    }
    if (!alreadyCheckpointed) checkpoint();
    const deletedIndex = editSegments.findIndex((segment) => segment.id === id);
    const deleted = editSegments[deletedIndex];
    if (!deleted) return;
    const dStart = deleted.timelineStart !== undefined ? deleted.timelineStart : deleted.start;
    const dDur = deleted.end - deleted.start;
    const remaining = editSegments.filter((segment) => segment.id !== id);
    // Conservar el objeto local en memoria: Deshacer puede restaurar este clip.
    const recomputed = recomputeTimeline(remaining);
    const newTotal = recomputed.reduce((sum, s) => sum + (s.end - s.start), 0);

    removeTimelineRange(dStart,dDur);
    setSelectedMusicId(null); setSelectedBrollId(null); setSelectedMgId(null); setSelectedZentryId(null);

    Object.values(segmentVideoRefs.current).forEach((element) => safePauseVideo(element));
    setPlaying(false);
    setEditSegments(recomputed);
    setDuration(newTotal);
    setSelectedSegmentId(recomputed[Math.min(deletedIndex,recomputed.length-1)]?.id ?? null);
    setCurrentTime(Math.min(dStart,Math.max(0,newTotal-0.05)));
  };

  const updateSegmentEdge = (id: string, edge: 'start' | 'end', value: number, original?:EditSegment, finish=true) => {
    const segment = original || editSegments.find((item) => item.id === id);
    if (!segment || !Number.isFinite(value)) return;
    const nextValue = edge === 'start'
      ? Math.max(0,Math.min(segment.end-0.08,value))
      : Math.max(segment.start+0.08,value);
    const changed = edge === 'start' ? nextValue-segment.start : segment.end-nextValue;
    if (finish && changed > 0.001) {
      const timelineStart=segment.timelineStart ?? segment.start;
      const cutStart=edge === 'start' ? timelineStart : (segment.timelineEnd ?? timelineStart+segment.end-segment.start)-changed;
      removeTimelineRange(cutStart,changed);
    }
    const updated = recomputeTimeline(editSegments.map((item) => item.id === id ? {...item,[edge]:nextValue} : item));
    const newTotal=updated.reduce((sum,item) => sum+item.end-item.start,0);
    setEditSegments(updated);
    setDuration(newTotal);
    if (finish) setCurrentTime((time) => Math.min(time,newTotal));
  };

  const startTrimDrag = (event: ReactPointerEvent<HTMLButtonElement>, id:string, edge:'start'|'end') => {
    const track = timelineTrackRef.current;
    const segment=editSegments.find((item) => item.id === id);
    if (!track || !segment) return;
    event.preventDefault(); event.stopPropagation(); checkpoint(); setSelectedSegmentId(id);
    const startX=event.clientX;
    const width=track.getBoundingClientRect().width;
    const total=duration;
    let finalValue=edge === 'start' ? segment.start : segment.end;
    const update = (clientX:number) => {
      finalValue=(edge === 'start' ? segment.start : segment.end)+(clientX-startX)/width*total;
      updateSegmentEdge(id,edge,finalValue,segment,false);
    };
    const move=(moveEvent:PointerEvent) => update(moveEvent.clientX);
    const stop=() => { window.removeEventListener('pointermove',move); window.removeEventListener('pointerup',stop); updateSegmentEdge(id,edge,finalValue,segment,true); };
    window.addEventListener('pointermove',move); window.addEventListener('pointerup',stop);
  };

  const startMgDrag = (event: ReactPointerEvent<HTMLDivElement>, id: string) => {
    const track = timelineTrackRef.current;
    if (!track) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedMgId(id);
    setSelectedSegmentId(null); setSelectedMusicId(null); setSelectedBrollId(null); setSelectedZentryId(null);
    const bounds = track.getBoundingClientRect();
    const mg = motionGraphicsItems.find((m) => m.id === id);
    if (!mg) return;
    const startX = event.clientX;
    const originalStart = mg.start;
    const move = (e: PointerEvent) => {
      const deltaSec = ((e.clientX - startX) / bounds.width) * duration;
      const newStart = Math.max(0, Math.min(duration - mg.duration, originalStart + deltaSec));
      updateMotionGraphic(id, { start: Math.round(newStart * 10) / 10 });
    };
    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
  };

  const startMgTrim = (event: ReactPointerEvent<HTMLButtonElement>, id: string, edge: 'start' | 'end') => {
    const track = timelineTrackRef.current;
    if (!track) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedMgId(id);
    const bounds = track.getBoundingClientRect();
    const mg = motionGraphicsItems.find((m) => m.id === id);
    if (!mg) return;
    const originalStart = mg.start;
    const originalDur = mg.duration;
    const move = (e: PointerEvent) => {
      const currentPos = ((e.clientX - bounds.left) / bounds.width) * duration;
      if (edge === 'start') {
        const newStart = Math.max(0, Math.min(originalStart + originalDur - 0.5, currentPos));
        const newDur = (originalStart + originalDur) - newStart;
        updateMotionGraphic(id, { start: Math.round(newStart * 10) / 10, duration: Math.round(newDur * 10) / 10 });
      } else {
        const newDur = Math.max(0.5, Math.min(duration - originalStart, currentPos - originalStart));
        updateMotionGraphic(id, { duration: Math.round(newDur * 10) / 10 });
      }
    };
    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
  };

  const ensureWhisperModel = async (model: 'base' | 'tiny', onProgress: (progress: number) => void) => {
    if (activeModelPromise) {
      if(activeModelKey!==model) {
        await activeModelPromise.catch(()=>undefined);
        return ensureWhisperModel(model,onProgress);
      }
      activeModelListeners.push(onProgress);
      return activeModelPromise;
    }

    activeModelListeners = [onProgress];
    activeModelKey = model;
    const broadcastProgress = (p: number) => {
      activeModelListeners.forEach((fn) => {
        try { fn(p); } catch {}
      });
    };

    activeModelPromise = (async () => {
      const modelUrl = `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${model}.bin`;
      const expectedSize = model === 'tiny' ? 77691713 : 147951465;

      const checkIndexedDB = (): Promise<Uint8Array | null> => {
        return new Promise((resolve) => {
          if (typeof indexedDB === 'undefined') return resolve(null);
          try {
            const rq = indexedDB.open('whisper-web', 1);
            rq.onupgradeneeded = () => {
              if (!rq.result.objectStoreNames.contains('models')) {
                rq.result.createObjectStore('models');
              }
            };
            rq.onsuccess = () => {
              const db = rq.result;
              try {
                if (!db.objectStoreNames.contains('models')) {
                  db.close();
                  return resolve(null);
                }
                const tx = db.transaction('models', 'readonly');
                const store = tx.objectStore('models');
                const getRq = store.get(modelUrl);
                getRq.onsuccess = () => {
                  const res = getRq.result || null;
                  db.close();
                  resolve(res);
                };
                getRq.onerror = () => {
                  db.close();
                  resolve(null);
                };
              } catch {
                db.close();
                resolve(null);
              }
            };
            rq.onerror = () => resolve(null);
          } catch {
            resolve(null);
          }
        });
      };

      const saveToIndexedDB = (data: Uint8Array): Promise<void> => {
        return new Promise((resolve) => {
          if (typeof indexedDB === 'undefined') return resolve();
          try {
            const rq = indexedDB.open('whisper-web', 1);
            rq.onupgradeneeded = () => {
              if (!rq.result.objectStoreNames.contains('models')) {
                rq.result.createObjectStore('models');
              }
            };
            rq.onsuccess = () => {
              const db = rq.result;
              try {
                if (!db.objectStoreNames.contains('models')) {
                  db.close();
                  return resolve();
                }
                const tx = db.transaction('models', 'readwrite');
                const store = tx.objectStore('models');
                const putRq = store.put(data, modelUrl);
                putRq.onsuccess = () => {
                  db.close();
                  resolve();
                };
                putRq.onerror = () => {
                  db.close();
                  resolve();
                };
              } catch {
                db.close();
                resolve();
              }
            };
            rq.onerror = () => resolve();
          } catch {
            resolve();
          }
        });
      };

      const existing = await checkIndexedDB();
      if (existing) {
        broadcastProgress(1);
        return;
      }

      // 2. Descargar modelo mediante streaming ligero y seguro
      let downloaded = false;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);
        const response = await fetch(`/api/whisper-model?model=${model}`, { signal: controller.signal });
        if (response.ok && response.body) {
          const reader = response.body.getReader();
          const chunks: Uint8Array[] = [];
          let receivedLength = 0;
          const total = parseInt(response.headers.get('content-length') || String(expectedSize), 10);

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            receivedLength += value.length;
            if (total > 0) broadcastProgress(receivedLength / total);
          }
          clearTimeout(timeoutId);

          if (receivedLength > 1000000) {
            const blob = new Blob(chunks as any);
            const arrayBuffer = await blob.arrayBuffer();
            await saveToIndexedDB(new Uint8Array(arrayBuffer));
            broadcastProgress(1);
            downloaded = true;
            return;
          }
        }
      } catch (proxyErr) {
        console.warn('Proxy /api/whisper-model error o timeout, probando descarga directa:', proxyErr);
      }

      // 3. Fallback a downloadWhisperModel estándar
      if (!downloaded) {
        const { downloadWhisperModel } = await import('@remotion/whisper-web');
        await downloadWhisperModel({
          model,
          onProgress: ({ progress }) => broadcastProgress(progress),
        });
      }
    })();

    try {
      await activeModelPromise;
    } finally {
      activeModelPromise = null;
      activeModelKey = null;
      activeModelListeners = [];
    }
  };

  const processSubtitles = async (sourceFile: File | null = videoFile, enterEditor = false, sourceDuration = mainDuration) => {
    if (!sourceFile) { setJobState('error'); setJobTitle('Primero sube un video'); setJobDetail('Elige un MP4, MOV o WebM de hasta 3 minutos.'); return; }
    if (duration > 180) { setJobState('error'); setJobTitle('El video supera 3 minutos'); setJobDetail('Recórtalo a 180 segundos o menos para esta primera versión.'); return; }
    setJobState('working'); setJobTitle('Iniciando IA Whisper'); setJobDetail('Preparando motor local optimizado...'); setJobProgress(0.04);
    try {
      const { canUseWhisperWeb, resampleTo16Khz, transcribe, toCaptions } = await import('@remotion/whisper-web');
      const support = await canUseWhisperWeb(WHISPER_MODEL);
      if (!support.supported) throw new Error(support.detailedReason ?? 'Este navegador no permite la transcripción local.');
      setJobTitle('Verificando modelo Whisper'); setJobDetail('Cargando modelo neuronal ligero en tu navegador...');
      await ensureWhisperModel(WHISPER_MODEL, (progress) => {
        const pct = Math.round((0.05 + progress * 0.35) * 100);
        setJobProgress(0.05 + progress * 0.35);
        setJobDetail(`Cargando modelo IA (${pct}%)...`);
      });
      setJobTitle('Extrayendo audio a 16 kHz'); setJobDetail('Procesando pista de voz limpia para máxima precisión...');
      const waveform = await withProcessingTimeout(resampleTo16Khz({ file:sourceFile, onProgress:(progress) => {
        setJobProgress(0.40 + progress * 0.15);
        setJobDetail(progress<=.5 ? 'Leyendo el archivo; después se decodificará su pista de audio.' : 'Convirtiendo la pista de audio a 16 kHz...');
      }}),120000,'La extracción de audio tardó más de 2 minutos. Comprueba que el video tenga una pista de audio compatible (AAC/MP3) y vuelve a intentarlo.');
      setJobTitle('Transcribiendo con IA en tiempo real'); setJobDetail('Whisper está reconociendo palabras y tiempos...');
      const isMobileDevice = typeof navigator !== 'undefined' && (
        /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent) ||
        (typeof window !== 'undefined' && window.innerWidth < 900)
      );
      // En móvil 1 hilo garantiza evitar deadlocks de pthreads y saturación de RAM/temperatura
      const threads = isMobileDevice ? 1 : Math.min(4, typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 4) : 4);
      const whisperWebOutput = await transcribe({
        channelWaveform: waveform,
        model: WHISPER_MODEL,
        language: 'es',
        onProgress: (progress) => {
          const pct = Math.round((0.55 + progress * 0.44) * 100);
          setJobProgress(0.55 + progress * 0.44);
          setJobDetail(`Reconociendo voz con IA (${pct}%)...`);
        },
        threads,
        logLevel: 'warn',
      });
      const result = toCaptions({ whisperWebOutput });
      const reliableCaptions = cleanWhisperCaptions(result.captions, waveform);
      if (!reliableCaptions.length) throw new Error('No se detectó voz clara con suficiente confianza en el video.');
      const saved = activeProjectKeyRef.current ? localStorage.getItem(activeProjectKeyRef.current) : null;
      if (saved && enterEditor) {
         try { applyDraft(withFreshVideoCaptions(await restoreDraftMedia(JSON.parse(saved) as SavedDraft),reliableCaptions), reliableCaptions, videoUrlRef.current || videoUrl || undefined, sourceDuration, sourceFile); }
        catch { setCaptions(reliableCaptions); }
      } else {
        if(!enterEditor) checkpoint();
        setCaptions(reliableCaptions);
        try { if(enterEditor) {
          const collection = readPersonalPresetCollection();
          const defaultPreset = collection.presets.find((preset) => preset.id === collection.defaultId);
           if (defaultPreset) applyPersonalPreset(defaultPreset,reliableCaptions,sourceDuration,sourceFile);
        }
        } catch {}
      }
      setJobProgress(1); setJobTitle('Subtítulos listos'); setJobDetail(`${reliableCaptions.length} palabras detectadas con precisión.`);
      if (enterEditor) { setJobState('idle'); setStage('editor'); }
      else setJobState('done');
    } catch (error) {
      setJobState('error'); setJobTitle('No se pudo transcribir'); setJobDetail(error instanceof Error ? error.message : 'Ocurrió un error inesperado.');
    }
  };

  const clearVideoCaptions = () => {
    if (!captions.length && !captionGroupStyles.length) return;
    checkpoint();
    setCaptions([]);
    setCaptionGroupStyles([]);
    setSelectedCaptionGroupStartMs(null);
    // Remove generated layers whose text/timing came from the video transcript;
    // user-created B-roll and motion layers remain editable on the timeline.
    setCustomBrolls((items) => items.filter((item) => !item.autoGenerated));
    setMotionGraphicsItems((items) => items.filter((item) => !item.id.startsWith('pack-')));
    autoBrollMaterializedKeyRef.current = '';
    setJobState('done');
    setJobTitle('Subtítulos del video eliminados');
    setJobDetail('Ahora puedes sincronizar los subtítulos desde los audios cargados. Deshacer restaura todo.');
    setJobProgress(1);
  };

  const syncCaptionsWithUploadedAudio = async () => {
    if (!musicClips.length) return;
    auditionAudioRef.current?.pause();
    setPlaying(false);
    setJobState('working');setJobTitle('Sincronizando subtítulos con audio');setJobDetail('Preparando el modelo local de voz...');setJobProgress(.02);
    try {
      const {canUseWhisperWeb,resampleTo16Khz,transcribe,toCaptions}=await import('@remotion/whisper-web');
      const support=await canUseWhisperWeb(AUDIO_WHISPER_MODEL);
      if (!support.supported) throw new Error(support.detailedReason ?? 'La transcripción local no está disponible en este navegador.');
      await ensureWhisperModel(AUDIO_WHISPER_MODEL,(progress)=>setJobProgress(.02+progress*.12));
      const synced:Caption[]=[];
      const ordered=[...musicClips].sort((a,b)=>a.start-b.start);
      const isMobile=/iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent) || window.innerWidth<900;
      const threads=isMobile ? 1 : Math.min(4,navigator.hardwareConcurrency || 4);
      // Resample all clips first and transcribe one combined waveform. Calling
      // Whisper once avoids retaining 14 worker/model result buffers and is
      // materially more stable for a full 14-audio batch. A short silent
      // separator lets us map each returned word back to its source clip.
      const separatorSamples = 1600; // 100 ms at 16 kHz
      const clipWaveforms: Float32Array[] = [];
      const clipOffsets: number[] = [];
      const transcribedClips:MusicClip[]=[];
      const skippedClips:string[]=[];
      let combinedLength = 0;
      for (let index=0; index<ordered.length; index++) {
        const clip=ordered[index];
        setJobDetail(`Preparando audio ${index+1}/${ordered.length}: ${clip.name}`);
        const audioBlob=await (await fetch(clip.src)).blob();
        const sourceFile=new File([audioBlob],clip.name,{type:audioBlob.type || 'audio/mpeg'});
        const waveform=await resampleTo16Khz({file:sourceFile,onProgress:(p)=>setJobProgress(.02+((index+p*.16)/ordered.length)*.12)});
        const sourceInterval=audioSourceInterval(clip);
        const clipWaveform=waveform.slice(Math.round(sourceInterval.start*16000),Math.round(sourceInterval.end*16000));
        if (!clipWaveform.length) {skippedClips.push(clip.name);continue;}
        transcribedClips.push(clip);
        clipOffsets.push(combinedLength);
        clipWaveforms.push(clipWaveform);
        combinedLength += clipWaveform.length + separatorSamples;
      }
      if (!clipWaveforms.length) throw new Error('Los audios no contienen una pista legible para transcribir.');
      const combinedWaveform = new Float32Array(combinedLength);
      let writeOffset = 0;
      for (const clipWaveform of clipWaveforms) {
        combinedWaveform.set(clipWaveform,writeOffset);
        writeOffset += clipWaveform.length + separatorSamples;
      }
      setJobDetail(`Transcribiendo ${clipWaveforms.length}/${ordered.length} audios con Whisper base...`);
      const output=await transcribe({channelWaveform:combinedWaveform,model:AUDIO_WHISPER_MODEL,language:'es',threads,logLevel:'warn',onProgress:(p)=>setJobProgress(.18+p*.78)});
      const rawCaptions = toCaptions({whisperWebOutput:output}).captions;
      let sourceCaptions=cleanWhisperCaptions(rawCaptions,combinedWaveform,{minConfidence:.10,minEnergy:.00012});
      if (!sourceCaptions.length) sourceCaptions=cleanWhisperCaptions(rawCaptions,combinedWaveform,{minConfidence:.04,minEnergy:0});
      for (const caption of sourceCaptions) {
        const captionStartSamples=Math.max(0,Math.round(caption.startMs*16));
        let clipIndex=-1;
        for (let index=0; index<clipWaveforms.length; index++) {
          const start=clipOffsets[index];
          if (captionStartSamples >= start && captionStartSamples < start+clipWaveforms[index].length) { clipIndex=index; break; }
        }
        if (clipIndex < 0) continue; // word landed in a separator
        const clip=transcribedClips[clipIndex];
        const sourceLocalStartMs=Math.max(0,caption.startMs-(clipOffsets[clipIndex]/16));
        const sourceLocalEndMs=Math.min(clipWaveforms[clipIndex].length/16,caption.endMs-(clipOffsets[clipIndex]/16));
        const fitRatio=1/audioRate(clip);
        const localStartMs=sourceLocalStartMs*fitRatio;
        const localEndMs=sourceLocalEndMs*fitRatio;
        if (localEndMs<=localStartMs) continue;
        const offset=clip.start*1000;
        synced.push({...caption,startMs:Math.round(localStartMs+offset),endMs:Math.round(localEndMs+offset),timestampMs:Math.round(localStartMs+offset)});
      }
      if (!synced.length) throw new Error('No se detectó voz en los fragmentos de audio colocados en la línea de tiempo. Prueba con audio hablado más limpio; los subtítulos anteriores siguen intactos.');
      const syncedGroups = groupCaptions(synced);
      const textForLayer = (start:number, layerDuration:number) =>
        syncedGroups.filter((group) => group.startMs / 1000 < start + layerDuration && group.endMs / 1000 > start).map(group=>group.text).join(' ');
      checkpoint();
      setCaptions(synced.sort((a,b)=>a.startMs-b.startMs));
      setCaptionGroupStyles([]);setSelectedCaptionGroupStartMs(null);
      // Rebind every editable visual layer to the new transcript. This avoids
      // stale words in B-roll cards and motion graphics when the audio has a
      // different phrase/timing than the original video.
      // Regenerate transcript-derived automatic layers; otherwise obsolete
      // B-roll survives when the new transcript produces no B-roll events.
      setCustomBrolls((items) => items.filter(item=>!item.autoGenerated || item.textSource==='manual').map((item) => {
        if(item.textSource==='manual') return item;
        const text = textForLayer(item.start,item.duration);
        return {...item,textSource:'transcript' as const,brollText:text,brollHeadline:text.toUpperCase()};
      }));
      setMotionGraphicsItems((items) => items.map((item) => {
        if(item.textSource==='manual') return item;
        const text = textForLayer(item.start,item.duration);
        return {...item,textSource:'transcript' as const,title:text,subtitle:text,highlightWord:text.split(/\s+/).filter(Boolean).at(-1)};
      }));
      autoBrollMaterializedKeyRef.current = '';
      setAudioSettingsNotice(`Subtítulos sincronizados con ${transcribedClips.length}/${ordered.length} audios y sus velocidades actuales. Revisa el texto reconocido antes de exportar.`);
      setJobProgress(1);setJobTitle('Subtítulos sincronizados');setJobDetail(`${synced.length} palabras generadas desde ${transcribedClips.length}/${ordered.length} audio(s).${skippedClips.length ? ` Sin audio legible: ${skippedClips.join(', ')}.` : ''} B-roll y motion graphics actualizados.`);setJobState('done');
    } catch(error) {setJobState('error');setJobTitle('No se pudieron sincronizar los subtítulos');setJobDetail(error instanceof Error ? error.message : 'Error de transcripción local.');}
  };

  const readVideoDuration = (file: File) => new Promise<number>((resolve, reject) => {
    void (async () => {
      try {
        const { ALL_FORMATS, BlobSource, Input } = await import('mediabunny');
        const input = new Input({formats:ALL_FORMATS,source:new BlobSource(file)});
        const value = await input.computeDuration();
        if (Number.isFinite(value) && value > 0) { resolve(value); return; }
      } catch { /* El lector nativo cubre formatos que Mediabunny no reconozca. */ }

      const objectUrl = URL.createObjectURL(file);
      const video = document.createElement('video');
      const clean = () => { URL.revokeObjectURL(objectUrl); video.removeAttribute('src'); };
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const value = video.duration;
        clean();
        if (Number.isFinite(value) && value > 0) resolve(value);
        else reject(new Error('No pude calcular la duración real de este WebM.'));
      };
      video.onerror = () => { clean(); reject(new Error('No pude leer este formato de video. Prueba con MP4 o WebM.')); };
      video.src = objectUrl;
    })();
  });

  const readVideoDimensions = (file: File) => new Promise<{width:number;height:number}>((resolve, reject) => {
    void (async () => {
      try {
        const { ALL_FORMATS, BlobSource, Input } = await import('mediabunny');
        const input = new Input({formats:ALL_FORMATS,source:new BlobSource(file)});
        const track = await input.getPrimaryVideoTrack();
        if (track && track.displayWidth > 0 && track.displayHeight > 0) {
          resolve({width:track.displayWidth,height:track.displayHeight});
          return;
        }
      } catch { /* El navegador puede leer metadatos de formatos no soportados por Mediabunny. */ }
      const objectUrl = URL.createObjectURL(file);
      const video = document.createElement('video');
      const clean = () => { URL.revokeObjectURL(objectUrl); video.removeAttribute('src'); };
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const {videoWidth:width,videoHeight:height} = video;
        clean();
        if (width > 0 && height > 0) resolve({width,height});
        else reject(new Error('No pude identificar la proporción del video.'));
      };
      video.onerror = () => { clean(); reject(new Error('No pude leer las dimensiones del video.')); };
      video.src = objectUrl;
    })();
  });

  const beginVideo = async (file: File) => {
    const allowed = file.type.startsWith('video/') || /\.(mp4|mov|webm)$/i.test(file.name);
    if (!allowed || file.size > 1024 * 1024 * 1024) {
      setStage('processing'); setJobState('error'); setJobTitle('Archivo no compatible'); setJobDetail(allowed ? 'El archivo supera el límite de 1 GB.' : 'Selecciona un video MP4, MOV o WebM.'); return;
    }
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    const nextUrl = URL.createObjectURL(file);
    videoUrlRef.current = nextUrl;
    autoBrollMaterializedKeyRef.current = '';
    activeProjectKeyRef.current=getProjectStorageKey(file); undoStackRef.current=[]; redoStackRef.current=[];
    setHistoryState({undo:0,redo:0});setMusicClips([]);setSelectedMusicId(null);draftSaveRevisionRef.current++;
    setStage('processing'); setVideoUrl(nextUrl); setVideoFile(file); setFileName(file.name.replace(/\.[^/.]+$/, ''));
    setCurrentTime(0); setDuration(0); setCaptions([]); setHookLeadText(''); setHookMainText(''); setBrollText(''); setCaptionPosition(DEFAULT_CAPTION_POSITION); setHookPosition(DEFAULT_HOOK_POSITION); setSelectedCanvasLayer('captions'); setCaptionGroupStyles([]); setSelectedCaptionGroupStartMs(null); setCustomBrolls([]); setMotionGraphicsItems([]); setZentryItems([]); setSelectedBrollId(null); setSelectedMgId(null); setSelectedZentryId(null); setSilences([]); setRemoveSilences(false); setJobProgress(0);
    setJobState('working'); setJobTitle('Analizando tu video'); setJobDetail('Comprobando el formato antes de crear los subtítulos.');
    try {
      const [measuredDuration, dimensions] = await Promise.all([readVideoDuration(file), readVideoDimensions(file)]);
      setSourceSize(dimensions);
      setOutputFormat('original');
      const initialSegment={id:`clip-${file.size}-${file.lastModified}`,start:0,end:measuredDuration,timelineStart:0,timelineEnd:measuredDuration,src:nextUrl,title:file.name.replace(/\.[^/.]+$/, '')};
      setMainDuration(measuredDuration);
      setDuration(measuredDuration);
      setSecondaryVideoUrl(null);
      setSecondaryVideoFile(null);
      setSecondaryDuration(0);
      setEditSegments([initialSegment]); setSelectedSegmentId(initialSegment.id);
      if (measuredDuration > 180) throw new Error('El video supera 3 minutos. Recórtalo a 180 segundos o menos.');
      await processSubtitles(file,true,measuredDuration);
    } catch (error) {
      setJobState('error'); setJobTitle('No se pudo preparar el video'); setJobDetail(error instanceof Error ? error.message : 'Ocurrió un error inesperado.');
    }
  };

  const uploadSecondaryVideo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    void addSequentialClip(file);
  };

  const addSequentialClip = async (file: File) => {
    if (new Set(editSegments.map((segment) => segment.src)).size >= 12) {
      setJobState('error');
      setJobTitle('Límite de clips alcanzado');
      setJobDetail('Puedes unir hasta 12 clips completos.');
      return;
    }

    const allowed = file.type.startsWith('video/') || /\.(mp4|mov|webm)$/i.test(file.name);
    if (!allowed || file.size > 1024 * 1024 * 1024) {
      setJobState('error');
      setJobTitle('Archivo no compatible');
      setJobDetail(allowed ? 'El archivo supera el límite de 1 GB.' : 'Selecciona un video MP4, MOV o WebM.');
      return;
    }

    checkpoint();

    try {
      const measured = await readVideoDuration(file);
      const clipDuration = measured;
      const nextSecUrl = URL.createObjectURL(file);
      const clipIndex = editSegments.length + 1;

      // Calcular inicio en la línea de tiempo acumulada
      const currentTimelineEnd = editSegments.reduce((sum, seg) => sum + (seg.end - seg.start), 0);
      const totalDur = currentTimelineEnd + clipDuration;

      const newSegment: EditSegment = {
        id: `clip-seq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        src: nextSecUrl,
        title: file.name.replace(/\.[^/.]+$/, ''),
        start: 0,
        end: clipDuration,
        timelineStart: currentTimelineEnd,
        timelineEnd: totalDur,
      };

      setEditSegments((prev) => {
        const updated = [...prev, newSegment];
        return recomputeTimeline(updated);
      });
      setDuration(totalDur);
      setSelectedSegmentId(newSegment.id);

      setBgTask({ active: true, label: `Transcribiendo Clip ${clipIndex} en segundo plano...`, progress: 0.1 });

      void (async () => {
        try {
          const { canUseWhisperWeb, resampleTo16Khz, transcribe, toCaptions } = await import('@remotion/whisper-web');
          const support = await canUseWhisperWeb(WHISPER_MODEL);
          if (!support.supported) {
            setBgTask({ active: false, label: `Clip ${clipIndex} añadido (Whisper no disponible)`, progress: 1, done: true });
            setTimeout(() => setBgTask(null), 3500);
            return;
          }

          setBgTask({ active: true, label: `Extrayendo audio Clip ${clipIndex}...`, progress: 0.25 });
          await ensureWhisperModel(WHISPER_MODEL,()=>{});
          const waveform = await withProcessingTimeout(resampleTo16Khz({
            file,
            onProgress: (p) => setBgTask({ active: true, label: `Extrayendo audio Clip ${clipIndex}...`, progress: 0.2 + p * 0.25 }),
          }),120000,'No se pudo extraer el audio del clip en 2 minutos. Revisa su formato y vuelve a intentarlo.');

          const isMobileDevice = typeof navigator !== 'undefined' && (
            /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent) ||
            (typeof window !== 'undefined' && window.innerWidth < 900)
          );
          const threads = isMobileDevice ? 1 : Math.min(4, typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 4) : 4);
          const whisperWebOutput = await transcribe({
            channelWaveform: waveform,
            model: WHISPER_MODEL,
            language: 'es',
            onProgress: (p) => setBgTask({ active: true, label: `Transcribiendo Clip ${clipIndex}...`, progress: 0.5 + p * 0.45 }),
            threads,
            logLevel: 'warn',
          });

          const result = toCaptions({ whisperWebOutput });
          const reliableCaptions = cleanWhisperCaptions(result.captions, waveform);

          if (reliableCaptions.length > 0) {
            const offsetMs = Math.round(currentTimelineEnd * 1000);
            const offsetCaptions: Caption[] = reliableCaptions.map((cap) => ({
              ...cap,
              startMs: cap.startMs + offsetMs,
              endMs: cap.endMs + offsetMs,
              timestampMs: cap.timestampMs !== null ? cap.timestampMs + offsetMs : null,
            }));

            setCaptions((prev) => [...prev, ...offsetCaptions].sort((a, b) => a.startMs - b.startMs));
            setBgTask({
              active: false,
              label: `✓ Clip ${clipIndex}: ${reliableCaptions.length} palabras sincronizadas`,
              progress: 1,
              done: true,
            });
          } else {
            setBgTask({
              active: false,
              label: `Clip ${clipIndex} añadido (sin voz detectada)`,
              progress: 1,
              done: true,
            });
          }
        } catch (err) {
          console.warn(`Error en transcripción en segundo plano del clip ${clipIndex}:`, err);
          setBgTask({
            active: false,
            label: `Clip ${clipIndex} añadido con éxito`,
            progress: 1,
            done: true,
          });
        } finally {
          setTimeout(() => setBgTask(null), 4000);
        }
      })();
    } catch (error) {
      setJobState('error');
      setJobTitle('No se pudo cargar el clip');
      setJobDetail(error instanceof Error ? error.message : 'Error inesperado al leer el archivo.');
    }
  };

  const addSecondaryClip = addSequentialClip;

  const removeSecondaryClip = () => {
    if (editSegments.length > 1) {
      const last = editSegments[editSegments.length - 1];
      deleteSegment(last.id);
    }
  };

  const resetProject = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    editSegments.forEach((seg) => {
      if (seg.src && seg.src !== videoUrl) {
        URL.revokeObjectURL(seg.src);
      }
    });
    if (secondaryVideoUrl) URL.revokeObjectURL(secondaryVideoUrl);
    if (brollUrl) URL.revokeObjectURL(brollUrl);
    setStage('upload'); setVideoUrl(null); setVideoFile(null); setSourceSize({width:1080,height:1920}); setOutputFormat('original');
    setSecondaryVideoUrl(null); setSecondaryVideoFile(null); setSecondaryDuration(0); setMainDuration(0); setBgTask(null);
    setBrollUrl(null); setOverlaySrc(null); setSfxSrc(null); setManualSfxClips([]); setFileName('Proyecto sin título');
    setMusicClips([]); setSelectedMusicId(null);
    undoStackRef.current=[];redoStackRef.current=[];setHistoryState({undo:0,redo:0});draftSaveRevisionRef.current++;
    activeProjectKeyRef.current=null; setCaptions([]); setEditSegments([]); setSelectedSegmentId(null); setCurrentTime(0); setDuration(0); setPlaying(false); setJobState('idle'); setJobProgress(0);
  };

  const exportVideo = async () => {
    if (!videoUrl || !videoFile) { setJobState('error'); setJobTitle('Falta el video'); setJobDetail('Sube un video antes de pulsar Viralizar.'); return; }
    
    // Validar créditos: cada exportación requiere al menos 1 crédito disponible
    if (credits < 1) {
      setJobState('error');
      setJobTitle('Sin créditos disponibles');
      setJobDetail('Has agotado tus créditos disponibles (0 créditos). Recarga créditos para exportar tu video en 1080p.');
      return;
    }

    setJobState('working'); setJobTitle(`Preparando exportación ${outputSize.width}×${outputSize.height} · ${outputFps} FPS`); setJobDetail('El MP4 se renderiza en tu navegador; el video no se sube.'); setJobProgress(0.01);
    try {
      const { canRenderMediaOnWeb, renderMediaOnWeb } = await import('@remotion/web-renderer');
      const support = await canRenderMediaOnWeb({ container:'mp4', width:outputSize.width, height:outputSize.height, videoCodec:'h264', audioCodec:'aac' });
      if (!support.canRender) {
        const errors = support.issues
          .filter((issue) => issue.severity === 'error')
          .map((issue) => issue.message)
          .join(' ');
        throw new Error(errors || 'Este navegador no permite exportar MP4 en este dispositivo.');
      }
      // PM-01: Remap all manual layers to the compressed output timeline (keepSegments)
      const outputCustomBrolls = (customBrolls || []).map((b) => {
        const remapped = remapIntervalToOutput(b.start, b.duration, keepSegments);
        if (!remapped) return null;
        return { ...b, start: remapped.start, duration: remapped.duration };
      }).filter((b): b is CustomBrollItem => b !== null);

      const outputMotionGraphicsItems = (motionGraphicsItems || []).map((mg) => {
        const remapped = remapIntervalToOutput(mg.start, mg.duration, keepSegments);
        if (!remapped) return null;
        return { ...mg, start: remapped.start, duration: remapped.duration };
      }).filter((mg): mg is MotionGraphicItem => mg !== null);

      const outputZentryItems = (zentryItems || []).map((z) => {
        const remapped = remapIntervalToOutput(z.start, z.duration, keepSegments);
        if (!remapped) return null;
        return { ...z, start: remapped.start, duration: remapped.duration };
      }).filter((z): z is ZentryTemplateItem => z !== null);

      const outputCaptionGroupStyles = captionGroupStyles.map((style) => {
        const remapped = remapIntervalToOutput(style.startMs / 1000, (style.endMs - style.startMs) / 1000, keepSegments);
        if (!remapped) return null;
        return {
          ...style,
          startMs: Math.round(remapped.start * 1000),
          endMs: Math.round((remapped.start + remapped.duration) * 1000),
        };
      }).filter((style): style is CaptionGroupStyleOverride => style !== null);
      const outputMusicTracks = musicClips.flatMap((clip) => remapAudioToOutput(clip,keepSegments)).map(clip => ({id:clip.id,src:clip.src,start:clip.start,duration:clip.duration,sourceStart:clip.sourceStart,volume:clip.volume,playbackRate:audioRate(clip)}));
      const outputManualSfxClips = manualSfxClips.map((clip) => {
        const remapped = remapTimeToOutput(sfxTimeOverrides[clip.id] ?? clip.start,keepSegments);
        return remapped === null ? null : {...clip,start:remapped};
      }).filter((clip):clip is ManualSfxClip => clip !== null);

      // PM-06: Respect contextualSfxDisabled; remap existing events or generate on output timeline
      const outputContextualSfx = contextualSfxDisabled
        ? []
        : contextualSfxEvents.length > 0
          ? contextualSfxEvents.map((evt) => {
              const remappedTime = remapTimeToOutput(evt.timeSec, keepSegments);
              if (remappedTime === null) return null;
              return { ...evt, timeSec: remappedTime };
            }).filter((evt): evt is ContextualSfxEvent => evt !== null)
          : generateContextualSfxEvents({
              captions: outputCaptions,
              customBrolls: outputCustomBrolls,
              motionGraphicsItems: outputMotionGraphicsItems,
              hookSfxEnabled,
            });
      const outputSfxTimeOverrides = Object.fromEntries(Object.entries(sfxTimeOverrides).flatMap(([id,time]) => {
        const remapped=remapTimeToOutput(time,keepSegments);
        return remapped === null ? [] : [[id,remapped]];
      }));

      const inputProps: ZentryVideoProps = {
        src: videoUrl,
        captions: outputCaptions,
        styleId: activeStyle,
        accentColor,
        fontSize,
        captionFontFamily,
        captionFontWeight,
        captionItalic,
        captionDualFont,
        captionTopFontFamily,
        captionBottomFontFamily,
        captionAlign,
        shadow,
        popAnimation,
        captionPositionX: captionPosition.x,
        captionPositionY: captionPosition.y,
        captionGroupStyles: outputCaptionGroupStyles,
        keepSegments,
        hookLeadText: effectiveHookLead,
        hookMainText: effectiveHookMain,
        hookPositionX: hookPosition.x,
        hookPositionY: hookPosition.y,
        hookLeadFontFamily,
        hookMainFontFamily,
        hookLeadFontSize,
        hookMainFontSize,
        hookLeadDuration,
        hookMainDuration,
        hookStyle,
        zoomPunch,
        motionGraphics,
        overlaySrc,
        brollEvents: outputBrollEvents,
        brollFontFamily: captionFontFamily,
        brollTransition,
        brollTypingSoundSrc: brollTypingSound ? '/assets/sfx/keyboard-mechanical.wav' : null,
        volume: muted ? 0 : volume,
        sfxSrc,
        manualSfxClips:outputManualSfxClips,
        musicTracks: outputMusicTracks,
        showWatermark,
        motionGraphicsItems: outputMotionGraphicsItems,
        customBrolls: outputCustomBrolls,
        hookSfxSrc: hookSfxEnabled ? (hookSfxSrc || '/assets/sfx/vine-boom.wav') : null,
        contextualSfxEvents: outputContextualSfx,
        zentryItems: outputZentryItems,
        sfxVolumeMultiplier,
        sfxTimeOverrides: outputSfxTimeOverrides,
      };
      const { getBlob } = await renderMediaOnWeb({
        composition:{ id:'zentry-studio-vip', component:ZentryComposition, durationInFrames:Math.max(1,Math.ceil(outputDuration*outputFps)), fps:outputFps, width:outputSize.width, height:outputSize.height, defaultProps:inputProps },
        inputProps,
        container:'mp4', videoCodec:'h264', audioCodec:'aac', videoBitrate:'high', audioBitrate:'high', hardwareAcceleration:'prefer-hardware', pageResponsiveness:'high',
        licenseKey: 'free-license',
        onProgress:({progress}) => setJobProgress(progress),
      });
      const blob = await getBlob();
      const downloadUrl = URL.createObjectURL(blob);
      setExportDownloadUrl((previous) => { if (previous) URL.revokeObjectURL(previous); return downloadUrl; });

      // Descontar exactamente 1 crédito en el estado local y en Supabase
      const nextCredits = Math.max(0, credits - 1);
      const nextDaily = (userProfile?.daily_exports_count ?? 0) + 1;
      setCredits(nextCredits);

      if (sessionUser) {
        try {
          const { data: rpcData, error: rpcError } = await supabase.rpc('consume_export_credit', { user_id: sessionUser.id });
          if (!rpcError && rpcData && typeof rpcData.credits === 'number') {
            setCredits(rpcData.credits);
            await fetchProfile(sessionUser.id, sessionUser.email);
          } else {
            // Actualización directa en la tabla profiles
            await supabase.from('profiles').upsert({
              id: sessionUser.id,
              email: sessionUser.email || '',
              credits: nextCredits,
              daily_exports_count: nextDaily,
              last_export_date: new Date().toISOString().split('T')[0],
              updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

            setUserProfile((prev) => prev ? {
              ...prev,
              credits: nextCredits,
              daily_exports_count: nextDaily,
            } : null);
          }
        } catch (dbErr) {
          console.warn('Error al actualizar créditos en Supabase:', dbErr);
        }
      }

      setJobState('done'); setJobProgress(1); setJobTitle('Video viralizado con éxito');
      setJobDetail(
        isVipUser
          ? `Video MP4 listo SIN marca de agua (Plan VIP). Se consumió 1 crédito (te quedan ${nextCredits} ${nextCredits === 1 ? 'crédito' : 'créditos'}). Puedes verlo y descargarlo aquí.`
          : `Video MP4 listo con marca de agua (Plan Free). Se consumió 1 crédito (te quedan ${nextCredits} ${nextCredits === 1 ? 'crédito' : 'créditos'}). Puedes verlo y descargarlo aquí.`
      );
    } catch (error) {
      setJobState('error'); setJobTitle('No se pudo exportar'); setJobDetail(error instanceof Error ? error.message : 'El navegador no pudo completar el MP4.');
    }
  };

  const togglePlayback = () => {
    let targetIndex = editSegments.findIndex((seg) => {
      const sStart = seg.timelineStart !== undefined ? seg.timelineStart : seg.start;
      const sEnd = seg.timelineEnd !== undefined ? seg.timelineEnd : seg.end;
      return currentTime >= sStart && currentTime < sEnd;
    });
    if (targetIndex < 0 && editSegments.length > 0) {
      targetIndex = 0;
      if (currentTime >= duration) seekTo(0);
    }

    const activeSeg = editSegments[targetIndex];
    if (!activeSeg) return;
    const el = segmentVideoRefs.current[activeSeg.id];
    if (!el) return;

    if (el.paused) {
      editSegments.forEach((seg, idx) => {
        if (idx !== targetIndex) {
          const other = segmentVideoRefs.current[seg.id];
          if (other) safePauseVideo(other);
        }
      });
      safePlayVideo(el);
      setPlaying(true);
    } else {
      safePauseVideo(el);
      setPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const safe = Number.isFinite(seconds) ? seconds : 0;
    return `${Math.floor(safe / 60)}:${Math.floor(safe % 60).toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (milliseconds: number) => formatTime(milliseconds/1000);

  if (view === 'landing') {
    return (
      <main className="landing-view">
        <Navbar 
          currentView="landing" 
          onSwitchView={(v) => setView(v)} 
          userProfile={userProfile}
          onRefreshProfile={() => {
            if (sessionUser?.id) fetchProfile(sessionUser.id);
          }}
        />
        <LandingPage 
          onStartEditing={() => setView('editor')} 
          isLoggedIn={Boolean(sessionUser)} 
        />
      </main>
    );
  }

  if (stage === 'upload') return (
    <main className="upload-shell">
      <Navbar 
        currentView="editor" 
        onSwitchView={(v) => setView(v)} 
        userProfile={userProfile}
        onRefreshProfile={() => {
          if (sessionUser?.id) fetchProfile(sessionUser.id);
        }}
      />
      <section className="upload-hero">
        <div className="upload-copy">
          <span className="upload-kicker"><b>NUEVO</b> Editor automático para video vertical</span>
          <h1>De tu grabación cruda<br/><em>a video listo para publicar.</em></h1>
          <p>Sube tu video y Zentry Studio crea la transcripción sincronizada. Después entrarás al editor para elegir el estilo, corregir palabras y exportar.</p>
          <div className="upload-steps"><span><b>01</b>Sube tu video</span><span><b>02</b>Generamos subtítulos</span><span><b>03</b>Elige tu estilo</span></div>
        </div>
        <div className="upload-action-column">
          <button className="video-dropzone" onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={dropVideo} type="button">
            <span className="drop-icon">↑</span><small>VIDEO PRINCIPAL</small><h2>Arrastra tu video</h2><p>Vertical, horizontal o cuadrado</p><strong>Seleccionar video</strong>
          </button>
          <div className="upload-limits"><span><b>180s</b>máximo</span><span><b>9:16</b>recomendado</span><span><b>1 GB</b>máximo</span><span><b>MP4</b>recomendado</span></div>
          <p className="privacy-note">◇ Procesamiento privado en este dispositivo · Tu video no se sube a servidores</p>
        </div>
      </section>
      <input ref={inputRef} className="file-input" type="file" accept="video/mp4,video/quicktime,video/webm" onChange={uploadVideo} />
    </main>
  );

  if (stage === 'processing') return (
    <main className="processing-shell">
      <header className="processing-header"><div className="brand-lockup"><div className="brand-mark">Z</div><div><div className="brand-name">ZENTRY <span>STUDIO</span></div><div className="brand-tier">VIP SUITE ACTIVA</div></div></div><button onClick={resetProject} type="button">Cancelar</button></header>
      <section className="processing-content">
        <div className="processing-video">{videoUrl && <video src={videoUrl} muted playsInline />}<div className="scan-line"/><span>{sourceSize.width > sourceSize.height ? 'Horizontal' : sourceSize.width === sourceSize.height ? 'Cuadrado' : 'Vertical'}</span></div>
        <div className={`processing-card ${jobState}`}>
          <div className="processing-orbit"><i/><b>{jobState === 'error' ? '!' : 'Z'}</b></div>
          <span className="eyebrow">ZENTRY STUDIO LOCAL ENGINE</span><h1>{jobTitle || 'Preparando tu proyecto'}</h1><p>{jobDetail}</p>
          <div className="processing-progress"><i style={{width:`${Math.max(jobState === 'error' ? 100 : 4,jobProgress*100)}%`}}/></div><strong>{jobState === 'error' ? 'Revisa el archivo y vuelve a intentarlo' : `${Math.round(jobProgress*100)}%`}</strong>
          <div className="processing-features"><span className={jobProgress > .12 ? 'done' : ''}>Audio</span><span className={jobProgress > .58 ? 'done' : ''}>Transcripción</span><span className={jobProgress > .98 ? 'done' : ''}>Editor</span></div>
          {jobState === 'error' && <div className="processing-actions"><button onClick={() => videoFile && void processSubtitles(videoFile,true)} disabled={!videoFile} type="button">Reintentar transcripción</button><button onClick={() => { setJobState('idle'); setStage('editor'); }} type="button">Entrar sin subtítulos</button><button onClick={resetProject} type="button">Elegir otro video</button></div>}
        </div>
      </section>
      <input ref={inputRef} className="file-input" type="file" accept="video/mp4,video/quicktime,video/webm" onChange={uploadVideo} />
    </main>
  );

  const brollLanes = assignTimelineLanes(customBrolls,duration);
  const motionLanes = assignTimelineLanes([...motionGraphicsItems,...zentryItems],duration);
  const brollTrackHeight = customBrolls.length ? Math.max(38,brollLanes.count * 30 + 6) : 0;
  const motionTrackHeight = motionGraphicsItems.length + zentryItems.length ? Math.max(38,motionLanes.count * 30 + 6) : 0;
  const captionTrackHeight = captionGroups.length ? 38 : 0;
  const musicTrackHeight = musicClips.length ? 44 : 0;
  const timelineContentHeight = 24 + captionTrackHeight + brollTrackHeight + motionTrackHeight + 48 + 36 + musicTrackHeight + 12;

  return (
    <main className="studio-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <button className="back-editor" onClick={() => { resetProject(); setView('landing'); }} type="button" title="Volver al inicio">←</button>
          <div className="brand-mark" onClick={() => setView('landing')} style={{ cursor: 'pointer' }}>Z</div>
          <div onClick={() => setView('landing')} style={{ cursor: 'pointer' }}><div className="brand-name">ZENTRY <span>STUDIO</span></div><div className="brand-tier">VIP SUITE ACTIVA</div></div>
        </div>
        <div className="project-title"><span className="saved-dot" /><input aria-label="Nombre del proyecto" value={fileName} onFocus={checkpoint} onChange={(event) => setFileName(event.target.value)} /><small>Autoguardado · {savedAt}</small></div>
        <div className="top-actions">
          {isAdminUser(sessionUser, userProfile) && (
            <a 
              href="/admin" 
              className="ghost-button admin-topbar-link" 
              title="Abrir Panel de Administrador"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/admin';
              }}
            >
              ⚙ Admin
            </a>
          )}
          <button className="credit-pill" type="button" title="1 exportación consume 1 crédito">
            <b>⚡ {credits}</b>
            <span>{credits === 1 ? 'crédito' : 'créditos'}</span>
          </button>
          <button className="ghost-button" onClick={() => setView('landing')} type="button">Ver Inicio</button>
          <button className="viral-button" onClick={exportVideo} disabled={jobState === 'working'} type="button"><span>✦</span> VIRALIZAR</button>
          <button className="avatar" onClick={() => setView('landing')} type="button" aria-label="Perfil">
            {sessionUser?.email ? sessionUser.email.slice(0, 2).toUpperCase() : 'ZS'}
          </button>
        </div>
      </header>

      <section className={`workspace tool-${activeTool}${inspectorMode === 'video' ? ' inspector-video' : ''}`}>
        <nav className="tool-rail" aria-label="Herramientas del editor">
          {tools.map((tool) => (
            <button className={activeTool === tool.id ? 'rail-item active' : 'rail-item'} key={tool.id} onClick={() => setActiveTool(tool.id)} type="button">
              <span>{tool.icon}</span>{tool.label}
            </button>
          ))}
        </nav>

        <aside className="left-panel">
          <div className="panel-heading"><div><span className="eyebrow">HERRAMIENTAS VIP</span><h1>{tools.find((tool) => tool.id === activeTool)?.label}</h1></div><button type="button" aria-label="Cerrar panel">×</button></div>
          {activeTool === 'timeline' && (
            <div className="timeline-info-panel" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'rgba(0, 245, 200, 0.08)', border: '1px solid rgba(0, 245, 200, 0.3)', borderRadius: 10, padding: 12 }}>
                <b style={{ color: '#00f5c8', fontSize: 13, display: 'block', marginBottom: 4 }}>⏱️ Modo Línea de Tiempo</b>
                <span style={{ fontSize: 11, color: '#aaa', lineHeight: 1.4, display: 'block' }}>
                  Edición táctil y multipista. Corta clips con precisión, recorta pistas, añade transiciones y sincroniza elementos.
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button type="button" onClick={cutAtPlayhead} style={{ padding: '10px 8px', borderRadius: 8, background: '#1c1c1c', border: '1px solid #333', color: '#fff', fontSize: 12, fontWeight: 750, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                  ✂ Cortar Clip
                </button>
                <button type="button" onClick={handleDeleteSelectedObject} style={{ padding: '10px 8px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', fontSize: 12, fontWeight: 750, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                  🗑 Eliminar
                </button>
                <button type="button" onClick={() => void detectSilences()} style={{ padding: '10px 8px', borderRadius: 8, background: '#1c1c1c', border: '1px solid #333', color: '#ffd166', fontSize: 12, fontWeight: 750, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                  ▱ Quitar silencios
                </button>
                <button type="button" onClick={() => secondaryInputRef.current?.click()} style={{ padding: '10px 8px', borderRadius: 8, background: 'rgba(0, 245, 200, 0.15)', border: '1px solid rgba(0, 245, 200, 0.4)', color: '#00f5c8', fontSize: 12, fontWeight: 750, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                  ＋ Añadir clip
                </button>
              </div>
              <div style={{ background: '#111', borderRadius: 8, padding: 12, border: '1px solid #222' }}>
                <span style={{ fontSize: 10, color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Controles y Gestos Táctiles</span>
                <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 11, color: '#bbb', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <li><b>Arrastrar cabezal:</b> Desliza la aguja roja para posicionar el tiempo.</li>
                  <li><b>Tocar clip:</b> Selecciona clips de video, B-roll, motion o música.</li>
                  <li><b>Pinch / Zoom:</b> Usa los botones ＋ y − para ampliar la escala.</li>
                </ul>
              </div>
            </div>
          )}
          {activeTool === 'subtitles' && <>
            <div className="transcript-tools">
              <button className="mini-action" onClick={() => void processSubtitles()} type="button">✦ Procesar video</button>
              <button
                className="mini-action"
                type="button"
                style={{ background: 'linear-gradient(135deg, #2a1111, #170a0a)', color: '#ff5f5f', borderColor: '#ff2a2a', fontWeight: 850 }}
                onClick={autoGenerateAiMotionGraphics}
                title="Crea automáticamente Motion Graphics 3D a partir de tus frases habladas"
              >
                ⚡ Auto Motion 3D
              </button>
            </div>
            <div className="transcript-list" style={{ maxHeight: 360, overflowY: 'auto' }}>
              {!captionGroups.length && (
                <div className="transcript-empty">
                  <b>{videoFile ? 'Sin subtítulos todavía' : 'Sube un video para comenzar'}</b>
                  <span>{videoFile ? 'Pulsa “Procesar video” para crear la transcripción real.' : 'Los subtítulos aparecerán aquí después de transcribirlo.'}</span>
                </div>
              )}
              {captionGroups.map((line, index) => (
                <div
                  className={currentTime * 1000 >= line.startMs && currentTime * 1000 < line.endMs ? 'transcript-line active' : 'transcript-line'}
                  key={`${line.startMs}-${index}`}
                  onClick={() => { setSelectedCaptionGroupStartMs(line.startMs); seekTo(line.startMs / 1000); }}
                >
                  <div className="transcript-line-header">
                    <span className="line-index-badge">#{String(index + 1).padStart(2, '0')}</span>
                    <span className="line-time-range">{formatTimestamp(line.startMs)} — {formatTimestamp(line.endMs)}</span>
                    <span style={{ fontSize: 9, opacity: 0.6 }}>▶</span>
                  </div>

                  <textarea
                    aria-label={`Subtítulo ${index + 1}`}
                    value={line.text}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={() => { setSelectedCaptionGroupStartMs(line.startMs); if (videoRef.current) { videoRef.current.currentTime = line.startMs / 1000; } }}
                    onChange={(event) => updateCaptionGroup(index, event.target.value)}
                    placeholder="Escribe el texto de este subtítulo..."
                  />

                  <div className="line-ai-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="line-action-btn motion"
                      title="Insertar Motion Graphic 3D con estas palabras"
                      onClick={() => {
                        convertPhraseToMotion3D(line.text, line.startMs / 1000, Math.max(2, (line.endMs - line.startMs) / 1000));
                      }}
                    >
                      ⚡ + Motion 3D
                    </button>
                    <button
                      type="button"
                      className="line-action-btn broll"
                      title="Buscar B-Roll automático de stock para esta frase"
                      onClick={() => {
                        void autoSuggestBrollForPhrase(line.text, line.startMs / 1000, Math.max(2.5, (line.endMs - line.startMs) / 1000));
                      }}
                    >
                      🎬 + B-Roll IA
                    </button>
                    <button
                      type="button"
                      className="line-action-btn tpl-btn"
                      title="Insertar B-Roll Minimal Blanco con esta frase"
                      onClick={() => {
                        insertBrollTemplateForPhrase('white-minimal', line.text, line.startMs / 1000, Math.max(2, (line.endMs - line.startMs) / 1000));
                      }}
                    >
                      ⚪ Blanco
                    </button>
                    <button
                      type="button"
                      className="line-action-btn tpl-btn"
                      style={{ color: '#ff7272' }}
                      title="Insertar B-Roll Alerta Roja con esta frase"
                      onClick={() => {
                        insertBrollTemplateForPhrase('red-impact', line.text, line.startMs / 1000, Math.max(2, (line.endMs - line.startMs) / 1000));
                      }}
                    >
                      🔴 Rojo
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="add-caption" onClick={addCaption} type="button">＋ Añadir subtítulo</button>
            <div className="silence-card"><span className="silence-icon">⌁</span><div><b>{silences.length ? `${silences.length} silencios` : 'Detectar silencios'}</b><small>{removeSilences ? 'Se eliminarán al exportar' : 'Analiza pausas de más de 0.5 s'}</small></div><button onClick={detectSilences} type="button">Analizar</button></div>
          </>}
          {activeTool === 'zentry-motion' && (
            <div className="tool-panel">
              <div className="vip-card" style={{ marginBottom: 10, background: 'linear-gradient(135deg, rgba(0, 245, 200, 0.12), rgba(99, 102, 241, 0.14))', border: '1px solid rgba(0, 245, 200, 0.35)' }}>
                <b style={{ fontSize: 12.5, color: '#ffffff' }}>Plantillas Zentry</b>
                <small style={{ color: '#bbb' }}>{ZENTRY_CATALOG_REGISTRY.length} plantillas · texto y sonido</small>
              </div>

              {/* Generador Automático de Pack Zentry (Todo en 1 clic) */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 245, 200, 0.12), rgba(99, 102, 241, 0.16))',
                  border: '1.5px solid rgba(0, 245, 200, 0.4)',
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13 }}>⚡</span>
                    <b style={{ fontSize: 11, color: '#00f5c8' }}>PACK ZENTRY AUTOMÁTICO</b>
                  </div>
                  <div style={{ display: 'flex', gap: 3 }}>
                    <button
                      type="button"
                      onClick={() => setSelectedPackFont('montserrat')}
                      style={{
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: 8.5,
                        fontWeight: selectedPackFont === 'montserrat' ? 800 : 500,
                        background: selectedPackFont === 'montserrat' ? '#00f5c8' : 'rgba(255,255,255,0.06)',
                        color: selectedPackFont === 'montserrat' ? '#000' : '#aaa',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Mont
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPackFont('playfair')}
                      style={{
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: 8.5,
                        fontStyle: 'italic',
                        fontWeight: selectedPackFont === 'playfair' ? 800 : 500,
                        background: selectedPackFont === 'playfair' ? '#00f5c8' : 'rgba(255,255,255,0.06)',
                        color: selectedPackFont === 'playfair' ? '#000' : '#aaa',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Play
                    </button>
                  </div>
                </div>

                <small style={{ color: '#bbb', fontSize: 9, display: 'block', marginBottom: 6 }}>
                  Hook, subtítulos, B-roll, motion y sonido.
                </small>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 3, marginBottom: 8 }}>
                  {[
                    { id: 'viral', label: 'Viral', icon: '🔥' },
                    { id: 'minimal', label: 'Clean', icon: '✨' },
                    { id: 'editorial', label: 'Luxury', icon: '💎' },
                    { id: 'neon', label: 'Neon', icon: '⚡' },
                    { id: 'kinetic', label: 'Bold', icon: '💥' },
                  ].map((pk) => {
                    const isSel = selectedPackStyle === pk.id;
                    return (
                      <button
                        key={pk.id}
                        type="button"
                        onClick={() => { const style = pk.id as typeof selectedPackStyle; setSelectedPackStyle(style); autoGenerateZentryPack(style,selectedPackFont); }}
                        style={{
                          padding: '4px 2px',
                          borderRadius: 5,
                          fontSize: 8.5,
                          fontWeight: 700,
                          background: isSel ? '#00f5c8' : 'rgba(255,255,255,0.06)',
                          color: isSel ? '#000' : '#ccc',
                          border: isSel ? '1px solid #00f5c8' : '1px solid rgba(255,255,255,0.1)',
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        <div>{pk.icon}</div>
                        <div>{pk.label}</div>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => autoGenerateZentryPack(selectedPackStyle, selectedPackFont)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: 6,
                    background: 'linear-gradient(135deg, #00f5c8, #6366f1)',
                    border: 'none',
                    color: '#000000',
                    fontWeight: 900,
                    fontSize: 10,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    boxShadow: '0 2px 10px rgba(0,245,200,0.25)',
                  }}
                >
                  <span>⚡</span> Generar Automáticamente en Video
                </button>
              </div>

              {/* Categorías Principales */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5, marginBottom: 10 }}>
                {[
                  { id: 'subtitles', label: 'Subtítulos', icon: 'CC' },
                  { id: 'hooks', label: 'Hooks', icon: '⚡' },
                  { id: 'typography', label: 'Tipografía', icon: 'Aa' },
                  { id: 'broll', label: 'B-roll', icon: '▣' },
                  { id: 'motion-graphics', label: 'Motion', icon: '✦' },
                ].map((cat) => {
                  const isSel = zentryCategoryFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => { setZentryCategoryFilter(cat.id as ZentryCategory); }}
                      style={{
                        padding: '6px 4px',
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 800,
                        textAlign: 'center',
                        background: isSel ? 'linear-gradient(135deg, rgba(0,245,200,0.25), rgba(99,102,241,0.25))' : 'rgba(255,255,255,0.04)',
                        border: isSel ? '1.5px solid #00f5c8' : '1px solid rgba(255,255,255,0.1)',
                        color: isSel ? '#00f5c8' : '#ccc',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: 12 }}>{cat.icon}</span>
                      <span>{cat.label} ({ZENTRY_CATALOG_REGISTRY.filter((tpl) => tpl.category === cat.id).length})</span>
                    </button>
                  );
                })}
              </div>

              {/* Subcategorías de B-Roll (Superior, Central, Inferior) */}
              {zentryCategoryFilter === 'broll' && (
                <div style={{ display: 'flex', gap: 5, marginBottom: 10, padding: '3px', background: 'rgba(0,0,0,0.4)', borderRadius: 6 }}>
                  {[
                    { id: 'all', label: `Todos (${ZENTRY_CATALOG_REGISTRY.filter((tpl) => tpl.category === 'broll').length})` },
                    { id: 'top', label: 'Superior' },
                    { id: 'center', label: 'Central' },
                    { id: 'bottom', label: 'Inferior' },
                  ].map((sub) => {
                    const isSel = zentryBrollFilter === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setZentryBrollFilter(sub.id as any)}
                        style={{
                          flex: 1,
                          padding: '4px 6px',
                          borderRadius: 5,
                          fontSize: 9.5,
                          fontWeight: 700,
                          background: isSel ? '#00f5c8' : 'transparent',
                          color: isSel ? '#000000' : '#cccccc',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Inspector de Clip Zentry Seleccionado */}
              {(() => {
                const selectedItem = zentryItems.find((z) => z.id === selectedZentryId);
                if (!selectedItem) return null;
                const tpl = getZentryTemplate(selectedItem.presetId);
                return (
                  <div
                    style={{
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1.5px solid #00f5c8',
                      borderRadius: 8,
                      padding: 10,
                      marginBottom: 12,
                      boxShadow: '0 8px 24px rgba(0,245,200,0.15)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 900, color: '#00f5c8', textTransform: 'uppercase', background: 'rgba(0,245,200,0.15)', padding: '2px 5px', borderRadius: 4 }}>
                          {selectedItem.category}
                        </span>
                        <b style={{ fontSize: 11, color: '#fff' }}>{tpl?.name || selectedItem.presetId}</b>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedZentryId(null)}
                        style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 13 }}
                        title="Cerrar inspector"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Timing */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 10, marginBottom: 8, color: '#aaa' }}>
                      <div>
                        <span>Inicio: </span>
                        <b style={{ color: '#fff' }}>{selectedItem.start.toFixed(1)}s</b>
                      </div>
                      <div>
                        <span>Duración: </span>
                        <b style={{ color: '#fff' }}>{selectedItem.duration.toFixed(1)}s</b>
                      </div>
                    </div>

                    <div className="zentry-layout-controls">
                      <b>Texto y posición de esta plantilla</b>
                      <small>Selecciona la capa en la línea de tiempo. Arrastra en el video para moverla.</small>
                      <label>Tamaño de letra · {selectedItem.fontSize ?? DEFAULT_TEXT_SIZE}px
                        <input aria-label="Tamaño de letra de plantilla Zentry" type="range" min="28" max="140" value={selectedItem.fontSize ?? DEFAULT_TEXT_SIZE} onChange={event=>updateZentryItem(selectedItem.id,{fontSize:Number(event.target.value)})} />
                      </label>
                      <label>Tamaño proporcional · {Math.round((selectedItem.textScale ?? 1)*100)}%
                        <input aria-label="Tamaño de texto Zentry Motion" type="range" min="0.25" max="2.5" step="0.05" value={selectedItem.textScale ?? 1} onChange={event => updateZentryItem(selectedItem.id,{textScale:Number(event.target.value)})} />
                      </label>
                      <label>Posición horizontal · {Math.round(selectedItem.positionX ?? 50)}%
                        <input aria-label="Posición horizontal Zentry Motion" type="range" min="0" max="100" step="1" value={selectedItem.positionX ?? 50} onChange={event => updateZentryItem(selectedItem.id,{positionX:Number(event.target.value)})} />
                      </label>
                      <label>Posición vertical · {Math.round(selectedItem.positionY ?? 50)}%
                        <input aria-label="Posición vertical Zentry Motion" type="range" min="0" max="100" step="1" value={selectedItem.positionY ?? 50} onChange={event => updateZentryItem(selectedItem.id,{positionY:Number(event.target.value)})} />
                      </label>
                      <button type="button" className="secondary-tool" onClick={() => updateZentryItem(selectedItem.id,{textScale:1,positionX:50,positionY:50})}>Restablecer tamaño y posición</button>
                    </div>
                    {/* Controles de SFX */}
                    <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.35)', borderRadius: 6, marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: '#00f5c8', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span>♫</span> Sonido Vinculado
                        </span>
                        <button
                          type="button"
                          onClick={() => updateZentryItem(selectedItem.id, { sfxEnabled: !selectedItem.sfxEnabled })}
                          style={{
                            padding: '2px 6px',
                            borderRadius: 4,
                            fontSize: 9,
                            fontWeight: 800,
                            background: selectedItem.sfxEnabled ? '#00f5c8' : 'rgba(255,255,255,0.1)',
                            color: selectedItem.sfxEnabled ? '#000' : '#888',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          {selectedItem.sfxEnabled ? 'SFX ON' : 'SFX OFF'}
                        </button>
                      </div>

                      {selectedItem.sfxEnabled && (
                        <>
                          <div style={{ marginBottom: 4 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: '#aaa', marginBottom: 2 }}>
                              <span>Volumen SFX</span>
                              <b style={{ color: '#fff' }}>{Math.round((selectedItem.sfxVolume ?? 1) * 100)}%</b>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={selectedItem.sfxVolume ?? 0.5}
                              onChange={(e) => updateZentryItem(selectedItem.id, { sfxVolume: Number(e.target.value) })}
                              style={{ width: '100%' }}
                            />
                          </div>

                          <div style={{ fontSize: 9.5, color: '#aaa', marginBottom: 4 }}>
                            <span>Sonido: </span>
                            <select
                              value={selectedItem.sfxId}
                              onChange={(e) => {
                                const newSfx = ZENTRY_SFX_MAP[e.target.value as ZentrySfxId];
                                if (newSfx) {
                                  updateZentryItem(selectedItem.id, {
                                    sfxId: e.target.value,
                                    sfxVolume: 1.0,
                                    offsetFrames: newSfx.offsetFrames,
                                  });
                                }
                              }}
                              style={{
                                width: '100%',
                                background: '#111',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: 4,
                                color: '#fff',
                                padding: '3px 5px',
                                fontSize: 9,
                                marginTop: 2,
                              }}
                            >
                              {Object.entries(ZENTRY_SFX_MAP).map(([sfxKey, sfxVal]) => (
                                <option key={sfxKey} value={sfxKey}>
                                  {sfxVal.label} ({sfxKey})
                                </option>
                              ))}
                            </select>
                          </div>

                          {tpl && selectedItem.sfxId !== tpl.sfxId && (
                            <button
                              type="button"
                              onClick={() => {
                                updateZentryItem(selectedItem.id, {
                                  sfxId: tpl.sfxId,
                                  sfxVolume: 1.0,
                                  offsetFrames: tpl.offsetFrames,
                                });
                              }}
                              style={{
                                fontSize: 9,
                                color: '#00f5c8',
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                textDecoration: 'underline',
                              }}
                            >
                              ↺ Restaurar sonido original ({tpl.sfxId})
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Selector de Tipografía (Montserrat vs Playfair) */}
                    {(selectedItem.category === 'typography' || selectedItem.category === 'subtitles') && (
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ fontSize: 9.5, color: '#aaa', display: 'block', marginBottom: 3 }}>Tipografía de esta capa:</span>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                          <button
                            type="button"
                            aria-label="Usar Montserrat en capa seleccionada"
                            onClick={() => updateZentryItem(selectedItem.id, { fontVariant: 'montserrat' })}
                            style={{
                              padding: '4px 6px',
                              borderRadius: 5,
                              fontSize: 9.5,
                              fontWeight: selectedItem.fontVariant === 'montserrat' ? 900 : 600,
                              background: selectedItem.fontVariant === 'montserrat' ? 'rgba(0,245,200,0.2)' : 'rgba(255,255,255,0.05)',
                              border: selectedItem.fontVariant === 'montserrat' ? '1px solid #00f5c8' : '1px solid rgba(255,255,255,0.1)',
                              color: selectedItem.fontVariant === 'montserrat' ? '#00f5c8' : '#aaa',
                              cursor: 'pointer',
                              fontFamily: 'Montserrat, sans-serif',
                            }}
                          >
                            Montserrat
                          </button>
                          <button
                            type="button"
                            aria-label="Usar Playfair en capa seleccionada"
                            onClick={() => updateZentryItem(selectedItem.id, { fontVariant: 'playfair' })}
                            style={{
                              padding: '4px 6px',
                              borderRadius: 5,
                              fontSize: 9.5,
                              fontWeight: selectedItem.fontVariant === 'playfair' ? 900 : 600,
                              background: selectedItem.fontVariant === 'playfair' ? 'rgba(0,245,200,0.2)' : 'rgba(255,255,255,0.05)',
                              border: selectedItem.fontVariant === 'playfair' ? '1px solid #00f5c8' : '1px solid rgba(255,255,255,0.1)',
                              color: selectedItem.fontVariant === 'playfair' ? '#00f5c8' : '#aaa',
                              cursor: 'pointer',
                              fontFamily: '"Playfair Display", serif',
                              fontStyle: 'italic',
                            }}
                          >
                            Playfair
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Acciones de Clip */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
                      <button
                        type="button"
                        onClick={() => updateZentryItem(selectedItem.id, { sfxLinked: !selectedItem.sfxLinked })}
                        style={{
                          padding: '5px 3px',
                          borderRadius: 5,
                          fontSize: 9,
                          fontWeight: 700,
                          background: selectedItem.sfxLinked ? 'rgba(0,245,200,0.15)' : 'rgba(255,255,255,0.05)',
                          border: selectedItem.sfxLinked ? '1px solid #00f5c8' : '1px solid rgba(255,255,255,0.1)',
                          color: selectedItem.sfxLinked ? '#00f5c8' : '#aaa',
                          cursor: 'pointer',
                        }}
                      >
                        {selectedItem.sfxLinked ? '🔗 Vinculado' : '⚡ Libre'}
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateZentryItem(selectedItem.id)}
                        style={{
                          padding: '5px 3px',
                          borderRadius: 5,
                          fontSize: 9,
                          fontWeight: 700,
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        📑 Duplicar
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteZentryItem(selectedItem.id)}
                        style={{
                          padding: '5px 3px',
                          borderRadius: 5,
                          fontSize: 9,
                          fontWeight: 700,
                          background: 'rgba(239,68,68,0.15)',
                          border: '1px solid rgba(239,68,68,0.4)',
                          color: '#f87171',
                          cursor: 'pointer',
                        }}
                      >
                        🗑 Eliminar
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Multiplicador Global de Volumen SFX */}
              <div style={{ padding: '7px 9px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#bbb', marginBottom: 3 }}>
                  <span>Volumen General de SFX</span>
                  <b style={{ color: '#00f5c8' }}>{Math.round(sfxVolumeMultiplier * 100)}%</b>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={sfxVolumeMultiplier}
                  onChange={(e) => setSfxVolumeMultiplier(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Cuadrícula Compacta de Tarjetas de Plantillas (2, 3 o 4 por línea) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                {ZENTRY_CATALOG_REGISTRY.filter((tpl) => {
                  if (tpl.category !== zentryCategoryFilter) return false;
                  if (zentryCategoryFilter === 'broll' && zentryBrollFilter !== 'all') {
                    return tpl.brollSubcategory === zentryBrollFilter;
                  }
                  return true;
                }).map((tpl) => {
                  const currentVariant = zentryFontVariantMap[tpl.id] || (tpl.fontVariants ? tpl.fontVariants[0] : 'montserrat');
                  const previewSrc = tpl.category === 'typography'
                    ? `/zentry-previews/typography/${currentVariant}/${tpl.id}.mp4`
                    : tpl.preview;

                  return (
                    <div
                      key={tpl.id}
                      style={{
                        background: 'rgba(18, 24, 38, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 8,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {/* Video Preview Compacto */}
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          height: 76,
                          background: '#0a0d14',
                          overflow: 'hidden',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          const v = e.currentTarget.querySelector('video');
                          if (v) v.play().catch(() => {});
                        }}
                        onMouseLeave={(e) => {
                          const v = e.currentTarget.querySelector('video');
                          if (v) { v.pause(); v.currentTime = 0; }
                        }}
                        onClick={(e) => {
                          const v = e.currentTarget.querySelector('video');
                          if (v) {
                            if (v.paused) v.play().catch(() => {});
                            else v.pause();
                          }
                          applyZentryTemplate(tpl.id, currentVariant, 'default');
                        }}
                      >
                        <video
                          src={previewSrc}
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            top: 4,
                            left: 4,
                            background: 'rgba(0,0,0,0.7)',
                            padding: '1px 5px',
                            borderRadius: 3,
                            fontSize: 8,
                            fontWeight: 800,
                            color: '#00f5c8',
                          }}
                        >
                          {tpl.brollSubcategory ? tpl.brollSubcategory.toUpperCase() : tpl.category.slice(0, 4).toUpperCase()}
                        </div>
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 4,
                            left: 4,
                            background: 'rgba(0,0,0,0.75)',
                            padding: '1px 4px',
                            borderRadius: 3,
                            fontSize: 7.5,
                            color: '#e0e7ff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                          }}
                        >
                          <span>♫</span>
                        </div>
                      </div>

                      {/* Info & Acciones Compactas */}
                      <div style={{ padding: '6px 7px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                        <div
                          title={tpl.name}
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: '#ffffff',
                            lineHeight: 1.2,
                            marginBottom: 4,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {tpl.name}
                        </div>

                        {/* Selector de Fuente para Tipografía */}
                        {tpl.fontVariants && tpl.fontVariants.length > 1 && (
                          <div style={{ display: 'flex', gap: 3, marginBottom: 5 }}>
                            <button
                              type="button"
                              onClick={() => setZentryFontVariantMap((prev) => ({ ...prev, [tpl.id]: 'montserrat' }))}
                              style={{
                                flex: 1,
                                padding: '2px 3px',
                                borderRadius: 3,
                                fontSize: 8.5,
                                fontWeight: currentVariant === 'montserrat' ? 800 : 500,
                                background: currentVariant === 'montserrat' ? '#00f5c8' : 'rgba(255,255,255,0.06)',
                                color: currentVariant === 'montserrat' ? '#000' : '#aaa',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              Mont
                            </button>
                            <button
                              type="button"
                              onClick={() => setZentryFontVariantMap((prev) => ({ ...prev, [tpl.id]: 'playfair' }))}
                              style={{
                                flex: 1,
                                padding: '2px 3px',
                                borderRadius: 3,
                                fontSize: 8.5,
                                fontStyle: 'italic',
                                fontWeight: currentVariant === 'playfair' ? 800 : 500,
                                background: currentVariant === 'playfair' ? '#00f5c8' : 'rgba(255,255,255,0.06)',
                                color: currentVariant === 'playfair' ? '#000' : '#aaa',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              Play
                            </button>
                          </div>
                        )}

                        {/* Botones de Aplicación según Categoría */}
                        {tpl.category === 'subtitles' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <button
                              type="button"
                              onClick={() => applyZentryTemplate(tpl.id, currentVariant, 'all')}
                              style={{
                                width: '100%',
                                padding: '4px 4px',
                                borderRadius: 4,
                                background: 'linear-gradient(135deg, #00f5c8, #0ea5e9)',
                                border: 'none',
                                color: '#000',
                                fontWeight: 800,
                                fontSize: 9,
                                cursor: 'pointer',
                              }}
                            >
                              ⚡ A todos
                            </button>
                            <button
                              type="button"
                              onClick={() => applyZentryTemplate(tpl.id, currentVariant, 'default')}
                              style={{
                                width: '100%',
                                padding: '3px 4px',
                                borderRadius: 4,
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: 8.5,
                                cursor: 'pointer',
                              }}
                            >
                              ＋ En posición
                            </button>
                          </div>
                        ) : tpl.category === 'hooks' ? (
                          <button
                            type="button"
                            onClick={() => applyZentryTemplate(tpl.id, currentVariant, 'default')}
                            style={{
                              width: '100%',
                              padding: '4px 4px',
                              borderRadius: 4,
                              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                              border: 'none',
                              color: '#fff',
                              fontWeight: 800,
                              fontSize: 9,
                              cursor: 'pointer',
                            }}
                          >
                            ⚡ Aplicar Hook
                          </button>
                        ) : tpl.category === 'broll' ? (
                          <button
                            type="button"
                            onClick={() => applyZentryTemplate(tpl.id, currentVariant, 'default')}
                            style={{
                              width: '100%',
                              padding: '4px 4px',
                              borderRadius: 4,
                              background: selectedBrollId ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #00f5c8, #0ea5e9)',
                              border: 'none',
                              color: '#000',
                              fontWeight: 800,
                              fontSize: 9,
                              cursor: 'pointer',
                            }}
                          >
                            {selectedBrollId ? '✓ Cambiar B-roll' : '＋ Aplicar B-roll'}
                          </button>
                        ) : tpl.category === 'motion-graphics' ? (
                          <button
                            type="button"
                            onClick={() => applyZentryTemplate(tpl.id, currentVariant, 'default')}
                            style={{
                              width: '100%',
                              padding: '4px 4px',
                              borderRadius: 4,
                              background: selectedMgId ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : 'linear-gradient(135deg, #00f5c8, #0ea5e9)',
                              border: 'none',
                              color: selectedMgId ? '#fff' : '#000',
                              fontWeight: 800,
                              fontSize: 9,
                              cursor: 'pointer',
                            }}
                          >
                            {selectedMgId ? '✓ Cambiar Motion' : '＋ Aplicar Motion'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => applyZentryTemplate(tpl.id, currentVariant, 'default')}
                            style={{
                              width: '100%',
                              padding: '4px 4px',
                              borderRadius: 4,
                              background: 'linear-gradient(135deg, #00f5c8, #0ea5e9)',
                              border: 'none',
                              color: '#000',
                              fontWeight: 800,
                              fontSize: 9,
                              cursor: 'pointer',
                            }}
                          >
                            ＋ Aplicar Texto
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {activeTool === 'styles' && (
            <div className="tool-panel">
              <div className="vip-card" style={{ marginBottom: 10 }}>
                <span>ESTILOS Y PLANTILLAS VIP</span>
                <b>PLANTILLAS MAESTRAS (1-CLIC)</b>
                <small>Preset completo de tipografía, colores y animación viral</small>
              </div>

              {/* 4 Mini Cards en cuadrícula compacta */}
              <div className="viro-mini-grid">
                {VIRO_MASTER_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    className="viro-mini-card"
                    onClick={() => applyMasterTemplate(tmpl.id)}
                    title={`Aplicar plantilla ${tmpl.name}`}
                  >
                    <div className="viro-mini-header">
                      <span className="viro-mini-badge">{tmpl.badge}</span>
                      <span className="viro-mini-icon">{tmpl.icon}</span>
                    </div>
                    <strong className="viro-mini-title">{tmpl.name}</strong>
                    <small className="viro-mini-desc">{tmpl.desc}</small>
                  </button>
                ))}
              </div>

              {/* Selector de Estilo de Subtítulos */}
              <div style={{ marginTop: 14 }}>
                <span className="field-label" style={{ marginBottom: 6 }}>Estilo Rápido de Subtítulos</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                  {CAPTION_PRESETS.slice(0, 6).map((preset) => {
                    const isSel = activeStyle === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => selectStyle(preset.id as CaptionStyleId)}
                        style={{
                          padding: '6px 8px',
                          borderRadius: 6,
                          fontSize: 10,
                          fontWeight: 700,
                          textAlign: 'left',
                          background: isSel ? 'rgba(0,245,200,0.15)' : 'rgba(255,255,255,0.04)',
                          border: isSel ? '1px solid #00f5c8' : '1px solid rgba(255,255,255,0.1)',
                          color: isSel ? '#00f5c8' : '#ddd',
                          cursor: 'pointer',
                        }}
                      >
                        {preset.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tipografía y Color de Acento */}
              <div style={{ marginTop: 14 }}>
                <label className="field-label">
                  Tipografía Principal
                  <select
                    value={captionFontFamily}
                    onChange={(e) => { checkpoint(); setCaptionFontFamily(e.target.value); }}
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.6)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 6,
                      color: '#fff',
                      padding: '6px 8px',
                      fontSize: 11,
                      marginTop: 4,
                    }}
                  >
                    <option value="Anton">Anton (Viral Hormozi / Impacto)</option>
                    <option value="Montserrat">Montserrat (Modern Clean / Marca)</option>
                    <option value="Playfair Display">Playfair Display (Editorial Elegante)</option>
                    <option value="Inter">Inter (Minimal Tech)</option>
                    <option value="Outfit">Outfit (Geométrica Redonda)</option>
                  </select>
                </label>

                <div style={{ marginTop: 10 }}>
                  <span className="field-label" style={{ marginBottom: 4, display: 'block' }}>Color de Acento Viral</span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {[
                      { color: '#00f5c8', label: 'Neón Mint' },
                      { color: '#ffd400', label: 'Amarillo Viral' },
                      { color: '#ff2a2a', label: 'Rojo Alerta' },
                      { color: '#ffffff', label: 'Blanco Puro' },
                      { color: '#eab308', label: 'Oro Luxury' },
                      { color: '#a855f7', label: 'Púrpura' },
                    ].map((col) => (
                      <button
                        key={col.color}
                        type="button"
                        onClick={() => { checkpoint(); setAccentColor(col.color); }}
                        title={col.label}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          background: col.color,
                          border: accentColor === col.color ? '2px solid #ffffff' : '1px solid rgba(0,0,0,0.5)',
                          boxShadow: accentColor === col.color ? '0 0 10px ' + col.color : 'none',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <label className="range-field" style={{ marginTop: 12 }}>
                  <span><b>Tamaño de subtítulos</b><em>{fontSize}px</em></span>
                  <input
                    type="range"
                    min="60"
                    max="160"
                    step="2"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                  />
                </label>
              </div>
            </div>
          )}
          {activeTool === 'transitions' && (
            <div className="tool-panel">
              <div className="transitions-scroll-panel">
                <div className="vip-card" style={{ marginBottom: 10 }}>
                  <span>MOTOR DE TRANSICIONES PRO</span>
                  <b>TRANSICIONES DINÁMICAS</b>
                  <small>Whip Pan 3D · Zoom Punch · Film Burn 35mm · Glitch RGB</small>
                </div>

                {/* Sección 1: Transiciones de B-Roll */}
                <div className="transition-section-card">
                  <div className="trans-sec-header">
                    <span style={{ fontSize: 13 }}>▣</span>
                    <strong style={{ fontSize: 11, color: '#00f5c8' }}>TRANSICIONES DE B-ROLL (IN / OUT)</strong>
                  </div>
                  <p style={{ fontSize: 9.5, color: '#999', margin: '4px 0 8px', lineHeight: 1.3 }}>
                    Efectos de entrada y salida para clips e imágenes B-Roll sobre el video.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#ccc', display: 'block', marginBottom: 3 }}>
                        Entrada (In):
                      </span>
                      <select
                        value={
                          (selectedBrollId ? customBrolls.find((b) => b.id === selectedBrollId)?.transitionIn : undefined) ||
                          (brollTransition === 'fade' ? 'smooth-fade' : brollTransition === 'glitch' ? 'rgb-glitch' : brollTransition === 'zoom' ? 'zoom-punch' : 'whip-pan')
                        }
                        onChange={(e) => {
                          const val = e.target.value as any;
                          checkpoint();
                          if (selectedBrollId) {
                            updateCustomBroll(selectedBrollId, { transitionIn: val });
                          } else {
                            setCustomBrolls((prev) => prev.map((b) => ({ ...b, transitionIn: val })));
                          }
                        }}
                        style={{
                          width: '100%',
                          background: 'rgba(0,0,0,0.6)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: 6,
                          color: '#fff',
                          padding: '6px 4px',
                          fontSize: 10,
                        }}
                      >
                        <option value="whip-pan">Whip Pan 3D (Rápido)</option>
                        <option value="zoom-punch">Zoom Punch Pro</option>
                        <option value="film-burn">Film Burn 35mm</option>
                        <option value="rgb-glitch">Glitch RGB CapCut</option>
                        <option value="smooth-fade">Fundido Suave</option>
                        <option value="none">Corte Seco (Directo)</option>
                      </select>
                    </div>

                    <div>
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#ccc', display: 'block', marginBottom: 3 }}>
                        Salida (Out):
                      </span>
                      <select
                        value={
                          (selectedBrollId ? customBrolls.find((b) => b.id === selectedBrollId)?.transitionOut : undefined) || 'smooth-fade'
                        }
                        onChange={(e) => {
                          const val = e.target.value as any;
                          checkpoint();
                          if (selectedBrollId) {
                            updateCustomBroll(selectedBrollId, { transitionOut: val });
                          } else {
                            setCustomBrolls((prev) => prev.map((b) => ({ ...b, transitionOut: val })));
                          }
                        }}
                        style={{
                          width: '100%',
                          background: 'rgba(0,0,0,0.6)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: 6,
                          color: '#fff',
                          padding: '6px 4px',
                          fontSize: 10,
                        }}
                      >
                        <option value="smooth-fade">Fundido Suave</option>
                        <option value="whip-pan">Whip Pan 3D (Rápido)</option>
                        <option value="zoom-punch">Zoom Punch Pro</option>
                        <option value="film-burn">Film Burn 35mm</option>
                        <option value="rgb-glitch">Glitch RGB CapCut</option>
                        <option value="none">Corte Seco (Directo)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      checkpoint();
                      const inVal = (selectedBrollId ? customBrolls.find((b) => b.id === selectedBrollId)?.transitionIn : undefined) || 'whip-pan';
                      const outVal = (selectedBrollId ? customBrolls.find((b) => b.id === selectedBrollId)?.transitionOut : undefined) || 'smooth-fade';
                      setCustomBrolls((prev) => prev.map((b) => ({ ...b, transitionIn: inVal, transitionOut: outVal })));
                      setJobState('done');
                      setJobTitle('Transiciones aplicadas a todos los B-Rolls');
                      setJobDetail(`${inVal} (In) y ${outVal} (Out) sincronizados en ${customBrolls.length} B-Rolls.`);
                    }}
                    style={{
                      width: '100%',
                      padding: '6px',
                      background: 'rgba(0,245,200,0.08)',
                      border: '1px solid rgba(0,245,200,0.3)',
                      borderRadius: 6,
                      color: '#00f5c8',
                      fontSize: 9.5,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    ✓ Aplicar a todos los B-Rolls ({customBrolls.length})
                  </button>
                </div>

                {/* Sección 2: Transiciones entre Clips de Video */}
                <div className="transition-section-card" style={{ marginTop: 10 }}>
                  <div className="trans-sec-header">
                    <span style={{ fontSize: 13 }}>▶</span>
                    <strong style={{ fontSize: 11, color: '#ff2a2a' }}>TRANSICIÓN ENTRE CLIPS DE VIDEO</strong>
                  </div>
                  <p style={{ fontSize: 9.5, color: '#999', margin: '4px 0 8px', lineHeight: 1.3 }}>
                    Transición al unir múltiples tomas o clips en la línea de tiempo.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5, marginBottom: 8 }}>
                    {[
                      { id: 'whip-pan', label: 'Whip Pan', icon: '⚡' },
                      { id: 'zoom-punch', label: 'Zoom Punch', icon: '🔍' },
                      { id: 'fade', label: 'Fundido', icon: '🌫️' },
                      { id: 'glitch', label: 'Glitch RGB', icon: '📺' },
                      { id: 'cut', label: 'Corte Seco', icon: '✂' },
                    ].map((tr) => (
                      <button
                        key={tr.id}
                        type="button"
                        onClick={() => {
                          checkpoint();
                          setEditSegments((prev) => prev.map((s) => ({ ...s, transitionToNext: tr.id as any })));
                          setJobState('done');
                          setJobTitle(`Transición ${tr.label} aplicada`);
                          setJobDetail('Configurada para todos los cortes entre clips.');
                        }}
                        style={{
                          padding: '6px 4px',
                          borderRadius: 6,
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: '#fff',
                          fontSize: 9,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 2,
                        }}
                      >
                        <span style={{ fontSize: 13 }}>{tr.icon}</span>
                        <span>{tr.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sección 3: Transiciones de Motion Graphics 3D */}
                <div className="transition-section-card" style={{ marginTop: 10 }}>
                  <div className="trans-sec-header">
                    <span style={{ fontSize: 13 }}>⚡</span>
                    <strong style={{ fontSize: 11, color: '#ffd400' }}>ENTRADA DE MOTION GRAPHICS 3D</strong>
                  </div>
                  <p style={{ fontSize: 9.5, color: '#999', margin: '4px 0 8px', lineHeight: 1.3 }}>
                    Física cinética y dirección de aparición para las tarjetas 3D en pantalla.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 8 }}>
                    {[
                      { id: 'slide-up', label: 'Subida', icon: '⬆️' },
                      { id: 'slide-left', label: 'Izquierda', icon: '⬅️' },
                      { id: 'slide-right', label: 'Derecha', icon: '➡️' },
                      { id: 'zoom', label: 'Pop 3D', icon: '💥' },
                    ].map((dir) => (
                      <button
                        key={dir.id}
                        type="button"
                        onClick={() => {
                          checkpoint();
                          if (selectedMgId) {
                            updateMotionGraphic(selectedMgId, { entranceTransition: dir.id as any });
                          } else {
                            setMotionGraphicsItems((prev) => prev.map((m) => ({ ...m, entranceTransition: dir.id as any })));
                          }
                          setJobState('done');
                          setJobTitle(`Entrada ${dir.label} configurada`);
                          setJobDetail('Animación con física de rebote elástico.');
                        }}
                        style={{
                          padding: '6px 3px',
                          borderRadius: 6,
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: '#fff',
                          fontSize: 9,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 2,
                        }}
                      >
                        <span style={{ fontSize: 12 }}>{dir.icon}</span>
                        <span>{dir.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sección 4: Efectos de Sonido Sincronizados (SFX) */}
                <div className="transition-section-card" style={{ marginTop: 10 }}>
                  <label className="tool-toggle" style={{ margin: 0, padding: 0 }}>
                    <span>
                      <b style={{ fontSize: 10 }}>Sonido Whoosh en transiciones</b>
                      <small style={{ fontSize: 8.5 }}>Dispara SFX cinemático al cambiar de escena</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={hookSfxEnabled}
                      onChange={(e) => setHookSfxEnabled(e.target.checked)}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
          {activeTool === 'video' && <div className="tool-panel">
            <button className="primary-tool" onClick={() => inputRef.current?.click()} type="button">↑ Subir o cambiar video principal</button>
            <div className="tool-card">
              <div>
                <b>Videos del proyecto ({new Set(editSegments.map((segment) => segment.src)).size}/12)</b>
                <small>MP4, MOV o WebM · hasta 60 s por clip adicional · transcripción en segundo plano</small>
              </div>
              <button onClick={() => secondaryInputRef.current?.click()} type="button">
                ＋ Añadir clip
              </button>
            </div>
            {secondaryVideoUrl && (
              <button className="secondary-tool" onClick={removeSecondaryClip} type="button">
                × Quitar clip secundario
              </button>
            )}
            <div className="tool-card"><div><b>Eliminar silencios</b><small>{silences.length ? `${silences.length} pausas encontradas` : 'Análisis local del audio'}</small></div><button onClick={detectSilences} type="button">Detectar</button></div>
            <label className="tool-toggle"><span><b>Aplicar cortes</b><small>Acorta automáticamente el resultado</small></span><input type="checkbox" checked={removeSilences} disabled={!silences.length} onChange={(event) => setRemoveSilences(event.target.checked)} /></label>
            <label className="tool-toggle"><span><b>Zoom punch</b><small>Énfasis visual al comenzar</small></span><input type="checkbox" checked={zoomPunch} onChange={(event) => setZoomPunch(event.target.checked)} /></label>
            {selectedSegment && <div className="trim-card"><div><b>Clip seleccionado</b><small>{selectedSegment.start.toFixed(2)}s — {selectedSegment.end.toFixed(2)}s</small></div><label>Entrada<input type="number" min="0" max={selectedSegment.end-.08} step="0.05" value={Number(selectedSegment.start.toFixed(2))} onFocus={checkpoint} onChange={(event) => updateSegmentEdge(selectedSegment.id,'start',Number(event.target.value))} /></label><label>Salida<input type="number" min={selectedSegment.start+.08} max={duration} step="0.05" value={Number(selectedSegment.end.toFixed(2))} onFocus={checkpoint} onChange={(event) => updateSegmentEdge(selectedSegment.id,'end',Number(event.target.value))} /></label><button onClick={() => deleteSegment(selectedSegment.id)} type="button">Eliminar clip</button></div>}
          </div>}
          {activeTool === 'audio' && <div className="tool-panel">
            <label className="range-field"><span><b>Volumen del sonido del video</b><em>{Math.round(volume*100)}%</em></span><input aria-label="Volumen del sonido del video" min="0" max="1" step="0.05" type="range" value={volume} onPointerDown={checkpoint} onChange={(event) => setVolume(Number(event.target.value))} /></label>
            <div className="tool-card"><div><b>Audios ({musicClips.length}/14)</b></div><button type="button" disabled={musicUploading || musicClips.length>=14} onClick={() => musicInputRef.current?.click()}>{musicUploading ? 'Cargando…' : '＋ Subir audio'}</button></div>
            {musicClips.length>0 && <label className="field-label">Escuchar y editar audio<select aria-label="Seleccionar audio subido" value={selectedMusicId || ''} onChange={event=>{setSelectedMusicId(event.target.value);setSelectedSfxId(null);}}><option value="">Selecciona un audio</option>{musicClips.map(clip=><option key={clip.id} value={clip.id}>{clip.name} · {audioRate(clip).toFixed(2)}×</option>)}</select></label>}
            {audioSettingsNotice && <p className="tool-note" role="status">{audioSettingsNotice}</p>}
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button className="secondary-tool" type="button" aria-label="Sincronizar subtítulos con audio" disabled={!musicClips.length || jobState==='working'} onClick={() => void syncCaptionsWithUploadedAudio()}>Sincronizar subtítulos</button>
              <button className="secondary-tool danger" type="button" aria-label="Eliminar subtítulos del video actuales" disabled={!captions.length || jobState==='working'} onClick={clearVideoCaptions}>Eliminar subtítulos</button>
            </div>
            <p className="tool-note">Sincronizar reemplaza los subtítulos actuales. Puedes deshacerlo.</p>
            <label className="range-field"><span><b>{selectedMusicClip ? 'Volumen del audio seleccionado' : 'Volumen de los audios subidos'}</b><em>{Math.round((selectedMusicClip?.volume ?? musicUploadVolume)*100)}%</em></span><input aria-label="Volumen del audio subido" type="range" min="0" max="1" step="0.01" value={selectedMusicClip?.volume ?? musicUploadVolume} onPointerDown={checkpoint} onChange={(event) => { const next = Number(event.target.value); setMusicUploadVolume(next); setMusicClips((clips) => clips.map((clip) => !selectedMusicId || clip.id === selectedMusicId ? {...clip,volume:next} : clip)); }} /></label>
            {!selectedMusicClip && musicClips.length > 1 && <p className="tool-note">Sin selección, el volumen se aplica a todos los audios subidos.</p>}
            {selectedSfxItem && <div className="trim-card"><div><b>Efecto seleccionado</b><small>{selectedSfxItem.label} · arrástralo en la pista ♪</small></div><label>Inicio (s)<input aria-label="Inicio del efecto de sonido" type="number" min="0" max={duration} step="0.1" value={Number(selectedSfxItem.timeSec.toFixed(2))} onFocus={checkpoint} onChange={(event) => setSfxTimeOverrides((items) => ({...items,[selectedSfxItem.id]:Math.max(0,Math.min(duration,Number(event.target.value)))}))} /></label>{selectedSfxItem.id.startsWith('manual-sfx-') && <button type="button" onClick={() => {checkpoint();setManualSfxClips((items)=>items.filter((item)=>item.id!==selectedSfxItem.id));setSelectedSfxId(null);}}>× Eliminar este efecto</button>}</div>}
            {selectedMusicClip && <div className="trim-card">
              <div><b>Audio seleccionado</b></div>
              <label>Inicio (s)<input aria-label="Inicio de música" type="number" min="0" max={Math.max(0,duration-selectedMusicClip.duration)} step="0.1" value={Number(selectedMusicClip.start.toFixed(2))} onChange={(event) => setMusicClips((clips) => clips.map((clip) => clip.id === selectedMusicClip.id ? {...clip,start:placeMusicClip(clip,Number(event.target.value),clips,duration)} : clip))} /></label>
              <label>Duración (s)<input aria-label="Duración de música" type="number" min="0.1" max={Math.max(0.1,maxAudioDuration(selectedMusicClip,musicClips,duration))} step="0.1" value={Number(selectedMusicClip.duration.toFixed(2))} onFocus={checkpoint} onChange={(event) => setMusicClips((clips) => clips.map((clip) => clip.id === selectedMusicClip.id ? {...clip,duration:Math.max(0.1,Math.min(maxAudioDuration(clip,clips,duration),Number(event.target.value) || .1))} : clip))} /></label>
              <label className="field-label">Velocidad del audio<select aria-label="Velocidad del audio" value={audioRate(selectedMusicClip)} onChange={event=>setSelectedAudioRate(Number(event.target.value))}>{![.5,.75,1,1.25,1.5,2,3,4,5].includes(audioRate(selectedMusicClip)) && <option value={audioRate(selectedMusicClip)}>{audioRate(selectedMusicClip).toFixed(2)}× (anterior)</option>}{[.5,.75,1,1.25,1.5,2,3,4,5].map(rate=><option key={rate} value={rate}>{rate===1 ? '1× · Original' : `${rate}×`}</option>)}</select></label>
              <audio key={selectedMusicClip.id} ref={auditionAudioRef} aria-label="Reproducir audio seleccionado" controls preload="metadata" src={selectedMusicClip.src} style={{width:'100%'}} onLoadedMetadata={event=>{event.currentTarget.currentTime=selectedMusicClip.sourceStart;event.currentTarget.playbackRate=audioRate(selectedMusicClip);event.currentTarget.volume=selectedMusicClip.volume;}} onPlay={event=>{setPlaying(false);musicPreviewRef.current?.pause();const interval=audioSourceInterval(selectedMusicClip);if(event.currentTarget.currentTime<interval.start || event.currentTarget.currentTime>=interval.end) event.currentTarget.currentTime=interval.start;}} onTimeUpdate={event=>{if(event.currentTarget.currentTime>=audioSourceInterval(selectedMusicClip).end) event.currentTarget.pause();}} />
              <small>Tras recortar o cambiar velocidad, vuelve a sincronizar.</small>
              <button type="button" onClick={() => { checkpoint(); setMusicClips((clips) => clips.filter((clip) => clip.id !== selectedMusicClip.id)); setSelectedMusicId(null); }}>× Eliminar fragmento</button>
            </div>}

            {/* Auto-Sincronizador Viral IA (Captura 2) */}
            <div style={{ margin: '14px 0', padding: 12, background: 'linear-gradient(135deg, rgba(255,42,42,0.12), rgba(0,245,200,0.12))', borderRadius: 10, border: '1px solid rgba(255,42,42,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <b style={{ color: '#fff', fontSize: 12 }}>Sonidos automáticos</b>
                <span style={{ fontSize: 10, color: '#00f5c8', fontWeight: 700 }}>
                  {contextualSfxEvents.length > 0 ? `${contextualSfxEvents.length} sonidos activos` : 'Inactivo'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="primary-button"
                  style={{ flex: 1, padding: '8px 12px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
                  onClick={() => {
                    setContextualSfxDisabled(false);
                    syncContextualSfx();
                  }}
                >
                  ✦ Sincronizar sonidos
                </button>
                {contextualSfxEvents.length > 0 && (
                  <button
                    type="button"
                    className="secondary-tool"
                    style={{ padding: '8px 12px', fontSize: 11, cursor: 'pointer' }}
                    onClick={() => {
                      setContextualSfxDisabled(true);
                      setContextualSfxEvents([]);
                    }}
                  >
                    Quitar
                  </button>
                )}
              </div>
              {contextualSfxEvents.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 110, overflowY: 'auto' }}>
                  {contextualSfxEvents.map((evt, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: 6, fontSize: 10 }}>
                      <span style={{ color: '#fff' }}><b>{evt.timeSec.toFixed(1)}s</b> · {evt.label}</span>
                      <button
                        type="button"
                        onClick={() => { const a = new Audio(evt.sfxSrc); a.volume = 0.5; void a.play().catch(() => {}); }}
                        style={{ background: 'none', border: 'none', color: '#00f5c8', fontSize: 10, cursor: 'pointer', fontWeight: 700 }}
                      >
                        ▶ {evt.sfxSrc.split('/').pop()}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <h3>Efectos de sonido · 36</h3>
            <div className="sfx-cats">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'trans', label: 'Transición' },
                { id: 'impact', label: 'Impacto' },
                { id: 'pop', label: 'Clicks/Pops' },
                { id: 'type', label: 'Escritura' },
                { id: 'notif', label: 'Notificación' },
                { id: 'success', label: 'Éxito' },
                { id: 'viral', label: 'Viral' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  className={`sfx-cat-btn ${selectedSfxCat === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedSfxCat(cat.id as SfxCategory)}
                  type="button"
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="sfx-library">
              {SFX_EFFECTS.filter((e) => selectedSfxCat === 'all' || e.cat === selectedSfxCat).map((effect) => (
                <button onClick={() => chooseSfx(effect.src)} type="button" key={effect.src}>
                  <span>▶</span>{effect.name}
                </button>
              ))}
            </div>
            <details className="editor-help"><summary>Ayuda de audio</summary><p>Los volúmenes del video, los audios subidos y los efectos son independientes. Selecciona un audio para ajustar solo ese archivo.</p><p>Sincronizar transcribe todos los audios subidos, reemplaza los subtítulos actuales y actualiza el texto de B-roll y motion. Puedes deshacerlo.</p><p>Cada pulsación en un sonido añade un efecto en el cabezal. Arrastra sus clips para moverlos; usa los bordes para recortar audio y «Cortar» para dividirlo.</p></details>
          </div>}
          {activeTool === 'effects' && <div className="tool-panel">
            <h3>Overlays de tu carpeta</h3><div className="overlay-library">{OVERLAY_EFFECTS.map((effect) => <button className={overlaySrc === effect.src ? 'active' : ''} onClick={() => setOverlaySrc(effect.src)} type="button" key={effect.name}><span>{effect.preview}</span><b>{effect.name}</b></button>)}</div>
            <label className="field-label">Línea superior del hook<input maxLength={36} value={hookLeadText} onFocus={checkpoint} onChange={(event) => setHookLeadText(event.target.value)} placeholder={`Automática: ${automaticHookLead || 'primera palabra'}`} /></label>
            <label className="field-label">Línea principal del hook<input ref={hookInputRef} maxLength={90} value={hookMainText} onFocus={checkpoint} onChange={(event) => setHookMainText(event.target.value)} placeholder={`Automática: ${automaticHookMain || 'resto de la frase'}`} /></label>
            {!hookLeadText.trim() && !hookMainText.trim() && automaticHookText && <p className="auto-hook-note"><b>Hook automático</b><span>{automaticHookLead}</span> {automaticHookMain}</p>}
            <div className="hook-style-grid">
              {HOOK_PRESETS.map((preset) => (
                <button
                  className={`hook-style-option hook-${preset.id} ${hookStyle === preset.id ? 'active' : ''}`}
                  aria-pressed={hookStyle === preset.id}
                  onClick={() => {
                    checkpoint();
                    setHookStyle(preset.id);
                    if ('leadFont' in preset && preset.leadFont) setHookLeadFontFamily(preset.leadFont);
                    if ('mainFont' in preset && preset.mainFont) setHookMainFontFamily(preset.mainFont);
                    if ('accent' in preset && preset.accent) setAccentColor(preset.accent);
                  }}
                  type="button"
                  key={preset.id}
                >
                  <span>
                    <small>{preset.sample[0]}</small>
                    <strong>{preset.sample[1]}</strong>
                  </span>
                  <b>{preset.name}</b>
                </button>
              ))}
            </div>
            <h3>Línea superior</h3><div className="hook-font-controls">
              <label>Tipo de letra<select aria-label="Tipo de letra de la línea superior" value={hookLeadFontFamily} onFocus={checkpoint} onChange={(event) => setHookLeadFontFamily(event.target.value)} style={{fontFamily:hookLeadFontFamily}}>{FONT_OPTIONS.map((font) => <option value={font} key={font} style={{fontFamily:font}}>{font}</option>)}</select></label>
              <label className="range-field"><span><b>Tamaño superior</b><em>{hookLeadFontSize}px</em></span><input aria-label="Tamaño de la línea superior" min="28" max="130" type="range" value={hookLeadFontSize} onPointerDown={checkpoint} onChange={(event) => setHookLeadFontSize(Number(event.target.value))} /></label>
              <label className="range-field"><span><b>Duración superior</b><em>{hookLeadDuration.toFixed(1)}s</em></span><input aria-label="Duración de la línea superior" min="0.1" max="10" step="0.1" type="range" value={hookLeadDuration} onPointerDown={checkpoint} onChange={(event) => setHookLeadDuration(Number(event.target.value))} /></label>
            </div>
            <h3>Línea principal</h3><div className="hook-font-controls">
              <label>Tipo de letra<select aria-label="Tipo de letra de la línea principal" value={hookMainFontFamily} onFocus={checkpoint} onChange={(event) => setHookMainFontFamily(event.target.value)} style={{fontFamily:hookMainFontFamily}}>{FONT_OPTIONS.map((font) => <option value={font} key={font} style={{fontFamily:font}}>{font}</option>)}</select></label>
              <label className="range-field"><span><b>Tamaño principal</b><em>{hookMainFontSize}px</em></span><input aria-label="Tamaño de la línea principal" min="48" max="180" type="range" value={hookMainFontSize} onPointerDown={checkpoint} onChange={(event) => setHookMainFontSize(Number(event.target.value))} /></label>
              <label className="range-field"><span><b>Duración principal</b><em>{hookMainDuration.toFixed(1)}s</em></span><input aria-label="Duración de la línea principal" min="0.1" max="10" step="0.1" type="range" value={hookMainDuration} onPointerDown={checkpoint} onChange={(event) => setHookMainDuration(Number(event.target.value))} /></label>
            </div>
            <div className="position-card"><span><b>Posición del hook</b><small>Arrástralo directamente sobre el video</small></span><button onClick={() => setHookPosition(DEFAULT_HOOK_POSITION)} type="button">Centrar</button></div>
            <label className="tool-toggle"><span><b>Impacto sonoro en Hook</b><small>Efecto viral (vine-boom) en segundo 0 para retención</small></span><input type="checkbox" checked={hookSfxEnabled} onChange={(event) => setHookSfxEnabled(event.target.checked)} /></label>
            <label className="tool-toggle"><span><b>Motion graphics</b><small>Acentos rojos animados</small></span><input type="checkbox" checked={motionGraphics} onChange={(event) => setMotionGraphics(event.target.checked)} /></label><label className="tool-toggle"><span><b>Zoom dinámico</b><small>Golpe visual de apertura</small></span><input type="checkbox" checked={zoomPunch} onChange={(event) => setZoomPunch(event.target.checked)} /></label>
          </div>}
          {activeTool === 'broll' && <div className="tool-panel broll-controls">
            <label className="tool-toggle"><span><b>B-roll automático</b></span><input aria-label="B-roll automático editable" type="checkbox" checked={autoBroll} onChange={(event) => { const enabled = event.target.checked; setAutoBroll(enabled); autoBrollMaterializedKeyRef.current = ''; if (!enabled) setCustomBrolls((current) => current.filter((item) => !item.autoGenerated)); }} /></label>
            <button type="button" className="secondary-tool" title="Sugerir un B-roll para la frase en el cabezal" onClick={() => { const phrase = transcribedPhrases.find((item) => currentTime >= item.start && currentTime < item.end); void autoSuggestBrollForPhrase(phrase?.text || brollText || 'tecnología',phrase?.start ?? currentTime,phrase?.duration ?? 3.5); }}>✦ Sugerir B-roll</button>
            <label className="tool-toggle"><span><b>Sonido de escritura</b><small>Teclado sincronizado con cada grupo de palabras</small></span><input type="checkbox" checked={brollTypingSound} onChange={(event) => setBrollTypingSound(event.target.checked)} /></label>
            <label className="field-label">Transición del B-roll
              <select aria-label="Transición del B-roll" value={brollTransition} onChange={(event) => setBrollTransition(event.target.value as typeof brollTransition)}>
                <option value="fade">Fundido Suave</option>
                <option value="slide">Deslizar (Whip Pan)</option>
                <option value="zoom">Zoom Punch</option>
                <option value="flash">Flash Blanco</option>
                <option value="glitch">Glitch RGB (CapCut)</option>
                <option value="spin">Giro 3D (Spin)</option>
              </select>
            </label>

            {/* Plantillas B-Roll de Fondo Completo */}
            <div style={{ marginTop: 12, marginBottom: 16, padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: '0.04em' }}>
                  ✦ PLANTILLAS B-ROLL (FONDO COMPLETO)
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => insertBrollTemplate('white-minimal')}
                  style={{
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    padding: '8px 6px',
                    fontWeight: 800,
                    fontSize: 10,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  <span style={{ fontSize: 16 }}>⚪</span>
                  <span>Fondo Blanco</span>
                  <small style={{ fontSize: 8, color: '#64748b', fontWeight: 600 }}>Minimal / Dial 3D</small>
                </button>

                <button
                  type="button"
                  onClick={() => insertBrollTemplate('red-impact')}
                  style={{
                    background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                    color: '#ffffff',
                    border: '1px solid #f87171',
                    borderRadius: 8,
                    padding: '8px 6px',
                    fontWeight: 800,
                    fontSize: 10,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    boxShadow: '0 4px 14px rgba(220,38,38,0.4)',
                  }}
                >
                  <span style={{ fontSize: 16 }}>🔴</span>
                  <span>Fondo Rojo</span>
                  <small style={{ fontSize: 8, color: '#fecaca', fontWeight: 600 }}>Alerta / Impacto</small>
                </button>

                <button
                  type="button"
                  onClick={() => insertBrollTemplate('black-oled')}
                  style={{
                    background: '#09090b',
                    color: '#ffffff',
                    border: '1px solid #27272a',
                    borderRadius: 8,
                    padding: '8px 6px',
                    fontWeight: 800,
                    fontSize: 10,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.7)',
                  }}
                >
                  <span style={{ fontSize: 16 }}>⚫</span>
                  <span>Fondo Negro</span>
                  <small style={{ fontSize: 8, color: '#00f5c8', fontWeight: 600 }}>OLED / Stealth</small>
                </button>
              </div>
              <div style={{marginTop:10,display:'grid',gap:5}}>
                <b style={{fontSize:10,color:'#00f5c8'}}>Plantillas B-roll originales</b>
                {ZENTRY_CENTRAL_REGISTRY.filter((tpl) => tpl.category === 'broll').map((tpl) => <button key={tpl.id} type="button" className="secondary-tool" onClick={() => applyZentryTemplate(tpl.id, (zentryFontVariantMap[tpl.id] || tpl.fontVariants?.[0]) as ZentryFontVariant, 'default')}>{tpl.name} · {tpl.brollSubcategory === 'top' ? 'superior' : tpl.brollSubcategory === 'center' ? 'centro' : 'inferior'}</button>)}
                <b style={{fontSize:10,color:'#00f5c8',marginTop:5}}>Mis plantillas B-roll ({savedBrollTemplates.length}/3)</b>
                {savedBrollTemplates.map((saved) => <button key={saved.id} type="button" className="secondary-tool" onClick={() => { const style = ['white-minimal','red-impact','black-oled'].includes(saved.settings.brollStyle || '') ? saved.settings.brollStyle as 'white-minimal' | 'red-impact' | 'black-oled' : 'black-oled'; insertBrollTemplate(style,{...saved.settings,brollStyle:style,src:''}); }}>{saved.name}</button>)}
              </div>
            </div>

            {activeBroll && <p className="auto-hook-note"><b>Fragmento sincronizado</b>{activeBroll.text}</p>}

            <h3>{pexelsFallback ? 'B-Roll local (Pexels no disponible)' : 'B-Roll en vivo (Pexels HD 9:16)'}</h3>
            {pexelsWarning && <p className="tool-note" role="status">{pexelsWarning}</p>}
            <div className="pexels-search-box">
              <div className="pexels-search-bar">
                <input
                  type="text"
                  value={pexelsQuery}
                  onChange={(e) => setPexelsQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && void searchPexels()}
                  aria-label="Buscar videos de B-roll"
                  placeholder="Buscar videos…"
                />
                <button type="button" aria-label="Buscar B-roll en Pexels" onClick={() => void searchPexels()}>
                  {pexelsLoading ? 'Buscando…' : 'Buscar'}
                </button>
              </div>
              <div className="pexels-chips">
                {['Tecnología', 'Dinero', 'Oficina', 'IA', 'Fitness', 'Coche', 'Naturaleza', 'Ciudad'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className={`pexels-chip ${pexelsQuery.toLowerCase() === chip.toLowerCase() ? 'active' : ''}`}
                    onClick={() => { setPexelsQuery(chip); void searchPexels(chip); }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {pexelsResults.length > 0 && (
              <div className="pexels-grid">
                {pexelsResults.map((v) => (
                  <div key={v.id} className="pexels-item" title={v.author}>
                    <img src={v.image} alt={v.author} />
                    <span className="pexels-item-duration">{v.duration}s</span>
                    <div className="pexels-actions-overlay">
                      <button
                        type="button"
                        className="pexels-act-btn"
                        onClick={() => {
                          setPlacementModal({
                            isOpen: true,
                            type: 'broll',
                            data: {
                              src: v.videoUrl,
                              isVideo: true,
                              title: `Pexels: ${v.author || 'Video Vertical'}`,
                            },
                          });
                        }}
                      >
                        ✓ Usar B-Roll
                      </button>
                      <button
                        type="button"
                        className="pexels-act-btn secondary"
                        onClick={() => {
                          addCustomBroll(v.videoUrl, true, `Pexels: ${v.author || 'Video'}`, currentTime, 4.0);
                        }}
                      >
                        ＋ Superponer Aquí
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Custom Overlaid B-Rolls List */}
            {customBrolls.length > 0 && (
              <div className="custom-broll-list">
                <h3>B-Rolls superpuestos en tu video ({customBrolls.length})</h3>
                {customBrolls.map((b, i) => (
                  <div
                    key={b.id}
                    className={`custom-broll-card ${selectedBroll?.id === b.id ? 'active' : ''}`}
                    onClick={() => { setSelectedBrollId(b.id); setSelectedMgId(null); setSelectedZentryId(null); seekTo(b.start + Math.min(0.4,b.duration*0.15)); }}
                  >
                    {b.brollStyle === 'white-minimal' ? (
                      <div className="custom-broll-thumb" style={{ background: '#f5f6f8', color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16 }}>⚪</div>
                    ) : b.brollStyle === 'red-impact' ? (
                      <div className="custom-broll-thumb" style={{ background: '#dc2626', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16 }}>🔴</div>
                    ) : b.brollStyle === 'black-oled' ? (
                      <div className="custom-broll-thumb" style={{ background: '#09090b', color: '#00f5c8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16 }}>⚫</div>
                    ) : b.type === 'video' ? (
                      <video src={b.src} className="custom-broll-thumb" muted />
                    ) : (
                      <img src={b.src} alt="" className="custom-broll-thumb" />
                    )}
                    <div className="custom-broll-info">
                      <span className="custom-broll-title">#{i + 1} {b.title || 'Clip B-Roll'}</span>
                      <span className="custom-broll-meta">
                        {formatTime(b.start)} — {formatTime(b.start + b.duration)} ({b.duration.toFixed(1)}s)
                      </span>
                    </div>
                    <button
                      type="button"
                      className="custom-broll-update-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBrollId(b.id);
                        handleUpdateSelectedObject(b.id);
                      }}
                      title="Actualizar B-Roll con audio"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#93c5fd',
                        fontSize: 13,
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      🔄
                    </button>
                    <button
                      type="button"
                      className="custom-broll-delete-btn"
                      onClick={(e) => { e.stopPropagation(); deleteCustomBroll(b.id); }}
                      title="Eliminar B-Roll"
                    >
                      🗑️
                    </button>
                  </div>
                ))}

                {selectedBroll && (
                  <div className="motion-card-editor" style={{ marginTop: 6 }}>
                    <b>Ajustes de #{selectedBroll.title}</b>
                    {selectedBroll.brollStyle && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '8px 0' }}>
                        <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
                          Titular Principal
                          <input
                            type="text"
                            value={selectedBroll.brollHeadline || ''}
                            onChange={(e) => updateCustomBroll(selectedBroll.id, { brollHeadline: e.target.value })}
                            style={{
                              width: '100%',
                              background: 'rgba(0,0,0,0.5)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: 6,
                              color: '#fff',
                              padding: '6px 8px',
                              fontSize: 11,
                              marginTop: 3,
                            }}
                          />
                        </label>
                        <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
                          Texto Secundario / Explicativo
                          <input
                            type="text"
                            value={selectedBroll.brollText || ''}
                            onChange={(e) => updateCustomBroll(selectedBroll.id, { brollText: e.target.value })}
                            style={{
                              width: '100%',
                              background: 'rgba(0,0,0,0.5)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: 6,
                              color: '#fff',
                              padding: '6px 8px',
                              fontSize: 11,
                              marginTop: 3,
                            }}
                          />
                        </label>

                        <div style={{ marginTop: 6 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
                            Dirección Cinética de Entrada (Pila vertical de 3-4 palabras)
                          </span>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginTop: 4 }}>
                            {[
                              { id: 'slide-up', label: '⬆️ Subida' },
                              { id: 'slide-left', label: '⬅️ Izquierda' },
                              { id: 'slide-right', label: '➡️ Derecha' },
                            ].map((dir) => {
                              const isSel = (selectedBroll.transitionDirection || 'slide-up') === dir.id;
                              return (
                                <button
                                  key={dir.id}
                                  type="button"
                                  className={`motion-style-pill ${isSel ? 'active' : ''}`}
                                  style={{
                                    fontSize: 10,
                                    padding: '5px 4px',
                                    borderRadius: 6,
                                    border: isSel ? '1px solid #00f5c8' : '1px solid rgba(255,255,255,0.15)',
                                    background: isSel ? 'rgba(0,245,200,0.15)' : 'rgba(255,255,255,0.05)',
                                    color: isSel ? '#00f5c8' : '#fff',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                  }}
                                  onClick={() => updateCustomBroll(selectedBroll.id, { transitionDirection: dir.id as any })}
                                >
                                  {dir.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div style={{ marginTop: 6 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
                            Icono 3D Transparente (Sin fondo flotando)
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                            {['💡', '⚡', '🚀', '🧠', '📱', '🎯', '🤖', '💎', '🔥', '✅'].map((ico) => {
                              const isSel = selectedBroll.icon3d === ico;
                              return (
                                <button
                                  key={ico}
                                  type="button"
                                  style={{
                                    fontSize: 16,
                                    padding: '4px 7px',
                                    borderRadius: 6,
                                    border: isSel ? '2px solid #00f5c8' : '1px solid rgba(255,255,255,0.15)',
                                    background: isSel ? 'rgba(0,245,200,0.2)' : 'rgba(255,255,255,0.05)',
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => updateCustomBroll(selectedBroll.id, { icon3d: ico })}
                                >
                                  {ico}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    <div style={{ margin: '10px 0', padding: '9px', display: 'grid', gap: 8, background: 'rgba(0,245,200,0.05)', border: '1px solid rgba(0,245,200,0.18)', borderRadius: 8 }}>
                      <b style={{ fontSize: 10, color: '#00f5c8' }}>DISEÑO COMPLETO DEL B-ROLL</b>
                      <label className="tool-toggle"><span><b>Seguir estilo de subtítulos</b><small>Fuente, tamaño y acento se actualizan en tiempo real</small></span><input aria-label="Seguir estilo de subtítulos B-roll" type="checkbox" checked={Boolean(selectedBroll.inheritCaptionStyle ?? selectedBroll.autoGenerated)} onChange={event=>updateCustomBroll(selectedBroll.id,{inheritCaptionStyle:event.target.checked})} /></label>
                      {selectedBroll.brollStyle && (
                        <label style={{ fontSize: 10, display: 'grid', gap: 3 }}>
                          Estilo visual
                          <select aria-label="Estilo visual B-roll" value={selectedBroll.brollStyle} onChange={(event) => updateCustomBroll(selectedBroll.id, { brollStyle: event.target.value as any, templateId:undefined })}>
                            {selectedBroll.brollStyle === 'image' && <option value="image">Imagen con movimiento</option>}
                            {selectedBroll.brollStyle === 'video' && <option value="video">Video original</option>}
                            <option value="white-minimal">Fondo blanco minimal</option>
                            <option value="red-impact">Fondo rojo impacto</option>
                            <option value="black-oled">Fondo negro OLED</option>
                          </select>
                        </label>
                      )}
                      <label style={{ fontSize: 10, display: 'grid', gap: 3 }}>
                        Tipografía
                        <select aria-label="Tipografía B-roll" value={selectedBroll.fontFamily || 'Montserrat'} onChange={(event) => updateCustomBroll(selectedBroll.id, { fontFamily: event.target.value })}>
                          {FONT_OPTIONS.map((font) => <option key={font} value={font}>{font}</option>)}
                        </select>
                      </label>
                      <label className="range-field">
                        <span><b>Tamaño de letra</b><em>{selectedBroll.fontSize || DEFAULT_TEXT_SIZE}px</em></span>
                        <input aria-label="Tamaño de letra B-roll" type="range" min="32" max="110" step="2" value={selectedBroll.fontSize || DEFAULT_TEXT_SIZE} onChange={(event) => updateCustomBroll(selectedBroll.id, { fontSize: Number(event.target.value) })} />
                      </label>
                      <label style={{ fontSize: 10, display: 'grid', gap: 3 }}>
                        Efecto del texto
                        <select aria-label="Efecto de texto B-roll" value={selectedBroll.textEffect || 'spring'} onChange={(event) => updateCustomBroll(selectedBroll.id, { textEffect: event.target.value as any })}>
                          <option value="editorial">Editorial animado · aparece + entrada derecha</option>
                          <option value="spring">Entrada spring</option>
                          <option value="typewriter">Máquina de escribir</option>
                          <option value="glow">Resplandor glow</option>
                          <option value="none">Sin efecto</option>
                        </select>
                      </label>
                      <label className="tool-toggle"><span><b>Dos tipografías animadas</b><small>Primera línea aparece · segunda entra desde la derecha</small></span><input aria-label="Dos tipografías B-roll" type="checkbox" checked={Boolean(selectedBroll.dualFont)} onChange={(event) => updateCustomBroll(selectedBroll.id,{dualFont:event.target.checked,topFontFamily:selectedBroll.topFontFamily || 'Pacifico',bottomFontFamily:selectedBroll.bottomFontFamily || 'Anton'})} /></label>
                      {selectedBroll.dualFont && <div style={{display:'grid',gridTemplateColumns:'repeat(2, minmax(0, 1fr))',gap:6}}><label>Primera línea<select aria-label="Tipografía superior B-roll" value={selectedBroll.topFontFamily || 'Pacifico'} onChange={(event) => updateCustomBroll(selectedBroll.id,{topFontFamily:event.target.value})}>{FONT_OPTIONS.map((font) => <option key={font} value={font}>{font}</option>)}</select></label><label>Segunda línea<select aria-label="Tipografía inferior B-roll" value={selectedBroll.bottomFontFamily || 'Anton'} onChange={(event) => updateCustomBroll(selectedBroll.id,{bottomFontFamily:event.target.value})}>{FONT_OPTIONS.map((font) => <option key={font} value={font}>{font}</option>)}</select></label></div>}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6 }}>
                        <label style={{ fontSize: 9 }}>Texto<input aria-label="Color del texto B-roll" type="color" value={selectedBroll.textColor || '#ffffff'} onChange={(event) => updateCustomBroll(selectedBroll.id, { textColor: event.target.value })} /><input key={`${selectedBroll.id}-text-${selectedBroll.textColor || '#ffffff'}`} aria-label="Hex texto B-roll" type="text" maxLength={7} defaultValue={selectedBroll.textColor || '#ffffff'} onBlur={(event) => {if (/^#[0-9a-f]{6}$/i.test(event.target.value)) updateCustomBroll(selectedBroll.id,{textColor:event.target.value}); else event.target.value = selectedBroll.textColor || '#ffffff';}} /></label>
                        <label style={{ fontSize: 9 }}>Acento<input aria-label="Color de acento B-roll" type="color" value={selectedBroll.accentColor || '#00f5c8'} onChange={(event) => updateCustomBroll(selectedBroll.id, { accentColor: event.target.value })} /><input key={`${selectedBroll.id}-accent-${selectedBroll.accentColor || '#00f5c8'}`} aria-label="Hex acento B-roll" type="text" maxLength={7} defaultValue={selectedBroll.accentColor || '#00f5c8'} onBlur={(event) => {if (/^#[0-9a-f]{6}$/i.test(event.target.value)) updateCustomBroll(selectedBroll.id,{accentColor:event.target.value}); else event.target.value = selectedBroll.accentColor || '#00f5c8';}} /></label>
                        <label style={{ fontSize: 9 }}>Fondo<input aria-label="Color de fondo B-roll" type="color" value={selectedBroll.backgroundColor || '#050505'} onChange={(event) => updateCustomBroll(selectedBroll.id, { backgroundColor: event.target.value })} /><input key={`${selectedBroll.id}-background-${selectedBroll.backgroundColor || '#050505'}`} aria-label="Hex fondo B-roll" type="text" maxLength={7} defaultValue={selectedBroll.backgroundColor || '#050505'} onBlur={(event) => {if (/^#[0-9a-f]{6}$/i.test(event.target.value)) updateCustomBroll(selectedBroll.id,{backgroundColor:event.target.value}); else event.target.value = selectedBroll.backgroundColor || '#050505';}} /></label>
                      </div>
                      <label className="tool-toggle">
                        <span><b>Sonido del B-roll</b><small>Aparece también en la pista de audio</small></span>
                        <input aria-label="Activar sonido B-roll" type="checkbox" checked={selectedBroll.sfxEnabled !== false} onChange={(event) => updateCustomBroll(selectedBroll.id, { sfxEnabled: event.target.checked })} />
                      </label>
                      <select aria-label="Efecto de sonido B-roll" value={selectedBroll.sfxSrc || ''} onChange={(event) => { const src = event.target.value || null; updateCustomBroll(selectedBroll.id, { sfxSrc: src }); }}>
                        <option value="">Sin sonido</option>
                        {SFX_EFFECTS.map((effect) => <option key={effect.src} value={effect.src}>{effect.name}</option>)}
                      </select>
                      <label className="range-field"><span><b>Volumen SFX</b><em>{Math.round((selectedBroll.sfxVolume ?? 0.3) * 100)}%</em></span><input aria-label="Volumen SFX B-roll" type="range" min="0" max="1" step="0.05" value={selectedBroll.sfxVolume ?? 0.3} onChange={(event) => updateCustomBroll(selectedBroll.id, { sfxVolume: Number(event.target.value) })} /></label>
                      <button type="button" className="secondary-tool" disabled={savedBrollTemplates.length >= 3} onClick={saveSelectedBrollTemplate}>Guardar este B-roll como plantilla ({savedBrollTemplates.length}/3)</button>
                    </div>

                    {/* Transiciones In / Out para cualquier B-Roll (Captura 3) */}
                    <div style={{ margin: '10px 0', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#00f5c8', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>
                        ✦ TRANSICIONES PRO DE ENTRADA Y SALIDA
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <label style={{ fontSize: 10, color: '#ccc', display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <span>Entrada (In):</span>
                          <select
                            aria-label="Transición de entrada B-roll"
                            value={selectedBroll.transitionIn || 'whip-pan'}
                            onChange={(e) => updateCustomBroll(selectedBroll.id, { transitionIn: e.target.value as any })}
                            style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, color: '#fff', padding: '5px', fontSize: 10 }}
                          >
                            <option value="whip-pan">Whip Pan 3D (Rápido)</option>
                            <option value="zoom-punch">Zoom Punch Pro</option>
                            <option value="film-burn">Film Burn 35mm</option>
                            <option value="rgb-glitch">Glitch RGB CapCut</option>
                            <option value="smooth-fade">Fundido Suave</option>
                            <option value="none">Corte Seco (Ninguno)</option>
                          </select>
                        </label>
                        <label style={{ fontSize: 10, color: '#ccc', display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <span>Salida (Out):</span>
                          <select
                            aria-label="Transición de salida B-roll"
                            value={selectedBroll.transitionOut || 'smooth-fade'}
                            onChange={(e) => updateCustomBroll(selectedBroll.id, { transitionOut: e.target.value as any })}
                            style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, color: '#fff', padding: '5px', fontSize: 10 }}
                          >
                            <option value="smooth-fade">Fundido Suave</option>
                            <option value="whip-pan">Whip Pan 3D (Rápido)</option>
                            <option value="zoom-punch">Zoom Punch Pro</option>
                            <option value="film-burn">Film Burn 35mm</option>
                            <option value="rgb-glitch">Glitch RGB CapCut</option>
                            <option value="none">Corte Seco (Ninguno)</option>
                          </select>
                        </label>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <label className="range-field" style={{ flex: 1 }}>
                        <span><b>Segundo inicio</b><em>{selectedBroll.start.toFixed(1)}s</em></span>
                        <input
                          type="range"
                          min="0"
                          max={Math.max(1, duration - 1)}
                          step="0.1"
                          value={selectedBroll.start}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateCustomBroll(selectedBroll.id, { start: val });
                            seekTo(val);
                          }}
                        />
                      </label>
                      <label className="range-field" style={{ flex: 1 }}>
                        <span><b>Duración</b><em>{selectedBroll.duration.toFixed(1)}s</em></span>
                        <input
                          type="range"
                          min="1"
                          max="15"
                          step="0.5"
                          value={selectedBroll.duration}
                          onChange={(e) => updateCustomBroll(selectedBroll.id, { duration: Number(e.target.value) })}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            <h3>B-roll de tu carpeta</h3><div className="broll-library">{BROLL_ASSETS.map((asset) => <button className={brollUrl === asset.src ? 'active' : ''} onClick={() => addCustomBroll(asset.src, false, asset.name, currentTime, 3.5)} type="button" key={asset.src}><img alt="" src={asset.src}/><span>{asset.name}</span></button>)}</div>
            <div className="broll-drop compact" onClick={() => brollInputRef.current?.click()}>{brollUrl ? <img alt="B-roll seleccionado" src={brollUrl} /> : <><b>＋</b><span>Añadir otra imagen</span><small>JPG, PNG o WebP</small></>}</div>
            <label className="emphasis-editor"><span><b>Texto de énfasis</b><small>{brollText.trim() ? `${brollText.trim().split(/\s+/).length} palabras` : 'Automático desde la transcripción'} · hasta 4,5s</small></span><textarea aria-label="Texto de énfasis del B-roll" value={brollText} onFocus={checkpoint} onChange={(event) => setBrollText(event.target.value)} placeholder="Vacío = Zentry toma el texto hablado en ese momento" /></label>
            <details className="editor-help"><summary>Ayuda de B-roll</summary><p>El B-roll conserva el metraje y la voz del video. Selecciona su clip para cambiar fondo, tipografía, animación o sonido.</p><p>Los clips automáticos también se pueden editar o eliminar. Al desactivar B-roll automático se retiran los generados automáticamente.</p></details>
          </div>}
          {activeTool === 'motion' && <div className="tool-panel">
            <div className="vip-card" style={{ marginBottom: 10 }}>
              <b>Escenas y tarjetas</b>
              <small>Texto animado y recursos visuales</small>
            </div>

            <button
              type="button"
              className="primary-tool"
              style={{
                background: 'linear-gradient(135deg, #ff2a2a, #ff6b6b)',
                color: '#fff',
                border: '0',
                boxShadow: '0 8px 24px rgba(255, 42, 42, 0.35)',
                fontWeight: 900,
                fontSize: 11,
                padding: '12px 14px',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onClick={autoGenerateAiMotionGraphics}
            >
              <span>✦</span> Auto-Generar Motion 3D con IA (Analizar video)
            </button>


            <h3>Estilos 3D Cinemáticos (ViroEdit)</h3>
            <div className="motion-3d-grid">
              {[
                { id: 'editorial-bw', title: 'Editorial B/N', desc: 'Blanco y negro con acento rojo y cerebro 3D', poster: '/assets/motion-3d/editorial-bw.jpg', badge: '3D IA' },
                { id: 'cinematic-black', title: 'Cinemático Negro', desc: 'Fondo negro con rim light neón y corredor 3D', poster: '/assets/motion-3d/cinematic-black.jpg', badge: 'NEON' },
                { id: 'photoreal-3d', title: 'Realista 3D', desc: 'Estudio hiperrealista con pantalla 3D', poster: '/assets/motion-3d/photoreal-3d.jpg', badge: 'STUDIO' },
                { id: 'collage-vintage', title: 'Collage Vintage', desc: 'Recortes retro, tijeras 3D y papel halftone', poster: '/assets/motion-3d/collage-vintage.jpg', badge: 'RETRO' },
              ].map((m3d) => (
                <div
                  key={m3d.id}
                  className="motion-3d-card"
                  onClick={() => setPlacementModal({ isOpen: true, type: 'motion', data: { style: m3d.id as MotionGraphic3DStyle } })}
                  title="Haz clic para insertar"
                >
                  <img src={m3d.poster} alt={m3d.title} />
                  <span className="motion-3d-badge">{m3d.badge}</span>
                  <div className="m3d-overlay">
                    <span className="m3d-title">{m3d.title}</span>
                    <span className="m3d-desc">{m3d.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <h3>Smart Overlays (Tarjetas Glass & Neón)</h3>
            <div className="motion-presets-grid">
              {[
                { type: 'stat', icon: '📊', label: 'Estadística' },
                { type: 'notif', icon: '🔔', label: 'Notificación' },
                { type: 'apps', icon: '🤖', label: 'Apps IA 3D' },
                { type: 'checklist', icon: '✅', label: 'Checklist' },
                { type: 'progress', icon: '📈', label: 'Progreso' },
                { type: 'quote', icon: '💬', label: 'Cita / Frase' },
                { type: 'alert', icon: '⚠️', label: 'Alerta Oro' },
                { type: 'pill', icon: '⚡', label: 'Pill Pro Tip' },
              ].map((card) => (
                <button
                  key={card.type}
                  type="button"
                  className="motion-preset-btn"
                  onClick={() => addMotionGraphic(card.type as MotionGraphicCardType)}
                >
                  <span>{card.icon}</span>
                  {card.label}
                </button>
              ))}
            </div>

            {motionGraphicsItems.length > 0 ? (
              <>
                <h3>Elementos en tu video ({motionGraphicsItems.length})</h3>
                {motionGraphicsItems.map((mg, i) => (
                  <div
                    key={mg.id}
                    className={`motion-item-card ${selectedMg?.id === mg.id ? 'active' : ''}`}
                    onClick={() => { setSelectedMgId(mg.id); seekTo(mg.start); }}
                  >
                    <div>
                      <b>#{i + 1} {mg.title || mg.type.toUpperCase()}</b>
                      <small style={{ display: 'block', color: '#888' }}>
                        {mg.start.toFixed(1)}s — {(mg.start + mg.duration).toFixed(1)}s ({mg.duration.toFixed(1)}s)
                      </small>
                    </div>
                    <button
                      type="button"
                      className="custom-mg-update-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMgId(mg.id);
                        handleUpdateSelectedObject();
                      }}
                      title="Actualizar Motion Graphic con audio"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#93c5fd',
                        fontSize: 13,
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      🔄
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); deleteMotionGraphic(mg.id); }}
                      style={{ background: 'none', border: 'none', color: '#ff4444', fontSize: 18, cursor: 'pointer' }}
                      title="Eliminar elemento"
                    >
                      🗑️
                    </button>
                  </div>
                ))}

                {selectedMg && (
                  <div className="motion-card-editor">
                    <b>Ajustes: #{selectedMg.title}</b>

                    <div style={{ marginTop: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#aaa' }}>Estilo</span>
                      <div className="motion-style-row" style={{ marginTop: 4 }}>
                        {[
                          { id: 'editorial-bw', label: 'Editorial B/N' },
                          { id: 'cinematic-black', label: 'Cinemático' },
                          { id: 'photoreal-3d', label: 'Realista 3D' },
                          { id: 'collage-vintage', label: 'Collage' },
                          { id: 'apple', label: 'Glass' },
                          { id: 'neon', label: 'Neon' },
                        ].map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            className={`motion-style-pill ${selectedMg.style === st.id ? 'active' : ''}`}
                            onClick={() => updateMotionGraphic(selectedMg.id, { style: st.id as MotionGraphicStyle })}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#aaa' }}>Modo de Visualización</span>
                      <div className="motion-style-row" style={{ marginTop: 4 }}>
                        <button
                          type="button"
                          className={`motion-style-pill ${selectedMg.displayMode !== 'floating' ? 'active' : ''}`}
                          onClick={() => updateMotionGraphic(selectedMg.id, { displayMode: 'full' })}
                        >
                          🎬 Escena 3D Completa
                        </button>
                        <button
                          type="button"
                          className={`motion-style-pill ${selectedMg.displayMode === 'floating' ? 'active' : ''}`}
                          onClick={() => updateMotionGraphic(selectedMg.id, { displayMode: 'floating' })}
                        >
                          🪟 Tarjeta Flotante 3D
                        </button>
                      </div>
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#aaa' }}>🎨 Plantilla de Fondo de la Tarjeta</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 6 }}>
                        {[
                          { id: 'white', label: '⚪ Blanco Minimal', desc: 'Elon Musk / Clean', bg: '#FFFFFF', color: '#0f172a', border: '1px solid #cbd5e1' },
                          { id: 'red', label: '🔴 Rojo Impacto', desc: 'Rojo fuego alerta', bg: 'linear-gradient(135deg, #dc2626, #991b1b)', color: '#fff', border: '1px solid #ef4444' },
                          { id: 'black', label: '⚫ Negro OLED', desc: 'Negro puro cine', bg: '#09090b', color: '#fff', border: '1px solid #27272a' },
                          { id: 'yellow', label: '🟡 Amarillo Viral', desc: 'Estilo MrBeast', bg: 'linear-gradient(135deg, #facc15, #eab308)', color: '#000', border: '1px solid #ca8a04' },
                          { id: 'neon', label: '🟢 Neón Cyber', desc: 'Cian futurista', bg: 'rgba(6,15,28,0.95)', color: '#06b6d4', border: '1px solid #06b6d4' },
                          { id: 'glass', label: '🔲 Dark Glass', desc: 'Vidrio blur', bg: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' },
                        ].map((tpl) => {
                          const isSel = (selectedMg.cardTheme || selectedMg.highlightTemplate || 'glass') === tpl.id;
                          return (
                            <button
                              key={tpl.id}
                              type="button"
                              className={`motion-style-pill ${isSel ? 'active' : ''}`}
                              style={{
                                fontSize: 10,
                                padding: '6px 4px',
                                borderRadius: 8,
                                border: isSel ? '2px solid #3b82f6' : tpl.border,
                                background: tpl.bg,
                                color: tpl.color,
                                fontWeight: 800,
                                cursor: 'pointer',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
                                boxShadow: isSel ? '0 0 10px rgba(59,130,246,0.6)' : 'none',
                              }}
                              onClick={() => {
                                checkpoint();
                                updateMotionGraphic(selectedMg.id, {
                                  cardTheme: tpl.id as any,
                                  highlightTemplate: tpl.id as any,
                                });
                              }}
                            >
                              <span>{tpl.label}</span>
                              <small style={{ fontSize: 8, opacity: 0.8, fontWeight: 600 }}>{tpl.desc}</small>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#aaa' }}>✨ Efecto de Entrada de Palabras</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginTop: 6 }}>
                        {[
                          { id: 'spring', label: '⚡ Rebote Pop', desc: 'Salto elástico palabra por palabra' },
                          { id: 'typewriter', label: '⌨ Máquina / SFX', desc: 'Escritura continua sincronizada' },
                          { id: 'elevation3d', label: '🚀 Ascenso 3D', desc: 'Rotación y profundidad Z' },
                          { id: 'glow', label: '✨ Destello Flash', desc: 'Punch y resplandor luminoso' },
                        ].map((anim) => {
                          const isSel = (selectedMg.wordAnimationMode || 'spring') === anim.id;
                          return (
                            <button
                              key={anim.id}
                              type="button"
                              className={`motion-style-pill ${isSel ? 'active' : ''}`}
                              style={{
                                fontSize: 11,
                                padding: '7px 8px',
                                borderRadius: 8,
                                border: isSel ? '2px solid #00f5c8' : '1px solid rgba(255,255,255,0.15)',
                                background: isSel ? 'rgba(0,245,200,0.15)' : 'rgba(255,255,255,0.05)',
                                color: isSel ? '#00f5c8' : '#fff',
                                fontWeight: 800,
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                              onClick={() => {
                                checkpoint();
                                updateMotionGraphic(selectedMg.id, { wordAnimationMode: anim.id as any });
                              }}
                            >
                              <div>{anim.label}</div>
                              <div style={{ fontSize: 9, opacity: 0.75, fontWeight: 500 }}>{anim.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#aaa' }}>🧭 Transición de Entrada 3D</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 6 }}>
                        {[
                          { id: 'slide-up', label: '⬆️ Subida' },
                          { id: 'slide-left', label: '⬅️ Izquierda' },
                          { id: 'slide-right', label: '➡️ Derecha' },
                          { id: 'pop-3d', label: '🚀 Pop 3D' },
                        ].map((trans) => {
                          const isSel = (selectedMg.entranceTransition || 'slide-up') === trans.id;
                          return (
                            <button
                              key={trans.id}
                              type="button"
                              className={`motion-style-pill ${isSel ? 'active' : ''}`}
                              style={{
                                fontSize: 10,
                                padding: '6px 4px',
                                borderRadius: 6,
                                border: isSel ? '2px solid #00f5c8' : '1px solid rgba(255,255,255,0.15)',
                                background: isSel ? 'rgba(0,245,200,0.15)' : 'rgba(255,255,255,0.05)',
                                color: isSel ? '#00f5c8' : '#fff',
                                fontWeight: 800,
                                cursor: 'pointer',
                              }}
                              onClick={() => {
                                checkpoint();
                                updateMotionGraphic(selectedMg.id, { entranceTransition: trans.id as any });
                              }}
                            >
                              {trans.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#aaa' }}>💎 Objeto / Icono 3D Transparente</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                        {['⚡', '🧠', '🚀', '💡', '🤖', '📱', '🎯', '💎', '🔥', '✅', '⭐', '📈'].map((ico) => {
                          const isSel = selectedMg.icon3d === ico;
                          return (
                            <button
                              key={ico}
                              type="button"
                              style={{
                                fontSize: 18,
                                padding: '4px 8px',
                                borderRadius: 8,
                                border: isSel ? '2px solid #00f5c8' : '1px solid rgba(255,255,255,0.15)',
                                background: isSel ? 'rgba(0,245,200,0.25)' : 'rgba(255,255,255,0.05)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              onClick={() => {
                                checkpoint();
                                updateMotionGraphic(selectedMg.id, { icon3d: ico, objectSet:'icon' });
                              }}
                            >
                              {ico}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <label className="field-label">Recursos del motion
                      <select aria-label="Recursos del motion" value={selectedMg.objectSet ?? (selectedMg.textSource==='manual' ? 'icon' : 'auto')} onChange={event=>{checkpoint();updateMotionGraphic(selectedMg.id,{objectSet:event.target.value as MotionGraphicItem['objectSet']});}}>
                        <option value="auto">Según los subtítulos (local)</option><option value="technology">Tecnología</option><option value="finance">Dinero y ventas</option><option value="conversation">Conversación</option><option value="learning">Cursos y aprendizaje</option><option value="growth">Crecimiento</option><option value="icon">Icono clásico</option><option value="off">Sin objetos</option>
                      </select>
                    </label>
                    <label className="tool-toggle"><span><b>Texto sincronizado con la voz</b><small>Se actualiza con los subtítulos actuales; escribir un título cambia a manual.</small></span><input aria-label="Sincronizar texto de motion con subtítulos" type="checkbox" checked={selectedMg.textSource !== 'manual'} onChange={event => updateMotionGraphic(selectedMg.id,{textSource:event.target.checked ? 'transcript' : 'manual'})} /></label>
                    <label className="range-field"><span><b>Tamaño de letra motion</b><em>{selectedMg.fontSize ?? DEFAULT_TEXT_SIZE}px</em></span><input aria-label="Tamaño de letra motion" type="range" min="28" max="140" value={selectedMg.fontSize ?? DEFAULT_TEXT_SIZE} onChange={event=>updateMotionGraphic(selectedMg.id,{fontSize:Number(event.target.value)})} /></label>
                    <label className="field-label" style={{ marginTop: 8 }}>
                      Título (Escribe [palabra] para resaltar con la plantilla de arriba)
                      <input
                        value={resolveMotionText(selectedMg,captions,currentTime).title}
                        onChange={(e) => updateMotionGraphic(selectedMg.id, { title: e.target.value })}
                        placeholder="Ej: Domina cada paso con [máxima velocidad]"
                      />
                    </label>

                    {selectedMg.type !== '3d-scene' && (
                      <label className="field-label">
                        Valor / Dato destacado
                        <input
                          value={selectedMg.value || ''}
                          onChange={(e) => updateMotionGraphic(selectedMg.id, { value: e.target.value })}
                        />
                      </label>
                    )}

                    <div style={{ display: 'flex', gap: 10 }}>
                      <label className="range-field" style={{ flex: 1 }}>
                        <span><b>Segundo inicio</b><em>{selectedMg.start.toFixed(1)}s</em></span>
                        <input
                          type="range"
                          min="0"
                          max={Math.max(1, duration - 1)}
                          step="0.1"
                          value={selectedMg.start}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateMotionGraphic(selectedMg.id, { start: val });
                            seekTo(val);
                          }}
                        />
                      </label>
                      <label className="range-field" style={{ flex: 1 }}>
                        <span><b>Duración</b><em>{selectedMg.duration.toFixed(1)}s</em></span>
                        <input
                          type="range"
                          min="1"
                          max="15"
                          step="0.5"
                          value={selectedMg.duration}
                          onChange={(e) => updateMotionGraphic(selectedMg.id, { duration: Number(e.target.value) })}
                        />
                      </label>
                    </div>

                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (currentTime > selectedMg.start + 0.1 && currentTime < selectedMg.start + selectedMg.duration - 0.1) {
                            checkpoint();
                            const splitOffset = currentTime - selectedMg.start;
                            const mg1: MotionGraphicItem = {
                              ...selectedMg,
                              duration: Math.round(splitOffset * 10) / 10,
                            };
                            const mg2: MotionGraphicItem = {
                              ...selectedMg,
                              id: `mg-${Date.now()}`,
                              start: Math.round(currentTime * 10) / 10,
                              duration: Math.round((selectedMg.duration - splitOffset) * 10) / 10,
                            };
                            setMotionGraphicsItems((prev) => prev.map((m) => (m.id === selectedMg.id ? mg1 : m)).concat(mg2));
                            setSelectedMgId(mg2.id);
                            setJobState('done');
                            setJobTitle('Motion Graphic dividido');
                            setJobDetail(`Dividido en ${currentTime.toFixed(1)}s.`);
                          } else {
                            setJobState('error');
                            setJobTitle('Mueve el cabezal dentro de la escena');
                            setJobDetail('El cabezal debe estar dentro del tiempo de esta escena para cortarla.');
                          }
                        }}
                        style={{
                          flex: 1,
                          background: 'rgba(255,255,255,0.08)',
                          color: '#fff',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: 8,
                          padding: '8px',
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        ✂ Cortar en {currentTime.toFixed(1)}s
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMotionGraphic(selectedMg.id)}
                        style={{
                          background: 'rgba(255,59,48,0.15)',
                          color: '#ff4444',
                          border: '1px solid rgba(255,59,48,0.3)',
                          borderRadius: 8,
                          padding: '8px 12px',
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="tool-note">Selecciona una escena para añadirla.</p>
            )}
          </div>}
          {activeTool === 'brand' && <div className="tool-panel">
            <div className="vip-card"><span>IDENTIDAD VISUAL</span><b>ZENTRY STUDIO VIP</b><small>Hasta 3 plantillas personales · una predeterminada</small></div>
            <label className="field-label">Nombre del proyecto<input value={fileName} onFocus={checkpoint} onChange={(event) => setFileName(event.target.value)} /></label>
            <label className="field-label">Nombre de la nueva plantilla<input value={personalPresetNameDraft} maxLength={40} onChange={(event) => setPersonalPresetNameDraft(event.target.value)} /></label>
            <button className="primary-tool" onClick={savePersonalPreset} disabled={personalPresets.length >= 3} type="button">Guardar plantilla ({personalPresets.length}/3)</button>
            {personalPresets.length >= 3 && <p className="tool-note">Límite de 3: actualiza o elimina una plantilla para guardar otra.</p>}
            {personalPresets.map((preset) => <div key={preset.id} style={{border:'1px solid #3b3b3b',borderRadius:10,padding:10,display:'grid',gap:6}}>
              <b>{preset.name}{defaultPersonalPresetId === preset.id ? ' · Predeterminada' : ''}</b>
              <small>Guardada: {new Date(preset.savedAt).toLocaleString('es')}{preset.timeline ? ` · ${preset.timeline.customBrolls.length} B-roll · ${preset.timeline.motionGraphicsItems.length + preset.timeline.zentryItems.length} capas` : ' · Solo estilo (actualiza para guardar las capas)'}</small>
              <button className="secondary-tool" onClick={() => { checkpoint(); applyPersonalPreset(preset); }} type="button">Aplicar</button>
              <button className="secondary-tool" onClick={() => updatePersonalPreset(preset)} type="button">Actualizar con la edición actual</button>
              {defaultPersonalPresetId !== preset.id && <button className="secondary-tool" onClick={() => setDefaultPersonalPreset(preset.id)} type="button">Usar por defecto</button>}
              <button className="secondary-tool" onClick={() => removePersonalPreset(preset.id)} type="button">Eliminar plantilla</button>
            </div>)}
            <details className="editor-help"><summary>Acerca de tus plantillas</summary><p>Se guardan en este navegador para tu cuenta, con el estilo y las capas editables. Los archivos B-roll locales deben volver a adjuntarse.</p><p>Para añadir capas a una plantilla antigua, pulsa «Actualizar con la edición actual».</p></details>
          </div>}
        </aside>

        <section className="preview-stage">
          <div className="preview-toolbar">
            <div className="zoom-control"><button onClick={() => setCanvasZoom((value) => Math.max(36,value-4))} type="button">−</button><span>{canvasZoom}%</span><button onClick={() => setCanvasZoom((value) => Math.min(76,value+4))} type="button">＋</button></div>
            <label className="format-label">Formato <select aria-label="Formato de salida" value={outputFormat} onChange={(event) => setOutputFormat(event.target.value as typeof outputFormat)}><option value="original">Original</option><option value="9:16">9:16</option><option value="16:9">16:9</option><option value="1:1">1:1</option></select> · {outputSize.width} × {outputSize.height}</label>
            <label className="format-label">FPS <select aria-label="Fotogramas por segundo" value={outputFps} onChange={(event) => setOutputFps(Number(event.target.value) as 24|30|60)}><option value="24">24</option><option value="30">30</option><option value="60">60</option></select></label>
            <button className="upload-top" onClick={() => inputRef.current?.click()} type="button">↑ Cambiar video</button>
          </div>

          <div className="phone-canvas-wrap">
            <div className="phone-canvas" ref={phoneCanvasRef} style={{scale:canvasZoom/52,aspectRatio:`${outputSize.width} / ${outputSize.height}`,maxWidth:'100%'}}>
              {videoUrl ? (
                <>
                  {editSegments.length > 0 ? editSegments.map((segment, index) => {
                    const segStart = segment.timelineStart !== undefined ? segment.timelineStart : segment.start;
                    const segEnd = segment.timelineEnd !== undefined ? segment.timelineEnd : segment.end;
                    const isCurrent = (currentTime >= segStart && currentTime < segEnd) || (index === editSegments.length - 1 && currentTime >= segEnd);
                    const clipSrc = segment.src || videoUrl || videoUrlRef.current || undefined;
                    return (<Fragment key={segment.id}>
                      {(segment.sharpness ?? 0) > 0 && <svg aria-hidden="true" width="0" height="0" style={{position:'absolute'}}><filter id={`preview-sharp-${index}`}><feConvolveMatrix order="3" edgeMode="duplicate" preserveAlpha="true" kernelMatrix={`0 ${-Math.min(1,Math.max(0,segment.sharpness ?? 0))*.08} 0 ${-Math.min(1,Math.max(0,segment.sharpness ?? 0))*.08} ${1+4*Math.min(1,Math.max(0,segment.sharpness ?? 0))*.08} ${-Math.min(1,Math.max(0,segment.sharpness ?? 0))*.08} 0 ${-Math.min(1,Math.max(0,segment.sharpness ?? 0))*.08} 0`} /></filter></svg>}
                      <video
                        ref={(el) => {
                          segmentVideoRefs.current[segment.id] = el;
                          if (el) el.volume=Math.max(0,Math.min(1,volume*(segment.clipVolume ?? 1)));
                          if (index === 0) (videoRef as any).current = el;
                        }}
                        src={clipSrc}
                        muted={muted || segment.clipMuted || Boolean(segment.processedAudioSrc)}
                        playsInline
                        preload="auto"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: isCurrent ? 'block' : 'none',
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          scale: zoomPunch && index === 0 && currentTime < 1 ? 1.04 : 1,
                          filter:`brightness(${segment.brightness ?? 1}) contrast(${segment.contrast ?? 1}) saturate(${segment.saturation ?? 1})${(segment.sharpness ?? 0) > 0 ? ` url(#preview-sharp-${index})` : ''}`,
                        }}
                        onLoadedMetadata={(event) => {
                          const value = event.currentTarget.duration;
                          if (index === 0) {
                            if (Number.isFinite(value) && value > 0 && !mainDuration) setMainDuration(value);
                            const { videoWidth, videoHeight } = event.currentTarget;
                            if (videoWidth > 0 && videoHeight > 0) setSourceSize({width:videoWidth,height:videoHeight});
                          }
                        }}
                        onTimeUpdate={(event) => {
                          if (!isCurrent) return;
                          const video = event.currentTarget;
                          const localTime = video.currentTime;
                          const audio=segmentAudioRefs.current[segment.id];
                          if (audio && Math.abs(audio.currentTime-localTime) > .15) audio.currentTime=localTime;
                          if (localTime >= segment.end - 0.05) {
                            if (index < editSegments.length - 1) {
                              safePauseVideo(video);
                              const nextSeg = editSegments[index + 1];
                              const nextStart = nextSeg.timelineStart !== undefined ? nextSeg.timelineStart : nextSeg.start;
                              const nextEl = segmentVideoRefs.current[nextSeg.id];
                              if (nextEl) {
                                nextEl.currentTime = nextSeg.start;
                                if (playing) safePlayVideo(nextEl);
                              }
                              setCurrentTime(nextStart);
                            } else {
                              safePauseVideo(video);
                              setPlaying(false);
                              setCurrentTime(duration);
                            }
                            return;
                          }
                          const mappedTime = segStart + Math.max(0, localTime - segment.start);
                          setCurrentTime(mappedTime);
                        }}
                        onPlay={(event) => {setPlaying(true);const audio=segmentAudioRefs.current[segment.id];if(audio && !muted && !segment.clipMuted){audio.currentTime=event.currentTarget.currentTime;void audio.play().catch(()=>{});}}}
                        onPause={() => {
                          segmentAudioRefs.current[segment.id]?.pause();
                          if (isCurrent) setPlaying(false);
                        }}
                      />
                      {segment.processedAudioSrc && <audio ref={(el) => {segmentAudioRefs.current[segment.id]=el;if(el) el.volume=Math.max(0,Math.min(1,volume*(segment.clipVolume ?? 1)));}} src={segment.processedAudioSrc} preload="auto" muted={muted || segment.clipMuted} />}
                    </Fragment>);
                  }) : (
                    <video
                      ref={(el)=>{videoRef.current=el;if(el) el.volume=Math.max(0,Math.min(1,volume));}}
                      src={videoUrl}
                      muted={muted}
                      playsInline
                      preload="auto"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  )}
                </>
              ) : (
                <div className="demo-scene"><div className="scene-glow" /><div className="creator-silhouette"><span /></div><div className="scene-badge">ZENTRY ORIGINAL</div></div>
              )}
               {overlaySrc && !visibleVisualLayer && <video className="overlay-preview" src={overlaySrc} autoPlay loop muted playsInline />}
              {(() => {
                 const previewMediaBroll = visibleVisualLayer?.kind === 'broll'
                   ? customBrolls.find((b) => b.id === visibleVisualLayer.id && Boolean(b.src) && !b.templateId && !(b.inheritCaptionStyle ?? b.autoGenerated))
                   : null;
                 const visibleBroll = visibleVisualLayer?.kind === 'broll'
                   ? customBrolls.find((b) => b.id === visibleVisualLayer.id)
                   : null;
                 const isAnyTextTemplateBrollActive = Boolean(visibleBroll && (brollOwnsAnimatedText(visibleBroll) || visibleBroll.templateId || ['white-minimal','red-impact','black-oled'].includes(visibleBroll.brollStyle || '')));
                 const isAnyCustomBrollActive = visibleVisualLayer?.kind === 'broll';
                 const isAnyMgActive = visibleVisualLayer?.kind === 'motion';
                 const isAnyZentryActive = visibleVisualLayer?.kind === 'zentry';
                const isHookActive = Boolean(
                  (effectiveHookLead || effectiveHookMain) &&
                  currentTime < Math.max(hookLeadDuration, hookMainDuration)
                );
                return (
                  <>
                    {isHookActive && (
                      <div
                          className={`hook-preview hook-${hookStyle} editable-layer ${
                            selectedCanvasLayer === 'hook' ? 'selected' : ''
                          }`}
                          style={{ left: `${hookPosition.x}%`, top: `${hookPosition.y}%`, zIndex:30 }}
                          onPointerDown={(event) => startLayerDrag(event, 'hook')}
                          onClick={editHook}
                          data-layer-label="HOOK · ARRASTRA · CLIC PARA EDITAR"
                        >
                          {effectiveHookLead && currentTime < hookLeadDuration && (
                            <small
                              style={{
                                fontFamily: hookLeadFontFamily,
                                opacity: hookLineOpacity(currentTime,hookLeadDuration),
                                fontSize: `${Math.max(7, Math.min(30, hookLeadFontSize * 0.19))}px`,
                              }}
                            >
                              {effectiveHookLead}
                            </small>
                          )}
                          {effectiveHookMain && currentTime < hookMainDuration && (
                            <strong
                              style={{
                                fontFamily: hookMainFontFamily,
                                opacity: hookLineOpacity(currentTime,hookMainDuration),
                                fontSize: `${Math.max(11, Math.min(42, hookMainFontSize * 0.18))}px`,
                              }}
                            >
                              {effectiveHookMain}
                            </strong>
                          )}
                        </div>
                      )}

                    {/* Active Custom B-Roll Overlays */}
                    {customBrolls.filter((broll) => visibleVisualLayer?.kind === 'broll' && visibleVisualLayer.id === broll.id).map((broll) => {
                      const isActive = currentTime >= broll.start && currentTime <= broll.start + broll.duration;
                      if (!isActive) return null;

                      // Extract words during this B-roll grouped into 4-word vertical stack (Captura 5)
                      const brollWords: { text: string; start: number; end: number }[] = [];
                      const bEndSec = broll.start + broll.duration;
                      for (const cap of captions) {
                        const cs = cap.startMs / 1000;
                        const ce = cap.endMs / 1000;
                        if (cs < bEndSec && ce > broll.start) {
                          const rawTokens = cap.text.trim().split(/\s+/).filter(Boolean);
                          if (rawTokens.length > 0) {
                            const dur = Math.max(0.22, (ce - cs) / rawTokens.length);
                            rawTokens.forEach((tok, idx) => {
                              const clean = tok.replace(/[.,/#!$%^&*;:{}=\-_`~()¿?¡!"]/g, '');
                              if (clean) {
                                brollWords.push({ text: clean, start: cs + idx * dur, end: cs + (idx + 1) * dur });
                              }
                            });
                          }
                        }
                      }

                      const pageSize = 4;
                      const groups: { words: { text: string; start: number; end: number }[]; start: number; end: number }[] = [];
                      for (let i = 0; i < brollWords.length; i += pageSize) {
                        const slice = brollWords.slice(i, i + pageSize);
                        groups.push({ words: slice, start: slice[0].start, end: slice[slice.length - 1].end });
                      }
                      const activeGroup = groups.find((g) => currentTime >= g.start && currentTime < g.end) || groups[0] || null;
                      const fallbackTokens = (broll.brollHeadline || 'ENFOQUE TOTAL PARA CRECER').split(/\s+/).slice(0, 4);
                      const displayStack = activeGroup && activeGroup.words.length > 0
                        ? activeGroup.words
                        : fallbackTokens.map((t, idx) => ({ text: t, start: broll.start + idx * 0.45, end: broll.start + (idx + 1) * 0.45 }));

                      const brollIcon =
                        broll.icon3d ||
                        (broll.brollStyle === 'red-impact'
                          ? '⚡'
                          : broll.brollStyle === 'black-oled'
                          ? '💎'
                          : '💡');

                      const tIn = broll.transitionIn || 'whip-pan';
                      const tOut = broll.transitionOut || 'smooth-fade';
                      const elapsed = currentTime - broll.start;
                      const remaining = (broll.start + broll.duration) - currentTime;

                      let canvasTransform = '';
                      let canvasOpacity = 1;
                      let canvasFilter = 'none';

                      if (elapsed < 0.35) {
                        const p = Math.max(0, Math.min(1, elapsed / 0.35));
                        if (tIn === 'whip-pan') {
                          const x = (1 - p) * 140;
                          const rot = (1 - p) * 4;
                          canvasTransform = `translateX(${x}px) rotate(${rot}deg)`;
                          canvasOpacity = p;
                        } else if (tIn === 'zoom-punch') {
                          const s = 1.25 - 0.25 * p;
                          canvasTransform = `scale(${s})`;
                          canvasOpacity = p;
                        } else if (tIn === 'rgb-glitch') {
                          canvasFilter = p < 0.75 ? 'drop-shadow(3px 0 #ff0055) drop-shadow(-3px 0 #00ffff)' : 'none';
                          canvasOpacity = p;
                        } else if (tIn === 'smooth-fade' || tIn === 'fade') {
                          canvasOpacity = p;
                        }
                      } else if (remaining < 0.35) {
                        const p = Math.max(0, Math.min(1, remaining / 0.35));
                        if (tOut === 'whip-pan') {
                          const x = (1 - p) * -140;
                          canvasTransform = `translateX(${x}px)`;
                          canvasOpacity = p;
                        } else if (tOut === 'zoom-punch') {
                          const s = 1 + (1 - p) * 0.2;
                          canvasTransform = `scale(${s})`;
                          canvasOpacity = p;
                        } else if (tOut !== 'none') {
                          canvasOpacity = p;
                        }
                      }

                      if (brollOwnsAnimatedText(broll)) {
                        const resolvedTextStyle = resolveBrollCaptionStyle(broll,previewCaptionSettings);
                        const mediaBackground = Boolean(broll.src) && !broll.templateId && !['white-minimal','red-impact','black-oled'].includes(broll.brollStyle || '');
                        return <div key={broll.id} style={{position:'absolute',inset:0,zIndex:5,overflow:'hidden',background:broll.backgroundColor || (broll.brollStyle === 'white-minimal' ? '#ffffff' : broll.brollStyle === 'red-impact' ? '#991b1b' : '#050505'),transform:canvasTransform || undefined,opacity:canvasOpacity}}>
                          {mediaBackground && (broll.type==='video' ? <SyncedBrollPreview src={broll.src} localTime={elapsed} playing={playing} style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <img src={broll.src} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />)}
                          <AnimatedBrollText broll={resolvedTextStyle} captions={captions} time={currentTime} fontSize={brollTextFontSize(resolvedTextStyle)*canvasWidth/outputSize.width} />
                        </div>;
                      }
                      if (broll.templateId) {
                        const text = displayStack.map((item) => item.text).join(' ') || broll.brollText || broll.brollHeadline || '';
                        const font = broll.fontFamily || 'Montserrat';
                        const color = broll.textColor || '#ffffff';
                        const accent = broll.accentColor || '#00f5c8';
                        const progress = Math.max(0,Math.min(1,elapsed/0.38));
                        const placement = broll.templateId.includes('corner') || broll.templateId === 'broll_top' ? {top:'9%',left:'7%',textAlign:'left' as const} : broll.templateId.includes('step') || broll.templateId.includes('callout') || broll.templateId === 'broll_bottom' ? {bottom:'13%',left:'7%',textAlign:'left' as const} : broll.templateId.includes('stat') ? {top:'18%',left:'7%',textAlign:'left' as const} : {top:'42%',left:'7%',right:'7%',textAlign:'center' as const};
                        return <div key={broll.id} style={{position:'absolute',inset:0,zIndex:5,background:['broll_top','broll_center','broll_bottom'].includes(broll.templateId) ? (broll.backgroundColor || '#050505') : 'transparent',overflow:'hidden',opacity:canvasOpacity,transform:canvasTransform || undefined}}>
                          <div style={{position:'absolute',...placement,fontFamily:font,lineHeight:1.05,opacity:progress,transform:`translateY(${(1-progress)*18}px)`,textShadow:'0 3px 12px #0008'}}>
                            {broll.templateId.includes('corner') || broll.templateId.includes('step') || broll.templateId === 'broll_top' || broll.templateId === 'broll_bottom' ? <div style={{fontSize:Math.max(12,(broll.fontSize || DEFAULT_TEXT_SIZE)*.17),fontWeight:800,color:accent,marginBottom:4}}>PASO {String(Math.max(1,Math.floor(broll.start)+1)).padStart(2,'0')}</div> : null}
                            <div style={{fontSize:Math.max(17,(broll.fontSize || DEFAULT_TEXT_SIZE)*.37),fontWeight:900,color,wordBreak:'break-word'}}>{text}</div>
                            {(broll.templateId.includes('stat') || broll.templateId.includes('callout')) && <div style={{fontSize:Math.max(13,(broll.fontSize || DEFAULT_TEXT_SIZE)*.22),fontWeight:800,color:accent,marginTop:5}}>{broll.templateId.includes('stat') ? '3×' : 'PALABRA CLAVE'}</div>}
                          </div>
                        </div>;
                      }
                      if (broll.brollStyle === 'white-minimal') {
                        return (
                          <div
                            key={broll.id}
                            style={{
                              position: 'absolute',
                              inset: 0,
                              zIndex: 5,
                              background: broll.backgroundColor || '#ffffff',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '16px 20px',
                              textAlign: 'center',
                              color: broll.textColor || '#0f172a',
                              fontFamily: broll.fontFamily || 'Montserrat',
                              transform: canvasTransform || undefined,
                              opacity: canvasOpacity,
                              filter: canvasFilter !== 'none' ? canvasFilter : undefined,
                              transition: 'transform 0.08s ease-out, opacity 0.08s ease-out',
                            }}
                          >
                            <div
                              style={{
                                fontSize: 46,
                                lineHeight: 1,
                                marginBottom: 12,
                                filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.12))',
                              }}
                            >
                              {brollIcon}
                            </div>
                            {/* Vertical Stack Kinetic Typography */}
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 6,
                                maxWidth: '92%',
                              }}
                            >
                              {displayStack.map((item, wIdx) => {
                                const wordEntered = currentTime >= item.start;
                                const isHl = wIdx === displayStack.length - 1;
                                return (
                                  <div
                                    key={wIdx}
                                    style={{
                                      opacity: wordEntered ? 1 : 0.25,
                                      transform: wordEntered ? 'translateY(0)' : 'translateY(8px)',
                                      transition: 'all 0.15s ease-out',
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: Math.max(12, (broll.fontSize || DEFAULT_TEXT_SIZE) * 0.34),
                                        fontWeight: 900,
                                        fontFamily: broll.fontFamily || 'Montserrat',
                                        textTransform: 'uppercase',
                                        color: broll.textColor || (isHl ? '#ffffff' : '#0f172a'),
                                        background: isHl ? (broll.accentColor || '#0f172a') : 'transparent',
                                        textShadow: broll.textEffect === 'glow' ? `0 0 10px ${broll.accentColor || '#2563eb'}` : undefined,
                                        padding: isHl ? '3px 14px' : 0,
                                        borderRadius: 8,
                                        boxShadow: isHl ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                                        display: 'inline-block',
                                        lineHeight: 1.1,
                                      }}
                                    >
                                      {item.text}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                            <div
                              style={{
                                width: 44,
                                height: 3,
                                background: '#0f172a',
                                borderRadius: 2,
                                marginTop: 12,
                              }}
                            />
                          </div>
                        );
                      }

                      if (broll.brollStyle === 'red-impact') {
                        return (
                          <div
                            key={broll.id}
                            style={{
                              position: 'absolute',
                              inset: 0,
                              zIndex: 5,
                              background: broll.backgroundColor || 'radial-gradient(circle at center, #ef4444 0%, #991b1b 60%, #450a0a 100%)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '16px 20px',
                              textAlign: 'center',
                              color: broll.textColor || '#fff',
                              fontFamily: broll.fontFamily || 'Montserrat',
                              transform: canvasTransform || undefined,
                              opacity: canvasOpacity,
                              filter: canvasFilter !== 'none' ? canvasFilter : undefined,
                              transition: 'transform 0.08s ease-out, opacity 0.08s ease-out',
                            }}
                          >
                            <div
                              style={{
                                fontSize: 46,
                                lineHeight: 1,
                                marginBottom: 12,
                                filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.6))',
                              }}
                            >
                              {brollIcon}
                            </div>
                            {/* Vertical Stack Kinetic Typography */}
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 6,
                                maxWidth: '92%',
                              }}
                            >
                              {displayStack.map((item, wIdx) => {
                                const wordEntered = currentTime >= item.start;
                                const isHl = wIdx === displayStack.length - 1;
                                return (
                                  <div
                                    key={wIdx}
                                    style={{
                                      opacity: wordEntered ? 1 : 0.25,
                                      transform: wordEntered ? 'translateY(0)' : 'translateY(8px)',
                                      transition: 'all 0.15s ease-out',
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: Math.max(12, (broll.fontSize || DEFAULT_TEXT_SIZE) * 0.34),
                                        fontWeight: 900,
                                        fontFamily: broll.fontFamily || 'Montserrat',
                                        textTransform: 'uppercase',
                                        color: broll.textColor || (isHl ? '#000000' : '#ffffff'),
                                        background: isHl ? (broll.accentColor || '#fef08a') : 'transparent',
                                        padding: isHl ? '3px 14px' : 0,
                                        borderRadius: 8,
                                        boxShadow: isHl ? '0 4px 16px rgba(0,0,0,0.5)' : 'none',
                                        textShadow: broll.textEffect === 'glow' ? `0 0 10px ${broll.accentColor || '#fef08a'}` : isHl ? 'none' : '0 2px 8px rgba(0,0,0,0.8)',
                                        display: 'inline-block',
                                        lineHeight: 1.1,
                                      }}
                                    >
                                      {item.text}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }

                      if (broll.brollStyle === 'black-oled') {
                        return (
                          <div
                            key={broll.id}
                            style={{
                              position: 'absolute',
                              inset: 0,
                              zIndex: 5,
                              background: broll.backgroundColor || '#050608',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '16px 20px',
                              textAlign: 'center',
                              color: broll.textColor || '#fff',
                              fontFamily: broll.fontFamily || 'Montserrat',
                              transform: canvasTransform || undefined,
                              opacity: canvasOpacity,
                              filter: canvasFilter !== 'none' ? canvasFilter : undefined,
                              transition: 'transform 0.08s ease-out, opacity 0.08s ease-out',
                            }}
                          >
                            <div
                              style={{
                                fontSize: 46,
                                lineHeight: 1,
                                marginBottom: 12,
                                filter: 'drop-shadow(0 8px 18px rgba(0,245,200,0.4))',
                              }}
                            >
                              {brollIcon}
                            </div>
                            {/* Vertical Stack Kinetic Typography */}
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 6,
                                maxWidth: '92%',
                              }}
                            >
                              {displayStack.map((item, wIdx) => {
                                const wordEntered = currentTime >= item.start;
                                const isHl = wIdx === displayStack.length - 1;
                                return (
                                  <div
                                    key={wIdx}
                                    style={{
                                      opacity: wordEntered ? 1 : 0.25,
                                      transform: wordEntered ? 'translateY(0)' : 'translateY(8px)',
                                      transition: 'all 0.15s ease-out',
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: Math.max(12, (broll.fontSize || DEFAULT_TEXT_SIZE) * 0.34),
                                        fontWeight: 900,
                                        fontFamily: broll.fontFamily || 'Montserrat',
                                        textTransform: 'uppercase',
                                        color: broll.textColor || (isHl ? '#000000' : '#ffffff'),
                                        background: isHl ? (broll.accentColor || '#00f5c8') : 'transparent',
                                        textShadow: broll.textEffect === 'glow' ? `0 0 10px ${broll.accentColor || '#00f5c8'}` : undefined,
                                        padding: isHl ? '3px 14px' : 0,
                                        borderRadius: 8,
                                        boxShadow: isHl ? '0 0 20px rgba(0,245,200,0.6)' : 'none',
                                        display: 'inline-block',
                                        lineHeight: 1.1,
                                      }}
                                    >
                                      {item.text}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }

                      const isVid =
                        broll.type === 'video' ||
                        broll.src.includes('.mp4') ||
                        broll.src.includes('.webm') ||
                        broll.src.includes('pexels') ||
                        broll.src.includes('video');
                      return (
                        <div
                          key={broll.id}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: 4,
                            overflow: 'hidden',
                            pointerEvents: 'none',
                            transform: canvasTransform || undefined,
                            opacity: canvasOpacity,
                            filter: canvasFilter !== 'none' ? canvasFilter : undefined,
                            transition: 'transform 0.08s ease-out, opacity 0.08s ease-out',
                          }}
                        >
                          {isVid ? (
                            <SyncedBrollPreview
                              src={broll.src}
                              localTime={elapsed}
                              playing={playing}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', scale: 1 + Math.min(1, Math.max(0, elapsed / Math.max(0.1, broll.duration))) * 0.12 }}
                            />
                          ) : (
                            <img
                              src={broll.src}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover', scale: 1 + Math.min(1, Math.max(0, elapsed / Math.max(0.1, broll.duration))) * 0.12 }}
                            />
                          )}
                          {/* Spoken captions use the normal animated subtitle layer above this B-roll. */}
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.65) 100%)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '16px 20px',
                              textAlign: 'center',
                            }}
                          >
                            {brollWords.length === 0 && <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 6,
                                maxWidth: '92%',
                              }}
                            >
                              {displayStack.map((item, wIdx) => {
                                const wordEntered = currentTime >= item.start;
                                const isHl = wIdx === displayStack.length - 1;
                                return (
                                  <div
                                    key={wIdx}
                                    style={{
                                      opacity: wordEntered ? 1 : 0.25,
                                      transform: wordEntered ? 'translateY(0)' : 'translateY(8px)',
                                      transition: 'all 0.15s ease-out',
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: Math.max(12, (broll.fontSize || DEFAULT_TEXT_SIZE) * 0.34),
                                        fontWeight: 900,
                                        fontFamily: broll.fontFamily || 'Montserrat',
                                        textTransform: 'uppercase',
                                        color: broll.textColor || (isHl ? '#000000' : '#ffffff'),
                                        background: isHl ? (broll.accentColor || accentColor || '#00f5c8') : 'transparent',
                                        padding: isHl ? '3px 14px' : 0,
                                        borderRadius: 8,
                                        boxShadow: isHl ? '0 0 20px rgba(0,245,200,0.6)' : 'none',
                                        textShadow: broll.textEffect === 'glow' ? `0 0 10px ${broll.accentColor || accentColor}` : isHl ? 'none' : '0 2px 8px rgba(0,0,0,0.9)',
                                        display: 'inline-block',
                                        lineHeight: 1.1,
                                      }}
                                    >
                                      {item.text}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>}
                          </div>
                        </div>
                      );
                    })}

                    {activeBroll && !isAnyCustomBrollActive && !isAnyMgActive && (
                      <div
                        className={`broll-preview transition-${brollTransition}`}
                        style={{ opacity: activeBrollOpacity }}
                      >
                        <img alt="B-roll automático" src={activeBroll.src} />
                        <span />
                        {activeBrollPage && (
                          <div
                            className={`broll-emphasis ${activeBrollPage.style}`}
                            key={`${activeBroll.start}-${activeBrollPage.index}`}
                          >
                            {activeBrollPage.context && <small>{activeBrollPage.context}</small>}
                            <b
                              style={{
                                color: activeBrollPage.style === 'script' ? '#fff' : accentColor,
                              }}
                            >
                              {activeBrollPage.focus}
                            </b>
                          </div>
                        )}
                      </div>
                    )}

                    {!isAnyTextTemplateBrollActive && !motionGraphicsItems.some(item=>visibleVisualLayer?.kind==='motion' && item.id===visibleVisualLayer.id && motionHidesCaptions(item)) && !isAnyZentryActive && (!activeBroll || isAnyCustomBrollActive) && (
                      <div
                        key={`${previewCaptionSettings.styleId}-${activePreviewCaptionGroup?.startMs ?? 0}`}
                        className={`caption-preview editable-layer ${getCaptionPreset(previewCaptionSettings.styleId).className} ${
                          selectedCanvasLayer === 'captions' ? 'selected' : ''
                        }`}
                        style={
                          {
                            left: `${previewCaptionSettings.positionX}%`,
                            top: `${previewCaptionSettings.positionY}%`,
                            '--caption-font-family': previewMediaBroll?.fontFamily || previewCaptionSettings.captionFontFamily,
                            '--caption-font-size': `${Math.max(10, Math.min(42, (previewMediaBroll?.fontSize || previewCaptionSettings.fontSize) * 0.32))}px`,
                            '--caption-font-weight': previewCaptionSettings.captionFontWeight,
                            '--caption-font-style': previewCaptionSettings.captionItalic ? 'italic' : 'normal',
                            textTransform: getCaptionPreset(previewCaptionSettings.styleId).textTransform,
                            justifyContent:
                              previewCaptionSettings.captionAlign === 'left'
                                ? 'flex-start'
                                : previewCaptionSettings.captionAlign === 'right'
                                ? 'flex-end'
                                : 'center',
                            textAlign: previewCaptionSettings.captionAlign,
                            lineHeight: previewCaptionSettings.styleId === 'rounded' ? 1.08 : 0.98,
                            letterSpacing: previewCaptionSettings.styleId === 'minimal' ? '.06em' : '-.03em',
                          } as CSSProperties
                        }
                        onPointerDown={(event) => startLayerDrag(event, 'captions')}
                        onClick={() => {
                          setSelectedCanvasLayer('captions');
                          setActiveTool('subtitles');
                        }}
                        data-layer-label="SUBTÍTULOS · ARRASTRA PARA MOVER"
                      >
                        {previewCaptions.flatMap((caption, index) => {
                          const active =
                            currentTime * 1000 >= caption.startMs && currentTime * 1000 < caption.endMs;
                          const splitIndex = Math.max(1, Math.ceil(previewCaptions.length / 2));
                          const nodes = [];
                          if ((previewMediaBroll?.dualFont || previewCaptionSettings.dualFontEnabled) && index === splitIndex) {
                            nodes.push(<span aria-hidden="true" key={`line-break-${caption.startMs}`} style={{ flexBasis: '100%', height: 0 }} />);
                          }
                          nodes.push(
                            <span
                              className={active ? 'active-word' : ''}
                              key={`${caption.startMs}-${index}`}
                              style={{
                                ...getPreviewWordStyle(
                                  previewCaptionSettings.styleId,
                                  active,
                                  previewCaptionSettings.accentColor,
                                  previewCaptionSettings.shadow,
                                  previewCaptionSettings.popAnimation
                                ),
                                ...(previewMediaBroll ? {color:active ? (previewMediaBroll.accentColor || '#00f5c8') : (previewMediaBroll.textColor || '#ffffff')} : {}),
                                fontFamily: (previewMediaBroll?.dualFont || previewCaptionSettings.dualFontEnabled)
                                  ? index < splitIndex
                                    ? previewMediaBroll?.topFontFamily || previewCaptionSettings.topFontFamily || 'Pacifico'
                                    : previewMediaBroll?.bottomFontFamily || previewCaptionSettings.bottomFontFamily || 'Anton'
                                  : previewMediaBroll?.fontFamily || previewCaptionSettings.captionFontFamily,
                                textTransform: (previewMediaBroll?.dualFont || previewCaptionSettings.dualFontEnabled) && index < splitIndex ? 'none' : undefined,
                                animation: 'none',
                                transition: 'none',
                                scale: wordPulse(currentTime-caption.startMs/1000,active,previewCaptionSettings.popAnimation),
                              }}
                            >
                              {caption.text.trim()}
                            </span>
                          );
                          return nodes;
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
              {/* Active Motion Graphics preview on canvas */}
              {motionGraphicsItems.filter((mg) => visibleVisualLayer?.kind === 'motion' && visibleVisualLayer.id === mg.id).map(rawMotion => resolveMotionText(rawMotion,captions,currentTime)).map((mg) => {
                const isActive = currentTime >= mg.start && currentTime <= mg.start + mg.duration;
                if (!isActive) return null;
                const is3D =
                  mg.type === '3d-scene' ||
                  mg.style === 'editorial-bw' ||
                  mg.style === 'cinematic-black' ||
                  mg.style === 'photoreal-3d' ||
                  mg.style === 'collage-vintage';

                if (is3D) {
                  const generatedBackground =
                    mg.style === 'cinematic-black'
                      ? 'radial-gradient(circle at 50% 35%, #164e63 0%, #07111b 42%, #020617 100%)'
                      : mg.style === 'photoreal-3d'
                      ? 'linear-gradient(155deg, #0f172a 0%, #1d4ed8 46%, #020617 100%)'
                      : mg.style === 'collage-vintage'
                      ? 'linear-gradient(135deg, #f5deb3 0%, #c08457 45%, #3f2d24 100%)'
                      : 'linear-gradient(145deg, #050505 0%, #262626 52%, #7f1d1d 100%)';

                  const isFloating = mg.displayMode === 'floating';
                  const theme = mg.cardTheme || (mg.highlightTemplate as any) || 'glass';

                  let cardBg = 'rgba(12, 14, 20, 0.92)';
                  let cardBorder = `1.5px solid ${mg.style === 'editorial-bw' ? '#ff2a2a' : accentColor}`;
                  let cardShadow = '0 16px 40px rgba(0,0,0,0.85)';
                  let subColor = mg.style === 'editorial-bw' ? '#fff' : accentColor;
                  let normalTextColor = '#ffffff';
                  let dividerColor = mg.style === 'editorial-bw' ? '#ff2a2a' : accentColor;
                  let badgeBg = '#ff2a2a';
                  let badgeTextColor = '#ffffff';

                  if (theme === 'white') {
                    cardBg = '#ffffff';
                    cardBorder = '2px solid rgba(0,0,0,0.15)';
                    cardShadow = '0 16px 40px rgba(0,0,0,0.45)';
                    subColor = '#666666';
                    normalTextColor = '#111111';
                    dividerColor = '#111111';
                    badgeBg = '#111111';
                    badgeTextColor = '#ffffff';
                  } else if (theme === 'red') {
                    cardBg = 'linear-gradient(135deg, rgba(220,20,60,0.96), rgba(120,0,20,0.98))';
                    cardBorder = '2px solid #ff2a2a';
                    cardShadow = '0 16px 40px rgba(220,20,60,0.4)';
                    subColor = '#ffcdd2';
                    normalTextColor = '#ffffff';
                    dividerColor = '#ffffff';
                    badgeBg = '#ffffff';
                    badgeTextColor = '#dc143c';
                  } else if (theme === 'black') {
                    cardBg = 'linear-gradient(135deg, rgba(8,8,12,0.98), rgba(18,18,24,0.98))';
                    cardBorder = '1.5px solid rgba(255,255,255,0.22)';
                    cardShadow = '0 16px 40px rgba(0,0,0,0.95)';
                    subColor = '#00f5c8';
                    normalTextColor = '#ffffff';
                    dividerColor = '#00f5c8';
                    badgeBg = '#00f5c8';
                    badgeTextColor = '#000000';
                  } else if (theme === 'yellow') {
                    cardBg = 'linear-gradient(135deg, rgba(255,212,0,0.98), rgba(200,160,0,0.99))';
                    cardBorder = '2px solid #ffe600';
                    cardShadow = '0 16px 40px rgba(255,212,0,0.35)';
                    subColor = '#000000';
                    normalTextColor = '#000000';
                    dividerColor = '#000000';
                    badgeBg = '#000000';
                    badgeTextColor = '#ffd400';
                  } else if (theme === 'neon') {
                    cardBg = 'rgba(5, 15, 20, 0.95)';
                    cardBorder = '2px solid #00f5c8';
                    cardShadow = '0 16px 40px rgba(0,245,200,0.3)';
                    subColor = '#00f5c8';
                    normalTextColor = '#ffffff';
                    dividerColor = '#00f5c8';
                    badgeBg = '#00f5c8';
                    badgeTextColor = '#000000';
                  }

                  const mgLocalSec = Math.max(0, currentTime - mg.start);
                  const mgEntrance = Math.min(1, Math.max(0, mgLocalSec / 0.35));
                  const mgExit = Math.min(1, Math.max(0, (mg.start + mg.duration - currentTime) / 0.3));
                  const mgOpacity = Math.min(mgEntrance * 1.5, mgExit * 1.5, 1);
                  const mgDir = mg.entranceTransition || 'slide-up';
                  let mgTransform = '';
                  if (mgDir === 'slide-up') {
                    const ty = (1 - mgEntrance) * 35;
                    mgTransform = `perspective(600px) translateY(${ty}px) scale(${0.9 + 0.1 * mgEntrance})`;
                  } else if (mgDir === 'slide-left') {
                    const tx = (1 - mgEntrance) * -50;
                    mgTransform = `perspective(600px) translateX(${tx}px) scale(${0.9 + 0.1 * mgEntrance})`;
                  } else if (mgDir === 'slide-right') {
                    const tx = (1 - mgEntrance) * 50;
                    mgTransform = `perspective(600px) translateX(${tx}px) scale(${0.9 + 0.1 * mgEntrance})`;
                  } else {
                    mgTransform = `scale(${0.85 + 0.15 * mgEntrance})`;
                  }

                  return (
                    <div
                      key={mg.id}
                      onClick={() => { setSelectedMgId(mg.id); setActiveTool('motion'); }}
                      style={{
                        position: 'absolute',
                        inset: isFloating ? 'auto 8% 22% 8%' : 0,
                        zIndex: 6,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        borderRadius: isFloating ? 16 : 0,
                        background: isFloating ? cardBg : undefined,
                        border: isFloating ? cardBorder : 'none',
                        boxShadow: isFloating ? cardShadow : 'none',
                        backdropFilter: isFloating ? 'blur(12px)' : undefined,
                        padding: isFloating ? '14px 10px' : 0,
                        transform: mgTransform,
                        opacity: mgOpacity,
                      }}
                    >
                      {!isFloating && (
                        <>
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background: generatedBackground,
                            }}
                          />
                          <div style={{ position: 'absolute', width: '72%', aspectRatio: '1', borderRadius: '50%', left: '-24%', top: '14%', background: 'radial-gradient(circle, rgba(255,255,255,.2), transparent 68%)' }} />
                        </>
                      )}
                      <div
                        style={{
                          position: 'relative',
                          zIndex: 2,
                          width: '88%',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <MotionSceneObjects item={mg} time={currentTime} scale={canvasWidth/outputSize.width} accent={accentColor}/>
                        {mg.subtitle &&
                          !mg.subtitle.toLowerCase().includes('profesional') &&
                          !mg.subtitle.toLowerCase().includes('contenido') &&
                          !mg.subtitle.toLowerCase().includes('asegurada') && (
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                color: subColor,
                                textShadow: theme === 'white' || theme === 'yellow' ? 'none' : '0 2px 8px #000',
                              }}
                            >
                              {mg.subtitle}
                            </span>
                          )}
                        <div
                          style={{
                            width: '55%',
                            height: 2,
                            background: dividerColor,
                            borderRadius: 2,
                            margin: '2px 0',
                          }}
                        />
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '4px 6px',
                            lineHeight: 1.1,
                          }}
                        >
                          {mg.dualFont ? <AnimatedMotionText item={mg} time={currentTime} scale={canvasWidth/outputSize.width} color={normalTextColor} accent={accentColor} /> : (mg.title || '').split(/\s+/).map((w, wIdx) => {
                            const isBracket = w.startsWith('[') && w.endsWith(']');
                            const clean = isBracket ? w.slice(1, -1) : w;
                            const isHighlight =
                              isBracket ||
                              (mg.highlightWord && clean.toLowerCase().includes(mg.highlightWord.toLowerCase()));

                            if (isHighlight) {
                              return (
                                <span
                                  key={wIdx}
                                  style={{
                                    background: badgeBg,
                                    color: badgeTextColor,
                                    fontWeight: 900,
                                    fontSize: (mg.fontSize ?? DEFAULT_TEXT_SIZE)*canvasWidth/outputSize.width,
                                    padding: '2px 8px',
                                    borderRadius: 6,
                                    textTransform: 'uppercase',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
                                  }}
                                >
                                  {clean}
                                </span>
                              );
                            }
                            return (
                              <span
                                key={wIdx}
                                style={{
                                  color: normalTextColor,
                                  fontSize: (mg.fontSize ?? DEFAULT_TEXT_SIZE)*canvasWidth/outputSize.width,
                                  fontWeight: 900,
                                  textTransform: 'uppercase',
                                  textShadow: theme === 'white' || theme === 'yellow' ? 'none' : '0 2px 8px #000',
                                }}
                              >
                                {clean}
                              </span>
                            );
                          })}
                        </div>
                        <div
                          style={{
                            width: '35%',
                            height: 2,
                            background: dividerColor,
                            borderRadius: 2,
                            margin: '2px 0',
                          }}
                        />
                        {mg.value && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              color: theme === 'white' || theme === 'yellow' ? '#000' : '#fff',
                              background: theme === 'white' ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.6)',
                              padding: '2px 8px',
                              borderRadius: 4,
                            }}
                          >
                            {mg.value}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }

                const isApple = mg.style === 'apple';
                const isNeon = mg.style === 'neon';
                const isEditorial = mg.style === 'editorial';
                return (
                  <div
                    key={mg.id}
                    onClick={() => { setSelectedMgId(mg.id); setActiveTool('motion'); }}
                    style={{
                      position: 'absolute',
                      left: `${mg.positionX ?? 50}%`,
                      top: `${mg.positionY ?? 50}%`,
                      transform: 'translate(-50%, -50%)',
                      maxWidth: '85%',
                      minWidth: '60%',
                      padding: '10px 14px',
                      borderRadius: isApple ? 14 : isNeon ? 10 : 6,
                      background: isApple ? 'rgba(18, 20, 29, 0.88)' : isNeon ? 'rgba(10, 12, 18, 0.95)' : '#ffffff',
                      color: isEditorial ? '#000' : '#fff',
                      border: isApple ? '1px solid rgba(255,255,255,0.2)' : isNeon ? `1.5px solid ${accentColor}` : '2px solid #000',
                      boxShadow: isNeon ? `0 0 16px ${accentColor}66` : '0 8px 24px rgba(0,0,0,0.6)',
                      backdropFilter: 'blur(10px)',
                      textAlign: 'center',
                      zIndex: 6,
                      cursor: 'pointer',
                    }}
                  >
                    {mg.type === 'stat' && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', opacity: 0.75 }}>{mg.title}</span>
                        <span style={{ fontSize: 24, fontWeight: 900, color: isNeon ? accentColor : isEditorial ? '#000' : '#fff' }}>{mg.value || '+340%'}</span>
                        {mg.subtitle && <span style={{ fontSize: 9, opacity: 0.8 }}>{mg.subtitle}</span>}
                      </div>
                    )}
                    {mg.type === 'notif' && (
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, fontWeight: 800 }}>
                          <span>🔔 {mg.title}</span>
                          <span style={{ opacity: 0.5 }}>{mg.subtitle || 'Ahora'}</span>
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, marginTop: 2 }}>{mg.value}</div>
                      </div>
                    )}
                    {mg.type === 'apps' && (
                      <div>
                        <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase' }}>{mg.title}</span>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 4, fontSize: 14 }}>
                          <span>🤖</span><span>✦</span><span>📝</span><span>⚡</span>
                        </div>
                      </div>
                    )}
                    {mg.type === 'checklist' && (
                      <div style={{ textAlign: 'left', fontSize: 9 }}>
                        <b style={{ textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>{mg.title}</b>
                        <div style={{ color: '#00f5c8' }}>✓ {mg.value}</div>
                        {mg.subtitle && <div style={{ color: '#00f5c8' }}>✓ {mg.subtitle}</div>}
                      </div>
                    )}
                    {mg.type === 'progress' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 800 }}>
                          <span>{mg.title}</span>
                          <span style={{ color: accentColor }}>{mg.value || '92%'}</span>
                        </div>
                        <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 4, marginTop: 3 }}>
                          <div style={{ width: '92%', height: '100%', background: accentColor, borderRadius: 4 }} />
                        </div>
                      </div>
                    )}
                    {mg.type === 'quote' && (
                      <div style={{ fontStyle: 'italic', fontSize: 10 }}>
                        “{mg.value}”
                        {mg.title && <small style={{ display: 'block', marginTop: 2, fontStyle: 'normal', fontWeight: 700 }}>— {mg.title}</small>}
                      </div>
                    )}
                    {mg.type === 'alert' && (
                      <div style={{ textAlign: 'left', fontSize: 9 }}>
                        <span style={{ color: '#ff3b30', fontWeight: 900 }}>⚠️ {mg.title}</span>
                        <div style={{ fontWeight: 700 }}>{mg.value}</div>
                      </div>
                    )}
                    {mg.type === 'pill' && (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>
                        <span style={{ background: accentColor, color: '#000', padding: '2px 6px', borderRadius: 999, fontWeight: 800 }}>{mg.title}</span>
                        <b>{mg.value}</b>
                      </div>
                    )}
                  </div>
                );
              })}
              {/* Active Zentry Motion & Typography templates preview on canvas (Scaled 1080x1920) */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: outputSize.width,
                  height: outputSize.height,
                  transform: `scale(${canvasWidth / outputSize.width})`,
                  transformOrigin: 'top left',
                  pointerEvents: 'none',
                  zIndex: 10,
                  overflow: 'hidden',
                }}
              >
                 {zentryItems.filter((item) => visibleVisualLayer?.kind === 'zentry' && visibleVisualLayer.id === item.id).map((item) => {
                  const isActive = currentTime >= item.start && currentTime < item.start + item.duration;
                  if (!isActive) return null;
                  const tpl = getZentryTemplate(item.presetId);
                  if (!tpl) return null;
                  const VisualComp = tpl.visualComponent;
                  const localSec = currentTime - item.start;
                  const overrideFrame = Math.max(0, Math.round(localSec * outputFps));

                  return (
                    <div
                      key={item.id}
                      data-zentry-canvas-item={item.id}
                      onPointerDown={event => startZentryCanvasDrag(event,item)}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        ...getZentryLayout(item,outputSize.width,outputSize.height),
                        pointerEvents: selectedZentryId === item.id ? 'auto' : 'none',
                        touchAction: 'none',
                        cursor: selectedZentryId === item.id ? 'move' : undefined,
                      }}
                    >
                      <ZentryTextSizeContext.Provider value={item.fontSize ?? DEFAULT_TEXT_SIZE}><VisualComp
                        {...(tpl.defaultProps || {})}
                        {...getZentryVisualProps(item)}
                        fontSize={item.fontSize ?? DEFAULT_TEXT_SIZE}
                        fontVariant={item.fontVariant || 'montserrat'}
                        overrideFrame={overrideFrame}
                      /></ZentryTextSizeContext.Provider>
                    </div>
                  );
                })}
              </div>
              {!videoUrl && <button className="canvas-upload" onClick={() => inputRef.current?.click()} type="button"><b>＋</b><span>Sube tu video</span><small>MP4, MOV o WebM · máximo 3 min</small></button>}
              {showWatermark && (
                <div
                  className="watermark-overlay"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    opacity: 0.78,
                    zIndex: 8,
                    userSelect: 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 14px',
                      background: 'rgba(9, 9, 9, 0.75)',
                      border: '1px solid rgba(255, 42, 42, 0.65)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.85), 0 0 14px rgba(255,42,42,0.3)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <span
                      style={{
                        color: '#ffffff',
                        fontWeight: 950,
                        fontSize: '13px',
                        letterSpacing: '0.06em',
                        fontFamily: 'Anton, Inter, sans-serif',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ZENTRY <span style={{ color: '#ff2a2a' }}>STUDIO</span> <span style={{ color: '#d7ad55' }}>VIP</span>
                    </span>
                  </div>
                  <span
                    style={{
                      color: '#ffffff',
                      fontSize: '7px',
                      fontWeight: 800,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      background: 'rgba(0,0,0,0.6)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      textShadow: '0 1px 3px #000',
                    }}
                  >
                    PLAN FREE
                  </span>
                </div>
              )}

              <div className="safe-zone"><span>ZONA SEGURA</span></div>
            </div>
          </div>
          <div className="playback-bar">
            <button className="step-button" onClick={() => seekTo(editSegments[0]?.start ?? 0)} type="button">|◀</button>
            <button className="play-button" onClick={togglePlayback} disabled={!videoUrl} type="button">{playing ? 'Ⅱ' : '▶'}</button>
            <button className="step-button" onClick={() => seekTo(editSegments[editSegments.length-1]?.end ?? duration)} type="button">▶|</button>
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            <button className={muted ? 'volume-button muted' : 'volume-button'} onClick={() => setMuted((value) => !value)} type="button">{muted ? 'MUTE' : '◖))'}</button>
            <button
              className={`mobile-timeline-pill ${activeTool === 'timeline' ? 'active' : ''}`}
              onClick={() => setActiveTool((curr) => (curr === 'timeline' ? 'subtitles' : 'timeline'))}
              type="button"
              aria-label="Alternar modo línea de tiempo"
            >
              {activeTool === 'timeline' ? '🎨 Opciones' : '⏱️ Timeline'}
            </button>
          </div>
        </section>

        <aside className="right-panel">
          {inspectorMode === 'video' && selectedSegment ? <div className="clip-inspector">
            <div className="right-heading"><div><span className="eyebrow">CLIP SELECCIONADO</span><h2>Configuración del video</h2></div><button type="button" onClick={() => setInspectorMode('design')} aria-label="Volver a diseño">×</button></div>
            <div className="clip-inspector-tabs"><button type="button" className={videoInspectorTab === 'video' ? 'active' : ''} onClick={() => setVideoInspectorTab('video')}>Video</button><button type="button" className={videoInspectorTab === 'audio' ? 'active' : ''} onClick={() => setVideoInspectorTab('audio')}>Audio del video</button></div>
            <p className="tool-note">{selectedSegment.title || 'Video'} · {formatTime(selectedSegment.end-selectedSegment.start)}</p>
            <label className="tool-toggle"><span><b>Aplicar a todos los clips</b><small>El mismo ajuste para cada fragmento de video</small></span><input aria-label="Aplicar ajustes a todos los clips" type="checkbox" checked={applyVideoToAll} onChange={(event) => setApplyVideoToAll(event.target.checked)} /></label>
            {videoInspectorTab === 'video' ? <>
              <label className="range-field"><span><b>Brillo</b><em>{Math.round((selectedSegment.brightness ?? 1)*100)}%</em></span><input aria-label="Brillo del video" type="range" min="0.5" max="1.5" step="0.01" value={selectedSegment.brightness ?? 1} onPointerDown={checkpoint} onChange={(event) => updateSelectedVideo({brightness:Number(event.target.value)})} /></label>
              <label className="range-field"><span><b>Contraste</b><em>{Math.round((selectedSegment.contrast ?? 1)*100)}%</em></span><input aria-label="Contraste del video" type="range" min="0.5" max="1.5" step="0.01" value={selectedSegment.contrast ?? 1} onPointerDown={checkpoint} onChange={(event) => updateSelectedVideo({contrast:Number(event.target.value)})} /></label>
              <label className="range-field"><span><b>Saturación</b><em>{Math.round((selectedSegment.saturation ?? 1)*100)}%</em></span><input aria-label="Saturación del video" type="range" min="0" max="2" step="0.01" value={selectedSegment.saturation ?? 1} onPointerDown={checkpoint} onChange={(event) => updateSelectedVideo({saturation:Number(event.target.value)})} /></label>
              <label className="range-field"><span><b>Nitidez</b><em>{Math.round((selectedSegment.sharpness ?? 0)*100)}%</em></span><input aria-label="Nitidez del video" type="range" min="0" max="1" step="0.01" value={selectedSegment.sharpness ?? 0} onPointerDown={checkpoint} onChange={(event) => updateSelectedVideo({sharpness:Number(event.target.value)})} /></label>
              <button type="button" className="secondary-tool" onClick={() => {checkpoint();updateSelectedVideo({brightness:1,contrast:1,saturation:1,sharpness:0});}}>Restablecer imagen</button>
            </> : <>
              <label className="tool-toggle"><span><b>Silenciar clip</b><small>Solo el audio de este video</small></span><input aria-label="Silenciar clip de video" type="checkbox" checked={Boolean(selectedSegment.clipMuted)} onChange={(event) => {checkpoint();updateSelectedVideo({clipMuted:event.target.checked});}} /></label>
              <label className="range-field"><span><b>Volumen del clip</b><em>{Math.round((selectedSegment.clipVolume ?? 1)*100)}%</em></span><input aria-label="Volumen del clip de video" type="range" min="0" max="1" step="0.01" value={selectedSegment.clipVolume ?? 1} onPointerDown={checkpoint} onChange={(event) => updateSelectedVideo({clipVolume:Number(event.target.value)})} /></label>
              <button type="button" className="secondary-tool" disabled={clipAudioProcessing.endsWith('…')} onClick={processSelectedVideoAudio}>{selectedSegment.processedAudioSrc ? '↻ Reprocesar ruido de fondo' : 'Reducir ruido de fondo'}</button>
              {selectedSegment.processedAudioSrc && <button type="button" className="secondary-tool" onClick={() => {checkpoint();updateSelectedVideo({processedAudioSrc:undefined});setClipAudioProcessing('');}}>Quitar reducción de ruido</button>}
              {clipAudioProcessing && <p className="tool-note" role="status">{clipAudioProcessing}</p>}
              <details className="editor-help"><summary>Sobre la reducción de ruido</summary><p>Se procesa al pulsar el botón, antes de exportar. Atenúa ruido en pausas y frecuencias fuera de la voz; no realiza aislamiento completo de voz.</p></details>
            </>}
          </div> : <>
          <div className="right-heading"><div><span className="eyebrow">DISEÑO</span><h2>Estilo de subtítulos</h2></div><button aria-label="Deshacer cambio de diseño" disabled={!historyState.undo} onClick={undo} type="button">↶</button></div>
          <div className={`selected-style-preview ${selectedStyle.className}`}><small>ESTILO ACTIVO</small><b>{selectedStyle.sample[0]}</b><b style={{color:selectedStyle.accent}}>{selectedStyle.sample[1]}</b><span>{selectedStyle.name}</span></div>

          {/* Plantillas Maestras ViroEdit en formato mini compacto */}
          <div className="viro-mini-right-bar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <span style={{ fontSize: 9, fontWeight: 950, color: '#ff2a2a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                PLANTILLAS MAESTRAS (1-CLIC)
              </span>
              <span style={{ fontSize: 8.5, color: '#00f5c8', fontWeight: 800 }}>⚡ VIRO PRO</span>
            </div>
            <div className="viro-mini-grid">
              {VIRO_MASTER_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  className="viro-mini-card"
                  onClick={() => applyMasterTemplate(tmpl.id)}
                  title={`Aplicar plantilla ${tmpl.name}`}
                >
                  <div className="viro-mini-header">
                    <span className="viro-mini-badge">{tmpl.badge}</span>
                    <span className="viro-mini-icon">{tmpl.icon}</span>
                  </div>
                  <strong className="viro-mini-title">{tmpl.name}</strong>
                  <small className="viro-mini-desc">{tmpl.desc}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="style-grid">
            {CAPTION_PRESETS.map((style) => (
              <button className={captionEditorValues.styleId === style.id ? 'style-card active' : 'style-card'} aria-pressed={captionEditorValues.styleId === style.id} key={style.id} onClick={() => selectStyle(style.id)} type="button">
                <span className={`style-sample ${style.className}`}><b>{style.sample[0]}</b><b style={{ color: style.accent }}>{style.sample[1]}</b></span>
                <span className="style-name">{style.name}{style.id === 'personal' && <em>PREDETERMINADO</em>}</span>
              </button>
            ))}
          </div>
          <button className="all-styles" type="button">{CAPTION_PRESETS.length} estilos incluidos <span>✓</span></button>
          <div className="property-section" style={{ display: 'grid', gap: 8 }}>
            <div className="section-title">
              <b>Edición por grupo</b>
              <span>{selectedCaptionGroup ? `Grupo ${captionGroups.findIndex((group) => group.startMs === selectedCaptionGroup.startMs) + 1}` : 'Todos los subtítulos'}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button type="button" onClick={() => setSelectedCaptionGroupStartMs(null)}>Editar todos</button>
              <button type="button" disabled={!selectedCaptionGroup} onClick={applyCurrentStyleToSelectedGroup}>Aplicar ajustes a este grupo</button>
              <button type="button" onClick={saveCurrentCaptionTemplate}>Guardar como plantilla</button>
              {selectedCaptionGroup && activeCaptionGroupStyle && (
                <button
                  type="button"
                  onClick={() => setCaptionGroupStyles((current) => current.filter((style) => style.startMs !== selectedCaptionGroup.startMs))}
                >
                  Quitar estilo del grupo
                </button>
              )}
            </div>
            {savedCaptionTemplates.length > 0 && (
              <div style={{ display: 'grid', gap: 5 }}>
                {savedCaptionTemplates.map((template) => (
                  <div key={template.id} style={{ display: 'flex', gap: 5 }}>
                    <button type="button" style={{ flex: 1 }} onClick={() => applyCaptionTemplateValues(template)}>{template.name}</button>
                    <button type="button" aria-label={`Eliminar plantilla ${template.name}`} onClick={() => deleteSavedCaptionTemplate(template.id)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="property-section font-controls">
            <div className="section-title"><b>Tipografía</b><span>{selectedCaptionGroup ? 'Solo este grupo' : 'Todos'} · {captionEditorValues.captionFontFamily}</span></div>
            <select aria-label="Tipo de letra" value={FONT_OPTIONS.find((font) => captionEditorValues.captionFontFamily === font || captionEditorValues.captionFontFamily.startsWith(`${font},`)) || captionEditorValues.captionFontFamily} onChange={(event) => updateCaptionEditorValues({ captionFontFamily: event.target.value })} style={{fontFamily:captionEditorValues.captionFontFamily}}>{FONT_OPTIONS.map((font) => <option value={font} key={font} style={{fontFamily:font}}>{font}</option>)}</select>
            <div className="property-row">
              <button aria-label="Negrita de subtítulos" aria-pressed={captionEditorValues.captionFontWeight >= 700} className={captionEditorValues.captionFontWeight >= 700 ? 'active' : ''} onClick={() => updateCaptionEditorValues({ captionFontWeight: captionEditorValues.captionFontWeight >= 700 ? 400 : 900 })} type="button"><b>B</b></button>
              <button aria-label="Cursiva de subtítulos" aria-pressed={captionEditorValues.captionItalic} className={captionEditorValues.captionItalic ? 'active' : ''} onClick={() => updateCaptionEditorValues({ captionItalic: !captionEditorValues.captionItalic })} type="button"><i>I</i></button>
              <button aria-label={`Cambiar alineación de subtítulos: ${captionEditorValues.captionAlign}`} onClick={() => updateCaptionEditorValues({ captionAlign: captionEditorValues.captionAlign === 'center' ? 'left' : captionEditorValues.captionAlign === 'left' ? 'right' : 'center' })} title={`Alineación: ${captionEditorValues.captionAlign}`} type="button">{captionEditorValues.captionAlign === 'left' ? '≡←' : captionEditorValues.captionAlign === 'right' ? '→≡' : '≡'}</button>
              <label>Tamaño<input min="28" max="140" type="number" value={captionEditorValues.fontSize} onChange={(event) => updateCaptionEditorValues({ fontSize: Math.max(28,Math.min(140,Number(event.target.value))) })} /></label>
            </div>
            <label className="font-size-slider"><span>Pequeño</span><input aria-label="Tamaño de subtítulos" min="28" max="140" type="range" value={captionEditorValues.fontSize} onChange={(event) => updateCaptionEditorValues({ fontSize: Number(event.target.value) })} /><span>Grande</span></label>
            <label className="tool-toggle" style={{ marginTop: 8 }}><span><b>Doble tipografía</b></span><input aria-label="Activar doble tipografía" type="checkbox" checked={captionEditorValues.dualFontEnabled ?? false} onChange={(event) => updateCaptionEditorValues({ dualFontEnabled: event.target.checked })} /></label>
            {(captionEditorValues.dualFontEnabled ?? false) && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 7 }}>
              <label className="field-label">Arriba<select aria-label="Fuente superior" value={captionEditorValues.topFontFamily || 'Great Vibes'} onChange={(event) => updateCaptionEditorValues({ topFontFamily: event.target.value })}>{FONT_OPTIONS.map((font) => <option value={font} key={`top-${font}`}>{font}</option>)}</select></label>
              <label className="field-label">Abajo<select aria-label="Fuente inferior" value={captionEditorValues.bottomFontFamily || 'Playfair Display'} onChange={(event) => updateCaptionEditorValues({ bottomFontFamily: event.target.value })}>{FONT_OPTIONS.map((font) => <option value={font} key={`bottom-${font}`}>{font}</option>)}</select></label>
            </div>}
          </div>
          <div className="property-section"><div className="section-title"><b>Posición</b><span>Arrastra el texto sobre el video</span></div><div className="position-readout"><span>X {Math.round(captionEditorValues.positionX)}%</span><span>Y {Math.round(captionEditorValues.positionY)}%</span><button onClick={() => updateCaptionEditorValues({ positionX: DEFAULT_CAPTION_POSITION.x, positionY: DEFAULT_CAPTION_POSITION.y })} type="button">Restablecer</button></div></div>
          <div className="property-section"><div className="section-title"><b>Palabra activa</b><span className="color-dot" style={{background:captionEditorValues.accentColor}} /></div><div className="color-swatches">{['#00f5c8','#ff6b00','#ffd500','#ff305f','#ffffff'].map((color) => <button aria-label={`Color ${color}`} className={captionEditorValues.accentColor === color ? 'selected' : ''} key={color} onClick={() => updateCaptionEditorValues({ accentColor: color })} style={{ background:color }} type="button" />)}</div></div>
          <div className="property-section toggles"><label><span><b>Animación pop</b><small>Entrada dinámica por palabra</small></span><input aria-label="Animación pop" type="checkbox" checked={captionEditorValues.popAnimation} onChange={(event) => updateCaptionEditorValues({ popAnimation: event.target.checked })} /></label><label><span><b>Sombra</b><small>Mejora la lectura</small></span><input aria-label="Sombra de subtítulos" type="checkbox" checked={captionEditorValues.shadow} onChange={(event) => updateCaptionEditorValues({ shadow: event.target.checked })} /></label></div>
          </>}
        </aside>
      </section>

      <section className="timeline">
        <div className="timeline-top">
          <div className="timeline-actions">
            <button aria-label="Deshacer" disabled={!historyState.undo} onClick={undo} type="button">↶</button>
            <button aria-label="Rehacer" disabled={!historyState.redo} onClick={redo} type="button">↷</button>
            <span />
            <button onClick={cutAtPlayhead} type="button">✂ Cortar</button>
            <button onClick={() => void detectSilences()} type="button">▱ Silencios</button>
            <button type="button" title="Mostrar los audios subidos sin salir del editor" onClick={() => { timelineBodyRef.current?.scrollTo({top:timelineContentHeight,behavior:'smooth'}); setActiveTool('audio'); }}>♫ Ver audios</button>
            <button className="timeline-add-clip" onClick={() => secondaryInputRef.current?.click()} disabled={new Set(editSegments.map((segment) => segment.src)).size >= 12} type="button" title="Añadir video completo (hasta 12 videos)">
              {new Set(editSegments.map((segment) => segment.src)).size >= 12 ? 'Máx. 12 videos' : `＋ Añadir Clip (${new Set(editSegments.map((segment) => segment.src)).size}/12)`}
            </button>
            <button
              className="timeline-delete-btn"
              onClick={handleDeleteSelectedObject}
              type="button"
              title="Eliminar objeto seleccionado (Clip, B-roll, Motion Graphic, Subtítulo o Zentry)"
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.45)',
                color: '#fca5a5',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'all 0.15s ease',
              }}
            >
              🗑 Eliminar
            </button>
            <button
              className="timeline-update-btn"
              onClick={() => handleUpdateSelectedObject()}
              type="button"
              title="Actualizar objeto seleccionado con el audio, texto y ajustes actuales"
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.45)',
                color: '#93c5fd',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'all 0.15s ease',
              }}
            >
              🔄 Actualizar
            </button>
            {selectedSegment && editSegments.length > 1 && <button onClick={() => deleteSegment(selectedSegment.id)} type="button">× Eliminar clip</button>}
          </div>
          <div className="timeline-zoom">
            <button onClick={() => setTimelineZoom((value) => Math.max(32,value-8))} type="button">−</button>
            <input aria-label="Zoom de la línea de tiempo" min="32" max="100" type="range" value={timelineZoom} onChange={(event) => setTimelineZoom(Number(event.target.value))} />
            <button onClick={() => setTimelineZoom((value) => Math.min(100,value+8))} type="button">＋</button>
          </div>
        </div>
        <div className="timeline-body" ref={timelineBodyRef}><div className="track-labels"><span title="Subtítulos" style={{height:captionTrackHeight,display:captionTrackHeight ? undefined : 'none'}}>CC<small>Texto</small></span><span title="B-roll" style={{height:brollTrackHeight,display:brollTrackHeight ? undefined : 'none'}}>▣<small>B-roll</small></span><span title="Motion y Zentry Motion" style={{height:motionTrackHeight,display:motionTrackHeight ? undefined : 'none'}}>✦<small>Motion</small></span><span title="Clips de video" style={{height:48}}>▶<small>Video</small></span><span title="Efectos de sonido" style={{height:36}}>〰<small>SFX</small></span><span title="Audios y música subidos" style={{height:musicTrackHeight,display:musicTrackHeight ? undefined : 'none'}}>♫<small>Audio</small></span></div><div className="tracks-scroll" style={{height:timelineContentHeight}}><div className="tracks" ref={timelineTrackRef} style={{width:`${Math.max(100,timelineZoom*2.4)}%`}}>
          <button className="ruler" onPointerDown={startPlayheadDrag} type="button" aria-label="Arrastrar cabezal de reproducción">{Array.from({length:5}).map((_,index) => <span key={index}>{formatTime((duration/4)*index)}</span>)}</button>
          <div className="caption-track" style={{display:captionTrackHeight ? undefined : 'none'}}>{captionGroups.map((group,index) => <input aria-label={`Subtítulo de la línea de tiempo ${index+1}`} key={`${group.startMs}-${index}`} value={group.text} onFocus={() => { setSelectedCaptionGroupStartMs(group.startMs); setSelectedBrollId(null); setSelectedMgId(null); setSelectedZentryId(null); seekTo(group.startMs/1000); }} onChange={(event) => updateCaptionGroup(index,event.target.value)} style={{left:`${(group.startMs/Math.max(1,duration*1000))*100}%`,width:`${Math.max(1.2,((group.endMs-group.startMs)/Math.max(1,duration*1000))*100)}%`}} />)}</div>
          <div className="broll-track" style={{height:brollTrackHeight,display:brollTrackHeight ? undefined : 'none'}}>
            {customBrolls.map((b) => {
              const leftPct = (b.start / Math.max(0.1, duration)) * 100;
              const widthPct = (b.duration / Math.max(0.1, duration)) * 100;
              const isSelected = selectedBrollId === b.id;
              return (
                <button
                  key={b.id}
                  className={`timeline-broll-clip ${isSelected ? 'selected' : ''}`}
                  title={`${b.title || 'B-Roll'} (${b.start.toFixed(1)}s - ${(b.start + b.duration).toFixed(1)}s)`}
                  onClick={() => {
                    setSelectedBrollId(b.id);
                    setSelectedMgId(null);
                    setSelectedZentryId(null);
                    setSelectedSegmentId(null); setSelectedMusicId(null); setSelectedCaptionGroupStartMs(null);
                    seekTo(b.start + Math.min(0.4,b.duration*0.15));
                    setActiveTool('broll');
                  }}
                  style={{
                     left: `${leftPct}%`,
                     width: `${Math.max(2.5, widthPct)}%`,
                     top:3+(brollLanes.lanes.get(b.id) || 0)*30,
                     bottom:'auto', height:24,
                  }}
                  type="button"
                >
                  <span>{b.type === 'video' ? '🎬' : '🖼️'}</span>
                  <span>{b.title || 'OVERLAY'}</span>
                </button>
              );
            })}
          </div>
          <div className="motion-track" style={{height:motionTrackHeight,display:motionTrackHeight ? undefined : 'none'}}>
            {motionGraphicsItems.map((mg) => {
              const leftPct = (mg.start / Math.max(0.1, duration)) * 100;
              const widthPct = (mg.duration / Math.max(0.1, duration)) * 100;
              return (
                <div
                  key={mg.id}
                  className={`timeline-mg-clip ${selectedMgId === mg.id ? 'selected' : ''}`}
                   style={{ left: `${leftPct}%`, width: `${Math.max(2.5, widthPct)}%`, top:3+(motionLanes.lanes.get(mg.id) || 0)*30, bottom:'auto', height:24, cursor: 'grab' }}
                  onClick={() => { setSelectedMgId(mg.id); setSelectedBrollId(null); setSelectedZentryId(null); setSelectedSegmentId(null); setSelectedMusicId(null); setSelectedCaptionGroupStartMs(null); seekTo(mg.start); setActiveTool('motion'); }}
                  onPointerDown={(event) => startMgDrag(event, mg.id)}
                  title={`${mg.title || mg.type} (${mg.start.toFixed(1)}s - ${(mg.start + mg.duration).toFixed(1)}s)`}
                >
                  <button
                    className="trim-handle start"
                    aria-label="Recortar inicio"
                    onPointerDown={(event) => startMgTrim(event, mg.id, 'start')}
                    type="button"
                  />
                  <span>⚡</span>
                  <b>{mg.title || mg.type.toUpperCase()}</b>
                  <button
                    className="trim-handle end"
                    aria-label="Recortar final"
                    onPointerDown={(event) => startMgTrim(event, mg.id, 'end')}
                    type="button"
                  />
                </div>
              );
            })}
            {zentryItems.map((zi) => {
              const tpl = getZentryTemplate(zi.presetId);
              const leftPct = (zi.start / Math.max(0.1, duration)) * 100;
              const widthPct = (zi.duration / Math.max(0.1, duration)) * 100;
              const isSelected = selectedZentryId === zi.id;
              const bgGradient =
                zi.category === 'broll' ? 'linear-gradient(135deg, #10b981, #047857)' :
                zi.category === 'hooks' ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                zi.category === 'subtitles' ? 'linear-gradient(135deg, #06b6d4, #0891b2)' :
                zi.category === 'typography' ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' :
                'linear-gradient(135deg, #ec4899, #be185d)';

              return (
                <div
                  key={zi.id}
                  className={`timeline-mg-clip ${isSelected ? 'selected' : ''}`}
                  style={{
                    left: `${leftPct}%`,
                     width: `${Math.max(2.5, widthPct)}%`,
                     top:3+(motionLanes.lanes.get(zi.id) || 0)*30,
                     bottom:'auto', height:24,
                    cursor: 'grab',
                    background: bgGradient,
                    borderColor: isSelected ? '#00f5c8' : 'rgba(255,255,255,0.3)',
                    boxShadow: isSelected ? '0 0 12px rgba(0,245,200,0.6)' : 'none',
                  }}
                  onClick={() => {
                    setSelectedZentryId(zi.id);
                    setSelectedBrollId(null);
                    setSelectedMgId(null);
                    setSelectedSegmentId(null); setSelectedMusicId(null); setSelectedCaptionGroupStartMs(null);
                    seekTo(zi.start);
                    setActiveTool('zentry-motion');
                  }}
                  onPointerDown={(event) => startZentryDrag(event, zi.id)}
                  title={`${tpl?.name || zi.presetId} (${zi.start.toFixed(1)}s - ${(zi.start + zi.duration).toFixed(1)}s) · SFX: ${zi.sfxEnabled ? 'ON' : 'OFF'}`}
                >
                  <button
                    className="trim-handle start"
                    aria-label="Recortar inicio"
                    onPointerDown={(event) => startZentryTrim(event, zi.id, 'start')}
                    type="button"
                  />
                  <span>{zi.category === 'broll' ? '▣' : zi.category === 'hooks' ? '⚡' : zi.category === 'typography' ? 'Aa' : '✦'}</span>
                  <b>{tpl?.name?.slice(0, 16) || zi.presetId}</b>
                  {zi.sfxEnabled && <span style={{ fontSize: 9, opacity: 0.9 }}>♫</span>}
                  <button
                    type="button"
                    aria-label={`Actualizar plantilla ${tpl?.name || zi.presetId}`}
                    onClick={(event) => { event.stopPropagation(); setSelectedZentryId(zi.id); handleUpdateSelectedObject(undefined, zi.id); }}
                    style={{ border: 0, background: 'transparent', color: '#dbeafe', cursor: 'pointer', fontSize: 9 }}
                  >↻</button>
                  <button
                    type="button"
                    aria-label={`Eliminar plantilla ${tpl?.name || zi.presetId}`}
                    onClick={(event) => { event.stopPropagation(); deleteZentryItem(zi.id); }}
                    style={{ border: 0, background: 'transparent', color: '#fecaca', cursor: 'pointer', fontSize: 9 }}
                  >×</button>
                  <button
                    className="trim-handle end"
                    aria-label="Recortar final"
                    onPointerDown={(event) => startZentryTrim(event, zi.id, 'end')}
                    type="button"
                  />
                </div>
              );
            })}
          </div>
          <div className="video-track">{editSegments.map((segment, index) => {
            const isSecondary = index > 0;
            const segTimelineStart = segment.timelineStart !== undefined ? segment.timelineStart : segment.start;
            const segTimelineWidth = segment.end - segment.start;
            const leftPct = (segTimelineStart / Math.max(0.1, duration)) * 100;
            const widthPct = (segTimelineWidth / Math.max(0.1, duration)) * 100;
            const clipSrc = segment.src || videoUrl;
            return (
              <div 
                className={`${selectedSegmentId === segment.id ? 'timeline-video-clip selected' : 'timeline-video-clip'} ${isSecondary ? 'secondary' : ''}`} 
                key={segment.id} 
                onClick={() => { setSelectedSegmentId(segment.id); setInspectorMode('video'); setSelectedMusicId(null); setSelectedBrollId(null); setSelectedMgId(null); setSelectedZentryId(null); setSelectedCaptionGroupStartMs(null); seekTo(segTimelineStart); }} 
                style={{ left:`${leftPct}%`, width:`${widthPct}%` }}
              >
                <button className="trim-handle start" aria-label="Recortar inicio" onPointerDown={(event) => startTrimDrag(event,segment.id,'start')} type="button" />
                {clipSrc && <TimelineThumbnail src={clipSrc} time={segment.start+(segment.end-segment.start)/2} />}
                <b>{index === 0 ? `VIDEO 1 · ${formatTime(segment.end-segment.start)}` : `CLIP ${index+1} · ${formatTime(segment.end-segment.start)}`}</b>
                {editSegments.length > 1 && <button className="clip-delete" aria-label="Eliminar clip" onClick={(event) => { event.stopPropagation(); deleteSegment(segment.id); }} type="button">×</button>}
                <button className="trim-handle end" aria-label="Recortar final" onPointerDown={(event) => startTrimDrag(event,segment.id,'end')} type="button" />
                {index < editSegments.length - 1 && (
                  <button
                    type="button"
                    title="Clic para cambiar transición entre clips"
                    onClick={(e) => {
                      e.stopPropagation();
                      const transOrder: ('cut' | 'whip-pan' | 'zoom-punch' | 'fade' | 'glitch')[] = ['cut', 'whip-pan', 'zoom-punch', 'fade', 'glitch'];
                      const cur = segment.transitionToNext || 'cut';
                      const next = transOrder[(transOrder.indexOf(cur) + 1) % transOrder.length];
                      setEditSegments((prev) => prev.map((s, idx) => idx === index ? { ...s, transitionToNext: next } : s));
                    }}
                    style={{
                      position: 'absolute',
                      right: -12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 12,
                      background: segment.transitionToNext && segment.transitionToNext !== 'cut' ? '#00f5c8' : 'rgba(20, 24, 33, 0.95)',
                      color: segment.transitionToNext && segment.transitionToNext !== 'cut' ? '#000000' : '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: 10,
                      padding: '2px 5px',
                      fontSize: 8,
                      fontWeight: 900,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    ⚡ {segment.transitionToNext || 'corte'}
                  </button>
                )}
              </div>
            );
          })}</div>
          <div className="audio-track">
            <div className="waveform">{Array.from({ length: 90 }).map((_, index) => <i key={index} style={{ height: `${20 + ((index * 17) % 65)}%` }} />)}</div>
            {sfxTimelineItems.map((audioItem, index) => (
              <button
                key={`${audioItem.id}-${index}`}
                type="button"
                title={`${audioItem.label} · ${audioItem.src}`}
                aria-label={`${audioItem.label} en ${audioItem.timeSec.toFixed(1)} segundos`}
                onPointerDown={(event) => startSfxDrag(event,audioItem.id,audioItem.timeSec)}
                onClick={() => { seekTo(audioItem.timeSec); setSelectedSfxId(audioItem.id); setActiveTool('audio'); }}
                style={{
                  position: 'absolute',
                  left: `${(audioItem.timeSec / Math.max(0.1, duration)) * 100}%`,
                  top: 4,
                  width: 9,
                  height: 22,
                  padding: 0,
                  borderRadius: 3,
                  border: '1px solid rgba(0,245,200,.9)',
                  background: 'linear-gradient(180deg,#00f5c8,#0891b2)',
                  color: '#001b18',
                  fontSize: 7,
                  overflow: 'hidden',
                  zIndex: 4,
                  cursor: 'grab',
                }}
              >♫</button>
            ))}
          </div><div className="music-track">{musicClips.map((clip) => <div key={clip.id} role="button" tabIndex={0} aria-label={`Música ${clip.name} de ${clip.start.toFixed(1)} a ${(clip.start+clip.duration).toFixed(1)} segundos`} className={`timeline-music-clip ${selectedMusicId === clip.id ? 'selected' : ''}`} title={`${clip.name} · ${clip.start.toFixed(1)}s`} style={{left:`${(clip.start/Math.max(duration,0.1))*100}%`,width:`${(clip.duration/Math.max(duration,0.1))*100}%`}} onClick={() => selectMusicClip(clip)} onKeyDown={(event) => {if (event.key === 'Enter') selectMusicClip(clip);}} onPointerDown={(event) => startMusicDrag(event,clip.id)}><button className="trim-handle start" aria-label="Recortar inicio de música" onPointerDown={(event) => startMusicTrim(event,clip.id,'start')} type="button" /><span>♫ {clip.name}</span><button className="music-delete" aria-label="Eliminar fragmento de música" onClick={(event) => {event.stopPropagation();checkpoint();setMusicClips((items) => items.filter((item) => item.id !== clip.id));setSelectedMusicId(null);}} type="button">×</button><button className="trim-handle end" aria-label="Recortar final de música" onPointerDown={(event) => startMusicTrim(event,clip.id,'end')} type="button" /></div>)}</div><div className="playhead" style={{left:`${Math.min(100,Math.max(0,(currentTime/Math.max(duration,0.1))*100))}%`}}><button type="button" aria-label="Mover cabezal rojo" onPointerDown={startPlayheadDrag} /><span>{formatTime(currentTime)}</span></div>
        </div></div></div>
      </section>
      {bgTask && (
        <div className={`bg-task-pill ${bgTask.done ? 'done' : ''}`} role="status">
          {bgTask.done ? <span className="bg-task-icon">✓</span> : <span className="bg-task-spinner" />}
          <span className="bg-task-label">{bgTask.label}</span>
          {bgTask.active && <span className="bg-task-pct">{Math.round(bgTask.progress * 100)}%</span>}
        </div>
      )}
      {(jobState === 'working' || jobState === 'error' || (jobState === 'done' && jobTitle === 'Video viralizado con éxito')) && <div className="job-backdrop" role="status" aria-live="polite"><div className={`job-card ${jobState}`}><div className="job-orbit"><span>{jobState === 'done' ? '✓' : jobState === 'error' ? '!' : 'Z'}</span></div><span className="eyebrow">ZENTRY LOCAL ENGINE</span><h2>{jobTitle}</h2><p>{jobDetail}</p><div className="job-progress"><i style={{width:`${Math.max(3,jobProgress*100)}%`}} /></div><b>{Math.round(jobProgress*100)}%</b>{jobState === 'done' && jobTitle === 'Video viralizado con éxito' && exportDownloadUrl && <div style={{display:'grid',gap:8,width:'100%',marginTop:12}}><video controls playsInline preload="metadata" src={exportDownloadUrl} style={{width:'100%',maxHeight:220,background:'#000',borderRadius:8}} /><a href={exportDownloadUrl} download={`${fileName || 'zentry-video'}-${outputSize.width}x${outputSize.height}.mp4`} style={{display:'block',padding:'10px 14px',borderRadius:8,background:'#00bfa5',color:'#001e19',fontWeight:800,textDecoration:'none'}}>↓ Descargar MP4 generado</a></div>}{jobState !== 'working' && <button onClick={() => setJobState('idle')} type="button">Volver al editor</button>}</div></div>}
      {placementModal && placementModal.isOpen && (
        <div className="placement-modal-backdrop" onClick={() => setPlacementModal(null)}>
          <div className="placement-modal" onClick={(e) => e.stopPropagation()}>
            <div className="placement-modal-header">
              <h3>
                {placementModal.type === 'broll'
                  ? '¿Dónde superponer este B-Roll?'
                  : '¿Dónde insertar este Motion Graphic 3D?'}
              </h3>
              <button
                type="button"
                className="placement-modal-close"
                onClick={() => setPlacementModal(null)}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: 0, fontSize: 12, color: '#aaa' }}>
              Elige si quieres posicionarlo en el segundo exacto actual o sincronizado con una frase hablada del video:
            </p>

            <button
              type="button"
              className="placement-phrase-btn placement-curr-btn"
              onClick={() => {
                if (placementModal.type === 'broll') {
                  addCustomBroll(
                    placementModal.data.src,
                    placementModal.data.isVideo,
                    placementModal.data.title,
                    currentTime,
                    3.5
                  );
                } else {
                  add3DMotionGraphic(
                    placementModal.data.style,
                    currentTime,
                    3.5
                  );
                }
              }}
            >
              <b>⏱️ En el segundo actual ({currentTime.toFixed(1)}s)</b>
              <small style={{ color: '#fff', opacity: 0.9 }}>
                Se reproducirá desde {currentTime.toFixed(1)}s hasta {(currentTime + 3.5).toFixed(1)}s
              </small>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ fontSize: 10, color: '#777', textTransform: 'uppercase', fontWeight: 800 }}>
                O vincular a una frase ({transcribedPhrases.length})
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            </div>

            <div className="placement-phrases-list">
              {transcribedPhrases.length === 0 ? (
                <div style={{ padding: 14, textAlign: 'center', color: '#888', fontSize: 11 }}>
                  No hay frases detectadas aún. Procesa los subtítulos o inserta en el segundo actual.
                </div>
              ) : (
                transcribedPhrases.map((phrase, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="placement-phrase-btn"
                    onClick={() => {
                      if (placementModal.type === 'broll') {
                        addCustomBroll(
                          placementModal.data.src,
                          placementModal.data.isVideo,
                          `B-Roll: "${phrase.text.slice(0, 20)}..."`,
                          phrase.start,
                          phrase.duration
                        );
                      } else {
                        add3DMotionGraphic(
                          placementModal.data.style,
                          phrase.start,
                          phrase.duration
                        );
                      }
                      seekTo(phrase.start);
                    }}
                  >
                    <b>"{phrase.text}"</b>
                    <small>
                      ⏱️ {phrase.start.toFixed(1)}s — {phrase.end.toFixed(1)}s ({phrase.duration.toFixed(1)}s)
                    </small>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {captionTemplateDialogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="caption-template-dialog-title"
          style={{ position:'fixed', inset:0, zIndex:10000, display:'grid', placeItems:'center', background:'rgba(0,0,0,.72)', padding:20 }}
          onMouseDown={(event) => { if (event.target === event.currentTarget) setCaptionTemplateDialogOpen(false); }}
        >
          <form
            onSubmit={(event) => { event.preventDefault(); confirmSaveCurrentCaptionTemplate(); }}
            style={{ width:'min(420px, 100%)', display:'grid', gap:14, padding:22, borderRadius:16, border:'1px solid rgba(0,245,200,.35)', background:'#10131a', boxShadow:'0 24px 80px rgba(0,0,0,.55)' }}
          >
            <div>
              <h2 id="caption-template-dialog-title" style={{ margin:0, color:'#fff', fontSize:20 }}>Guardar plantilla de subtítulos</h2>
              <p style={{ margin:'6px 0 0', color:'#9ca3af', fontSize:13 }}>Conserva tipografías, colores, animación, tamaño y posición.</p>
            </div>
            <label style={{ display:'grid', gap:6, color:'#d1d5db', fontSize:12, fontWeight:800 }}>
              Nombre de la plantilla
              <input
                autoFocus
                aria-label="Nombre de la plantilla personalizada"
                value={captionTemplateNameDraft}
                onChange={(event) => setCaptionTemplateNameDraft(event.target.value)}
                style={{ width:'100%', borderRadius:9, border:'1px solid #374151', background:'#07090d', color:'#fff', padding:'11px 12px', fontSize:14 }}
              />
            </label>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
              <button type="button" onClick={() => setCaptionTemplateDialogOpen(false)}>Cancelar</button>
              <button type="submit" disabled={!captionTemplateNameDraft.trim()} style={{ background:'#00f5c8', color:'#04110e', fontWeight:900 }}>Guardar plantilla</button>
            </div>
          </form>
        </div>
      )}
      <input ref={inputRef} className="file-input" type="file" accept="video/mp4,video/quicktime,video/webm" onChange={uploadVideo} />
      <input ref={secondaryInputRef} className="file-input" type="file" accept="video/mp4,video/quicktime,video/webm" onChange={uploadSecondaryVideo} />
      <input ref={musicInputRef} className="file-input" type="file" multiple accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg" onChange={uploadMusic} />
      {musicClips.length > 0 && <audio ref={musicPreviewRef} preload="auto" />}
      <input ref={brollInputRef} className="file-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadBroll} />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
        onSuccess={() => {
          if (sessionUser?.id) fetchProfile(sessionUser.id);
        }}
      />
    </main>
  );
}
