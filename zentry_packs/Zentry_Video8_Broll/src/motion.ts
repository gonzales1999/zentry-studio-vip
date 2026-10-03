import {Easing, interpolate, spring} from 'remotion';

export const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

export const easeOut = Easing.out(Easing.cubic);

export const fadeUp = (frame:number, start:number, duration:number) => {
  const p = interpolate(frame, [start, start + duration], [0, 1], {...clamp, easing:easeOut});
  return {
    opacity: p,
    transform: `translateY(${interpolate(p,[0,1],[34,0])}px)`,
  };
};

export const pop = (frame:number, fps:number, start:number, duration:number) => {
  const s = spring({
    frame: Math.max(0, frame - start),
    fps,
    durationInFrames: duration,
    config: {damping: 8, stiffness: 190, mass: 0.72},
  });
  return {
    opacity: Math.min(1, s * 1.7),
    transform: `scale(${interpolate(s,[0,1],[0.55,1])})`,
  };
};

export const softPop = (frame:number, fps:number, start:number, duration:number) => {
  const s = spring({
    frame: Math.max(0, frame - start),
    fps,
    durationInFrames: duration,
    config: {damping: 13, stiffness: 165, mass: 0.8},
  });
  return {
    opacity: Math.min(1, s * 1.8),
    transform: `translateY(${interpolate(s,[0,1],[20,0])}px) scale(${interpolate(s,[0,1],[0.9,1])})`,
  };
};
