/** Atenúa frecuencias fuera de la voz y el ruido de bajo nivel durante las pausas. */
export async function reduceClipNoise(sourceUrl:string, onStage:(label:string)=>void):Promise<string> {
  onStage('Leyendo el audio del video…');
  const response=await fetch(sourceUrl);
  if (!response.ok) throw new Error('No se pudo leer el audio del clip.');
  const bytes=await response.arrayBuffer();
  const decoder=new AudioContext();
  let decoded:AudioBuffer;
  try {
    onStage('Decodificando la voz…');
    decoded=await decoder.decodeAudioData(bytes);
  } finally {
    await decoder.close();
  }
  const rate=22050;
  const offline=new OfflineAudioContext(1,Math.ceil(decoded.duration*rate),rate);
  const source=offline.createBufferSource();
  source.buffer=decoded;
  const highpass=offline.createBiquadFilter();
  highpass.type='highpass'; highpass.frequency.value=85;
  const lowpass=offline.createBiquadFilter();
  lowpass.type='lowpass'; lowpass.frequency.value=8500;
  source.connect(highpass); highpass.connect(lowpass); lowpass.connect(offline.destination);
  source.start();
  onStage('Reduciendo ruido en las pausas…');
  const rendered=await offline.startRendering();
  const samples=rendered.getChannelData(0);
  const windowSize=Math.round(rate*.02);
  const windows:number[]=[];
  for(let start=0;start<samples.length;start+=windowSize){
    let energy=0;
    for(let i=start;i<Math.min(samples.length,start+windowSize);i++) energy+=samples[i]*samples[i];
    windows.push(Math.sqrt(energy/Math.max(1,Math.min(windowSize,samples.length-start))));
  }
  const sorted=[...windows].sort((a,b)=>a-b);
  const noiseFloor=sorted[Math.floor(sorted.length*.2)] || 0;
  const gate=Math.max(.008,noiseFloor*2.8);
  const wav=new ArrayBuffer(44+samples.length*2);
  const view=new DataView(wav);
  const write=(at:number,value:string)=>{for(let i=0;i<value.length;i++) view.setUint8(at+i,value.charCodeAt(i));};
  write(0,'RIFF'); view.setUint32(4,36+samples.length*2,true); write(8,'WAVE'); write(12,'fmt ');
  view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);
  view.setUint32(24,rate,true);view.setUint32(28,rate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);
  write(36,'data');view.setUint32(40,samples.length*2,true);
  let gain=1;
  for(let i=0;i<samples.length;i++){
    const level=windows[Math.min(windows.length-1,Math.floor(i/windowSize))];
    const target=level < gate ? .12 : 1;
    gain+=(target-gain)*.002;
    const value=Math.max(-1,Math.min(1,samples[i]*gain));
    view.setInt16(44+i*2,Math.round(value*32767),true);
  }
  onStage('Preparando audio mejorado…');
  const blob=new Blob([wav],{type:'audio/wav'});
  return await new Promise<string>((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(String(reader.result));
    reader.onerror=()=>reject(new Error('No se pudo preparar el audio procesado.'));
    reader.readAsDataURL(blob);
  });
}
