import React from 'react';
import {staticFile} from 'remotion';
import {Audio} from '@remotion/media';
import {ZENTRY_SFX_MAP, ZentrySfxId} from './soundMap';

export type ZentryPresetSfxProps = {
  presetId?: ZentrySfxId | string | null;
  from?: number;
  volumeMultiplier?: number;
  muted?: boolean;
  offsetFrames?: number;
};

export const ZentryPresetSfx: React.FC<ZentryPresetSfxProps> = ({
  presetId,
  from = 0,
  volumeMultiplier = 1,
  muted = false,
  offsetFrames = 0,
}) => {
  if (!presetId) return null;
  const preset = (ZENTRY_SFX_MAP as Record<string, any>)[presetId];
  if (!preset) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[ZentryPresetSfx] No audio mapping found for presetId: "${presetId}". Visual preset remains active, SFX disabled.`);
    }
    return null;
  }

  const filePath = preset.file.startsWith('/') ? preset.file.slice(1) : preset.file;
  const totalOffset = (preset.offsetFrames || 0) + offsetFrames;

  return (
    <Audio
      src={staticFile(filePath)}
      from={Math.max(0, from + totalOffset)}
      volume={muted ? 0 : Math.min(1, Math.max(0, preset.volume * volumeMultiplier))}
      name={`SFX · ${preset.label}`}
      premountFor={15}
    />
  );
};
