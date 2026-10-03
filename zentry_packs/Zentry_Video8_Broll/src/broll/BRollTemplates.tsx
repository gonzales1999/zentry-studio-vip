import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {fadeUp, pop, softPop} from '../motion';

const W='#fff', Y='#FFF000';
type Theme = {fontFamily?:string;fontSize?:number;color?:string;accentColor?:string};

export const BRoll01CenterKeyword:React.FC<{text?:string}&Theme>=({text='AUTOMÁTICOS',fontFamily,fontSize,color})=>{
  const frame=useCurrentFrame(); const {fps}=useVideoConfig();
  return <div style={{position:'absolute',left:'5%',right:'5%',top:'48%',textAlign:'center',fontFamily:fontFamily || 'Arial, Helvetica, sans-serif'}}>
    <div style={{...pop(frame,fps,0,16),fontSize:(fontSize || 66)*1.24,fontWeight:950,color:color || W,letterSpacing:-4,textShadow:'0 4px 12px rgba(0,0,0,.5)'}}>{text}</div>
  </div>
};

export const BRoll02CornerLabel:React.FC<{label?:string;number?:string}&Theme>=({label='LECCIÓN',number='21/30',fontFamily,fontSize,color,accentColor})=>{
  const frame=useCurrentFrame(); const {fps}=useVideoConfig();
  return <div style={{position:'absolute',left:'6%',top:'7.5%',display:'flex',gap:12,filter:'drop-shadow(0 3px 8px rgba(0,0,0,.5))'}}>
    <span style={{...fadeUp(frame,0,10),fontFamily:fontFamily || 'Impact, "Arial Narrow", sans-serif',fontSize:(fontSize || 64)*.78,color:color || W}}>{label}</span>
    <span style={{...pop(frame,fps,4,15),fontFamily:fontFamily || 'Impact, "Arial Narrow", sans-serif',fontSize:(fontSize || 64)*.78,color:accentColor || Y}}>{number}</span>
  </div>
};

export const BRoll03Step:React.FC<{step?:string;text?:string}&Theme>=({step='PASO 01',text='GENERA LOS SUBTÍTULOS',fontFamily,fontSize,color,accentColor})=>{
  const frame=useCurrentFrame(); const {fps}=useVideoConfig();
  return <div style={{position:'absolute',left:'7%',bottom:'12%',fontFamily:fontFamily || 'Arial, Helvetica, sans-serif',textShadow:'0 4px 10px rgba(0,0,0,.5)'}}>
    <div style={{...fadeUp(frame,0,10),fontSize:(fontSize || 64)*.48,fontWeight:900,color:accentColor || Y,letterSpacing:2}}>{step}</div>
    <div style={{...softPop(frame,fps,4,15),fontSize:(fontSize || 64)*.78,fontWeight:950,color:color || W,letterSpacing:-2,maxWidth:720,lineHeight:.9}}>{text}</div>
  </div>
};

export const BRoll04Stat:React.FC<{stat?:string;label?:string}&Theme>=({stat='3×',label='MÁS RETENCIÓN',fontFamily,fontSize,color,accentColor})=>{
  const frame=useCurrentFrame(); const {fps}=useVideoConfig();
  return <div style={{position:'absolute',left:'6%',top:'18%',fontFamily:fontFamily || 'Arial, Helvetica, sans-serif'}}>
    <div style={{...pop(frame,fps,0,18),fontSize:(fontSize || 64)*1.97,fontWeight:950,color:accentColor || Y,lineHeight:.75,letterSpacing:-7}}>{stat}</div>
    <div style={{...fadeUp(frame,5,12),fontSize:(fontSize || 64)*.58,fontWeight:950,color:color || W,letterSpacing:-1}}>{label}</div>
  </div>
};

export const BRoll05Callout:React.FC<{small?:string;big?:string}&Theme>=({small='PALABRA',big='CLAVE',fontFamily,fontSize,color,accentColor})=>{
  const frame=useCurrentFrame(); const {fps}=useVideoConfig();
  return <div style={{position:'absolute',right:'7%',bottom:'15%',textAlign:'right',fontFamily:fontFamily || 'Arial, Helvetica, sans-serif'}}>
    <div style={{...fadeUp(frame,0,10),fontSize:(fontSize || 64)*.44,fontWeight:800,color:color || W}}>{small}</div>
    <div style={{...pop(frame,fps,5,16),fontSize:(fontSize || 64)*1.13,fontWeight:950,color:accentColor || Y,letterSpacing:-4,lineHeight:.85}}>{big}</div>
  </div>
};

export const BRoll06QuoteStack:React.FC<{lines?:string[]}&Theme>=({lines=['MANTÉN','EL OJO','EN MOVIMIENTO'],fontFamily,fontSize,color,accentColor})=>{
  const frame=useCurrentFrame(); const {fps}=useVideoConfig();
  return <div style={{position:'absolute',left:'6%',right:'6%',top:'42%',textAlign:'center',fontFamily:fontFamily || 'Arial, Helvetica, sans-serif'}}>
    {lines.map((l,i)=><div key={i} style={{...softPop(frame,fps,i*5,15),fontSize:(fontSize || 64)*(i===1?1.22:.75),fontWeight:950,color:i===1?(accentColor || Y):(color || W),letterSpacing:i===1?-4:-2,lineHeight:.87}}>{l}</div>)}
  </div>
};
