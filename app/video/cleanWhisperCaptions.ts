import type { Caption } from '@remotion/captions';

export const cleanWhisperCaptions = (
  items: Caption[],
  waveform: Float32Array,
  options: { minConfidence?: number; minEnergy?: number } = {},
): Caption[] => {
  const cleaned: Caption[] = [];
  const minConfidence = options.minConfidence ?? 0.16;
  const minEnergy = options.minEnergy ?? 0.0006;
  const controlToken = /(?:\[_[A-Z]+(?:_\d+)?_?\]|<\|[^|]+\|>|\[(?:BLANK_AUDIO|SILENCE|MUSIC|NOISE)\])/gi;

  for (const item of items) {
    const raw = item.text.normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g,'');
    const visible = raw.replace(controlToken,'').replace(/\s+/g,' ');
    const text = visible.trim();
    if (!text || (item.confidence !== null && item.confidence < minConfidence)) continue;

    const fromSample = Math.max(0,Math.floor((item.startMs/1000)*16000));
    const toSample = Math.min(waveform.length,Math.max(fromSample+1,Math.ceil((item.endMs/1000)*16000)));
    let energy = 0;
    let samples = 0;
    for (let index=fromSample; index<toSample; index+=8) {
      energy += waveform[index]*waveform[index];
      samples++;
    }
    if (samples && Math.sqrt(energy/samples) < minEnergy) continue;

    const previous = cleaned[cleaned.length-1];
    const continuesPreviousWord = previous && !/^\s/.test(visible) && item.startMs-previous.endMs < 280;
    if (continuesPreviousWord) {
      previous.text += text;
      previous.endMs = Math.max(previous.endMs,item.endMs);
      previous.confidence = previous.confidence === null || item.confidence === null ? previous.confidence : Math.min(previous.confidence,item.confidence);
      continue;
    }
    if (/^[\p{P}\p{S}]+$/u.test(text) && !previous) continue;
    cleaned.push({ ...item, text:`${cleaned.length ? ' ' : ''}${text}`, endMs:Math.max(item.startMs+90,item.endMs) });
  }

  return cleaned;
};
