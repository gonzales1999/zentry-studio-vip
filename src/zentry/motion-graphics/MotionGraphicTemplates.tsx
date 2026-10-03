import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ReferenceTextAnimation} from '../animations';
import {COLORS, FONT_ACCENT, FONT_PRIMARY} from '../fonts';

export type MotionGraphicTemplateProps = {
  title?: string;
  subtitle?: string;
  value?: string;
  overrideFrame?: number;
  fontVariant?: 'montserrat' | 'playfair';
};

export const Motion01HeroSplit: React.FC<MotionGraphicTemplateProps> = ({
  title = 'IDEA',
  subtitle = 'a video',
  overrideFrame,
  fontVariant = 'montserrat',
}) => {
  const accentFont = fontVariant === 'playfair' ? '"Playfair Display", serif' : FONT_ACCENT;
  return (
    <AbsoluteFill style={{justifyContent:'center',alignItems:'center',textAlign:'center',padding:80}}>
      <ReferenceTextAnimation
        text={title}
        animation="slide-right"
        unit="whole"
        fontSize={142}
        fontFamily={FONT_PRIMARY}
        fontWeight={900}
        overrideFrame={overrideFrame}
      />
      <ReferenceTextAnimation
        text={subtitle}
        animation="slide-left"
        unit="whole"
        delay={4}
        fontSize={126}
        color={COLORS.magenta}
        fontFamily={accentFont}
        fontWeight={900}
        style={{fontStyle:'italic',letterSpacing:-6}}
        overrideFrame={overrideFrame}
      />
    </AbsoluteFill>
  );
};

export const Motion02KineticStack: React.FC<MotionGraphicTemplateProps & { words?: string[] }> = ({
  words = ['GUION', 'IMAGEN', 'VIDEO'],
  overrideFrame,
  fontVariant = 'montserrat',
}) => {
  return (
    <AbsoluteFill style={{justifyContent:'center',alignItems:'flex-start',padding:'0 105px'}}>
      {words.map((x, i) => (
        <ReferenceTextAnimation
          key={`${x}-${i}`}
          text={x}
          animation="reveal-soft"
          unit="whole"
          delay={i * 5}
          fontSize={105}
          color={i === 1 ? COLORS.yellow : COLORS.white}
          fontFamily={FONT_PRIMARY}
          fontWeight={900}
          style={{textAlign:'left',letterSpacing:-5}}
          overrideFrame={overrideFrame}
        />
      ))}
    </AbsoluteFill>
  );
};

export const Motion03EditorialQuote: React.FC<MotionGraphicTemplateProps & { quote?: string; author?: string }> = ({
  quote = '“El movimiento debe ayudar a leer”',
  author = 'ZENTRY MOTION',
  title,
  subtitle,
  overrideFrame,
  fontVariant = 'montserrat',
}) => {
  const accentFont = fontVariant === 'playfair' ? '"Playfair Display", serif' : FONT_ACCENT;
  const displayQuote = title || quote;
  const displayAuthor = subtitle || author;
  return (
    <AbsoluteFill style={{justifyContent:'center',alignItems:'center',textAlign:'center',padding:110}}>
      <ReferenceTextAnimation
        text={displayQuote}
        animation="slide-up"
        unit="words"
        fontSize={72}
        color={COLORS.mint}
        fontFamily={accentFont}
        fontWeight={800}
        style={{fontStyle:'italic',lineHeight:1.05}}
        overrideFrame={overrideFrame}
      />
      <ReferenceTextAnimation
        text={displayAuthor}
        animation="tracking-simple"
        unit="letters"
        delay={15}
        fontSize={30}
        color={COLORS.yellow}
        fontFamily={FONT_PRIMARY}
        fontWeight={900}
        overrideFrame={overrideFrame}
      />
    </AbsoluteFill>
  );
};

export const Motion04StatPunch: React.FC<MotionGraphicTemplateProps> = ({
  value = '3×',
  title,
  subtitle = 'más retención',
  overrideFrame,
  fontVariant = 'montserrat',
}) => {
  const accentFont = fontVariant === 'playfair' ? '"Playfair Display", serif' : FONT_ACCENT;
  const displayVal = value || title || '3×';
  const displaySub = subtitle;
  return (
    <AbsoluteFill style={{justifyContent:'center',alignItems:'center',textAlign:'center'}}>
      <ReferenceTextAnimation
        text={displayVal}
        animation="scale-b"
        unit="whole"
        fontSize={210}
        color={COLORS.yellow}
        fontFamily={FONT_PRIMARY}
        fontWeight={900}
        overrideFrame={overrideFrame}
      />
      <ReferenceTextAnimation
        text={displaySub}
        animation="reveal-bounce"
        unit="whole"
        delay={5}
        fontSize={88}
        fontFamily={accentFont}
        fontWeight={900}
        style={{fontStyle:'italic',letterSpacing:-5}}
        overrideFrame={overrideFrame}
      />
    </AbsoluteFill>
  );
};

export const Motion05GradientTitle: React.FC<MotionGraphicTemplateProps> = ({
  title = 'CREA',
  subtitle = 'impacto',
  overrideFrame,
  fontVariant = 'montserrat',
}) => {
  const accentFont = fontVariant === 'playfair' ? '"Playfair Display", serif' : FONT_ACCENT;
  return (
    <AbsoluteFill style={{justifyContent:'center',alignItems:'center',textAlign:'center'}}>
      <ReferenceTextAnimation
        text={title}
        animation="tracking-elastic"
        unit="letters"
        fontSize={92}
        fontFamily={FONT_PRIMARY}
        fontWeight={900}
        overrideFrame={overrideFrame}
      />
      <div style={{
        fontFamily: accentFont,
        fontStyle: 'italic',
        fontWeight: 900,
        fontSize: 150,
        letterSpacing: -7,
        background: `linear-gradient(90deg,${COLORS.white},${COLORS.magenta},${COLORS.pink})`,
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        filter: 'drop-shadow(0 8px 20px rgba(180,70,255,.3))',
      }}>
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};

export const Motion06StepSequence: React.FC<MotionGraphicTemplateProps & { step?: string; bottomText?: string }> = ({
  step = '01',
  title = 'Crea el hook',
  bottomText = '02 · SUBTÍTULO  03 · B-ROLL',
  overrideFrame,
  fontVariant = 'montserrat',
}) => {
  const accentFont = fontVariant === 'playfair' ? '"Playfair Display", serif' : FONT_ACCENT;
  return (
    <AbsoluteFill style={{justifyContent:'center',alignItems:'flex-start',padding:'0 90px'}}>
      <ReferenceTextAnimation
        text={step}
        animation="scale-a"
        unit="whole"
        fontSize={120}
        color={COLORS.yellow}
        fontFamily={FONT_PRIMARY}
        fontWeight={900}
        style={{textAlign:'left'}}
        overrideFrame={overrideFrame}
      />
      <ReferenceTextAnimation
        text={title}
        animation="slide-right"
        unit="words"
        delay={4}
        fontSize={72}
        fontFamily={accentFont}
        fontWeight={900}
        style={{fontStyle:'italic',textAlign:'left'}}
        overrideFrame={overrideFrame}
      />
      <ReferenceTextAnimation
        text={bottomText}
        animation="fade-soft"
        unit="words"
        delay={10}
        fontSize={31}
        fontFamily={FONT_PRIMARY}
        fontWeight={800}
        style={{textAlign:'left'}}
        overrideFrame={overrideFrame}
      />
    </AbsoluteFill>
  );
};
