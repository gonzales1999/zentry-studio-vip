import React from 'react';
import {AbsoluteFill, Composition} from 'remotion';
import {ReferenceTextAnimation} from './animations';
import {REFERENCE_ANIMATION_PRESETS} from './animations/presets';
import {
  CleanSerifHero, YellowBubble, GradientSerif, YellowMicroKaraoke,
  MarkerHandwritten, TutorialCaps, MintSerifHero, YellowGlowSerif
} from './subtitles';

const BG: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{
    background:'linear-gradient(145deg,#111827,#05070c)',
    justifyContent:'center',
    alignItems:'center',
    color:'#fff'
  }}>{children}</AbsoluteFill>
);

const AnimationPreview: React.FC<{index:number}> = ({index}) => {
  const p = REFERENCE_ANIMATION_PRESETS[index];
  return <BG>
    <ReferenceTextAnimation
      text={"ZENTRY\nMOTION"}
      animation={p.animation}
      unit={p.unit}
      fontSize={112}
      fontWeight={950}
    />
  </BG>;
};

const SubtitleBG: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{
    background:'linear-gradient(180deg,#6b402d,#2a1d1a)',
    color:'#fff'
  }}>
    <div style={{
      position:'absolute', left:170, top:260, width:740, height:1080,
      borderRadius:60, background:'rgba(255,255,255,.05)'
    }} />
    {children}
  </AbsoluteFill>
);

const S = [
  CleanSerifHero, YellowBubble, GradientSerif, YellowMicroKaraoke,
  MarkerHandwritten, TutorialCaps, MintSerifHero, YellowGlowSerif
];

export const RemotionRoot: React.FC = () => (
  <>
    {REFERENCE_ANIMATION_PRESETS.map((p, i) => (
      <Composition
        key={p.id}
        id={`Anim-${p.id}`}
        component={() => <AnimationPreview index={i} />}
        durationInFrames={60}
        fps={30}
        width={1080}
        height={1920}
      />
    ))}
    {S.map((Comp, i) => (
      <Composition
        key={`sub-${i}`}
        id={`Subtitle-S${String(i+1).padStart(2,'0')}`}
        component={() => <SubtitleBG><Comp main={['preguntando','animaciones','Premiere','listo','Animaciones','ARRASTRARLO','complicaciones','"Texto"'][i]} /></SubtitleBG>}
        durationInFrames={60}
        fps={30}
        width={1080}
        height={1920}
      />
    ))}
  </>
);
