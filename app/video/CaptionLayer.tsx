import React from 'react';
import { captionPages, brollOwnsAnimatedText, wordPulse, motionHidesCaptions } from './captionTiming';
import type { TikTokPage } from '@remotion/captions';
import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { getCaptionPreset } from './presets';
import type { CaptionStyleId } from './presets';
import type { CustomBrollItem, MotionGraphicItem, ZentryVideoProps } from './types';

interface CaptionLayerProps extends Pick<
  ZentryVideoProps,
  | 'captions'
  | 'styleId'
  | 'accentColor'
  | 'fontSize'
  | 'captionFontFamily'
  | 'captionFontWeight'
  | 'captionItalic'
  | 'captionDualFont'
  | 'captionTopFontFamily'
  | 'captionBottomFontFamily'
  | 'captionAlign'
  | 'shadow'
  | 'popAnimation'
  | 'captionPositionX'
  | 'captionPositionY'
  | 'captionGroupStyles'
  | 'brollEvents'
> {
  motionGraphicsItems?: MotionGraphicItem[];
  customBrolls?: CustomBrollItem[];
  hookActiveUntilSec?: number;
  zentryItems?: ZentryVideoProps['zentryItems'];
}

type CaptionPageProps = Omit<CaptionLayerProps, 'captions'> & { page: TikTokPage };

const getWordVisual = (
  styleId: CaptionStyleId,
  active: boolean,
  accentColor: string,
  shadow: boolean
) => {
  const base: React.CSSProperties = {
    color: active ? accentColor : '#ffffff',
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: '0px',
    WebkitTextStroke: '4px #050505',
    paintOrder: 'stroke fill',
    textShadow: shadow ? '0 8px 3px #000, 0 18px 35px rgba(0,0,0,.82)' : 'none',
  };

  // ViroEdit Styles
  if (styleId === 'estebanStyle') {
    return {
      ...base,
      WebkitTextStroke: active ? '0px transparent' : '3px #000',
      color: active ? (accentColor || '#00F5C8') : '#FFFFFF',
      textShadow: active
        ? '0 0 20px rgba(0,245,200,0.8), 0 0 40px rgba(0,245,200,0.4), 0 4px 12px #000'
        : '0 4px 14px rgba(0,0,0,0.9)',
    };
  }

  if (styleId === 'editorialStory') {
    return {
      ...base,
      WebkitTextStroke: '0px transparent',
      color: active ? (accentColor || '#00D4FF') : '#FFFFFF',
      textShadow: active
        ? '0 0 25px rgba(0,212,255,0.85), 0 0 50px rgba(0,212,255,0.4), 0 6px 20px #000'
        : '0 6px 18px rgba(0,0,0,0.95)',
    };
  }

  if (styleId === 'impactoStats') {
    return {
      ...base,
      WebkitTextStroke: '6px #000',
      color: active ? (accentColor || '#FFD700') : '#FFFFFF',
      textShadow: '5px 7px 0 #000, 0 15px 28px #000',
    };
  }

  if (styleId === 'motivacionalDual') {
    return {
      ...base,
      WebkitTextStroke: '4px #000',
      color: active ? (accentColor || '#00FF66') : '#FFFFFF',
      textShadow: active
        ? '0 0 25px rgba(0,255,102,0.8), 0 6px 20px #000'
        : '0 6px 18px rgba(0,0,0,0.85)',
    };
  }

  if (styleId === 'instagramOrange') {
    return {
      ...base,
      WebkitTextStroke: '5px #000',
      color: active ? (accentColor || '#FF6B00') : '#FFFFFF',
      textShadow: '0 8px 24px rgba(0,0,0,0.9)',
    };
  }

  if (styleId === 'minimalistaClean') {
    return {
      ...base,
      WebkitTextStroke: '0px transparent',
      color: active ? (accentColor || '#00BFFF') : '#FFFFFF',
      textShadow: '0 4px 14px rgba(0,0,0,0.9)',
      letterSpacing: '1px',
    };
  }

  if (styleId === 'magazineEditorial') {
    return {
      ...base,
      WebkitTextStroke: '0px transparent',
      color: active ? '#FFFFFF' : '#D0D0D0',
      textDecoration: active ? 'underline' : 'none',
      textUnderlineOffset: '6px',
      textDecorationThickness: '3px',
      textShadow: '0 6px 18px rgba(0,0,0,0.95)',
    };
  }

  if (styleId === 'simpleBasic') {
    return {
      ...base,
      WebkitTextStroke: '3px #000',
      color: active ? (accentColor || '#00D4FF') : '#FFFFFF',
    };
  }

  if (styleId === 'helveticaBold') {
    return {
      ...base,
      WebkitTextStroke: '2px #000',
      color: active ? '#FFFFFF' : '#E0E0E0',
      backgroundColor: active ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.5)',
      borderRadius: 10,
      padding: '3px 12px 6px',
    };
  }

  if (styleId === 'aniStyle') {
    return {
      ...base,
      WebkitTextStroke: '0px transparent',
      color: active ? '#FFFFFF' : '#D5D5D5',
      textShadow: '0 4px 14px rgba(0,0,0,0.9)',
    };
  }

  if (styleId === 'boldCaps') {
    return {
      ...base,
      WebkitTextStroke: '0px transparent',
      color: active ? '#000000' : '#FFFFFF',
      backgroundColor: active ? (accentColor || '#FFD400') : 'rgba(0,0,0,0.7)',
      borderRadius: 6,
      padding: '2px 14px 6px',
      textShadow: active ? 'none' : '0 4px 12px rgba(0,0,0,0.9)',
    };
  }

  // Legacy Styles
  if (styleId === 'hormozi') return { ...base, WebkitTextStroke: '6px #050505', letterSpacing: '-2px', color: active ? accentColor : '#ffffff' };
  if (styleId === 'editorial') return { ...base, WebkitTextStroke: '0px transparent', color: active ? '#c20000' : '#fff8ee', textShadow: '0 6px 18px rgba(0,0,0,.95)', textDecoration: active ? 'underline' : 'none', textDecorationThickness: '5px', textUnderlineOffset: '8px' };
  if (styleId === 'helvetica') return { ...base, WebkitTextStroke: '2px #000', color: active ? '#fef4b4' : '#ffffff', backgroundColor: 'rgba(0,0,0,.76)', borderRadius: 12, padding: '4px 14px 8px' };
  if (styleId === 'compact') return { ...base, WebkitTextStroke: '3px #050505', color: active ? '#fff' : '#fff', backgroundColor: active ? '#ff3158' : 'rgba(0,0,0,.62)', borderRadius: 14, padding: '3px 13px 8px' };
  if (styleId === 'neon') return { ...base, WebkitTextStroke: '3px #101010', color: active ? '#d7ff27' : '#ffffff', textShadow: active ? '0 0 12px #d7ff27, 0 0 32px rgba(215,255,39,.75), 0 8px 18px #000' : '0 8px 18px #000' };
  if (styleId === 'impact') return { ...base, WebkitTextStroke: '6px #000', color: active ? '#ffd400' : '#ffffff', textShadow: '5px 7px 0 #000, 0 15px 28px #000' };
  if (styleId === 'rounded') return { ...base, WebkitTextStroke: '0px transparent', color: active ? '#ffffff' : '#fff5fc', backgroundColor: active ? '#d82b94' : 'rgba(20,8,18,.62)', borderRadius: 28, padding: '5px 18px 9px', textShadow: '0 8px 18px rgba(0,0,0,.75)' };
  if (styleId === 'minimal') return { ...base, WebkitTextStroke: '0px transparent', color: active ? '#79a8ff' : '#ffffff', textShadow: '0 4px 14px rgba(0,0,0,.9)', letterSpacing: '2px' };
  if (styleId === 'elegant') return { ...base, WebkitTextStroke: '0px transparent', color: active ? '#f6d79c' : '#fffaf0', textShadow: '0 5px 18px rgba(0,0,0,.95)', letterSpacing: '1px' };
  if (styleId === 'yellow-box') return { ...base, WebkitTextStroke: '0px transparent', color: active ? '#111111' : '#ffffff', backgroundColor: active ? '#ffd400' : '#111111', borderRadius: 8, padding: '4px 16px 9px', textShadow: 'none' };
  if (styleId === 'capcut-pop') return { ...base, WebkitTextStroke: '5px #271500', color: active ? '#ffe24a' : '#ffffff', textShadow: '0 8px 0 #3a1d00,0 18px 30px #000' };
  if (styleId === 'capcut-comic') return { ...base, WebkitTextStroke: '5px #281006', color: active ? '#ff7433' : '#fff8e7', borderRadius: 16, padding: '1px 10px 7px', textShadow: '4px 7px 0 #281006,0 15px 24px #000' };
  if (styleId === 'capcut-bubble') return { ...base, WebkitTextStroke: '5px #07262c', color: active ? '#48e8ff' : '#ffffff', textShadow: '0 0 18px #48e8ff99,0 8px 0 #07262c,0 18px 30px #000' };
  if (styleId === 'capcut-hand') return { ...base, WebkitTextStroke: '1px #1c0909', color: active ? '#ff4a55' : '#fff', textShadow: '0 6px 12px #000', letterSpacing: '2px' };
  if (styleId === 'capcut-story') return { ...base, WebkitTextStroke: '1px #251a0c', color: active ? '#ffd783' : '#fffaf0', textShadow: '0 7px 16px #000' };

  return base;
};

const CaptionPage: React.FC<CaptionPageProps> = ({
  page,
  styleId,
  accentColor,
  fontSize,
  captionFontFamily,
  captionFontWeight,
  captionItalic,
  captionDualFont = false,
  captionTopFontFamily = 'Great Vibes',
  captionBottomFontFamily = 'Playfair Display',
  captionAlign,
  shadow,
  popAnimation,
  captionPositionX,
  captionPositionY = 72,
  brollEvents,
  motionGraphicsItems,
  customBrolls,
  zentryItems,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const preset = getCaptionPreset(styleId);

  const absoluteTimeMs = page.startMs + (frame / fps) * 1000;
  const currentSec = absoluteTimeMs / 1000;
  const activeMediaBroll = customBrolls?.find((broll) =>
    Boolean(broll.src) && !broll.templateId && !(broll.inheritCaptionStyle ?? broll.autoGenerated) &&
    currentSec >= broll.start && currentSec < broll.start + broll.duration
  );

  // Zentry templates contain their own text: do not stack the normal caption layer over them.
  if (
    zentryItems &&
    zentryItems.some(
      (item) =>
        currentSec >= item.start &&
        currentSec < item.start + item.duration
    )
  ) {
    return null;
  }

  // 4. MUTUAL EXCLUSIVITY: Hide subtitles during active B-rolls (which display their own kinetic typography) or full 3D scenes
  if (
    (brollEvents &&
      brollEvents.some(
        (event) =>
          event.words &&
          event.words.length > 0 &&
          currentSec >= event.start &&
          currentSec < event.end &&
          !customBrolls?.some((broll) => currentSec >= broll.start && currentSec < broll.start + broll.duration)
      )) ||
    (customBrolls &&
      customBrolls.some((broll) => {
        const isTextTemplate = brollOwnsAnimatedText(broll) || Boolean(broll.templateId) ||
          broll.brollStyle === 'white-minimal' ||
          broll.brollStyle === 'red-impact' ||
          broll.brollStyle === 'black-oled';
        return isTextTemplate &&
          currentSec >= broll.start &&
          currentSec < broll.start + broll.duration;
      })) ||
    (motionGraphicsItems &&
      motionGraphicsItems.some(
        (mg) =>
          motionHidesCaptions(mg) &&
          currentSec >= mg.start &&
          currentSec < mg.start + mg.duration
      ))
  ) {
    return null;
  }

  // Page level smooth entrance and exit
  const pageDurationFrames = Math.max(1, Math.round(((page.tokens[page.tokens.length - 1]?.toMs - page.startMs) / 1000) * fps));

  const pageEntrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 140 },
  });

  const pageOpacity = interpolate(
    frame,
    [0, 3, Math.max(4, pageDurationFrames - 3), pageDurationFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );


  const renderToken = (token: TikTokPage['tokens'][number], tokenIndex: number) => {
    const active = token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;
    const wordVisual = getWordVisual(styleId, active, accentColor || preset.accent, shadow);
    const tokenStartFrame = Math.max(0, Math.round(((token.fromMs - page.startMs) / 1000) * fps));
    const localWordFrame = Math.max(0, frame - tokenStartFrame);
    const wordPop = wordPulse(localWordFrame/fps,active,popAnimation);
    return (
      <span
        key={`${token.fromMs}-${tokenIndex}`}
        style={{
          ...wordVisual,
          ...(activeMediaBroll ? {color:active ? (activeMediaBroll.accentColor || accentColor) : (activeMediaBroll.textColor || '#ffffff'),fontFamily:activeMediaBroll.dualFont ? (tokenIndex < Math.ceil(page.tokens.length/2) ? activeMediaBroll.topFontFamily || 'Pacifico' : activeMediaBroll.bottomFontFamily || 'Anton') : activeMediaBroll.fontFamily || captionFontFamily} : {}),
          display: 'inline-block',
          transform: `scale(${wordPop})`,
        }}
      >
        {token.text}
      </span>
    );
  };

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: `${captionPositionX}%`,
          top: `${captionPositionY ?? 54}%`,
          width: 'max-content',
          maxWidth: '88%',
          transform: `translate(-50%, -50%) scale(${interpolate(pageEntrance, [0, 1], [0.94, 1])})`,
          opacity: pageOpacity,
          display: 'flex',
          flexDirection: (activeMediaBroll?.dualFont || captionDualFont) ? 'column' : 'row',
          flexWrap: 'wrap',
          justifyContent:
            captionAlign === 'left'
              ? 'flex-start'
              : captionAlign === 'right'
              ? 'flex-end'
              : 'center',
          gap:
            styleId === 'estebanStyle' || styleId === 'editorialStory' || styleId === 'editorial' || styleId === 'elegant'
              ? '4px 18px'
              : '8px 22px',
          textAlign: captionAlign,
          fontFamily: activeMediaBroll?.fontFamily || captionFontFamily || preset.fontFamily,
          fontSize: activeMediaBroll?.fontSize || fontSize,
          lineHeight: styleId === 'rounded' ? 1.08 : 1.02,
          fontWeight: captionFontWeight,
          fontStyle: captionItalic || preset.fontStyle === 'italic' ? 'italic' : 'normal',
          textTransform: preset.textTransform ?? 'uppercase',
          letterSpacing: styleId === 'minimal' || styleId === 'minimalistaClean' ? '2px' : '-1px',
        }}
      >
        {(activeMediaBroll?.dualFont || captionDualFont) ? (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 14px', fontFamily: activeMediaBroll?.topFontFamily || captionTopFontFamily, fontSize: '0.72em', fontWeight: 400, fontStyle: 'normal', textTransform: 'none' }}>
              {page.tokens.slice(0, Math.max(1, Math.ceil(page.tokens.length / 2))).map(renderToken)}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 16px', fontFamily: activeMediaBroll?.bottomFontFamily || captionBottomFontFamily, fontStyle: activeMediaBroll?.dualFont ? 'normal' : 'italic', transform: activeMediaBroll?.dualFont ? `translateX(${interpolate(frame,[0,12],[120,0],{extrapolateRight:'clamp'})}px)` : undefined }}>
              {page.tokens.slice(Math.max(1, Math.ceil(page.tokens.length / 2))).map((token, index) => renderToken(token, index + Math.max(1, Math.ceil(page.tokens.length / 2))))}
            </div>
          </>
        ) : page.tokens.map(renderToken)}
      </div>
    </AbsoluteFill>
  );
};

export const CaptionLayer: React.FC<CaptionLayerProps> = ({ captions, ...styleProps }) => {
  const { fps } = useVideoConfig();
  const pages = captionPages(captions);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {pages.map((page, index) => {
        const next = pages[index + 1];
        const from = Math.round((page.startMs / 1000) * fps);
        const to = Math.round((Math.min(next?.startMs ?? Infinity,page.startMs+page.durationMs) / 1000) * fps);
        const duration = Math.max(1, to - from);
        const groupStyle = styleProps.captionGroupStyles?.find(
          (override) => page.startMs < override.endMs && (page.tokens[page.tokens.length - 1]?.toMs ?? page.startMs) > override.startMs
        );
        const pageStyleProps = groupStyle
          ? {
              ...styleProps,
              styleId: groupStyle.styleId,
              accentColor: groupStyle.accentColor,
              fontSize: groupStyle.fontSize,
              captionFontFamily: groupStyle.captionFontFamily,
              captionFontWeight: groupStyle.captionFontWeight,
              captionItalic: groupStyle.captionItalic,
              captionDualFont: groupStyle.dualFontEnabled ?? false,
              captionTopFontFamily: groupStyle.topFontFamily || 'Great Vibes',
              captionBottomFontFamily: groupStyle.bottomFontFamily || 'Playfair Display',
              captionAlign: groupStyle.captionAlign,
              shadow: groupStyle.shadow,
              popAnimation: groupStyle.popAnimation,
              captionPositionX: groupStyle.positionX,
              captionPositionY: groupStyle.positionY,
            }
          : styleProps;

        return (
          <Sequence key={`${page.startMs}-${index}`} from={from} durationInFrames={duration}>
            <CaptionPage page={page} {...pageStyleProps} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
