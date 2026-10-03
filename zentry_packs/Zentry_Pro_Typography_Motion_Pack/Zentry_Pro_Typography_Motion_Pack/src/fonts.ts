import * as Montserrat from '@remotion/google-fonts/Montserrat';
import * as PlayfairDisplay from '@remotion/google-fonts/PlayfairDisplay';

const montserrat = Montserrat.loadFont('normal', {
  weights: ['700', '800', '900'],
  subsets: ['latin', 'latin-ext'],
});

const playfairItalic = PlayfairDisplay.loadFont('italic', {
  weights: ['700', '800', '900'],
  subsets: ['latin', 'latin-ext'],
});

export const FONT_PRIMARY = montserrat.fontFamily;
export const FONT_ACCENT = playfairItalic.fontFamily;

export const COLORS = {
  white: '#FFFFFF',
  yellow: '#FFE600',
  yellowGlow: '#FFF000',
  magenta: '#D36BFF',
  pink: '#FF73B8',
  mint: '#C9F5D7',
  shadow: 'rgba(0,0,0,.42)',
};
