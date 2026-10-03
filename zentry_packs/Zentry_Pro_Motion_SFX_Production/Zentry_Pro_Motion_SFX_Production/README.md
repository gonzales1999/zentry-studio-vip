# Zentry Pro Motion SFX Production Pack

Este paquete añade sound design original al paquete visual `Zentry_Pro_Typography_Motion_Pack`.

## Contenido
- 27 SFX para las 27 animaciones tipográficas.
  - El mismo SFX se reutiliza para las variantes Montserrat y Playfair del mismo movimiento.
- 8 SFX para subtítulos.
- 6 SFX para hooks.
- 3 SFX para B-roll: arriba, centro y abajo.
- 6 SFX para Motion Graphics.
- Total: 50 archivos MP3 originales.
- `sound-map.json`: fuente de verdad para archivo, volumen y offset.
- `visual-component-map.json`: vínculo entre componentes visuales y IDs de sonido.
- `src/audio/`: helpers para Remotion/editor.

## Integración Remotion actual
El componente recomendado actualmente es `Audio` de `@remotion/media`.

Alinea la versión de `@remotion/media` con la versión exacta de `remotion` instalada en tu proyecto.

Ejemplo:
```tsx
<ZentryPresetSfx presetId="hook_01_dual_line" />
```

## Producción
1. Copia `public/sfx/` al `public/` de tu editor.
2. Copia `src/audio/` a tu código.
3. Fusiona los componentes del paquete visual Zentry.
4. Usa el mismo `presetId` tanto para visual como para audio.
5. El editor debe permitir activar/desactivar SFX y ajustar volumen por clip.
6. No dupliques archivos de audio para Montserrat y Playfair: el movimiento es el mismo y comparte SFX.
