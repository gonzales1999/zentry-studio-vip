import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ReferenceTextAnimation} from '../animations';
import {COLORS, FONT_ACCENT, FONT_PRIMARY} from '../fonts';

export type BRollTemplateProps = {
  title?: string;
  subtitle?: string;
  text?: string;
  overrideFrame?: number;
  fontVariant?: 'montserrat' | 'playfair';
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  accentColor?: string;
};

export const BRollTop: React.FC<BRollTemplateProps> = ({
  title = 'PASO 01',
  subtitle = 'genera la idea',
  text,
  overrideFrame,
  fontVariant = 'montserrat',
  fontFamily,
  fontSize,
  color,
  accentColor,
}) => {
  const accentFont = fontFamily || (fontVariant === 'playfair' ? '"Playfair Display", serif' : FONT_ACCENT);
  const displaySub = text || subtitle;
  return (
    <AbsoluteFill style={{justifyContent:'flex-start',alignItems:'flex-start',padding:'105px 72px'}}>
      <ReferenceTextAnimation
        text={title}
        animation="tracking-simple"
        unit="letters"
        fontSize={(fontSize || 64)*.47}
        color={accentColor || COLORS.yellow}
        fontFamily={fontFamily || FONT_PRIMARY}
        fontWeight={900}
        style={{textAlign:'left'}}
        overrideFrame={overrideFrame}
      />
      <ReferenceTextAnimation
        text={displaySub}
        animation="slide-right"
        unit="words"
        delay={4}
        fontSize={fontSize || 66}
        color={color}
        fontFamily={accentFont}
        fontWeight={900}
        style={{fontStyle:'italic',textAlign:'left',letterSpacing:-4,textShadow:'0 5px 16px rgba(0,0,0,.42)'}}
        overrideFrame={overrideFrame}
      />
    </AbsoluteFill>
  );
};

export const BRollCenter: React.FC<BRollTemplateProps> = ({
  title = '10×',
  subtitle = 'más rápido',
  text,
  overrideFrame,
  fontVariant = 'montserrat',
  fontFamily,
  fontSize,
  color,
  accentColor,
}) => {
  const accentFont = fontFamily || (fontVariant === 'playfair' ? '"Playfair Display", serif' : FONT_ACCENT);
  const displaySub = text || subtitle;
  return (
    <AbsoluteFill style={{justifyContent:'center',alignItems:'center',textAlign:'center',padding:80}}>
      <ReferenceTextAnimation
        text={title}
        animation="scale-a"
        unit="whole"
        fontSize={(fontSize || 64)*2.8}
        color={accentColor || COLORS.mint}
        fontFamily={fontFamily || FONT_PRIMARY}
        fontWeight={900}
        overrideFrame={overrideFrame}
      />
      <ReferenceTextAnimation
        text={displaySub}
        animation="reveal-bounce"
        unit="whole"
        delay={4}
        fontSize={(fontSize || 64)*1.44}
        color={color}
        fontFamily={accentFont}
        fontWeight={900}
        style={{fontStyle:'italic',letterSpacing:-5,textShadow:'0 5px 16px rgba(0,0,0,.42)'}}
        overrideFrame={overrideFrame}
      />
    </AbsoluteFill>
  );
};

export const BRollBottom: React.FC<BRollTemplateProps & { footerText?: string }> = ({
  title = 'RESULTADO',
  subtitle = 'contenido profesional',
  footerText = 'sin complicarte',
  text,
  overrideFrame,
  fontVariant = 'montserrat',
  fontFamily,
  fontSize,
  color,
  accentColor,
}) => {
  const accentFont = fontFamily || (fontVariant === 'playfair' ? '"Playfair Display", serif' : FONT_ACCENT);
  const displaySub = text || subtitle;
  return (
    <AbsoluteFill style={{justifyContent:'flex-end',alignItems:'flex-start',padding:'0 72px 150px'}}>
      <ReferenceTextAnimation
        text={title}
        animation="tracking-simple"
        unit="letters"
        fontSize={(fontSize || 64)*.45}
        color={accentColor || COLORS.yellow}
        fontFamily={fontFamily || FONT_PRIMARY}
        fontWeight={900}
        style={{textAlign:'left'}}
        overrideFrame={overrideFrame}
      />
      <ReferenceTextAnimation
        text={displaySub}
        animation="slide-up"
        unit="words"
        delay={4}
        fontSize={fontSize || 62}
        color={color}
        fontFamily={fontFamily || FONT_PRIMARY}
        fontWeight={900}
        style={{textAlign:'left',letterSpacing:-3,textShadow:'0 5px 16px rgba(0,0,0,.5)'}}
        overrideFrame={overrideFrame}
      />
      <ReferenceTextAnimation
        text={footerText}
        animation="fade-soft"
        unit="whole"
        delay={8}
        fontSize={(fontSize || 64)*.77}
        color={accentColor || COLORS.mint}
        fontFamily={accentFont}
        fontWeight={900}
        style={{fontStyle:'italic',textAlign:'left',letterSpacing:-3}}
        overrideFrame={overrideFrame}
      />
    </AbsoluteFill>
  );
};
