import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {ReferenceTextAnimation} from '../animations';
import {COLORS, FONT_ACCENT, FONT_PRIMARY} from '../fonts';

const wrap: React.CSSProperties = {
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  pointerEvents: 'none',
};

type Props = {
  top?: string;
  main?: string;
};

export const Subtitle01CleanEditorial: React.FC<Props> = ({
  top='La gente me sigue',
  main='preguntando',
}) => (
  <AbsoluteFill style={wrap}>
    <div style={{transform:'translateY(210px)'}}>
      <ReferenceTextAnimation
        text={top}
        animation="fade-soft"
        unit="words"
        fontSize={39}
        fontFamily={FONT_PRIMARY}
        fontWeight={800}
      />
      <ReferenceTextAnimation
        text={main}
        animation="reveal-soft"
        unit="whole"
        delay={7}
        fontSize={105}
        fontFamily={FONT_ACCENT}
        fontWeight={800}
        style={{
          fontStyle:'italic',
          letterSpacing:-4,
          textShadow:`0 6px 18px ${COLORS.shadow}`,
        }}
      />
    </div>
  </AbsoluteFill>
);

export const Subtitle02YellowBubblePro: React.FC<Props> = ({
  top='cómo hago estas',
  main='animaciones',
}) => (
  <AbsoluteFill style={wrap}>
    <div style={{transform:'translateY(-245px)'}}>
      <ReferenceTextAnimation
        text={top}
        animation="slide-up"
        unit="words"
        fontSize={37}
        fontFamily={FONT_PRIMARY}
        fontWeight={800}
      />
      <ReferenceTextAnimation
        text={main}
        animation="reveal-bounce"
        unit="letters"
        delay={4}
        fontSize={102}
        color={COLORS.yellow}
        fontFamily={FONT_PRIMARY}
        fontWeight={900}
        style={{
          letterSpacing:-5,
          textShadow:'0 5px 0 rgba(0,0,0,.08), 0 10px 24px rgba(0,0,0,.28)',
        }}
      />
    </div>
  </AbsoluteFill>
);

export const Subtitle03GradientEditorial: React.FC<Props> = ({
  top='dentro de',
  main='Premiere',
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame,[0,18],[0,1],{
    extrapolateLeft:'clamp',
    extrapolateRight:'clamp'
  });
  return (
    <AbsoluteFill style={wrap}>
      <div style={{transform:'translateY(235px)'}}>
        <ReferenceTextAnimation
          text={top}
          animation="fade-soft"
          unit="words"
          fontSize={38}
          fontFamily={FONT_PRIMARY}
          fontWeight={800}
        />
        <div style={{
          fontFamily:FONT_ACCENT,
          fontStyle:'italic',
          fontWeight:900,
          fontSize:112,
          letterSpacing:-5,
          opacity:p,
          transform:`translateY(${(1-p)*48}px) scale(${.86+.14*p})`,
          background:`linear-gradient(90deg,${COLORS.white},${COLORS.magenta},${COLORS.pink})`,
          WebkitBackgroundClip:'text',
          color:'transparent',
          filter:'drop-shadow(0 8px 18px rgba(180,70,255,.25))'
        }}>{main}</div>
      </div>
    </AbsoluteFill>
  );
};

export const Subtitle04YellowMicroEditorial: React.FC<Props> = ({
  main='listo',
}) => (
  <AbsoluteFill style={wrap}>
    <div style={{transform:'translateY(180px)'}}>
      <ReferenceTextAnimation
        text={main}
        animation="fade-soft"
        unit="whole"
        fontSize={38}
        color={COLORS.yellow}
        fontFamily={FONT_ACCENT}
        fontWeight={800}
        style={{fontStyle:'italic'}}
      />
    </div>
  </AbsoluteFill>
);

export const Subtitle05DualFontLabel: React.FC<Props> = ({
  main='Animaciones',
}) => (
  <AbsoluteFill style={{...wrap, justifyContent:'flex-start', paddingTop:215}}>
    <ReferenceTextAnimation
      text={main}
      animation="tracking-elastic"
      unit="letters"
      fontSize={93}
      color={COLORS.yellow}
      fontFamily={FONT_PRIMARY}
      fontWeight={900}
      style={{letterSpacing:-5}}
    />
    <div style={{marginTop:10}}>
      <ReferenceTextAnimation
        text="(5 segundos)"
        animation="fade-soft"
        unit="words"
        delay={8}
        fontSize={40}
        fontFamily={FONT_ACCENT}
        fontWeight={800}
        style={{fontStyle:'italic'}}
      />
    </div>
  </AbsoluteFill>
);

export const Subtitle06TutorialCapsPro: React.FC<Props> = ({
  main='ARRASTRARLO',
}) => (
  <AbsoluteFill style={{...wrap, justifyContent:'flex-start', paddingTop:340}}>
    <ReferenceTextAnimation
      text={main}
      animation="slide-up"
      unit="words"
      fontSize={62}
      fontFamily={FONT_PRIMARY}
      fontWeight={900}
      style={{
        letterSpacing:-3,
        textShadow:'0 4px 10px rgba(0,0,0,.55)'
      }}
    />
  </AbsoluteFill>
);

export const Subtitle07MintEditorial: React.FC<Props> = ({
  main='complicaciones',
}) => (
  <AbsoluteFill style={wrap}>
    <div style={{transform:'translateY(130px)'}}>
      <ReferenceTextAnimation
        text={main}
        animation="reveal-bounce"
        unit="whole"
        fontSize={92}
        color={COLORS.mint}
        fontFamily={FONT_ACCENT}
        fontWeight={900}
        style={{
          fontStyle:'italic',
          letterSpacing:-4,
          textShadow:'0 6px 18px rgba(0,0,0,.34)'
        }}
      />
    </div>
  </AbsoluteFill>
);

export const Subtitle08YellowGlowEditorial: React.FC<Props> = ({
  main='"Texto"',
}) => (
  <AbsoluteFill style={wrap}>
    <div style={{transform:'translateY(250px)'}}>
      <ReferenceTextAnimation
        text={main}
        animation="scale-b"
        unit="whole"
        fontSize={138}
        color={COLORS.yellowGlow}
        fontFamily={FONT_ACCENT}
        fontWeight={900}
        style={{
          fontStyle:'italic',
          letterSpacing:-6,
          textShadow:'0 5px 0 #F19300, 0 0 22px rgba(255,191,0,.72), 0 12px 30px rgba(0,0,0,.42)'
        }}
      />
    </div>
  </AbsoluteFill>
);
