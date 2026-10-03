import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ZentryPresetSfx} from './audio/ZentryPresetSfx';
// Import the matching visual template from the Zentry visual pack.
// Example:
// import {Hook01DualLine} from './hooks';

export const ExampleWithSound: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* <Hook01DualLine /> */}
      <ZentryPresetSfx presetId="hook_01_dual_line" />
    </AbsoluteFill>
  );
};
