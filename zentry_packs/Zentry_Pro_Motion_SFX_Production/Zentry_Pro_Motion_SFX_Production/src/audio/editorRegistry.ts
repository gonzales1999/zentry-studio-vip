import type {ComponentType} from 'react';
import {ZENTRY_SFX_MAP, ZentrySfxId} from './soundMap';

/**
 * Use this registry as the single source of truth in the editor.
 * visualComponent can be filled by the host app when importing the Zentry visual pack.
 */
export type ZentryEditorPreset = {
  id: ZentrySfxId;
  label: string;
  category: 'typography' | 'subtitles' | 'hooks' | 'broll' | 'motion-graphics';
  sfxId: ZentrySfxId;
  defaultVolume: number;
  offsetFrames: number;
};

export const ZENTRY_EDITOR_PRESETS: ZentryEditorPreset[] = Object.entries(
  ZENTRY_SFX_MAP,
).map(([id, sfx]) => {
  const category =
    id.startsWith('subtitle_') ? 'subtitles' :
    id.startsWith('hook_') ? 'hooks' :
    id.startsWith('broll_') ? 'broll' :
    id.startsWith('motion_') ? 'motion-graphics' :
    'typography';

  return {
    id: id as ZentrySfxId,
    label: sfx.label,
    category,
    sfxId: id as ZentrySfxId,
    defaultVolume: sfx.volume,
    offsetFrames: sfx.offsetFrames,
  };
});
