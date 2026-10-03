import type {Caption} from '@remotion/captions';

/** Restoration may keep styling and media, but must never replace a successful new transcript. */
export const withFreshVideoCaptions = <T extends {captions?:Caption[]}>(draft:T,captions:Caption[]):T => ({...draft,captions});

/** Clear the timer on both success and failure; never leave processing waiting indefinitely. */
export const withProcessingTimeout = async <T>(task:Promise<T>,milliseconds:number,message:string):Promise<T> => {
  let timer:ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([task,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error(message)),milliseconds);})]);
  } finally { if(timer!==undefined) clearTimeout(timer); }
};
