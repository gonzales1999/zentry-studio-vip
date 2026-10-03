import type {Caption} from '@remotion/captions';
import type {CustomBrollItem} from './types';
import {brollTextPage,textEntrance,wordPulse} from './captionTiming';

/** One renderer for editor and MP4. All motion is derived from the supplied timeline time. */
export const AnimatedBrollText = ({broll,captions,time,fontSize}: {broll:CustomBrollItem;captions:Caption[];time:number;fontSize:number}) => {
  const page=brollTextPage(broll,captions,time);
  if(!page) return null;
  const split=Math.ceil(page.words.length/2);
  const enabled=broll.textEffect!=='none';
  const baseColor=broll.textColor || (broll.brollStyle==='white-minimal' ? '#111827' : '#ffffff');
  const accent=broll.accentColor || '#00f5c8';
  return <div data-broll-animated-text={broll.id} style={{position:'absolute',inset:'8%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:fontSize*.16,pointerEvents:'none',textAlign:'center',zIndex:3}}>
    {[page.words.slice(0,split),page.words.slice(split)].filter(line=>line.length).map((line,index)=>{
      const motion=textEntrance(time-page.start-(index ? Math.min(.08,(page.end-page.start)/6) : 0),enabled,index===1);
      return <div key={index} style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'0 .22em',maxWidth:'100%',fontFamily:broll.dualFont ? (index===0 ? broll.topFontFamily || 'Pacifico' : broll.bottomFontFamily || 'Anton') : broll.fontFamily || 'Montserrat',fontSize,fontWeight:index===0 && broll.dualFont ? 400 : 800,lineHeight:1.18,color:index===0 ? baseColor : accent,opacity:motion.opacity,transform:`translateX(${motion.x}em) scale(${motion.scale})`,textShadow:broll.textEffect==='glow' ? `0 0 .3em ${accent}` : '0 .05em .15em #0008'}}>
        {line.map((word,wordIndex)=><span key={`${word.start}-${wordIndex}`} style={{display:'inline-block',color:time>=word.start && time<word.end ? accent : undefined,transform:`scale(${wordPulse(time-word.start,time>=word.start && time<word.end,enabled)})`}}>{broll.textEffect==='typewriter' ? word.text.slice(0,Math.ceil(word.text.length*Math.max(0,Math.min(1,(time-word.start)/Math.min(.2,word.end-word.start))))) : word.text}</span>)}
      </div>;
    })}
  </div>;
};
