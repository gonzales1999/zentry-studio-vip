import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ReferenceTextAnimation} from '../animations';
import {COLORS, FONT_ACCENT, FONT_PRIMARY} from '../fonts';

export const Motion01HeroSplit:React.FC=()=>(
  <AbsoluteFill style={{justifyContent:'center',alignItems:'center',textAlign:'center',padding:80}}>
    <ReferenceTextAnimation text="IDEA" animation="slide-right" unit="whole" fontSize={142} fontFamily={FONT_PRIMARY} fontWeight={900} />
    <ReferenceTextAnimation text="a video" animation="slide-left" unit="whole" delay={4} fontSize={126} color={COLORS.magenta} fontFamily={FONT_ACCENT} fontWeight={900} style={{fontStyle:'italic',letterSpacing:-6}} />
  </AbsoluteFill>
);

export const Motion02KineticStack:React.FC=()=>(
  <AbsoluteFill style={{justifyContent:'center',alignItems:'flex-start',padding:'0 105px'}}>
    {['GUION','IMAGEN','VIDEO'].map((x,i)=><ReferenceTextAnimation key={x} text={x} animation="reveal-soft" unit="whole" delay={i*5} fontSize={105} color={i===1?COLORS.yellow:COLORS.white} fontFamily={FONT_PRIMARY} fontWeight={900} style={{textAlign:'left',letterSpacing:-5}} />)}
  </AbsoluteFill>
);

export const Motion03EditorialQuote:React.FC=()=>(
  <AbsoluteFill style={{justifyContent:'center',alignItems:'center',textAlign:'center',padding:110}}>
    <ReferenceTextAnimation text="“El movimiento debe ayudar a leer”" animation="slide-up" unit="words" fontSize={72} color={COLORS.mint} fontFamily={FONT_ACCENT} fontWeight={800} style={{fontStyle:'italic',lineHeight:1.05}} />
    <ReferenceTextAnimation text="ZENTRY MOTION" animation="tracking-simple" unit="letters" delay={15} fontSize={30} color={COLORS.yellow} fontFamily={FONT_PRIMARY} fontWeight={900} />
  </AbsoluteFill>
);

export const Motion04StatPunch:React.FC=()=>(
  <AbsoluteFill style={{justifyContent:'center',alignItems:'center',textAlign:'center'}}>
    <ReferenceTextAnimation text="3×" animation="scale-b" unit="whole" fontSize={210} color={COLORS.yellow} fontFamily={FONT_PRIMARY} fontWeight={900} />
    <ReferenceTextAnimation text="más retención" animation="reveal-bounce" unit="whole" delay={5} fontSize={88} fontFamily={FONT_ACCENT} fontWeight={900} style={{fontStyle:'italic',letterSpacing:-5}} />
  </AbsoluteFill>
);

export const Motion05GradientTitle:React.FC=()=>(
  <AbsoluteFill style={{justifyContent:'center',alignItems:'center',textAlign:'center'}}>
    <ReferenceTextAnimation text="CREA" animation="tracking-elastic" unit="letters" fontSize={92} fontFamily={FONT_PRIMARY} fontWeight={900} />
    <div style={{
      fontFamily:FONT_ACCENT,fontStyle:'italic',fontWeight:900,fontSize:150,letterSpacing:-7,
      background:`linear-gradient(90deg,${COLORS.white},${COLORS.magenta},${COLORS.pink})`,
      WebkitBackgroundClip:'text',color:'transparent',filter:'drop-shadow(0 8px 20px rgba(180,70,255,.3))'
    }}>impacto</div>
  </AbsoluteFill>
);

export const Motion06StepSequence:React.FC=()=>(
  <AbsoluteFill style={{justifyContent:'center',alignItems:'flex-start',padding:'0 90px'}}>
    <ReferenceTextAnimation text="01" animation="scale-a" unit="whole" fontSize={120} color={COLORS.yellow} fontFamily={FONT_PRIMARY} fontWeight={900} style={{textAlign:'left'}} />
    <ReferenceTextAnimation text="Crea el hook" animation="slide-right" unit="words" delay={4} fontSize={72} fontFamily={FONT_ACCENT} fontWeight={900} style={{fontStyle:'italic',textAlign:'left'}} />
    <ReferenceTextAnimation text="02 · SUBTÍTULO  03 · B-ROLL" animation="fade-soft" unit="words" delay={10} fontSize={31} fontFamily={FONT_PRIMARY} fontWeight={800} style={{textAlign:'left'}} />
  </AbsoluteFill>
);
