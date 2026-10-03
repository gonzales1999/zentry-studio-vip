import type { Metadata } from 'next';
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/900.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/900.css';
import '@fontsource/bebas-neue/400.css';
import '@fontsource/anton/400.css';
import '@fontsource/playfair-display/700-italic.css';
import '@fontsource/great-vibes/400.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zentry Studio — VIP Suite Activa',
  description: 'Zentry Studio: Editor de videos verticales, subtítulos dinámicos con IA y renderizado en tu dispositivo.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
