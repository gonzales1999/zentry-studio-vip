import React from 'react';
import {ReferenceTextAnimation, ReferenceTextAnimationProps} from './ReferenceTextAnimation';
import {FONT_ACCENT, FONT_PRIMARY} from '../fonts';

export type FontLook = 'montserrat' | 'playfair';

export const DualFontAnimation: React.FC<
  Omit<ReferenceTextAnimationProps, 'fontFamily'> & {fontLook?: FontLook}
> = ({fontLook = 'montserrat', style, ...props}) => {
  const editorial = fontLook === 'playfair';
  return (
    <ReferenceTextAnimation
      {...props}
      fontFamily={editorial ? FONT_ACCENT : FONT_PRIMARY}
      style={{
        fontStyle: editorial ? 'italic' : 'normal',
        letterSpacing: editorial ? -2 : -3,
        ...style,
      }}
    />
  );
};
