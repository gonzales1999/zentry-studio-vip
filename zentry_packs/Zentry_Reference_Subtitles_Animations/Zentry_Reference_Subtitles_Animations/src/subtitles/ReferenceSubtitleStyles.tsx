import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {ReferenceTextAnimation} from '../animations';

const wrap: React.CSSProperties = {
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  pointerEvents: 'none',
};

type Props = {
  top?: string;
  main: string;
  color?: string;
};

export const CleanSerifHero: React.FC<Props> = ({top='La gente me sigue', main='preguntando'}) => (
  <AbsoluteFill style={wrap}>
    <div style={{transform:'translateY(210px)'}}>
      <ReferenceTextAnimation text={top} animation="fade-soft" unit="words" fontSize={38} fontWeight={500} />
      <ReferenceTextAnimation
        text={main}
        animation="reveal-soft"
        unit="whole"
        delay={7}
        fontSize={100}
        fontFamily="Georgia, serif"
        fontWeight={700}
        style={{fontStyle:'italic', textShadow:'0 5px 12px rgba(0,0,0,.35)'}}
      />
    </div>
  </AbsoluteFill>
);

export const YellowBubble: React.FC<Props> = ({top='cómo hago estas', main='animaciones'}) => (
  <AbsoluteFill style={wrap}>
    <div style={{transform:'translateY(-250px)'}}>
      <ReferenceTextAnimation text={top} animation="slide-up" unit="words" fontSize={36} fontWeight={650} />
      <ReferenceTextAnimation
        text={main}
        animation="reveal-bounce"
        unit="letters"
        delay={4}
        fontSize={100}
        color="#ffe700"
        fontWeight={950}
        style={{letterSpacing:-4, textShadow:'0 4px 0 rgba(0,0,0,.08)'}}
      />
    </div>
  </AbsoluteFill>
);

export const GradientSerif: React.FC<Props> = ({top='dentro de', main='Premiere'}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame,[0,16],[0,1],{extrapolateLeft:'clamp', extrapolateRight:'clamp'});
  return (
    <AbsoluteFill style={wrap}>
      <div style={{transform:'translateY(240px)'}}>
        <ReferenceTextAnimation text={top} animation="fade-soft" unit="words" fontSize={38} fontWeight={550} />
        <div style={{
          fontFamily:'Georgia, serif',
          fontStyle:'italic',
          fontWeight:800,
          fontSize:108,
          opacity:p,
          transform:`translateY(${(1-p)*45}px) scale(${.88+.12*p})`,
          background:'linear-gradient(90deg,#fff,#c96cff,#ff73b8)',
          WebkitBackgroundClip:'text',
          color:'transparent',
          textShadow:'0 7px 18px rgba(171,56,255,.22)'
        }}>{main}</div>
      </div>
    </AbsoluteFill>
  );
};

export const YellowMicroKaraoke: React.FC<Props> = ({main='listo'}) => (
  <AbsoluteFill style={wrap}>
    <div style={{transform:'translateY(180px)'}}>
      <ReferenceTextAnimation
        text={main}
        animation="fade-soft"
        unit="whole"
        fontSize={34}
        color="#f5e846"
        fontFamily="Georgia, serif"
        fontWeight={500}
      />
    </div>
  </AbsoluteFill>
);

export const MarkerHandwritten: React.FC<Props> = ({main='Animaciones'}) => (
  <AbsoluteFill style={{...wrap, justifyContent:'flex-start', paddingTop:210}}>
    <ReferenceTextAnimation
      text={main}
      animation="tracking-elastic"
      unit="letters"
      fontSize={92}
      color="#ffe600"
      fontWeight={950}
      style={{letterSpacing:-4}}
    />
    <div style={{marginTop:10}}>
      <ReferenceTextAnimation
        text="(5 segundos)"
        animation="fade-soft"
        unit="letters"
        delay={8}
        fontSize={38}
        fontFamily="cursive"
        fontWeight={500}
      />
    </div>
  </AbsoluteFill>
);

export const TutorialCaps: React.FC<Props> = ({main='ARRASTRARLO'}) => (
  <AbsoluteFill style={{...wrap, justifyContent:'flex-start', paddingTop:340}}>
    <ReferenceTextAnimation
      text={main}
      animation="slide-up"
      unit="words"
      fontSize={58}
      fontWeight={950}
      style={{textShadow:'0 3px 6px rgba(0,0,0,.6)'}}
    />
  </AbsoluteFill>
);

export const MintSerifHero: React.FC<Props> = ({main='complicaciones'}) => (
  <AbsoluteFill style={wrap}>
    <div style={{transform:'translateY(130px)'}}>
      <ReferenceTextAnimation
        text={main}
        animation="reveal-bounce"
        unit="whole"
        fontSize={86}
        color="#c9f5d7"
        fontFamily="Georgia, serif"
        fontWeight={800}
        style={{fontStyle:'italic', textShadow:'0 5px 16px rgba(0,0,0,.28)'}}
      />
    </div>
  </AbsoluteFill>
);

export const YellowGlowSerif: React.FC<Props> = ({main='"Texto"'}) => (
  <AbsoluteFill style={wrap}>
    <div style={{transform:'translateY(250px)'}}>
      <ReferenceTextAnimation
        text={main}
        animation="scale-b"
        unit="whole"
        fontSize={132}
        color="#ffef00"
        fontFamily="Georgia, serif"
        fontWeight={900}
        style={{
          fontStyle:'italic',
          textShadow:'0 5px 0 #f19300, 0 0 18px rgba(255,191,0,.7), 0 12px 28px rgba(0,0,0,.4)'
        }}
      />
    </div>
  </AbsoluteFill>
);
