const PREFIX='zentry-media:';
const sourceKeys=new Map<string,string>();
const restoredUrls=new Map<string,string>();
let database:Promise<IDBDatabase>|undefined;
function db() {
  return database ??= new Promise<IDBDatabase>((resolve,reject)=>{
    const request=indexedDB.open('zentry-local-media',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('files');
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>{database=undefined;reject(request.error);};
  });
}
async function storeBlob(key:string,blob:Blob) {
  const database=await db();
  await new Promise<void>((resolve,reject)=>{
    const tx=database.transaction('files','readwrite');
    tx.objectStore('files').put(blob,key);
    tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });
}
async function readBlob(key:string) {
  const database=await db();
  return new Promise<Blob>((resolve,reject)=>{
    const request=database.transaction('files').objectStore('files').get(key);
    request.onsuccess=()=>request.result instanceof Blob ? resolve(request.result) : reject(new Error('Falta un medio guardado. Vuelve a cargar su archivo.'));
    request.onerror=()=>reject(request.error);
  });
}
async function transform(value:unknown, direction:'save'|'load'):Promise<unknown> {
  if(typeof value==='string') {
    // Old drafts used session-only blob URLs. Detect expired references while
    // loading, rather than carrying them into the next save and render.
    if(direction==='load' && value.startsWith('blob:')) {
      try {const response=await fetch(value);return response.ok ? value : undefined;}
      catch {return undefined;}
    }
    if(direction==='save' && /^(blob:|data:)/.test(value)) {
      let key=sourceKeys.get(value);
      if(!key) {
        const response=await fetch(value);
        if(!response.ok) throw new Error('No se pudo guardar un archivo local.');
        key=crypto.randomUUID();await storeBlob(key,await response.blob());sourceKeys.set(value,key);
      }
      return PREFIX+key;
    }
    if(direction==='load' && value.startsWith(PREFIX)) {
      const key=value.slice(PREFIX.length);
      let url=restoredUrls.get(key);
      if(!url) {url=URL.createObjectURL(await readBlob(key));restoredUrls.set(key,url);sourceKeys.set(url,key);}
      return url;
    }
    return value;
  }
  if(Array.isArray(value)) return Promise.all(value.map(item=>transform(item,direction)));
  if(value && typeof value==='object') {
    const entries=await Promise.all(Object.entries(value).map(async([key,item])=>[key,await transform(item,direction)]));
    return Object.fromEntries(entries);
  }
  return value;
}
export async function persistDraftMedia<T>(draft:T):Promise<T> {return await transform(draft,'save') as T;}
export async function restoreDraftMedia<T>(draft:T):Promise<T> {return await transform(draft,'load') as T;}
export function releaseRestoredMedia() {
  for(const url of restoredUrls.values()) URL.revokeObjectURL(url);
  restoredUrls.clear();sourceKeys.clear();
}
export function collectBlobUrls(value:unknown,result=new Set<string>()):Set<string> {
  if(typeof value==='string' && value.startsWith('blob:')) result.add(value);
  else if(Array.isArray(value)) value.forEach(item=>collectBlobUrls(item,result));
  else if(value && typeof value==='object') Object.values(value).forEach(item=>collectBlobUrls(item,result));
  return result;
}
export function releaseUnusedRestoredMedia(retained:Set<string>) {
  for(const [key,url] of restoredUrls) if(!retained.has(url)) {
    URL.revokeObjectURL(url);restoredUrls.delete(key);sourceKeys.delete(url);
  }
}
