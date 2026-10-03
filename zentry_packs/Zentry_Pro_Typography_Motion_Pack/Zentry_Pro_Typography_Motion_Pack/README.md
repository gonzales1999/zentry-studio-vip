# Zentry Pro Typography Motion Pack v2

Mejora del paquete de referencia entregado por el usuario.

## Dos tipografías
- **Montserrat ExtraBold / Black**: subtítulos, lectura rápida, hooks y texto funcional.
- **Playfair Display Bold Italic**: palabras de impacto, títulos editoriales y énfasis.

Las fuentes se cargan con `@remotion/google-fonts`; NO se incluyen archivos de fuente en el ZIP.

## Secciones
- `src/animations/`: conserva las **27 animaciones originales**. Cada una puede usar Montserrat o Playfair.
- `src/subtitles/`: **8 subtítulos** mejorados manteniendo el lenguaje visual del paquete anterior.
- `src/hooks/`: **6 hooks**.
- `src/broll/`: **3 plantillas exactas por posición**: arriba, centro y abajo.
- `src/motion-graphics/`: **6 motion graphics** tipográficos.

## Colores conservados / refinados
- Blanco `#FFFFFF`
- Amarillo `#FFE600`
- Amarillo glow `#FFF000`
- Magenta `#D36BFF`
- Rosa `#FF73B8`
- Mint `#C9F5D7`

## Instalación
```bash
npm install
npm start
```

## Uso de las 27 animaciones con las dos fuentes
```tsx
<DualFontAnimation
  text="ZENTRY MOTION"
  animation="reveal-bounce"
  unit="words"
  fontLook="montserrat"
/>

<DualFontAnimation
  text="ZENTRY MOTION"
  animation="reveal-bounce"
  unit="words"
  fontLook="playfair"
/>
```

Los MP4 de `previews/` son previews móviles. El render de Remotion usa las fuentes exactas cargadas desde `@remotion/google-fonts`.
