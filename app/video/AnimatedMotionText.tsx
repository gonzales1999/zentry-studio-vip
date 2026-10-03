import type {MotionGraphicItem} from './types';
import {textEntrance} from './captionTiming';
/** Shared preview/export: upper line appears, lower line enters from the right. */
export const AnimatedMotionText = ({item,time,scale=1,color='#fff',accent='#00f5c8'}:{item:MotionGraphicItem;time:number;scale?:number;color?:string;accent?:string}) => {
  const words=item.title.trim().split(/\s+/).filter(Boolean);
  const split=Math.ceil(words.length/2);
  const size=(item.fontSize ?? 58)*scale;
  return <div data-motion-dual-text={item.id} style={{width:'100%',display:'flex',flexDirection:'column',alignItems:'center',gap:size*.16,textAlign:'center'}}>
    {[words.slice(0,split),words.slice(split)].filter(line=>line.length).map((line,index)=>{
      const entrance=textEntrance(time-(item.textPageStart ?? item.start)-(index ? .08 : 0),true,index===1);
      return <div key={index} data-motion-line={index} style={{maxWidth:'100%',overflowWrap:'anywhere',fontFamily:index===0 ? item.topFontFamily || 'Montserrat' : item.bottomFontFamily || 'Anton',fontSize:size,fontWeight:index===0 ? 500 : 800,lineHeight:1.18,color:index===0 ? color : accent,opacity:entrance.opacity,transform:`translateX(${entrance.x}em) scale(${entrance.scale})`}}>{line.join(' ')}</div>;
    })}
  </div>;
};
