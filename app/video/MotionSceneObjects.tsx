import type {MotionGraphicItem} from './types';
import {motionObjectMode,motionObjectTheme} from './motionObjects';

const Gear=({color}:{color:string})=><svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true"><path fill={color} stroke="#17202d" strokeWidth="3" d="M40 6h20l3 13 9 5 13-4 10 17-10 9v9l10 9-10 17-13-4-9 5-3 13H40l-3-13-9-5-13 4L5 64l10-9v-9L5 37l10-17 13 4 9-5z"/><circle cx="50" cy="50" r="18" fill="#edf0f4" stroke="#17202d" strokeWidth="4"/></svg>;
const Bubble=({color}:{color:string})=><svg viewBox="0 0 130 100" width="100%" height="100%" aria-hidden="true"><path d="M12 8h106v66H56L30 94V74H12z" fill={color} stroke="#17202d" strokeWidth="4" strokeLinejoin="round"/><g fill="#fff"><circle cx="40" cy="40" r="6"/><circle cx="65" cy="40" r="6"/><circle cx="90" cy="40" r="6"/></g></svg>;
const Chart=({color}:{color:string})=><svg viewBox="0 0 160 140" width="100%" height="100%" aria-hidden="true"><rect x="4" y="4" width="152" height="132" rx="14" fill="#f8fafc" stroke="#17202d" strokeWidth="4"/><g fill={color}><rect x="22" y="89" width="25" height="28"/><rect x="65" y="66" width="25" height="51"/><rect x="108" y="38" width="25" height="79"/></g><path d="M23 68l47-27 54-20m-15 0h15v15" fill="none" stroke="#17202d" strokeWidth="5" strokeLinecap="round"/></svg>;
const Coin=({color}:{color:string})=><svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true"><circle cx="54" cy="54" r="42" fill="#17202d"/><circle cx="47" cy="47" r="42" fill={color} stroke="#17202d" strokeWidth="3"/><circle cx="47" cy="47" r="31" fill="none" stroke="#fff" strokeWidth="2"/><path d="M61 32c-20-13-40 9-14 16s5 26-15 12M47 20v54" fill="none" stroke="#17202d" strokeWidth="5"/></svg>;
const Book=({color}:{color:string})=><svg viewBox="0 0 170 140" width="100%" height="100%" aria-hidden="true"><path d="M8 16Q42 0 85 21Q128 0 162 16v105q-38-12-77 4q-39-16-77-4z" fill="#f8fafc" stroke="#17202d" strokeWidth="4"/><path d="M85 21v104M23 38l45 8M23 60l45 8M23 82l45 8M101 46l45-8M101 68l45-8M101 90l45-8" stroke={color} strokeWidth="5"/></svg>;
const Phone=({color}:{color:string})=><svg viewBox="0 0 150 240" width="100%" height="100%" aria-hidden="true"><rect x="16" y="8" width="125" height="222" rx="23" fill="#17202d"/><rect x="7" y="3" width="125" height="222" rx="23" fill="#f8fafc" stroke="#6b7280" strokeWidth="4"/><rect x="48" y="13" width="45" height="11" rx="6" fill="#17202d"/><path d="M24 149l26-36 24 9 38-58" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"/><g fill="#17202d"><rect x="25" y="165" width="17" height="31"/><rect x="58" y="143" width="17" height="53"/><rect x="91" y="117" width="17" height="79"/></g><path d="M52 211h35" stroke="#17202d" strokeWidth="4" strokeLinecap="round"/></svg>;

/** Shared 2.5D SVG choreography driven by the editor/export clock. */
export const MotionSceneObjects=({item,time,scale=1,accent='#00f5c8'}:{item:MotionGraphicItem;time:number;scale?:number;accent?:string})=>{
  const mode=motionObjectMode(item);
  if(mode==='off') return null;
  const elapsed=Math.max(0,Math.min(item.duration,time-item.start));
  if(mode==='icon') return <div data-motion-object-mode="icon" style={{fontSize:58*scale,lineHeight:1,translate:`0 ${Math.sin(elapsed*3)*6*scale}px`}}>{item.icon3d || '💡'}</div>;
  const theme=motionObjectTheme(item);
  const primary=theme==='finance' ? <Coin color={accent}/> : theme==='learning' ? <Book color={accent}/> : theme==='growth' ? <Chart color={accent}/> : <Phone color={accent}/>;
  const secondary=theme==='conversation' ? <Bubble color={accent}/> : theme==='finance' ? <Chart color={accent}/> : <Gear color={accent}/>;
  return <div data-motion-object-theme={theme} style={{width:340*scale,height:240*scale,maxWidth:'100%',position:'relative',flexShrink:0,perspective:900*scale,pointerEvents:'none'}}>
    <div style={{position:'absolute',inset:0,transform:`scale(${1+Math.min(elapsed/Math.max(.1,item.duration),1)*.045})`}}>
      <div style={{position:'absolute',bottom:'2%',left:'12%',width:'76%',height:'9%',borderRadius:'50%',background:'rgba(0,0,0,.24)',filter:`blur(${9*scale}px)`}}/>
      <div style={{position:'absolute',width:'43%',height:'90%',left:'25%',top:'4%',opacity:Math.min(1,elapsed/.2),transform:`translateY(${(1-Math.min(1,elapsed/.4))*25*scale+Math.sin(elapsed*2)*4*scale}px) rotate(-9deg) rotateY(${Math.sin(elapsed)*8}deg)`,filter:`drop-shadow(${8*scale}px ${12*scale}px ${8*scale}px rgba(0,0,0,.25))`}}>{primary}</div>
      <div style={{position:'absolute',width:'25%',height:'34%',right:'2%',top:'3%',opacity:Math.min(1,Math.max(0,(elapsed-.1)/.2)),translate:`0 ${Math.sin(elapsed*2.6)*6*scale}px`,rotate:`${Math.sin(elapsed)*12}deg`,filter:`drop-shadow(0 ${8*scale}px ${5*scale}px rgba(0,0,0,.2))`}}><Bubble color={accent}/></div>
      <div style={{position:'absolute',width:'25%',height:'34%',left:'1%',bottom:'4%',opacity:Math.min(1,Math.max(0,(elapsed-.18)/.2)),rotate:`${elapsed*18}deg`,filter:`drop-shadow(0 ${8*scale}px ${5*scale}px rgba(0,0,0,.2))`}}>{secondary}</div>
    </div>
  </div>;
};
