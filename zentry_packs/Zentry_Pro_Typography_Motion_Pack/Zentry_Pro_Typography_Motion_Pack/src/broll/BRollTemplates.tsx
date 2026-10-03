import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ReferenceTextAnimation} from '../animations';
import {COLORS, FONT_ACCENT, FONT_PRIMARY} from '../fonts';

export const BRollTop:React.FC=()=>(
  <AbsoluteFill style={{justifyContent:'flex-start',alignItems:'flex-start',padding:'105px 72px'}}>
    <ReferenceTextAnimation text="PASO 01" animation="tracking-simple" unit="letters" fontSize={30} color={COLORS.yellow} fontFamily={FONT_PRIMARY} fontWeight={900} style={{textAlign:'left'}} />
    <ReferenceTextAnimation text="genera la idea" animation="slide-right" unit="words" delay={4} fontSize={66} fontFamily={FONT_ACCENT} fontWeight={900} style={{fontStyle:'italic',textAlign:'left',letterSpacing:-4,textShadow:'0 5px 16px rgba(0,0,0,.42)'}} />
  </AbsoluteFill>
);

export const BRollCenter:React.FC=()=>(
  <AbsoluteFill style={{justifyContent:'center',alignItems:'center',textAlign:'center',padding:80}}>
    <ReferenceTextAnimation text="10×" animation="scale-a" unit="whole" fontSize={180} color={COLORS.mint} fontFamily={FONT_PRIMARY} fontWeight={900} />
    <ReferenceTextAnimation text="más rápido" animation="reveal-bounce" unit="whole" delay={4} fontSize={92} fontFamily={FONT_ACCENT} fontWeight={900} style={{fontStyle:'italic',letterSpacing:-5,textShadow:'0 5px 16px rgba(0,0,0,.42)'}} />
  </AbsoluteFill>
);

export const BRollBottom:React.FC=()=>(
  <AbsoluteFill style={{justifyContent:'flex-end',alignItems:'flex-start',padding:'0 72px 150px'}}>
    <ReferenceTextAnimation text="RESULTADO" animation="tracking-simple" unit="letters" fontSize={29} color={COLORS.yellow} fontFamily={FONT_PRIMARY} fontWeight={900} style={{textAlign:'left'}} />
    <ReferenceTextAnimation text="contenido profesional" animation="slide-up" unit="words" delay={4} fontSize={62} fontFamily={FONT_PRIMARY} fontWeight={900} style={{textAlign:'left',letterSpacing:-3,textShadow:'0 5px 16px rgba(0,0,0,.5)'}} />
    <ReferenceTextAnimation text="sin complicarte" animation="fade-soft" unit="whole" delay={8} fontSize={49} color={COLORS.mint} fontFamily={FONT_ACCENT} fontWeight={900} style={{fontStyle:'italic',textAlign:'left',letterSpacing:-3}} />
  </AbsoluteFill>
);
