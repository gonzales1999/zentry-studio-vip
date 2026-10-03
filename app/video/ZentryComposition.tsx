import { Audio, Video } from '@remotion/media';
import type { Caption } from '@remotion/captions';
import { AbsoluteFill, Easing, Img, Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CaptionLayer } from './CaptionLayer';
import { AnimatedBrollText } from './AnimatedBrollText';
import { brollOwnsAnimatedText, brollTextFontSize, resolveBrollCaptionStyle, resolveMotionText } from './captionTiming';
import { hookLineOpacity } from './hookTiming';
import { MotionGraphicsLayer } from './MotionGraphicsLayer';
import {ZentryTextSizeContext} from '../../src/zentry/animations/ReferenceTextAnimation';
import { safeInterpolate } from './safeInterpolate';
import type { ZentryVideoProps, CustomBrollItem } from './types';
import { getZentryTemplate } from '../../src/zentry/registry';
import { ZentryPresetSfx } from '../../src/zentry/audio/ZentryPresetSfx';
import { getVisibleVisualLayer, getZentryVisualProps, getZentryLayout } from './visibleLayers';

const BuiltInOverlayEffect = ({ src }: { src: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = frame / Math.max(1, fps * 3);
  const fadeOut = safeInterpolate(progress, [0.72, 1], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const lower = src.toLowerCase();

  if (lower.includes('fireflies')) {
    return (
      <AbsoluteFill style={{ pointerEvents:'none', overflow:'hidden', opacity:fadeOut, mixBlendMode:'screen' }}>
        {Array.from({ length: 26 }).map((_, index) => {
          const x = (index * 37) % 100;
          const y = (index * 61 + frame * (0.22 + (index % 4) * 0.05)) % 115;
          const size = 4 + (index % 5) * 2;
          const pulse = 0.25 + 0.7 * Math.abs(Math.sin((frame + index * 9) / 11));
          return <i key={index} style={{ position:'absolute', left:`${x}%`, top:`${115-y}%`, width:size, height:size, borderRadius:'50%', background:'#ffd37a', boxShadow:'0 0 16px 5px rgba(255,153,51,.75)', opacity:pulse }} />;
        })}
      </AbsoluteFill>
    );
  }

  if (lower.includes('flash')) {
    const flash = Math.max(0, 1 - (frame % Math.max(8, Math.round(fps * 0.7))) / 7);
    return <AbsoluteFill style={{ pointerEvents:'none', background:'#fff', opacity:flash * 0.82 * fadeOut, mixBlendMode:'screen' }} />;
  }

  if (lower.includes('glitch')) {
    const shift = frame % 2 === 0 ? 18 : -14;
    return (
      <AbsoluteFill style={{ pointerEvents:'none', opacity:0.42 * fadeOut, mixBlendMode:'screen', transform:`translateX(${shift}px)`, background:'repeating-linear-gradient(0deg, rgba(255,0,68,.7) 0 8px, transparent 8px 28px, rgba(0,245,255,.55) 28px 34px, transparent 34px 55px)' }} />
    );
  }

  const flicker = 0.48 + (frame % 5) * 0.065;
  const drift = safeInterpolate(progress, [0, 1], [-12, 18]);
  return (
    <AbsoluteFill style={{ pointerEvents:'none', opacity:flicker * fadeOut, mixBlendMode:'screen', transform:`translateX(${drift}px) scale(1.08)`, background:'radial-gradient(circle at 28% 48%, rgba(255,244,188,.98) 0 8%, rgba(255,101,23,.85) 20%, transparent 47%), radial-gradient(circle at 78% 22%, rgba(255,213,80,.75), transparent 38%), linear-gradient(115deg, rgba(255,48,0,.8), rgba(255,188,42,.45) 36%, transparent 67%)', filter:'contrast(1.25) saturate(1.35)' }} />
  );
};

const CustomBrollLayer = ({
  broll,
  durationInFrames,
  transition,
  accentColor,
  captions,
}: {
  broll: CustomBrollItem;
  durationInFrames: number;
  transition: ZentryVideoProps['brollTransition'];
  accentColor: string;
  captions?: Caption[];
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // In / Out Transitions
  const tIn = broll.transitionIn || (transition === 'fade' ? 'smooth-fade' : transition === 'zoom' ? 'zoom-punch' : transition === 'glitch' ? 'rgb-glitch' : transition === 'flash' ? 'film-burn' : 'whip-pan');
  const tOut = broll.transitionOut || 'smooth-fade';

  const inFrames = Math.min(8, Math.max(3, Math.floor(durationInFrames * 0.25)));
  const outFrames = Math.min(8, Math.max(3, Math.floor(durationInFrames * 0.25)));
  const inProgress = safeInterpolate(frame, [0, inFrames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const exitFrame = Math.max(0, frame - (durationInFrames - outFrames));
  const outProgress = safeInterpolate(exitFrame, [0, outFrames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Transition In values
  let tInX = 0;
  let tInRot = 0;
  let tInScale = 1;
  let tInFlash = 0;
  let tInGlitch = 0;
  let tInOpacity = inProgress;

  if (tIn === 'whip-pan') {
    tInX = safeInterpolate(inProgress, [0, 1], [380, 0], { easing: Easing.out(Easing.cubic) });
    tInRot = safeInterpolate(inProgress, [0, 1], [5, 0]);
  } else if (tIn === 'zoom-punch') {
    tInScale = safeInterpolate(inProgress, [0, 1], [1.35, 1], { easing: Easing.out(Easing.back(1.4)) });
  } else if (tIn === 'film-burn') {
    tInFlash = safeInterpolate(inProgress, [0, 0.4, 1], [1, 0.65, 0]);
  } else if (tIn === 'rgb-glitch') {
    tInGlitch = frame < inFrames ? ((frame % 2 === 0 ? 1 : -1) * (inFrames - frame) * 3.5) : 0;
  }

  // Transition Out values
  let tOutX = 0;
  let tOutRot = 0;
  let tOutScale = 1;
  let tOutFlash = 0;
  let tOutGlitch = 0;
  let tOutOpacity = 1 - outProgress;

  if (tOut === 'whip-pan') {
    tOutX = safeInterpolate(outProgress, [0, 1], [0, -380], { easing: Easing.in(Easing.cubic) });
    tOutRot = safeInterpolate(outProgress, [0, 1], [0, -5]);
  } else if (tOut === 'zoom-punch') {
    tOutScale = safeInterpolate(outProgress, [0, 1], [1, 1.25]);
    tOutOpacity = safeInterpolate(outProgress, [0, 1], [1, 0]);
  } else if (tOut === 'film-burn') {
    tOutFlash = safeInterpolate(outProgress, [0, 0.6, 1], [0, 0.6, 1]);
  } else if (tOut === 'rgb-glitch') {
    tOutGlitch = exitFrame > 0 ? ((exitFrame % 2 === 0 ? 1 : -1) * exitFrame * 3.5) : 0;
  }

  const layerOpacity = (tIn === 'none' ? 1 : tIn === 'smooth-fade' || tIn === 'fade' ? tInOpacity : safeInterpolate(frame, [0, 3], [0, 1])) *
                       (tOut === 'none' ? 1 : tOut === 'smooth-fade' || tOut === 'fade' ? tOutOpacity : safeInterpolate(exitFrame, [0, outFrames], [1, 0]));
  const layerScale = (tInScale || 1) * (tOutScale || 1);
  const layerTranslateX = (tInX || 0) + (tOutX || 0) + (tInGlitch || 0) + (tOutGlitch || 0);
  const layerRotate = (tInRot || 0) + (tOutRot || 0);
  const flashOpacity = Math.max(tInFlash || 0, tOutFlash || 0);

  const style = broll.brollStyle || (broll.src ? 'custom' : 'white-minimal');
  const template = broll.templateId ? getZentryTemplate(broll.templateId) : undefined;
  const TemplateComponent = template?.category === 'broll' ? template.visualComponent : null;
  const isFullscreenTemplate = Boolean(broll.templateId && ['broll_top', 'broll_center', 'broll_bottom'].includes(broll.templateId));
  const brollFontFamily = broll.fontFamily || 'Montserrat, sans-serif';
  // The design panel is drawn on a small canvas; scale its typography to the
  // full-resolution output so selected B-roll text remains readable in MP4.
  const brollFontSize = brollTextFontSize(broll);
  const brollTextColor = broll.textColor || (style === 'white-minimal' ? '#111827' : '#ffffff');
  const brollAccentColor = broll.accentColor || accentColor;
  const brollTextShadow = broll.textEffect === 'glow' ? `0 0 18px ${brollAccentColor}, 0 6px 20px rgba(0,0,0,.8)` : undefined;

  const brollStartSec = broll.start;
  const brollEndSec = broll.start + broll.duration;
  const currentSec = brollStartSec + frame / fps;

  // Extract all real spoken words from transcript during this B-roll
  const brollWords: { text: string; start: number; end: number }[] = [];
  if (captions && captions.length > 0) {
    for (const cap of captions) {
      const capStart = cap.startMs / 1000;
      const capEnd = cap.endMs / 1000;
      if (capStart < brollEndSec && capEnd > brollStartSec) {
        const rawTokens = cap.text.trim().split(/\s+/).filter(Boolean);
        if (rawTokens.length > 0) {
          const tokenDur = Math.max(0.22, (capEnd - capStart) / rawTokens.length);
          rawTokens.forEach((tok, idx) => {
            const clean = tok.replace(/[.,/#!$%^&*;:{}=\-_`~()¿?¡!"]/g, '');
            if (clean) {
              brollWords.push({
                text: clean,
                start: capStart + idx * tokenDur,
                end: capStart + (idx + 1) * tokenDur,
              });
            }
          });
        }
      }
    }
  }

  // Chunk words into vertical stacks of 3 to 4 words (Captura 5)
  const pageSize = 4;
  const groups: { words: { text: string; start: number; end: number }[]; start: number; end: number; index: number }[] = [];
  for (let i = 0; i < brollWords.length; i += pageSize) {
    const slice = brollWords.slice(i, i + pageSize);
    groups.push({
      words: slice,
      start: slice[0].start,
      end: slice[slice.length - 1].end,
      index: Math.floor(i / pageSize),
    });
  }

  const activeGroupIndex = groups.findIndex((g) => currentSec >= g.start && currentSec < g.end);
  const activeGroup = activeGroupIndex >= 0 ? groups[activeGroupIndex] : (groups.length > 0 ? groups[0] : null);
  const groupIndex = activeGroup ? activeGroup.index : 0;

  // Fallback words if no subtitles present
  const fallbackTokens = (broll.brollHeadline || broll.title || 'ENFOQUE TOTAL PARA CRECER').split(/\s+/).slice(0, 4);
  const displayItems: { text: string; start: number; end: number }[] = activeGroup && activeGroup.words.length > 0
    ? activeGroup.words
    : fallbackTokens.map((w, idx) => ({
        text: w,
        start: brollStartSec + idx * 0.45,
        end: brollStartSec + (idx + 1) * 0.45,
      }));

  const icon = broll.icon3d || (style === 'red-impact' ? '⚡' : style === 'black-oled' ? '💎' : '💡');
  const dir = broll.transitionDirection || (groupIndex % 3 === 0 ? 'slide-up' : groupIndex % 3 === 1 ? 'slide-left' : 'slide-right');
  const templateText = activeGroup?.words.map((word) => word.text).join(' ') || broll.brollText || broll.brollHeadline || broll.title || template?.name || '';
  const templateWords = templateText.split(/\s+/).filter(Boolean);
  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        opacity: layerOpacity,
        scale: layerScale,
        transform: `translateX(${layerTranslateX}px) rotate(${layerRotate}deg)`,
        filter: flashOpacity > 0.4 ? 'brightness(1.3) contrast(1.15)' : undefined,
        fontFamily: brollFontFamily,
        color: brollTextColor,
      }}
    >
      {brollOwnsAnimatedText(broll) ? (
        <AbsoluteFill style={{background:broll.backgroundColor || (style === 'white-minimal' ? '#ffffff' : style === 'red-impact' ? '#991b1b' : '#050505')}}>
          {broll.src && !TemplateComponent && !['white-minimal','red-impact','black-oled'].includes(style) && (broll.type==='video'
            ? <Video src={broll.src} muted style={{width:'100%',height:'100%'}} objectFit="cover" />
            : <Img src={broll.src} style={{width:'100%',height:'100%',objectFit:'cover'}} />)}
          <AnimatedBrollText broll={broll} captions={captions || []} time={currentSec} fontSize={brollFontSize} />
        </AbsoluteFill>
      ) : TemplateComponent ? (
        <AbsoluteFill
          style={{
            background: isFullscreenTemplate
              ? style === 'white-minimal'
                ? broll.backgroundColor || 'radial-gradient(circle at center, #ffffff 0%, #eef2f7 100%)'
                : style === 'red-impact'
                  ? broll.backgroundColor || 'linear-gradient(145deg, #dc2626 0%, #7f1d1d 100%)'
                  : broll.backgroundColor || '#050505'
              : 'transparent',
            fontFamily: brollFontFamily,
            color: brollTextColor,
            fontSize: brollFontSize,
            textShadow: brollTextShadow,
          }}
        >
          <TemplateComponent
            text={templateText}
            title={templateWords.slice(0, 2).join(' ') || templateText}
            subtitle={templateWords.slice(2).join(' ') || templateText}
            label={templateWords[0] || 'IDEA'}
            number={templateWords.slice(1, 3).join(' ') || '01'}
            step={`PASO ${String(Math.max(1, groupIndex + 1)).padStart(2, '0')}`}
            stat={templateWords[0] || '3×'}
            small={templateWords[0] || 'PALABRA'}
            big={templateWords.slice(1).join(' ') || templateText}
            lines={templateWords.length ? templateWords.slice(0, 3) : [templateText]}
            fontVariant={broll.templateFontVariant || 'montserrat'}
            fontFamily={brollFontFamily}
            fontSize={brollFontSize}
            color={brollTextColor}
            accentColor={brollAccentColor}
          />
        </AbsoluteFill>
      ) : style === 'white-minimal' ? (
        // Minimal Studio White (Tesla / Elon Musk style as in videoplayback.mp4)
        <AbsoluteFill
          style={{
            background: broll.backgroundColor || 'radial-gradient(circle at center, #ffffff 0%, #f8fafc 55%, #f1f5f9 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10% 8%',
          }}
        >
          {/* Subtle Ambient Studio Vignette */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at center, transparent 60%, rgba(0,0,0,0.06) 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* Floating Transparent 3D Icon Cutout */}
          <div
            style={{
              fontSize: 84,
              lineHeight: 1,
              marginBottom: 24,
              filter: 'drop-shadow(0 16px 28px rgba(0,0,0,0.14))',
              transform: `translateY(${Math.sin(frame / 8) * 8}px) scale(${safeInterpolate(inProgress, [0, 1], [0.75, 1])})`,
            }}
          >
            {icon}
          </div>

          {/* Vertical Stack Kinetic Typography (Captura 5) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              maxWidth: '92%',
              textAlign: 'center',
            }}
          >
            {displayItems.map((item, wIdx) => {
              const wordEntered = broll.textEffect === 'none' || currentSec >= item.start;
              const wordLocalSec = Math.max(0, currentSec - item.start);
              const wordLocalFrame = Math.max(0, Math.round(wordLocalSec * fps));
              const wordSpringVal = broll.textEffect === 'none'
                ? 1
                : broll.textEffect === 'typewriter'
                  ? Math.min(1, wordLocalFrame / 3)
                  : spring({ frame: wordLocalFrame, fps, config: { damping: 13, stiffness: 180 } });

              let wTransform = '';
              const wOpacity = wordEntered ? safeInterpolate(wordSpringVal, [0, 0.3, 1], [0, 0.7, 1]) : 0;
              if (dir === 'slide-up') {
                const ty = safeInterpolate(wordSpringVal, [0, 1], [65, 0]);
                const rx = safeInterpolate(wordSpringVal, [0, 1], [25, 0]);
                wTransform = `perspective(700px) translateY(${ty}px) rotateX(${rx}deg) scale(${safeInterpolate(wordSpringVal, [0, 1], [0.82, 1])})`;
              } else if (dir === 'slide-left') {
                const tx = safeInterpolate(wordSpringVal, [0, 1], [-100, 0]);
                const ry = safeInterpolate(wordSpringVal, [0, 1], [-18, 0]);
                wTransform = `perspective(700px) translateX(${tx}px) rotateY(${ry}deg) scale(${safeInterpolate(wordSpringVal, [0, 1], [0.82, 1])})`;
              } else {
                const tx = safeInterpolate(wordSpringVal, [0, 1], [100, 0]);
                const ry = safeInterpolate(wordSpringVal, [0, 1], [18, 0]);
                wTransform = `perspective(700px) translateX(${tx}px) rotateY(${ry}deg) scale(${safeInterpolate(wordSpringVal, [0, 1], [0.82, 1])})`;
              }

              const isHighlight = wIdx === displayItems.length - 1;
              return (
                <div
                  key={wIdx}
                  style={{
                    transform: wTransform,
                    opacity: wOpacity,
                    transition: 'none',
                  }}
                >
                  {isHighlight ? (
                    <span
                      style={{
                        fontSize: brollFontSize,
                        fontWeight: 900,
                        color: brollTextColor,
                        background: brollAccentColor,
                        textShadow: brollTextShadow,
                        padding: '6px 28px',
                        borderRadius: 18,
                        fontFamily: brollFontFamily,
                        textTransform: 'uppercase',
                        boxShadow: '0 14px 34px rgba(0,0,0,0.25)',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.05,
                        display: 'inline-block',
                      }}
                    >
                      {item.text}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: brollFontSize,
                        fontWeight: 900,
                        color: brollTextColor,
                        fontFamily: brollFontFamily,
                        textTransform: 'uppercase',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.05,
                        display: 'inline-block',
                      }}
                    >
                      {item.text}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Minimalist Accent Line */}
          <div
            style={{
              width: 140,
              height: 4,
              background: '#0f172a',
              borderRadius: 4,
              marginTop: 24,
              opacity: 0.9,
            }}
          />
        </AbsoluteFill>
      ) : style === 'red-impact' ? (
        // Red Impact Kinetic Template
        <AbsoluteFill
          style={{
            background: broll.backgroundColor || 'radial-gradient(circle at center, #ef4444 0%, #b91c1c 45%, #7f1d1d 80%, #450a0a 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10% 8%',
          }}
        >
          {/* Pulsating Light Ring */}
          <div
            style={{
              position: 'absolute',
              width: 380,
              height: 380,
              borderRadius: '50%',
              border: '2.5px solid rgba(254, 202, 202, 0.35)',
              boxShadow: '0 0 80px rgba(239, 68, 68, 0.75)',
              transform: `scale(${safeInterpolate(frame, [0, durationInFrames], [0.92, 1.14])})`,
            }}
          />

          {/* Floating Transparent 3D Icon Cutout */}
          <div
            style={{
              fontSize: 86,
              lineHeight: 1,
              marginBottom: 24,
              filter: 'drop-shadow(0 14px 28px rgba(0,0,0,0.6))',
              transform: `translateY(${Math.sin(frame / 7) * 7}px)`,
              zIndex: 2,
            }}
          >
            {icon}
          </div>

          {/* Vertical Stack Kinetic Typography (Captura 5) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              maxWidth: '92%',
              textAlign: 'center',
              zIndex: 2,
            }}
          >
            {displayItems.map((item, wIdx) => {
              const wordEntered = broll.textEffect === 'none' || currentSec >= item.start;
              const wordLocalSec = Math.max(0, currentSec - item.start);
              const wordLocalFrame = Math.max(0, Math.round(wordLocalSec * fps));
              const wordSpringVal = broll.textEffect === 'none'
                ? 1
                : broll.textEffect === 'typewriter'
                  ? Math.min(1, wordLocalFrame / 3)
                  : spring({ frame: wordLocalFrame, fps, config: { damping: 13, stiffness: 180 } });

              let wTransform = '';
              const wOpacity = wordEntered ? safeInterpolate(wordSpringVal, [0, 0.3, 1], [0, 0.7, 1]) : 0;
              if (dir === 'slide-up') {
                const ty = safeInterpolate(wordSpringVal, [0, 1], [65, 0]);
                const rx = safeInterpolate(wordSpringVal, [0, 1], [25, 0]);
                wTransform = `perspective(700px) translateY(${ty}px) rotateX(${rx}deg) scale(${safeInterpolate(wordSpringVal, [0, 1], [0.82, 1])})`;
              } else if (dir === 'slide-left') {
                const tx = safeInterpolate(wordSpringVal, [0, 1], [-100, 0]);
                const ry = safeInterpolate(wordSpringVal, [0, 1], [-18, 0]);
                wTransform = `perspective(700px) translateX(${tx}px) rotateY(${ry}deg) scale(${safeInterpolate(wordSpringVal, [0, 1], [0.82, 1])})`;
              } else {
                const tx = safeInterpolate(wordSpringVal, [0, 1], [100, 0]);
                const ry = safeInterpolate(wordSpringVal, [0, 1], [18, 0]);
                wTransform = `perspective(700px) translateX(${tx}px) rotateY(${ry}deg) scale(${safeInterpolate(wordSpringVal, [0, 1], [0.82, 1])})`;
              }

              const isHighlight = wIdx === displayItems.length - 1;
              return (
                <div
                  key={wIdx}
                  style={{
                    transform: wTransform,
                    opacity: wOpacity,
                    transition: 'none',
                  }}
                >
                  {isHighlight ? (
                    <span
                      style={{
                        fontSize: brollFontSize,
                        fontWeight: 900,
                        color: brollTextColor,
                        background: brollAccentColor,
                        textShadow: brollTextShadow,
                        padding: '6px 28px',
                        borderRadius: 18,
                        fontFamily: brollFontFamily,
                        textTransform: 'uppercase',
                        boxShadow: '0 12px 34px rgba(0,0,0,0.7), 0 0 30px rgba(254,240,138,0.6)',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.05,
                        display: 'inline-block',
                      }}
                    >
                      {item.text}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: brollFontSize,
                        fontWeight: 900,
                        color: brollTextColor,
                        fontFamily: brollFontFamily,
                        textTransform: 'uppercase',
                        textShadow: brollTextShadow || '0 8px 30px rgba(0,0,0,0.9), 0 0 25px rgba(255,255,255,0.7)',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.05,
                        display: 'inline-block',
                      }}
                    >
                      {item.text}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      ) : style === 'black-oled' ? (
        // OLED Stealth Luxury Template
        <AbsoluteFill
          style={{
            background: broll.backgroundColor || 'radial-gradient(circle at center, #18181b 0%, #09090b 60%, #000000 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10% 8%',
          }}
        >
          {/* Ambient Cyan Aura */}
          <div
            style={{
              position: 'absolute',
              width: 420,
              height: 420,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 245, 200, 0.22) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          {/* Floating Transparent 3D Icon Cutout */}
          <div
            style={{
              fontSize: 86,
              lineHeight: 1,
              marginBottom: 24,
              filter: 'drop-shadow(0 14px 28px rgba(0,245,200,0.45))',
              transform: `translateY(${Math.sin(frame / 7) * 7}px)`,
              zIndex: 2,
            }}
          >
            {icon}
          </div>

          {/* Vertical Stack Kinetic Typography (Captura 5) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              maxWidth: '92%',
              textAlign: 'center',
              zIndex: 2,
            }}
          >
            {displayItems.map((item, wIdx) => {
              const wordEntered = broll.textEffect === 'none' || currentSec >= item.start;
              const wordLocalSec = Math.max(0, currentSec - item.start);
              const wordLocalFrame = Math.max(0, Math.round(wordLocalSec * fps));
              const wordSpringVal = broll.textEffect === 'none'
                ? 1
                : broll.textEffect === 'typewriter'
                  ? Math.min(1, wordLocalFrame / 3)
                  : spring({ frame: wordLocalFrame, fps, config: { damping: 13, stiffness: 180 } });

              let wTransform = '';
              const wOpacity = wordEntered ? safeInterpolate(wordSpringVal, [0, 0.3, 1], [0, 0.7, 1]) : 0;
              if (dir === 'slide-up') {
                const ty = safeInterpolate(wordSpringVal, [0, 1], [65, 0]);
                const rx = safeInterpolate(wordSpringVal, [0, 1], [25, 0]);
                wTransform = `perspective(700px) translateY(${ty}px) rotateX(${rx}deg) scale(${safeInterpolate(wordSpringVal, [0, 1], [0.82, 1])})`;
              } else if (dir === 'slide-left') {
                const tx = safeInterpolate(wordSpringVal, [0, 1], [-100, 0]);
                const ry = safeInterpolate(wordSpringVal, [0, 1], [-18, 0]);
                wTransform = `perspective(700px) translateX(${tx}px) rotateY(${ry}deg) scale(${safeInterpolate(wordSpringVal, [0, 1], [0.82, 1])})`;
              } else {
                const tx = safeInterpolate(wordSpringVal, [0, 1], [100, 0]);
                const ry = safeInterpolate(wordSpringVal, [0, 1], [18, 0]);
                wTransform = `perspective(700px) translateX(${tx}px) rotateY(${ry}deg) scale(${safeInterpolate(wordSpringVal, [0, 1], [0.82, 1])})`;
              }

              const isHighlight = wIdx === displayItems.length - 1;
              return (
                <div
                  key={wIdx}
                  style={{
                    transform: wTransform,
                    opacity: wOpacity,
                    transition: 'none',
                  }}
                >
                  {isHighlight ? (
                    <span
                      style={{
                        fontSize: brollFontSize,
                        fontWeight: 900,
                        color: brollTextColor,
                        background: brollAccentColor,
                        textShadow: brollTextShadow,
                        padding: '6px 28px',
                        borderRadius: 18,
                        fontFamily: brollFontFamily,
                        textTransform: 'uppercase',
                        boxShadow: '0 0 35px rgba(0,245,200,0.7), 0 12px 30px rgba(0,0,0,0.85)',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.05,
                        display: 'inline-block',
                      }}
                    >
                      {item.text}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: brollFontSize,
                        fontWeight: 900,
                        color: brollTextColor,
                        fontFamily: brollFontFamily,
                        textTransform: 'uppercase',
                        textShadow: brollTextShadow || '0 8px 30px rgba(0,0,0,0.95)',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.05,
                        display: 'inline-block',
                      }}
                    >
                      {item.text}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      ) : (
        // Standard video / image B-roll
        <>
          {broll.type === 'video' || broll.src.includes('.mp4') || broll.src.includes('.webm') ? (
            <Video src={broll.src} volume={0} loop objectFit="cover" style={{ width: '100%', height: '100%' }} />
          ) : (
            <Img
              src={broll.src}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                scale: safeInterpolate(frame, [0, Math.max(1, durationInFrames - 1)], [1, 1.12], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                translate: `${safeInterpolate(frame, [0, Math.max(1, durationInFrames - 1)], [0, -18], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px 0px`,
              }}
            />
          )}
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.1), transparent 40%, rgba(0,0,0,0.65))' }} />
          {brollWords.length === 0 && broll.brollHeadline && (
            <div style={{ position: 'absolute', bottom: '14%', left: '8%', right: '8%', textAlign: 'center', zIndex: 2 }}>
              <span
                style={{
                  display: 'inline-block',
                   background: broll.backgroundColor ? `${broll.backgroundColor}dd` : 'rgba(0,0,0,0.75)',
                   color: brollTextColor,
                   fontSize: brollFontSize,
                  fontWeight: 900,
                   fontFamily: brollFontFamily,
                   textShadow: brollTextShadow,
                  padding: '8px 24px',
                  borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.85)',
                  textTransform: 'uppercase',
                  opacity: broll.textEffect === 'none' ? 1 : safeInterpolate(frame, [0, Math.max(1, Math.min(9, durationInFrames - 1))], [0, 1], { extrapolateLeft:'clamp', extrapolateRight:'clamp' }),
                  scale: broll.textEffect === 'none' ? 1 : safeInterpolate(frame, [0, Math.max(1, Math.min(10, durationInFrames - 1))], [0.84, 1], { extrapolateLeft:'clamp', extrapolateRight:'clamp' }),
                }}
              >
                {broll.textEffect === 'typewriter'
                  ? broll.brollHeadline.slice(0, Math.max(1, Math.ceil(broll.brollHeadline.length * Math.min(1, frame / Math.max(1, Math.min(durationInFrames - 1, 18))))))
                  : broll.brollHeadline}
              </span>
            </div>
          )}
        </>
      )}

      {flashOpacity > 0 && <AbsoluteFill style={{ background: '#ffffff', opacity: flashOpacity }} />}
    </AbsoluteFill>
  );
};

const AnimatedBrollLayer = ({ event, accentColor, fontFamily, durationInFrames, transition }: {
  event:ZentryVideoProps['brollEvents'][number]; accentColor:string; fontFamily:string; durationInFrames:number; transition:ZentryVideoProps['brollTransition'];
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = event.words;
  const absoluteTime = event.start+frame/fps;
  const pageSize = 2;
  const exactIndex = words.findIndex((word) => absoluteTime >= word.start && absoluteTime < word.end);
  const latestIndex = words.reduce((result,word,index) => word.start <= absoluteTime ? index : result,0);
  const activeIndex = exactIndex >= 0 ? exactIndex : latestIndex;
  const pageIndex = Math.floor(activeIndex/pageSize);
  const focusStart = pageIndex*pageSize;
  const pageStart = Math.round(Math.max(0,(words[focusStart]?.start-event.start))*fps);
  const pageEnd = Math.round(Math.min(event.end-event.start,(words[Math.min(words.length-1,focusStart+pageSize-1)]?.end-event.start))*fps);
  const slot = Math.max(1,pageEnd-pageStart);
  const pageFrame = frame-pageStart;
  const enterEnd = Math.max(2,Math.min(5,slot*.24));
  const exitStart = Math.max(enterEnd,slot-Math.max(2,Math.min(5,slot*.2)));
  const opacity = safeInterpolate(pageFrame,[0,enterEnd,exitStart,slot],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const scale = safeInterpolate(pageFrame,[0,enterEnd,Math.min(slot,enterEnd+4)],[.72,1.08,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.out(Easing.back(1.6)),output:'perceptual-scale'});
  const layerOpacity = safeInterpolate(frame,[0,5,Math.max(5,durationInFrames-5),durationInFrames],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const entrance = safeInterpolate(frame,[0,Math.min(8,durationInFrames)],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.out(Easing.cubic)});
  const layerScale = transition === 'zoom' ? safeInterpolate(entrance,[0,1],[1.24,1],{output:'perceptual-scale'}) : 1;
  const layerTranslateX = transition === 'slide' ? safeInterpolate(entrance,[0,1],[260,0]) : 0;
  const flashOpacity = transition === 'flash' ? safeInterpolate(frame,[0,2,6],[.9,.35,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}) : 0;
  const variant = [0,0,1,2][pageIndex%4];
  const activeFont = variant === 1 ? 'Great Vibes' : variant === 2 ? 'Playfair Display' : fontFamily;
  const activeColor = variant === 1 ? '#ffffff' : accentColor;
  const activeSize = variant === 1 ? 120 : variant === 2 ? 88 : 96;
  const context = words.slice(Math.max(0,focusStart-3),focusStart).map((word) => word.text).join(' ');
  const focus = words.slice(focusStart,focusStart+pageSize).map((word) => word.text).join(' ');

  const isVideo = event.src.includes('.mp4') || event.src.includes('.webm') || event.src.includes('video') || event.src.includes('pexels');

  return <AbsoluteFill style={{ overflow:'hidden', opacity:layerOpacity, scale:layerScale, translate:`${layerTranslateX}px 0` }}>
    {isVideo ? (
      <Video src={event.src} volume={0} loop objectFit="cover" style={{ width:'100%', height:'100%' }} />
    ) : (
      <Img src={event.src} style={{ width:'100%', height:'100%', objectFit:'cover', scale:safeInterpolate(frame,[0,durationInFrames],[1.03,1.1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',output:'perceptual-scale'}) }} />
    )}
    <AbsoluteFill style={{ background:'linear-gradient(180deg,rgba(0,0,0,.08),transparent 38%,rgba(0,0,0,.5))' }} />
    {flashOpacity > 0 && <AbsoluteFill style={{ background:'#fff', opacity:flashOpacity }} />}
    {words.length > 0 && (
      <div
        style={{
          position: 'absolute',
          left: '6%',
          right: '6%',
          top: '54%',
          translate: '0 -50%',
          textAlign: 'center',
          textShadow: '0 6px 0 #000, 0 16px 32px #000',
          opacity,
          scale,
          zIndex: 3,
        }}
      >
        {context ? (
          <div
            style={{
              minHeight: 38,
              color: '#fff',
              fontFamily: 'Inter, Montserrat, sans-serif',
              fontSize: 32,
              fontWeight: 800,
              lineHeight: 1.05,
              opacity: 0.94,
              textShadow: '0 0 10px #fff, 0 8px 18px #000',
              textTransform: 'uppercase',
            }}
          >
            {context}
          </div>
        ) : null}
        <div
          style={{
            color: activeColor,
            fontFamily: activeFont,
            fontSize: activeSize,
            fontStyle: variant === 2 || variant === 1 ? 'italic' : 'normal',
            fontWeight: variant === 1 ? 400 : 900,
            lineHeight: 0.92,
            textTransform: variant === 1 ? 'none' : 'uppercase',
            WebkitTextStroke: variant === 1 ? '0 transparent' : '3px #041410',
            paintOrder: 'stroke fill',
            textShadow:
              variant === 1
                ? '0 0 18px #fff, 0 15px 32px #000'
                : `0 0 18px ${accentColor}, 0 7px 0 #001914, 0 17px 32px #000`,
            overflowWrap: 'anywhere',
          }}
        >
          {focus}
        </div>
      </div>
    )}
  </AbsoluteFill>;
};

const HookLayer = ({ leadText, mainText, accentColor, x, y, leadFontFamily, mainFontFamily, leadFontSize, mainFontSize, leadDuration, mainDuration, styleId }: {
  leadText:string; mainText:string; accentColor:string; x:number; y:number; leadFontFamily:string; mainFontFamily:string; leadFontSize:number; mainFontSize:number; leadDuration:number; mainDuration:number; styleId:ZentryVideoProps['hookStyle'];
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = safeInterpolate(frame,[0,7,12],[.55,1.1,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.out(Easing.back(1.7)),output:'perceptual-scale'});
  const lineOpacity = (duration:number) => hookLineOpacity(frame/fps,duration);
  const isViro = styleId === 'viro';
  const isImpact = styleId === 'impact';
  const isEditorial = styleId === 'editorial';
  const isClean = styleId === 'clean';
  const isMotivacional = styleId === 'motivacional';
  const isInstagram = styleId === 'instagram';
  const isBoldCaps = styleId === 'boldcaps';

  const mainColor = isViro ? (accentColor || '#00f5c8')
    : isEditorial ? '#ff3e47'
    : isMotivacional ? '#00ff66'
    : isInstagram ? '#ff6b00'
    : isBoldCaps ? '#111111'
    : '#ffffff';

  const mainBackground = isImpact ? '#ef2828' : isBoldCaps ? '#ffd400' : 'transparent';
  const stroke = isEditorial || isClean || isBoldCaps ? '0 transparent' : isMotivacional ? '3px #041a0e' : isInstagram ? '3px #1a0800' : '4px #061713';

  return (
    <AbsoluteFill style={{zIndex:30,pointerEvents:'none'}}>
      <div
        style={{
          position: 'absolute',
          left: `${x}%`,
          top: `${y}%`,
          width: isClean ? '82%' : '88%',
          translate: '-50% -50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: isClean ? '22px 26px' : 0,
          borderRadius: isClean ? 14 : 0,
          background: isClean ? 'rgba(0,0,0,.76)' : 'transparent',
          textAlign: 'center',
          filter: isClean ? 'none' : 'drop-shadow(0 10px 18px rgba(0,0,0,.75))',
          scale,
        }}
      >
        {leadText.trim() && (
          <div
            style={{
              color: isClean ? '#aaa' : '#fff',
              fontFamily: leadFontFamily,
              fontSize: leadFontSize,
              fontStyle: isEditorial ? 'italic' : 'normal',
              fontWeight: isViro ? 400 : isBoldCaps ? 900 : 800,
              lineHeight: 1.2,
              marginBottom: 4,
              textTransform: isViro || isEditorial ? 'none' : 'uppercase',
              textShadow: isClean ? 'none' : '0 0 12px #fff, 0 9px 18px #000',
              opacity: lineOpacity(leadDuration),
            }}
          >
            {leadText}
          </div>
        )}
        {mainText.trim() && (
          <div
            style={{
              width: isImpact || isBoldCaps ? 'fit-content' : 'auto',
              maxWidth: '100%',
              margin: '0 auto',
              padding: isImpact ? '8px 18px' : isBoldCaps ? '6px 16px' : 0,
              borderRadius: isImpact ? 8 : isBoldCaps ? 6 : 0,
              background: mainBackground,
              color: mainColor,
              fontFamily: mainFontFamily,
              fontSize: mainFontSize,
              fontStyle: isEditorial ? 'italic' : 'normal',
              fontWeight: isEditorial ? 700 : 900,
              lineHeight: isClean ? 1.15 : 1.1,
              letterSpacing: isClean ? 0 : -2,
              textTransform: isEditorial ? 'none' : 'uppercase',
              WebkitTextStroke: stroke,
              paintOrder: 'stroke fill',
              textShadow: isClean || isBoldCaps ? 'none' : isEditorial ? '0 12px 28px #000' : isImpact ? '0 9px 0 #000, 0 22px 42px #000' : isMotivacional ? '0 0 20px rgba(0,255,102,0.8), 0 9px 0 #03140b, 0 22px 42px #000' : isInstagram ? '0 0 20px rgba(255,107,0,0.8), 0 9px 0 #150600, 0 22px 42px #000' : `0 0 20px ${accentColor || '#00f5c8'}, 0 9px 0 #001914, 0 22px 42px #000`,
              opacity: lineOpacity(mainDuration),
            }}
          >
            {mainText}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const ZentryComposition = (props: ZentryVideoProps) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const segments = props.keepSegments.length ? props.keepSegments : [{start:0,end:frame/fps+3600}];
  const hookActiveUntilSec = (props.hookLeadText?.trim() || props.hookMainText?.trim())
    ? Math.max(props.hookLeadDuration || 0, props.hookMainDuration || 0)
    : 0;
  const visibleVisualLayer = getVisibleVisualLayer(frame/fps,props.customBrolls || [],props.motionGraphicsItems || [],props.zentryItems || []);
  const visibleBrolls = (props.customBrolls || []).filter((item) => visibleVisualLayer?.kind === 'broll' && item.id === visibleVisualLayer.id);
  const visibleMotionItems = (props.motionGraphicsItems || []).filter((item) => visibleVisualLayer?.kind === 'motion' && item.id === visibleVisualLayer.id);
  const visibleZentryItems = (props.zentryItems || []).filter((item) => visibleVisualLayer?.kind === 'zentry' && item.id === visibleVisualLayer.id);

  return (
    <AbsoluteFill style={{ backgroundColor:'#000000', overflow:'hidden' }}>
      {segments.map((segment,index) => {
        const duration = Math.max(1,Math.round((segment.end-segment.start)*fps));
        const from = segments.slice(0,index).reduce((sum,item) => sum+Math.max(1,Math.round((item.end-item.start)*fps)),0);
        return (
          <Sequence key={`${segment.start}-${index}`} from={from} durationInFrames={duration}>
            {(segment.sharpness ?? 0) > 0 && <svg aria-hidden="true" width="0" height="0" style={{position:'absolute'}}><filter id={`render-sharp-${index}`}><feConvolveMatrix order="3" edgeMode="duplicate" preserveAlpha="true" kernelMatrix={`0 ${-Math.min(1,Math.max(0,segment.sharpness ?? 0))*.08} 0 ${-Math.min(1,Math.max(0,segment.sharpness ?? 0))*.08} ${1+4*Math.min(1,Math.max(0,segment.sharpness ?? 0))*.08} ${-Math.min(1,Math.max(0,segment.sharpness ?? 0))*.08} 0 ${-Math.min(1,Math.max(0,segment.sharpness ?? 0))*.08} 0`} /></filter></svg>}
            <Video name={`Video ${index+1}`} src={segment.src || props.src} trimBefore={Math.round(segment.start*fps)} volume={segment.processedAudioSrc || segment.clipMuted ? 0 : props.volume*(segment.clipVolume ?? 1)} style={{ width:'100%', height:'100%', scale:(props.zoomPunch && index === 0) ? safeInterpolate(frame,[0,10,28],[1,1.08,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}) : 1, filter:`brightness(${segment.brightness ?? 1}) contrast(${segment.contrast ?? 1}) saturate(${segment.saturation ?? 1})${(segment.sharpness ?? 0) > 0 ? ` url(#render-sharp-${index})` : ''}` }} objectFit="contain" />
            {segment.processedAudioSrc && !segment.clipMuted && <Audio src={segment.processedAudioSrc} trimBefore={Math.round(segment.start*fps)} volume={props.volume*(segment.clipVolume ?? 1)} />}
          </Sequence>
        );
      })}
      {props.overlaySrc && !visibleVisualLayer && <Sequence durationInFrames={Math.round(3*fps)}><BuiltInOverlayEffect src={props.overlaySrc} /></Sequence>}
      {/* Custom Overlay B-Rolls (Templates: Blanco Minimal, Rojo Impacto, Negro OLED, o videos Pexels) */}
      {visibleBrolls.map((broll, index) => {
        const from = Math.round(broll.start * fps);
        const durationInFrames = Math.max(1, Math.round(broll.duration * fps));
        return (
          <Sequence key={`custom-broll-${broll.id || index}`} from={from} durationInFrames={durationInFrames}>
            <CustomBrollLayer
              broll={resolveBrollCaptionStyle(broll, props.captionGroupStyles?.find(group=>frame/fps*1000>=group.startMs && frame/fps*1000<group.endMs) || {
                styleId:props.styleId,accentColor:props.accentColor,fontSize:props.fontSize,captionFontFamily:props.captionFontFamily,
                captionFontWeight:props.captionFontWeight,captionItalic:props.captionItalic,dualFontEnabled:props.captionDualFont,
                topFontFamily:props.captionTopFontFamily,bottomFontFamily:props.captionBottomFontFamily,captionAlign:props.captionAlign,
                shadow:props.shadow,popAnimation:props.popAnimation,positionX:props.captionPositionX,positionY:props.captionPositionY ?? 72,
              })}
              durationInFrames={durationInFrames}
              transition={props.brollTransition}
              accentColor={props.accentColor}
              captions={props.captions}
            />
            {broll.templateId && !broll.sfxSrc && broll.templateSfxEnabled !== false && (
              <ZentryPresetSfx
                presetId={broll.templateId}
                volumeMultiplier={props.sfxVolumeMultiplier ?? 1}
              />
            )}
            {broll.sfxEnabled !== false && broll.sfxSrc && props.sfxTimeOverrides?.[`broll-sfx-${broll.id}`] === undefined && (
              <Sequence durationInFrames={Math.min(durationInFrames, Math.max(1, Math.round(2.5 * fps)))}>
                <Audio src={broll.sfxSrc} volume={Math.max(0, Math.min(1, (broll.sfxVolume ?? 0.3)*(props.sfxVolumeMultiplier ?? 1)))} />
              </Sequence>
            )}
            {props.brollTypingSoundSrc &&
              props.captions
                .filter((caption) => {
                  const startSec = caption.startMs / 1000;
                  const endSec = caption.endMs / 1000;
                  return startSec < broll.start + broll.duration && endSec > broll.start;
                })
                .filter((_, captionIndex) => captionIndex % 2 === 0)
                .map((caption, captionIndex) => {
                  const relativeStart = Math.max(0, caption.startMs / 1000 - broll.start);
                  return (
                    <Sequence
                      key={`custom-broll-typing-${broll.id}-${caption.startMs}-${captionIndex}`}
                      from={Math.round(relativeStart * fps)}
                      durationInFrames={Math.max(1, Math.round(Math.min(0.32, Math.max(0.08, (caption.endMs - caption.startMs) / 1000)) * fps))}
                    >
                      <Audio src={props.brollTypingSoundSrc!} volume={Math.min(1,0.24*(props.sfxVolumeMultiplier ?? 1))} />
                    </Sequence>
                  );
                })}
          </Sequence>
        );
      })}
      {/* Filter out auto B-rolls that collide with manual B-rolls or Motion Graphics (PM-02) */}
      {(() => {
        const renderedBrollEvents = (props.brollEvents || []).filter((event) => {
          const hasCustomCollision = (props.customBrolls || []).some(
            (b) => b.start < event.end && b.start + b.duration > event.start
          );
          const hasMgCollision = (props.motionGraphicsItems || []).some(
            (mg) => mg.start < event.end && mg.start + mg.duration > event.start
          );
          return !hasCustomCollision && !hasMgCollision;
        });

        return (
          <>
            {renderedBrollEvents.map((event, index) => {
              const from = Math.round(event.start * fps);
              const durationInFrames = Math.max(1, Math.round((event.end - event.start) * fps));
              return (
                <Sequence key={`${event.src}-${event.start}-${index}`} from={from} durationInFrames={durationInFrames}>
                  <AnimatedBrollLayer
                    event={event}
                    accentColor={props.accentColor}
                    fontFamily={props.brollFontFamily}
                    durationInFrames={durationInFrames}
                    transition={props.brollTransition}
                  />
                </Sequence>
              );
            })}
            {props.brollTypingSoundSrc &&
              renderedBrollEvents.flatMap((event, eventIndex) =>
                event.words
                  .filter((_, wordIndex) => wordIndex % 2 === 0)
                  .map((word, wordIndex) => (
                    <Sequence
                      key={`typing-${eventIndex}-${wordIndex}`}
                      from={Math.round(word.start * fps)}
                      durationInFrames={Math.max(1, Math.round(Math.min(0.58, word.end - word.start) * fps))}
                    >
                      <Audio src={props.brollTypingSoundSrc!} volume={Math.min(1,0.2*(props.sfxVolumeMultiplier ?? 1))} />
                    </Sequence>
                  ))
              )}
          </>
        );
      })()}
      {(props.hookLeadText?.trim() || props.hookMainText?.trim()) && (
        <Sequence durationInFrames={Math.round(hookActiveUntilSec * fps)}>
          <HookLayer
            leadText={props.hookLeadText || ''}
            mainText={props.hookMainText || ''}
            accentColor={props.accentColor}
            x={props.hookPositionX}
            y={props.hookPositionY}
            leadFontFamily={props.hookLeadFontFamily}
            mainFontFamily={props.hookMainFontFamily}
            leadFontSize={props.hookLeadFontSize}
            mainFontSize={props.hookMainFontSize}
            leadDuration={props.hookLeadDuration}
            mainDuration={props.hookMainDuration}
            styleId={props.hookStyle}
          />
        </Sequence>
      )}
      {props.hookSfxSrc && <Sequence from={0} durationInFrames={Math.round(2 * fps)}><Audio src={props.hookSfxSrc} volume={Math.min(1,0.75*(props.sfxVolumeMultiplier ?? 1))} /></Sequence>}
      {props.sfxSrc && <Sequence from={Math.round((props.sfxTimeOverrides?.['manual-sfx'] ?? .35)*fps)}><Audio src={props.sfxSrc} volume={Math.min(1,0.55*(props.sfxVolumeMultiplier ?? 1))} /></Sequence>}
      {(props.manualSfxClips || []).map((clip) => <Sequence key={clip.id} from={Math.round((props.sfxTimeOverrides?.[clip.id] ?? clip.start)*fps)}><Audio src={clip.src} volume={Math.max(0,Math.min(1,clip.volume*(props.sfxVolumeMultiplier ?? 1)))} /></Sequence>)}
      {(props.customBrolls || []).filter((broll) => broll.sfxEnabled !== false && broll.sfxSrc && props.sfxTimeOverrides?.[`broll-sfx-${broll.id}`] !== undefined).map((broll) => <Sequence key={`moved-broll-sfx-${broll.id}`} from={Math.round(props.sfxTimeOverrides![`broll-sfx-${broll.id}`]*fps)} durationInFrames={Math.max(1,Math.round(2.5*fps))}><Audio src={broll.sfxSrc!} volume={Math.max(0,Math.min(1,(broll.sfxVolume ?? .3)*(props.sfxVolumeMultiplier ?? 1)))} /></Sequence>)}
      {(props.musicTracks || []).map((clip) => <Sequence key={clip.id} from={Math.max(0,Math.round(clip.start*fps))} durationInFrames={Math.max(1,Math.round(clip.duration*fps))}>
        <Audio src={clip.src} playbackRate={clip.playbackRate ?? 1} trimBefore={Math.max(0,Math.round(clip.sourceStart*fps))} volume={Math.max(0,Math.min(1,clip.volume))} />
      </Sequence>)}
      {/* Dynamic Contextual SFX (Captura 2: audio viral contextual por palabras clave, brolls y motion graphics) */}
      {props.contextualSfxEvents && props.contextualSfxEvents.map((evt, idx) => (
        <Sequence
          key={`ctx-sfx-${evt.id || idx}`}
          from={Math.round((props.sfxTimeOverrides?.[evt.id] ?? evt.timeSec) * fps)}
          durationInFrames={Math.max(1, Math.round(2.5 * fps))}
        >
          <Audio src={evt.sfxSrc} volume={evt.volume ?? 0.65} />
        </Sequence>
      ))}
      <CaptionLayer
        captions={props.captions}
        styleId={props.styleId}
        accentColor={props.accentColor}
        fontSize={props.fontSize}
        captionFontFamily={props.captionFontFamily}
        captionFontWeight={props.captionFontWeight}
        captionItalic={props.captionItalic}
        captionDualFont={props.captionDualFont}
        captionTopFontFamily={props.captionTopFontFamily}
        captionBottomFontFamily={props.captionBottomFontFamily}
        captionAlign={props.captionAlign}
        shadow={props.shadow}
        popAnimation={props.popAnimation}
        captionPositionX={props.captionPositionX}
        captionPositionY={props.captionPositionY}
        captionGroupStyles={props.captionGroupStyles}
        customBrolls={visibleBrolls}
        brollEvents={(props.brollEvents || []).filter((event) => {
          const hasCustomCollision = (props.customBrolls || []).some(
            (b) => b.start < event.end && b.start + b.duration > event.start
          );
          const hasMgCollision = (props.motionGraphicsItems || []).some(
            (mg) => mg.start < event.end && mg.start + mg.duration > event.start
          );
          return !hasCustomCollision && !hasMgCollision;
        })}
        motionGraphicsItems={visibleMotionItems}
        hookActiveUntilSec={hookActiveUntilSec}
        zentryItems={visibleZentryItems}
      />
      <MotionGraphicsLayer items={visibleMotionItems.map(item=>resolveMotionText(item,props.captions,frame/fps))} accentColor={props.accentColor} />
      {/* Zentry Pro Templates & Motion Layer (Subtítulos, Hooks, Tipografía, B-roll, Motion Graphics + SFX) */}
      {visibleZentryItems.map((item, index) => {
        const tpl = getZentryTemplate(item.presetId);
        if (!tpl) return null;
        const VisualComp = tpl.visualComponent;
        const from = Math.round(item.start * fps);
        const durationInFrames = Math.max(1, Math.round(item.duration * fps));

        return (
          <Sequence
            key={`zentry-item-${item.id || index}`}
            from={from}
            durationInFrames={durationInFrames}
          >
            <AbsoluteFill style={{ pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', ...getZentryLayout(item,width,height) }}>
              <ZentryTextSizeContext.Provider value={item.fontSize ?? 58}><VisualComp
                {...(tpl.defaultProps || {})}
                {...getZentryVisualProps(item)}
                fontSize={item.fontSize ?? 58}
                fontVariant={item.fontVariant || 'montserrat'}
              /></ZentryTextSizeContext.Provider>
            </AbsoluteFill>
            {item.sfxEnabled && props.sfxTimeOverrides?.[`zentry-sfx-${item.id}`] === undefined && (
              <ZentryPresetSfx
                presetId={item.sfxId || tpl.sfxId}
                from={0}
                volumeMultiplier={(item.sfxVolume ?? 1) * (props.sfxVolumeMultiplier ?? 1)}
                offsetFrames={item.offsetFrames}
              />
            )}
          </Sequence>
        );
      })}
      {(props.zentryItems || []).filter((item) => item.sfxEnabled && props.sfxTimeOverrides?.[`zentry-sfx-${item.id}`] !== undefined).map((item) => <Sequence key={`moved-zentry-sfx-${item.id}`} from={Math.round(props.sfxTimeOverrides![`zentry-sfx-${item.id}`]*fps)} durationInFrames={Math.max(1,Math.round(2.5*fps))}><ZentryPresetSfx presetId={item.sfxId || getZentryTemplate(item.presetId)?.sfxId || item.presetId} volumeMultiplier={(item.sfxVolume ?? 1)*(props.sfxVolumeMultiplier ?? 1)} offsetFrames={item.offsetFrames} /></Sequence>)}
      {props.showWatermark && (
        <AbsoluteFill style={{ pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, opacity: 0.72 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 44px', background: 'rgba(9, 9, 9, 0.72)', border: '3px solid rgba(255, 42, 42, 0.65)', borderRadius: 24, boxShadow: '0 12px 40px rgba(0, 0, 0, 0.85), 0 0 30px rgba(255, 42, 42, 0.35)' }}>
              <span style={{ color: '#ffffff', fontWeight: 900, fontSize: 52, letterSpacing: '0.06em', fontFamily: 'Anton, Inter, sans-serif', textTransform: 'uppercase', textShadow: '0 4px 12px rgba(0,0,0,0.9)' }}>
                ZENTRY <span style={{ color: '#ff2a2a' }}>STUDIO</span> <span style={{ color: '#d7ad55' }}>VIP</span>
              </span>
            </div>
            <span style={{ color: '#ffffff', fontSize: 22, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', background: 'rgba(0, 0, 0, 0.6)', padding: '6px 20px', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.2)', textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
              PLAN FREE
            </span>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
