import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ReferenceTextAnimation} from '../animations';
import {COLORS, FONT_ACCENT, FONT_PRIMARY} from '../fonts';

const shadow='0 6px 18px rgba(0,0,0,.42)';

export const Hook01DualLine:React.FC=()=>(
  <AbsoluteFill style={{justifyContent:'flex-start',alignItems:'center',paddingTop:210,textAlign:'center'}}>
    <ReferenceTextAnimation text="ESTO CAMBIA" animation="slide-up" unit="words" fontSize={74} fontFamily={FONT_PRIMARY} fontWeight={900} />
    <ReferenceTextAnimation text="todo" animation="reveal-bounce" unit="whole" delay={6} fontSize={126} color={COLORS.yellow} fontFamily={FONT_ACCENT} fontWeight={900} style={{fontStyle:'italic',letterSpacing:-6,textShadow:shadow}} />
  </AbsoluteFill>
);

export const Hook02LeftKeyword:React.FC=()=>(
  <AbsoluteFill style={{justifyContent:'flex-start',alignItems:'flex-start',padding:'180px 72px',textAlign:'left'}}>
    <ReferenceTextAnimation text="NO HAGAS" animation="slide-right" unit="words" fontSize={62} fontFamily={FONT_PRIMARY} fontWeight={900} style={{textAlign:'left'}} />
    <ReferenceTextAnimation text="esto" animation="scale-a" unit="whole" delay={5} fontSize={132} color={COLORS.magenta} fontFamily={FONT_ACCENT} fontWeight={900} style={{fontStyle:'italic',textAlign:'left',letterSpacing:-6,textShadow:shadow}} />
  </AbsoluteFill>
);

export const Hook03Question:React.FC=()=>(
  <AbsoluteFill style={{justifyContent:'flex-start',alignItems:'center',paddingTop:205,textAlign:'center'}}>
    <ReferenceTextAnimation text="¿POR QUÉ NADIE" animation="fade-soft" unit="words" fontSize={54} fontFamily={FONT_PRIMARY} fontWeight={900} />
    <ReferenceTextAnimation text="te mira?" animation="tracking-elastic" unit="letters" delay={5} fontSize={112} color={COLORS.mint} fontFamily={FONT_ACCENT} fontWeight={900} style={{fontStyle:'italic',letterSpacing:-5,textShadow:shadow}} />
  </AbsoluteFill>
);

export const Hook04Number:React.FC=()=>(
  <AbsoluteFill style={{justifyContent:'flex-start',alignItems:'flex-start',padding:'165px 76px'}}>
    <ReferenceTextAnimation text="3" animation="scale-b" unit="whole" fontSize={190} color={COLORS.yellow} fontFamily={FONT_PRIMARY} fontWeight={900} style={{textAlign:'left',lineHeight:.8}} />
    <ReferenceTextAnimation text="errores" animation="reveal-soft" unit="whole" delay={5} fontSize={96} fontFamily={FONT_ACCENT} fontWeight={900} style={{fontStyle:'italic',textAlign:'left',letterSpacing:-5}} />
    <ReferenceTextAnimation text="QUE TE QUITAN RETENCIÓN" animation="slide-up" unit="words" delay={9} fontSize={39} fontFamily={FONT_PRIMARY} fontWeight={800} style={{textAlign:'left'}} />
  </AbsoluteFill>
);

export const Hook05Gradient:React.FC=()=>(
  <AbsoluteFill style={{justifyContent:'flex-start',alignItems:'center',paddingTop:195,textAlign:'center'}}>
    <ReferenceTextAnimation text="MIRA HASTA" animation="slide-up" unit="words" fontSize={56} fontFamily={FONT_PRIMARY} fontWeight={900} />
    <div style={{
      fontFamily:FONT_ACCENT,fontStyle:'italic',fontWeight:900,fontSize:128,letterSpacing:-6,
      background:`linear-gradient(90deg,${COLORS.white},${COLORS.magenta},${COLORS.pink})`,
      WebkitBackgroundClip:'text',color:'transparent',filter:'drop-shadow(0 7px 18px rgba(180,70,255,.28))'
    }}>el final</div>
  </AbsoluteFill>
);

export const Hook06Editorial:React.FC=()=>(
  <AbsoluteFill style={{justifyContent:'flex-start',alignItems:'center',paddingTop:205,textAlign:'center'}}>
    <ReferenceTextAnimation text="EL SECRETO" animation="tracking-simple" unit="letters" fontSize={48} color={COLORS.yellow} fontFamily={FONT_PRIMARY} fontWeight={900} />
    <ReferenceTextAnimation text="que funciona" animation="reveal-bounce" unit="whole" delay={5} fontSize={118} fontFamily={FONT_ACCENT} fontWeight={900} style={{fontStyle:'italic',letterSpacing:-6,textShadow:shadow}} />
  </AbsoluteFill>
);
