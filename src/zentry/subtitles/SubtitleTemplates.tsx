import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {ReferenceTextAnimation} from '../animations';
import {COLORS, FONT_ACCENT, FONT_PRIMARY} from '../fonts';

const wrap: React.CSSProperties = {
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  pointerEvents: 'none',
};

export type SubtitleTemplateProps = {
  top?: string;
  main?: string;
  text?: string;
  overrideFrame?: number;
  fontVariant?: 'montserrat' | 'playfair';
};

const resolveText = (props: SubtitleTemplateProps, defaultTop: string, defaultMain: string) => {
  // El texto sincronizado del editor debe ganar sobre los textos de demostración
  // incluidos en defaultProps del catálogo.
  if (props.text) {
    const words = props.text.trim().split(/\s+/);
    if (words.length > 2) {
      const mid = Math.ceil(words.length / 2);
      return { top: words.slice(0, mid).join(' '), main: words.slice(mid).join(' ') };
    }
    return { top: '', main: props.text };
  }
  if (props.top || props.main) {
    return { top: props.top ?? defaultTop, main: props.main ?? defaultMain };
  }
  return { top: defaultTop, main: defaultMain };
};

export const Subtitle01CleanEditorial: React.FC<SubtitleTemplateProps> = (props) => {
  const { top, main } = resolveText(props, 'La gente me sigue', 'preguntando');
  const accentFont = props.fontVariant === 'playfair' ? '"Playfair Display", serif' : FONT_ACCENT;
  return (
    <AbsoluteFill style={wrap}>
      <div style={{transform:'translateY(210px)'}}>
        {top && (
          <ReferenceTextAnimation
            text={top}
            animation="fade-soft"
            unit="words"
            fontSize={39}
            fontFamily={FONT_PRIMARY}
            fontWeight={800}
            overrideFrame={props.overrideFrame}
          />
        )}
        <ReferenceTextAnimation
          text={main}
          animation="reveal-soft"
          unit="whole"
          delay={7}
          fontSize={105}
          fontFamily={accentFont}
          fontWeight={800}
          style={{
            fontStyle:'italic',
            letterSpacing:-4,
            textShadow:`0 6px 18px ${COLORS.shadow}`,
          }}
          overrideFrame={props.overrideFrame}
        />
      </div>
    </AbsoluteFill>
  );
};

export const Subtitle02YellowBubblePro: React.FC<SubtitleTemplateProps> = (props) => {
  const { top, main } = resolveText(props, 'cómo hago estas', 'animaciones');
  return (
    <AbsoluteFill style={wrap}>
      <div style={{transform:'translateY(-245px)'}}>
        {top && (
          <ReferenceTextAnimation
            text={top}
            animation="slide-up"
            unit="words"
            fontSize={37}
            fontFamily={FONT_PRIMARY}
            fontWeight={800}
            overrideFrame={props.overrideFrame}
          />
        )}
        <ReferenceTextAnimation
          text={main}
          animation="reveal-bounce"
          unit="letters"
          delay={4}
          fontSize={102}
          color={COLORS.yellow}
          fontFamily={FONT_PRIMARY}
          fontWeight={900}
          style={{
            letterSpacing:-5,
            textShadow:'0 5px 0 rgba(0,0,0,.08), 0 10px 24px rgba(0,0,0,.28)',
          }}
          overrideFrame={props.overrideFrame}
        />
      </div>
    </AbsoluteFill>
  );
};

const RemotionFrameConsumer: React.FC<{
  children: (frame: number) => React.ReactElement | null;
}> = ({ children }) => {
  const frame = useCurrentFrame();
  return children(frame);
};

const Subtitle03GradientEditorialRenderer: React.FC<SubtitleTemplateProps & { frame: number }> = (props) => {
  const { top, main } = resolveText(props, 'dentro de', 'Premiere');
  const accentFont = props.fontVariant === 'playfair' ? '"Playfair Display", serif' : FONT_ACCENT;
  const currentFrame = props.overrideFrame !== undefined ? props.overrideFrame : props.frame;
  const p = interpolate(currentFrame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={wrap}>
      <div style={{transform:'translateY(235px)'}}>
        {top && (
          <ReferenceTextAnimation
            text={top}
            animation="fade-soft"
            unit="words"
            fontSize={38}
            fontFamily={FONT_PRIMARY}
            fontWeight={800}
            overrideFrame={props.overrideFrame}
          />
        )}
        <div style={{
          fontFamily: accentFont,
          fontStyle:'italic',
          fontWeight:900,
          fontSize:112,
          letterSpacing:-5,
          opacity:p,
          transform:`translateY(${(1-p)*48}px) scale(${.86+.14*p})`,
          background:`linear-gradient(90deg,${COLORS.white},${COLORS.magenta},${COLORS.pink})`,
          WebkitBackgroundClip:'text',
          color:'transparent',
          filter:'drop-shadow(0 8px 18px rgba(180,70,255,.25))'
        }}>{main}</div>
      </div>
    </AbsoluteFill>
  );
};

export const Subtitle03GradientEditorial: React.FC<SubtitleTemplateProps> = (props) => {
  if (props.overrideFrame !== undefined) {
    return <Subtitle03GradientEditorialRenderer {...props} frame={props.overrideFrame} />;
  }
  return (
    <RemotionFrameConsumer>
      {(frame) => <Subtitle03GradientEditorialRenderer {...props} frame={frame} />}
    </RemotionFrameConsumer>
  );
};

export const Subtitle04YellowMicroEditorial: React.FC<SubtitleTemplateProps> = (props) => {
  const displayText = props.text || props.main || 'listo';
  const accentFont = props.fontVariant === 'playfair' ? '"Playfair Display", serif' : FONT_ACCENT;
  return (
    <AbsoluteFill style={wrap}>
      <div style={{transform:'translateY(180px)'}}>
        <ReferenceTextAnimation
          text={displayText}
          animation="fade-soft"
          unit="whole"
          fontSize={38}
          color={COLORS.yellow}
          fontFamily={accentFont}
          fontWeight={800}
          style={{fontStyle:'italic'}}
          overrideFrame={props.overrideFrame}
        />
      </div>
    </AbsoluteFill>
  );
};

export const Subtitle05DualFontLabel: React.FC<SubtitleTemplateProps & { subLabel?: string }> = (props) => {
  const displayText = props.text || props.main || 'Animaciones';
  const subLabel = props.top || props.subLabel || (props.text ? '' : '(5 segundos)');
  const accentFont = props.fontVariant === 'playfair' ? '"Playfair Display", serif' : FONT_ACCENT;
  return (
    <AbsoluteFill style={{...wrap, justifyContent:'flex-start', paddingTop:215}}>
      <ReferenceTextAnimation
        text={displayText}
        animation="tracking-elastic"
        unit="letters"
        fontSize={93}
        color={COLORS.yellow}
        fontFamily={FONT_PRIMARY}
        fontWeight={900}
        style={{letterSpacing:-5}}
        overrideFrame={props.overrideFrame}
      />
      {subLabel && (
        <div style={{marginTop:10}}>
          <ReferenceTextAnimation
            text={subLabel}
            animation="fade-soft"
            unit="words"
            delay={8}
            fontSize={40}
            fontFamily={accentFont}
            fontWeight={800}
            style={{fontStyle:'italic'}}
            overrideFrame={props.overrideFrame}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};

export const Subtitle06TutorialCapsPro: React.FC<SubtitleTemplateProps> = (props) => {
  const displayText = (props.text || props.main || 'ARRASTRARLO').toUpperCase();
  return (
    <AbsoluteFill style={{...wrap, justifyContent:'flex-start', paddingTop:340}}>
      <ReferenceTextAnimation
        text={displayText}
        animation="slide-up"
        unit="words"
        fontSize={62}
        fontFamily={FONT_PRIMARY}
        fontWeight={900}
        style={{
          letterSpacing:-3,
          textShadow:'0 4px 10px rgba(0,0,0,.55)'
        }}
        overrideFrame={props.overrideFrame}
      />
    </AbsoluteFill>
  );
};

export const Subtitle07MintEditorial: React.FC<SubtitleTemplateProps> = (props) => {
  const displayText = props.text || props.main || 'complicaciones';
  const accentFont = props.fontVariant === 'playfair' ? '"Playfair Display", serif' : FONT_ACCENT;
  return (
    <AbsoluteFill style={wrap}>
      <div style={{transform:'translateY(130px)'}}>
        <ReferenceTextAnimation
          text={displayText}
          animation="reveal-bounce"
          unit="whole"
          fontSize={92}
          color={COLORS.mint}
          fontFamily={accentFont}
          fontWeight={900}
          style={{
            fontStyle:'italic',
            letterSpacing:-4,
            textShadow:'0 6px 18px rgba(0,0,0,.34)'
          }}
          overrideFrame={props.overrideFrame}
        />
      </div>
    </AbsoluteFill>
  );
};

export const Subtitle08YellowGlowEditorial: React.FC<SubtitleTemplateProps> = (props) => {
  const displayText = props.text || props.main || '"Texto"';
  const accentFont = props.fontVariant === 'playfair' ? '"Playfair Display", serif' : FONT_ACCENT;
  return (
    <AbsoluteFill style={wrap}>
      <div style={{transform:'translateY(250px)'}}>
        <ReferenceTextAnimation
          text={displayText}
          animation="scale-b"
          unit="whole"
          fontSize={138}
          color={COLORS.yellowGlow}
          fontFamily={accentFont}
          fontWeight={900}
          style={{
            fontStyle:'italic',
            letterSpacing:-6,
            textShadow:'0 5px 0 #F19300, 0 0 22px rgba(255,191,0,.72), 0 12px 30px rgba(0,0,0,.42)'
          }}
          overrideFrame={props.overrideFrame}
        />
      </div>
    </AbsoluteFill>
  );
};
