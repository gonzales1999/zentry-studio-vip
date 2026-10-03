import React from 'react';
import {AbsoluteFill, Composition} from 'remotion';
import {REFERENCE_ANIMATION_PRESETS, DualFontAnimation} from './animations';
import * as Subs from './subtitles';
import * as Hooks from './hooks';
import * as BRoll from './broll';
import * as Motion from './motion-graphics';

const DemoBG:React.FC<{children:React.ReactNode}>=({children})=>(
  <AbsoluteFill style={{
    background:'linear-gradient(150deg,#17101f,#06080d 55%,#11171c)',
    color:'#fff',
    overflow:'hidden'
  }}>
    <div style={{position:'absolute',left:180,top:230,width:720,height:1180,borderRadius:100,background:'rgba(255,255,255,.025)'}}/>
    <div style={{position:'absolute',right:-120,top:-80,width:430,height:900,background:'linear-gradient(180deg,rgba(255,230,0,.12),transparent)',transform:'rotate(18deg)'}}/>
    {children}
  </AbsoluteFill>
);

const subtitles=[
  Subs.Subtitle01CleanEditorial,
  Subs.Subtitle02YellowBubblePro,
  Subs.Subtitle03GradientEditorial,
  Subs.Subtitle04YellowMicroEditorial,
  Subs.Subtitle05DualFontLabel,
  Subs.Subtitle06TutorialCapsPro,
  Subs.Subtitle07MintEditorial,
  Subs.Subtitle08YellowGlowEditorial,
];

const hooks=[
  Hooks.Hook01DualLine,Hooks.Hook02LeftKeyword,Hooks.Hook03Question,
  Hooks.Hook04Number,Hooks.Hook05Gradient,Hooks.Hook06Editorial,
];

const broll=[BRoll.BRollTop,BRoll.BRollCenter,BRoll.BRollBottom];

const motion=[
  Motion.Motion01HeroSplit,Motion.Motion02KineticStack,Motion.Motion03EditorialQuote,
  Motion.Motion04StatPunch,Motion.Motion05GradientTitle,Motion.Motion06StepSequence,
];

const textForPreset=(unit:string)=> unit==='lines' ? 'ZENTRY\nMOTION' : 'ZENTRY MOTION';

export const RemotionRoot:React.FC=()=>(
  <>
    {REFERENCE_ANIMATION_PRESETS.map((p,i)=>(
      <Composition
        key={`m-${p.id}`}
        id={`Typography-Montserrat-${p.id}`}
        component={()=><DemoBG><DualFontAnimation text={textForPreset(p.unit)} animation={p.animation} unit={p.unit} fontLook="montserrat" fontSize={112} fontWeight={900}/></DemoBG>}
        durationInFrames={60} fps={30} width={1080} height={1920}
      />
    ))}
    {REFERENCE_ANIMATION_PRESETS.map((p,i)=>(
      <Composition
        key={`p-${p.id}`}
        id={`Typography-Playfair-${p.id}`}
        component={()=><DemoBG><DualFontAnimation text={textForPreset(p.unit)} animation={p.animation} unit={p.unit} fontLook="playfair" fontSize={118} fontWeight={900}/></DemoBG>}
        durationInFrames={60} fps={30} width={1080} height={1920}
      />
    ))}
    {subtitles.map((Comp,i)=><Composition key={`s${i}`} id={`Subtitle-${String(i+1).padStart(2,'0')}`} component={()=><DemoBG><Comp /></DemoBG>} durationInFrames={60} fps={30} width={1080} height={1920}/>)}
    {hooks.map((Comp,i)=><Composition key={`h${i}`} id={`Hook-${String(i+1).padStart(2,'0')}`} component={()=><DemoBG><Comp /></DemoBG>} durationInFrames={60} fps={30} width={1080} height={1920}/>)}
    {broll.map((Comp,i)=><Composition key={`b${i}`} id={`BRoll-${['Top','Center','Bottom'][i]}`} component={()=><DemoBG><Comp /></DemoBG>} durationInFrames={60} fps={30} width={1080} height={1920}/>)}
    {motion.map((Comp,i)=><Composition key={`g${i}`} id={`Motion-${String(i+1).padStart(2,'0')}`} component={()=><DemoBG><Comp /></DemoBG>} durationInFrames={60} fps={30} width={1080} height={1920}/>)}
  </>
);
