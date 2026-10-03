import React from 'react';
import {staticFile} from 'remotion';
import {Audio} from '@remotion/media';
import {ZENTRY_SFX_MAP, ZentrySfxId} from './soundMap';

export type ZentryPresetSfxProps = {
  presetId: ZentrySfxId;
  from?: number;
  volumeMultiplier?: number;
  muted?: boolean;
};

export const ZentryPresetSfx: React.FC<ZentryPresetSfxProps> = ({
  presetId,
  from = 0,
  volumeMultiplier = 1,
  muted = false,
}) => {
  const preset = ZENTRY_SFX_MAP[presetId];
  return (
    <Audio
      src={staticFile(preset.file)}
      from={Math.max(0, from + preset.offsetFrames)}
      volume={muted ? 0 : Math.min(1, preset.volume * volumeMultiplier)}
      name={`SFX · ${preset.label}`}
      premountFor={15}
    />
  );
};
