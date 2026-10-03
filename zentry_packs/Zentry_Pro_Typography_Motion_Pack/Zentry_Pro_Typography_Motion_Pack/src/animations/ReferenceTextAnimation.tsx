import React from 'react';
import {FONT_PRIMARY} from '../fonts';
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export type UnitMode = 'whole' | 'lines' | 'words' | 'letters';
export type RefAnimation =
  | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right'
  | 'fade-simple' | 'fade-soft' | 'blur-fade'
  | 'scale-a' | 'scale-b' | 'scale'
  | 'tracking-simple' | 'tracking-elastic'
  | 'reveal-soft' | 'reveal-bounce' | 'flip'
  | 'blur' | 'blur-random' | 'chaotic'
  | 'delete-letters' | 'ascend';

export type ReferenceTextAnimationProps = {
  text: string;
  animation: RefAnimation;
  unit?: UnitMode;
  durationInFrames?: number;
  delay?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number | string;
  color?: string;
  style?: React.CSSProperties;
};

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const easeOut = Easing.out(Easing.cubic);
const easeInOut = Easing.inOut(Easing.cubic);

const getUnits = (text: string, mode: UnitMode) => {
  if (mode === 'letters') return Array.from(text);
  if (mode === 'words') return text.split(/(\s+)/);
  if (mode === 'lines') return text.split('\n');
  return [text];
};

const delayPerUnit = (mode: UnitMode) =>
  mode === 'letters' ? 1.25 : mode === 'words' ? 4 : mode === 'lines' ? 7 : 0;

export const ReferenceTextAnimation: React.FC<ReferenceTextAnimationProps> = ({
  text,
  animation,
  unit = 'whole',
  durationInFrames = 18,
  delay = 0,
  fontSize = 92,
  fontFamily = FONT_PRIMARY,
  fontWeight = 900,
  color = '#fff',
  style,
}) => {
  const frame = useCurrentFrame() - delay;
  const {fps} = useVideoConfig();
  if (frame < 0) return null;

  const units = getUnits(text, unit);
  const stagger = delayPerUnit(unit);

  const renderUnit = (token: string, index: number) => {
    const local = frame - index * stagger;
    const p = interpolate(local, [0, durationInFrames], [0, 1], {
      ...clamp,
      easing: easeOut,
    });
    const smooth = interpolate(local, [0, durationInFrames], [0, 1], {
      ...clamp,
      easing: easeInOut,
    });
    const bounce = spring({
      frame: Math.max(0, local),
      fps,
      durationInFrames: Math.max(10, durationInFrames + 8),
      config: {damping: 7, stiffness: 165, mass: 0.8},
    });
    const elastic = spring({
      frame: Math.max(0, local),
      fps,
      durationInFrames: Math.max(12, durationInFrames + 12),
      config: {damping: 5, stiffness: 205, mass: 0.7},
    });

    let transform = '';
    let opacity = p;
    let filter = 'none';
    let letterSpacing: number | string | undefined;
    let clipPath: string | undefined;

    switch (animation) {
      case 'slide-up':
        transform = `translateY(${interpolate(p, [0,1], [70,0])}px)`;
        break;
      case 'slide-down':
        transform = `translateY(${interpolate(p, [0,1], [-70,0])}px)`;
        break;
      case 'slide-left':
        transform = `translateX(${interpolate(p, [0,1], [120,0])}px)`;
        break;
      case 'slide-right':
        transform = `translateX(${interpolate(p, [0,1], [-120,0])}px)`;
        break;
      case 'fade-simple':
        opacity = p;
        break;
      case 'fade-soft':
        opacity = smooth;
        transform = `translateY(${interpolate(smooth,[0,1],[18,0])}px)`;
        break;
      case 'blur-fade':
        opacity = p;
        filter = `blur(${interpolate(p,[0,1],[18,0])}px)`;
        break;
      case 'scale-a':
        opacity = Math.min(1, bounce * 1.7);
        transform = `scale(${interpolate(bounce,[0,1],[0.45,1])})`;
        break;
      case 'scale-b':
        opacity = p;
        transform = `scale(${interpolate(p,[0,0.55,1],[1.65,0.92,1],clamp)})`;
        break;
      case 'scale':
        opacity = Math.min(1, elastic * 1.6);
        transform = `scale(${interpolate(elastic,[0,1],[0.25,1])})`;
        break;
      case 'tracking-simple':
        opacity = p;
        letterSpacing = interpolate(smooth,[0,1],[24,0]);
        break;
      case 'tracking-elastic':
        opacity = Math.min(1, elastic * 1.6);
        letterSpacing = interpolate(elastic,[0,1],[28,0]);
        break;
      case 'reveal-soft':
        opacity = p;
        clipPath = `inset(${interpolate(p,[0,1],[100,0])}% 0 0 0)`;
        transform = `translateY(${interpolate(p,[0,1],[38,0])}px)`;
        break;
      case 'reveal-bounce':
        opacity = Math.min(1, bounce * 1.7);
        transform = `translateY(${interpolate(bounce,[0,1],[95,0])}px)`;
        break;
      case 'flip':
        opacity = p;
        transform = `perspective(900px) rotateX(${interpolate(p,[0,1],[88,0])}deg)`;
        break;
      case 'blur':
        opacity = p;
        filter = `blur(${interpolate(p,[0,1],[14,0])}px)`;
        transform = `translateY(${interpolate(p,[0,1],[28,0])}px)`;
        break;
      case 'blur-random': {
        const seed = (index * 9301 + 49297) % 233280;
        const random = seed / 233280;
        const dir = random > 0.5 ? 1 : -1;
        opacity = p;
        filter = `blur(${interpolate(p,[0,1],[18,0])}px)`;
        transform = `translate(${dir * interpolate(p,[0,1],[55,0])}px, ${interpolate(p,[0,1],[35*(random-.5),0])}px)`;
        break;
      }
      case 'chaotic': {
        const wave = (1-p) * Math.sin((index + 1) * 3.7 + local * 0.8);
        opacity = p;
        filter = `blur(${(1-p)*16}px)`;
        transform = `translate(${wave*55}px, ${wave*34}px) rotate(${wave*10}deg)`;
        break;
      }
      case 'delete-letters': {
        // Exit-style effect: visible first, letters disappear sequentially.
        const q = interpolate(local, [0, durationInFrames], [1, 0], clamp);
        opacity = q;
        transform = `translateY(${interpolate(q,[1,0],[0,-28])}px) scale(${interpolate(q,[1,0],[1,0.82])})`;
        filter = `blur(${interpolate(q,[1,0],[0,7])}px)`;
        break;
      }
      case 'ascend':
        opacity = p;
        transform = `translateY(${interpolate(p,[0,1],[115,0])}px) rotate(${interpolate(p,[0,1],[6,0])}deg)`;
        break;
    }

    const isSpace = /^\s+$/.test(token);
    return (
      <span
        key={`${token}-${index}`}
        style={{
          display: unit === 'lines' ? 'block' : 'inline-block',
          whiteSpace: isSpace ? 'pre' : undefined,
          marginRight: unit === 'words' && !isSpace ? '0.22em' : undefined,
          opacity,
          transform,
          filter,
          letterSpacing,
          clipPath,
          transformOrigin: '50% 50%',
          willChange: 'transform, opacity, filter, clip-path',
        }}
      >
        {token}
      </span>
    );
  };

  return (
    <div
      style={{
        fontSize,
        fontFamily,
        fontWeight,
        color,
        lineHeight: 1.0,
        textAlign: 'center',
        ...style,
      }}
    >
      {units.map(renderUnit)}
    </div>
  );
};
