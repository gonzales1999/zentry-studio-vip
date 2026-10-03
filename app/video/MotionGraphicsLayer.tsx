import React from 'react';
import { AbsoluteFill, Easing, Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { safeInterpolate } from './safeInterpolate';
import type { MotionGraphicItem } from './types';
import {AnimatedMotionText} from './AnimatedMotionText';
import {MotionSceneObjects} from './MotionSceneObjects';

interface MotionGraphicsLayerProps {
  items: MotionGraphicItem[];
  accentColor: string;
}

const MOTION_3D_BACKGROUNDS: Record<string, string> = {
  'editorial-bw': 'linear-gradient(145deg, #050505 0%, #262626 52%, #7f1d1d 100%)',
  'cinematic-black': 'radial-gradient(circle at 50% 35%, #164e63 0%, #07111b 42%, #020617 100%)',
  'photoreal-3d': 'linear-gradient(155deg, #0f172a 0%, #1d4ed8 46%, #020617 100%)',
  'collage-vintage': 'linear-gradient(135deg, #f5deb3 0%, #c08457 45%, #3f2d24 100%)',
};

const SingleMotionGraphicItem: React.FC<{
  item: MotionGraphicItem;
  accentColor: string;
  durationFrames: number;
  fps: number;
}> = ({ item, accentColor, durationFrames, fps }) => {
  const localFrame = useCurrentFrame();
  const is3DStyle =
    item.type === '3d-scene' ||
    item.style === 'editorial-bw' ||
    item.style === 'cinematic-black' ||
    item.style === 'photoreal-3d' ||
    item.style === 'collage-vintage';

  // Safe fade in and fade exit
  const enterFrames = Math.max(1, Math.min(10, Math.floor(durationFrames * 0.25)));
  const exitFrames = Math.max(1, Math.min(10, Math.floor(durationFrames * 0.25)));
  const safeExitStart = Math.max(enterFrames + 1, durationFrames - exitFrames);
  const safeEnd = Math.max(safeExitStart + 1, durationFrames);

  const overallOpacity = safeInterpolate(
    localFrame,
    [0, enterFrames, safeExitStart, safeEnd],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <>
      {/* Universal Entry Sound for any motion graphic style (3D, editorial, apple, neon) */}
      {item.sfxSrc && (
        <Sequence from={0} durationInFrames={Math.min(durationFrames, Math.round(fps * 2.5))}>
          <Audio src={item.sfxSrc} volume={0.65} />
        </Sequence>
      )}

      {is3DStyle ? (
        (() => {
          const styleKey = item.style in MOTION_3D_BACKGROUNDS ? item.style : 'editorial-bw';
          const generatedBackground = MOTION_3D_BACKGROUNDS[styleKey];
          const isFloating = item.displayMode === 'floating';

          // Parse kinetic title
          const rawTitle = item.title || '';
          const words = rawTitle.split(/\s+/).filter(Boolean);

          // Kinetic line expansion
          const lineSpring = spring({
            frame: Math.max(0, localFrame - 4),
            fps,
            config: { damping: 16, stiffness: 100 },
          });

          // Entry 3D card scale for floating mode
          const cardSpring = spring({
            frame: localFrame,
            fps,
            config: { damping: 14, stiffness: 120 },
          });

          const theme = item.cardTheme || item.highlightTemplate || 'glass';
          const animMode = item.wordAnimationMode || 'spring';

          let cardBg = 'rgba(12, 14, 20, 0.88)';
          let cardBorder = `2px solid ${styleKey === 'editorial-bw' ? '#ff2a2a' : styleKey === 'cinematic-black' ? '#00f5c8' : '#ffd500'}88`;
          let cardShadow = `0 20px 60px rgba(0,0,0,0.85), 0 0 35px ${accentColor}44`;
          let defaultWordColor = '#ffffff';
          let defaultWordShadow = '0 6px 20px rgba(0,0,0,0.95), 0 2px 4px #000';
          let decorLineColor = styleKey === 'editorial-bw' ? '#ff2a2a' : styleKey === 'cinematic-black' ? '#00f5c8' : '#ffffff';

          if (theme === 'white') {
            cardBg = '#ffffff';
            cardBorder = '2px solid #e2e8f0';
            cardShadow = '0 25px 60px rgba(0,0,0,0.22), 0 0 35px rgba(255,255,255,0.7)';
            defaultWordColor = '#0f172a';
            defaultWordShadow = 'none';
            decorLineColor = '#0f172a';
          } else if (theme === 'red') {
            cardBg = 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)';
            cardBorder = '2px solid #f87171';
            cardShadow = '0 25px 60px rgba(220,38,38,0.55), 0 0 40px rgba(239,68,68,0.4)';
            defaultWordColor = '#ffffff';
            defaultWordShadow = '0 4px 14px rgba(0,0,0,0.6)';
            decorLineColor = '#fef08a';
          } else if (theme === 'black') {
            cardBg = '#000000';
            cardBorder = '2px solid #27272a';
            cardShadow = '0 30px 70px rgba(0,0,0,0.95), 0 0 25px rgba(255,255,255,0.1)';
            defaultWordColor = '#ffffff';
            defaultWordShadow = '0 6px 20px rgba(0,0,0,0.95)';
            decorLineColor = '#00f5c8';
          } else if (theme === 'yellow') {
            cardBg = 'linear-gradient(135deg, #facc15 0%, #eab308 100%)';
            cardBorder = '2px solid #ca8a04';
            cardShadow = '0 25px 50px rgba(234,179,8,0.45)';
            defaultWordColor = '#0a0a0a';
            defaultWordShadow = 'none';
            decorLineColor = '#000000';
          } else if (theme === 'neon') {
            cardBg = 'rgba(6, 15, 28, 0.94)';
            cardBorder = '2px solid #06b6d4';
            cardShadow = '0 25px 60px rgba(0,0,0,0.85), 0 0 40px rgba(6,182,212,0.45)';
            defaultWordColor = '#ffffff';
            defaultWordShadow = '0 0 15px rgba(6,182,212,0.5)';
            decorLineColor = '#06b6d4';
          }

          return (
            <AbsoluteFill
              key={item.id}
              style={{
                opacity: overallOpacity,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isFloating ? 'flex-start' : 'center',
                paddingTop: isFloating ? '18%' : 0,
              }}
            >
              {/* Generated full-screen scene: no catalog preview video is embedded. */}
              {!isFloating && (
                <AbsoluteFill style={{ overflow: 'hidden', background: generatedBackground }}>
                  <div style={{ position: 'absolute', width: 560, height: 560, borderRadius: '50%', left: -180, top: 140, background: 'radial-gradient(circle, rgba(255,255,255,.18), transparent 68%)', scale: safeInterpolate(localFrame, [0, 30], [0.75, 1], { extrapolateRight: 'clamp' }) }} />
                  <div style={{ position: 'absolute', width: 520, height: 900, right: -180, top: -80, rotate: '18deg', background: 'linear-gradient(180deg, rgba(255,255,255,.12), transparent)' }} />
                  <AbsoluteFill
                    style={{
                      background:
                        styleKey === 'editorial-bw'
                          ? 'radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.78) 100%)'
                          : styleKey === 'cinematic-black'
                          ? 'radial-gradient(circle at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)'
                          : 'radial-gradient(circle at center, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.65) 100%)',
                    }}
                  />
                </AbsoluteFill>
              )}

              {/* Floating 3D Container Styled with Selected Card Theme */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  width: isFloating ? '84%' : '88%',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: isFloating ? 12 : 16,
                  padding: isFloating ? '26px 20px' : 0,
                  borderRadius: isFloating ? 28 : 0,
                  background: isFloating ? cardBg : 'transparent',
                  border: isFloating ? cardBorder : 'none',
                  boxShadow: isFloating ? cardShadow : 'none',
                  backdropFilter: isFloating && theme === 'glass' ? 'blur(20px)' : undefined,
                  transform: (() => {
                    const trans = item.entranceTransition || (item.style === 'cinematic-black' ? 'slide-left' : 'slide-up');
                    if (trans === 'slide-left') {
                      const x = safeInterpolate(cardSpring, [0, 1], [-200, 0]);
                      const ry = safeInterpolate(cardSpring, [0, 1], [-18, 0]);
                      return isFloating
                        ? `perspective(1000px) translateX(${x}px) rotateY(${ry}deg) scale(${cardSpring})`
                        : `perspective(1000px) translateX(${x}px) rotateY(${ry}deg)`;
                    }
                    if (trans === 'slide-right') {
                      const x = safeInterpolate(cardSpring, [0, 1], [200, 0]);
                      const ry = safeInterpolate(cardSpring, [0, 1], [18, 0]);
                      return isFloating
                        ? `perspective(1000px) translateX(${x}px) rotateY(${ry}deg) scale(${cardSpring})`
                        : `perspective(1000px) translateX(${x}px) rotateY(${ry}deg)`;
                    }
                    if (trans === 'pop-3d') {
                      const s = safeInterpolate(cardSpring, [0, 1], [0.65, 1]);
                      const rx = safeInterpolate(cardSpring, [0, 1], [25, 0]);
                      return isFloating
                        ? `perspective(1000px) rotateX(${rx}deg) scale(${s})`
                        : `perspective(1000px) rotateX(${rx}deg) scale(${s})`;
                    }
                    // default: slide-up
                    const y = safeInterpolate(cardSpring, [0, 1], [140, 0]);
                    const rx = safeInterpolate(cardSpring, [0, 1], [18, 0]);
                    return isFloating
                      ? `perspective(1000px) translateY(${y}px) rotateX(${rx}deg) scale(${cardSpring})`
                      : `perspective(1000px) translateY(${y}px) rotateX(${safeInterpolate(localFrame, [0, 15], [6, 0], { extrapolateRight: 'clamp' })}deg)`;
                  })(),
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Floating Transparent 3D Icon Cutout */}
                <MotionSceneObjects item={item} time={item.start+localFrame/fps} accent={accentColor}/>

                {/* Word-by-Word Typing Sound Effect */}
                {words.map((_, wIdx) => {
                  const wordDelayFrames = Math.round(wIdx * 3.5);
                  return (
                    <Sequence
                      key={`type-sfx-${item.id}-${wIdx}`}
                      from={wordDelayFrames}
                      durationInFrames={Math.max(2, Math.round(fps * 0.12))}
                    >
                      <Audio src="/assets/sfx/keyboard-mechanical.wav" volume={0.35} />
                    </Sequence>
                  );
                })}

                {/* Eyebrow / Subtitle above (only when custom and relevant) */}
                {item.subtitle &&
                  !item.subtitle.toLowerCase().includes('profesional') &&
                  !item.subtitle.toLowerCase().includes('asegurada') &&
                  !item.subtitle.toLowerCase().includes('contenido') && (
                    <div
                      style={{
                        fontSize: isFloating ? 24 : 28,
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: theme === 'white' ? '#475569' : styleKey === 'editorial-bw' ? '#ffffff' : accentColor,
                        opacity: safeInterpolate(localFrame, [0, 8], [0, 1], {
                          extrapolateLeft: 'clamp',
                          extrapolateRight: 'clamp',
                        }),
                        textShadow: theme === 'white' ? 'none' : '0 4px 16px rgba(0,0,0,0.9)',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {item.subtitle}
                    </div>
                  )}

                {/* Animated Top Decor Line */}
                <div
                  style={{
                    width: `${lineSpring * 65}%`,
                    height: 4,
                    background: decorLineColor,
                    borderRadius: 9999,
                    boxShadow: theme === 'white' ? 'none' : `0 0 12px ${decorLineColor}`,
                  }}
                />

                {/* 2-by-2 Kinetic Word Animation */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '12px 16px',
                    lineHeight: 1.15,
                  }}
                >
                  {item.dualFont ? <AnimatedMotionText item={item} time={item.start+localFrame/fps} color={theme==='white' || theme==='yellow' ? '#111827' : '#ffffff'} accent={accentColor} /> : words.map((word, wIdx) => {
                    const isBracket = word.startsWith('[') && word.endsWith(']');
                    const cleanWord = isBracket ? word.slice(1, -1) : word;
                    const isHighlighted =
                      isBracket ||
                      (item.highlightWord &&
                        cleanWord.toLowerCase().includes(item.highlightWord.toLowerCase()));

                    // Group words in pairs of 2: Pair 0 enters first, then Pair 1 enters 6 frames later
                    const pairIdx = Math.floor(wIdx / 2);
                    const pairDelay = pairIdx * 6;
                    const intraPairDelay = (wIdx % 2) * 1.5;
                    const wordFrame = Math.max(0, localFrame - pairDelay - intraPairDelay);
                    const wordSpring = spring({
                      frame: wordFrame,
                      fps,
                      config: { damping: 14, stiffness: 155 },
                    });
                    const wordOpacity = safeInterpolate(wordFrame, [0, 4], [0, 1], {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    });

                    // Directional entrance per 2-word pair:
                    // Pair 0: pops from bottom (translateY)
                    // Pair 1: slides in from left (translateX)
                    // Pair 2: slides in from right (translateX)
                    const isPair0 = pairIdx % 3 === 0;
                    const isPair1 = pairIdx % 3 === 1;

                    const wordY = isPair0 ? safeInterpolate(wordSpring, [0, 1], [36, 0]) : 0;
                    const wordX = isPair1
                      ? safeInterpolate(wordSpring, [0, 1], [-45, 0])
                      : !isPair0
                      ? safeInterpolate(wordSpring, [0, 1], [45, 0])
                      : 0;
                    const wordRot = safeInterpolate(wordSpring, [0, 1], [wIdx % 2 === 0 ? 3 : -3, 0]);

                    let badgeBg = '#ff2a2a';
                    let badgeColor = '#ffffff';
                    let badgeShadow = '0 8px 30px rgba(0,0,0,0.85), 0 0 35px rgba(255,42,42,0.6)';

                    if (theme === 'white') {
                      badgeBg = '#0f172a';
                      badgeColor = '#ffffff';
                      badgeShadow = '0 8px 24px rgba(0,0,0,0.25)';
                    } else if (theme === 'red') {
                      badgeBg = '#fef08a';
                      badgeColor = '#000000';
                      badgeShadow = '0 8px 25px rgba(0,0,0,0.7), 0 0 30px rgba(254,240,138,0.7)';
                    } else if (theme === 'yellow') {
                      badgeBg = '#000000';
                      badgeColor = '#ffffff';
                      badgeShadow = '0 8px 25px rgba(0,0,0,0.7)';
                    } else if (theme === 'neon') {
                      badgeBg = '#06b6d4';
                      badgeColor = '#000000';
                      badgeShadow = '0 8px 30px rgba(0,0,0,0.85), 0 0 35px rgba(6,182,212,0.8)';
                    } else if (theme === 'black') {
                      badgeBg = '#00f5c8';
                      badgeColor = '#000000';
                      badgeShadow = '0 8px 30px rgba(0,0,0,0.85), 0 0 35px rgba(0,245,200,0.7)';
                    }

                    // Word animation modes
                    let wordTransform = `translateZ(${isFloating ? 30 : 15}px) translateX(${wordX}px) translateY(${wordY}px) rotate(${wordRot}deg) scale(${safeInterpolate(wordSpring, [0, 1], [0.85, 1])})`;
                    let wordBadgeTransform = `translateZ(${isFloating ? 50 : 35}px) translateX(${wordX}px) translateY(${wordY}px) rotate(${wordRot}deg) scale(${wordSpring})`;

                    if (animMode === 'typewriter') {
                      const typedScale = wordFrame < 2 ? 1.08 : 1;
                      wordTransform = `translateZ(${isFloating ? 25 : 10}px) scale(${typedScale})`;
                      wordBadgeTransform = `translateZ(${isFloating ? 40 : 25}px) scale(${typedScale * 1.05})`;
                    } else if (animMode === 'elevation3d') {
                      const elevZ = safeInterpolate(wordSpring, [0, 1], [-80, isFloating ? 30 : 15]);
                      const elevRotX = safeInterpolate(wordSpring, [0, 1], [40, 0]);
                      wordTransform = `perspective(600px) rotateX(${elevRotX}deg) translateZ(${elevZ}px) scale(${wordSpring})`;
                      wordBadgeTransform = `perspective(600px) rotateX(${elevRotX}deg) translateZ(${elevZ + 20}px) scale(${wordSpring * 1.05})`;
                    } else if (animMode === 'glow') {
                      const glowScale = safeInterpolate(wordSpring, [0, 1], [0.5, 1]);
                      wordTransform = `translateZ(${isFloating ? 30 : 15}px) scale(${glowScale})`;
                      wordBadgeTransform = `translateZ(${isFloating ? 50 : 35}px) scale(${wordSpring * 1.08})`;
                    }

                    if (isHighlighted) {
                      return (
                        <span
                          key={wIdx}
                          style={{
                            display: 'inline-block',
                            opacity: wordOpacity,
                            transform: wordBadgeTransform,
                            background: badgeBg,
                            color: badgeColor,
                            fontWeight: 900,
                            fontSize: item.fontSize ?? 58,
                            padding: isFloating ? '4px 18px' : '4px 22px',
                            borderRadius: 14,
                            boxShadow: badgeShadow,
                            fontFamily: 'Anton, Inter, sans-serif',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {cleanWord}
                        </span>
                      );
                    }

                    return (
                      <span
                        key={wIdx}
                        style={{
                          display: 'inline-block',
                          opacity: wordOpacity,
                          transform: wordTransform,
                          color: defaultWordColor,
                          fontSize: item.fontSize ?? 58,
                          fontWeight: 900,
                          fontFamily:
                            styleKey === 'collage-vintage'
                              ? 'Bebas Neue, Anton, sans-serif'
                              : 'Anton, Inter, sans-serif',
                          letterSpacing: '-0.02em',
                          textShadow: defaultWordShadow,
                          textTransform: 'uppercase',
                        }}
                      >
                        {cleanWord}
                      </span>
                    );
                  })}
                </div>

                {/* Animated Bottom Decor Line */}
                <div
                  style={{
                    width: `${lineSpring * 40}%`,
                    height: 4,
                    background: decorLineColor,
                    borderRadius: 9999,
                    boxShadow: theme === 'white' ? 'none' : `0 0 10px ${decorLineColor}`,
                  }}
                />

                {/* Additional Value or CTA below */}
                {item.value && (
                  <div
                    style={{
                      fontSize: 34,
                      fontWeight: 800,
                      color: '#ffffff',
                      background: 'rgba(0,0,0,0.65)',
                      padding: '8px 24px',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.2)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
                      opacity: safeInterpolate(localFrame, [0, 14], [0, 1], {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp',
                      }),
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {item.value}
                  </div>
                )}
              </div>
            </AbsoluteFill>
          );
        })()
      ) : (
        (() => {
          // ==========================================
          // SMART OVERLAY CARDS (Apple Glass, Neon, Editorial)
          // ==========================================
          const posX = item.positionX ?? 50;
        const posY = item.positionY ?? 50;
        const overlayEnterFrames = Math.max(1, Math.min(10, Math.floor(durationFrames * 0.25)));
        const overlayExitFrames = Math.max(1, Math.min(10, Math.floor(durationFrames * 0.25)));
        const overlayExitStart = Math.max(overlayEnterFrames + 1, durationFrames - overlayExitFrames);
        const overlayEnd = Math.max(overlayExitStart + 1, durationFrames);

        const scale = safeInterpolate(
          localFrame,
          [0, Math.max(1, Math.round(overlayEnterFrames * 0.7)), Math.max(2, overlayEnterFrames)],
          [0.65, 1.08, 1],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.back(1.8)),
          }
        );

        const translateY = safeInterpolate(
          localFrame,
          [0, overlayEnterFrames, overlayExitStart, overlayEnd],
          [30, 0, 0, -25],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        const isApple = item.style === 'apple';
        const isNeon = item.style === 'neon';
        const isEditorial = item.style === 'editorial';

        const containerStyle: React.CSSProperties = {
          position: 'absolute',
          left: `${posX}%`,
          top: `${posY}%`,
          transform: `translate(-50%, -50%) translateY(${translateY}px) scale(${scale})`,
          opacity: overallOpacity,
          maxWidth: '86%',
          minWidth: 420,
          padding: '24px 30px',
          borderRadius: isApple ? 26 : isNeon ? 20 : 12,
          background: isApple
            ? 'rgba(18, 20, 29, 0.84)'
            : isNeon
            ? 'rgba(10, 12, 18, 0.94)'
            : '#ffffff',
          color: isEditorial ? '#111111' : '#ffffff',
          border: isApple
            ? '1.5px solid rgba(255, 255, 255, 0.18)'
            : isNeon
            ? `2px solid ${accentColor}`
            : '3.5px solid #000000',
          boxShadow: isApple
            ? '0 24px 60px rgba(0, 0, 0, 0.75)'
            : isNeon
            ? `0 0 35px ${accentColor}55, 0 20px 45px rgba(0,0,0,0.85)`
            : '8px 8px 0px #000000',
          backdropFilter: 'blur(20px)',
          fontFamily: isEditorial ? 'Playfair Display, serif' : 'Inter, sans-serif',
          textAlign: 'center',
          boxSizing: 'border-box',
        };

        return (
          <div key={item.id} style={containerStyle}>
            {item.type === 'stat' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                {item.title && (
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      opacity: isEditorial ? 0.75 : 0.8,
                      color: isEditorial ? '#222' : '#aaa',
                    }}
                  >
                    {item.title}
                  </span>
                )}
                <span
                  style={{
                    fontSize: 78,
                    fontWeight: 900,
                    fontFamily: isEditorial ? 'Playfair Display, serif' : 'Anton, Inter, sans-serif',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    color: isEditorial ? '#000000' : isNeon ? accentColor : '#ffffff',
                    textShadow: isNeon ? `0 0 25px ${accentColor}` : 'none',
                  }}
                >
                  {item.value || '+350%'}
                </span>
                {item.subtitle && (
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      opacity: 0.85,
                      marginTop: 4,
                      color: isEditorial ? '#444' : '#e0e0e0',
                    }}
                  >
                    {item.subtitle}
                  </span>
                )}
              </div>
            )}

            {item.type === 'notif' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: 'linear-gradient(135deg, #FF007A, #7928CA)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                      }}
                    >
                      🔔
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 700, color: isEditorial ? '#000' : '#fff' }}>
                      {item.title || 'Nueva Notificación'}
                    </span>
                  </div>
                  <span style={{ fontSize: 16, opacity: 0.5 }}>{item.subtitle || 'ahora'}</span>
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: isEditorial ? '#111' : isNeon ? '#00f5c8' : '#ffffff',
                  }}
                >
                  {item.value || 'Tu cuenta ha sido verificada con éxito'}
                </div>
              </div>
            )}

            {item.type === 'apps' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: isNeon ? accentColor : isEditorial ? '#000' : '#fff',
                  }}
                >
                  {item.title || 'STACK DE APLICACIONES'}
                </span>
                <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
                  {['🤖', '✦', '📝', '⚡'].map((emoji, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 14,
                        background: isApple ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.3)',
                        border: idx === 0 ? `2px solid ${accentColor}` : '1px solid rgba(255,255,255,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 28,
                        boxShadow: idx === 0 ? `0 0 20px ${accentColor}88` : 'none',
                      }}
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
                {item.subtitle && <span style={{ fontSize: 18, opacity: 0.8 }}>{item.subtitle}</span>}
              </div>
            )}

            {item.type === 'checklist' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: isNeon ? accentColor : isEditorial ? '#000' : '#fff',
                  }}
                >
                  {item.title || 'REGLAS DEL ÉXITO'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, fontWeight: 700 }}>
                  <span style={{ color: '#00f5c8', fontSize: 24 }}>✓</span>
                  <span>{item.value || 'Ganchos de 3 segundos'}</span>
                </div>
                {item.subtitle && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, fontWeight: 700 }}>
                    <span style={{ color: '#00f5c8', fontSize: 24 }}>✓</span>
                    <span>{item.subtitle}</span>
                  </div>
                )}
              </div>
            )}

            {item.type === 'progress' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 22, fontWeight: 800 }}>{item.title || 'COMPLETADO'}</span>
                  <span style={{ fontSize: 28, fontWeight: 900, color: accentColor }}>
                    {item.value || '88%'}
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: 14,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.15)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: item.value?.includes('%') ? item.value : '88%',
                      height: '100%',
                      borderRadius: 8,
                      background: `linear-gradient(90deg, ${accentColor}, #00f5c8)`,
                      boxShadow: `0 0 16px ${accentColor}`,
                    }}
                  />
                </div>
                {item.subtitle && <span style={{ fontSize: 16, opacity: 0.75, textAlign: 'left' }}>{item.subtitle}</span>}
              </div>
            )}

            {item.type === 'quote' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 30, fontWeight: 700, fontStyle: 'italic', lineHeight: 1.25 }}>
                  “{item.value || item.title || 'La disciplina vence al talento cuando el talento no se disciplina.'}”
                </div>
                {item.subtitle && (
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      opacity: 0.8,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: isNeon ? accentColor : undefined,
                    }}
                  >
                    — {item.subtitle}
                  </span>
                )}
              </div>
            )}

            {item.type === 'alert' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 24 }}>⚠️</span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: '#ff3b30', letterSpacing: '0.06em' }}>
                    {item.title || 'ATENCIÓN'}
                  </span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: isEditorial ? '#111' : '#fff' }}>
                  {item.value || 'No cometas este error en tus primeros videos'}
                </div>
                {item.subtitle && <span style={{ fontSize: 16, opacity: 0.75 }}>{item.subtitle}</span>}
              </div>
            )}

            {item.type === 'pill' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                <span
                  style={{
                    background: accentColor,
                    color: '#000',
                    fontWeight: 900,
                    fontSize: 20,
                    padding: '6px 16px',
                    borderRadius: 999,
                    letterSpacing: '0.08em',
                  }}
                >
                  {item.title || 'TIP CLAVE'}
                </span>
                <span style={{ fontSize: 26, fontWeight: 800 }}>{item.value || 'Edición Dinámica'}</span>
              </div>
            )}
            </div>
          );
        })()
      )}
    </>
  );
};

export const MotionGraphicsLayer: React.FC<MotionGraphicsLayerProps> = ({ items, accentColor }) => {
  const { fps } = useVideoConfig();

  if (!items || !items.length) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 15 }}>
      {items.map((item) => {
        const startFrame = Math.round(item.start * fps);
        const durationFrames = Math.max(1, Math.round(item.duration * fps));

        return (
          <Sequence
            key={item.id}
            from={startFrame}
            durationInFrames={durationFrames}
          >
            <SingleMotionGraphicItem
              item={item}
              accentColor={accentColor}
              durationFrames={durationFrames}
              fps={fps}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
