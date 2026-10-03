export const DEFAULT_HOOK_DURATION = 2;
/** Exact exclusive end; short hooks use proportional fades, not fixed frame minima. */
export const hookLineOpacity = (time:number,duration:number) => {
  if (!Number.isFinite(duration) || duration <= 0 || time < 0 || time >= duration) return 0;
  const fadeIn=Math.min(.12,duration/4);
  const fadeOut=Math.min(.25,duration/4);
  return Math.max(0,Math.min(1,time/fadeIn,(duration-time)/fadeOut));
};
