export type TimelineAudio = {id:string;start:number;duration:number;sourceStart:number;sourceDuration:number;playbackRate?:number};
/** Prefer a complete original-speed clip; otherwise trim into the largest free interval. */
export function audioUploadSlot(sourceDuration:number, clips:Pick<TimelineAudio,'start'|'duration'>[], videoDuration:number) {
  if(!Number.isFinite(sourceDuration) || sourceDuration<=0 || !Number.isFinite(videoDuration) || videoDuration<=0) return null;
  const gaps:{start:number;duration:number}[]=[];
  let cursor=0;
  for(const clip of [...clips].sort((a,b)=>a.start-b.start)) {
    const start=Math.max(0,Math.min(videoDuration,clip.start));
    if(start-cursor>=.1) gaps.push({start:cursor,duration:start-cursor});
    cursor=Math.max(cursor,Math.min(videoDuration,clip.start+clip.duration));
  }
  if(videoDuration-cursor>=.1) gaps.push({start:cursor,duration:videoDuration-cursor});
  const gap=gaps.find(item=>item.duration>=sourceDuration) ?? gaps.reduce<typeof gaps[number] | undefined>((best,item)=>!best || item.duration>best.duration ? item : best,undefined);
  return gap ? {start:gap.start,duration:Math.min(sourceDuration,gap.duration)} : null;
}
export const audioRate = (clip: Pick<TimelineAudio,'playbackRate'>) =>
  Number.isFinite(clip.playbackRate) && clip.playbackRate! > 0 ? clip.playbackRate! : 1;

export function audioSourceInterval(clip:TimelineAudio) {
  const start=Math.max(0,clip.sourceStart);
  return {start,end:Math.max(start,Math.min(clip.sourceDuration,start+clip.duration*audioRate(clip)))};
}

export function maxAudioDuration(clip:TimelineAudio, clips:TimelineAudio[], duration:number) {
  const next=Math.min(duration,...clips.filter(item=>item.id!==clip.id && item.start>=clip.start-.001).map(item=>item.start));
  return Math.max(0,Math.min(next-clip.start,(clip.sourceDuration-clip.sourceStart)/audioRate(clip)));
}

export function changeAudioRate<T extends TimelineAudio>(clip:T, rate:number, clips:TimelineAudio[], duration:number):T {
  if(!Number.isFinite(rate) || rate<.5 || rate>5) throw new Error('Elige una velocidad entre 0,5× y 5×.');
  const next={...clip,playbackRate:rate,duration:clip.duration*audioRate(clip)/rate};
  if(next.duration>maxAudioDuration(next,clips,duration)+.001) throw new Error('No hay espacio para esa velocidad sin superponer audios. Mueve el siguiente audio o amplía el video.');
  return next;
}

export function sourceCaptionToTimeline(startMs:number,endMs:number,clip:TimelineAudio) {
  const interval=audioSourceInterval(clip);
  const from=Math.max(interval.start*1000,startMs);
  const to=Math.min(interval.end*1000,endMs);
  if(to<=from) return null;
  return {startMs:Math.round(clip.start*1000+(from-interval.start*1000)/audioRate(clip)),endMs:Math.round(clip.start*1000+(to-interval.start*1000)/audioRate(clip))};
}

/** Keep every audible source interval when export removes gaps from the video. */
export function remapAudioToOutput<T extends TimelineAudio>(clip:T, segments:{start:number;end:number;timelineStart:number;timelineEnd:number}[]):T[] {
  if (!segments.length) return [clip];
  let outputOffset=0;
  const result:T[]=[];
  for (const segment of segments) {
    const from=Math.max(clip.start,segment.timelineStart);
    const to=Math.min(clip.start+clip.duration,segment.timelineEnd);
    if(to>from) result.push({...clip,id:`${clip.id}-output-${result.length}`,start:outputOffset+from-segment.timelineStart,duration:to-from,sourceStart:clip.sourceStart+(from-clip.start)*audioRate(clip)});
    outputOffset+=segment.end-segment.start;
  }
  return result;
}
