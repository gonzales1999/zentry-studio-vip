PROMPT DE INTEGRACIÓN — ZENTRY MOTION TEMPLATES + SFX

OBJETIVO
Integra en mi editor de video existente el paquete visual Zentry Pro Typography Motion Pack y el paquete Zentry Pro Motion SFX Production Pack. No rediseñes las plantillas: usa los componentes existentes como fuente de verdad y llévalos a producción.

REGLAS
1. Antes de modificar, audita la arquitectura actual del editor, Remotion, timeline, sistema de assets, estado, exportación y render.
2. No rompas funciones existentes. Integra por módulos y conserva compatibilidad.
3. Detecta la versión exacta instalada de `remotion`. Instala `@remotion/media` usando EXACTAMENTE la misma versión. Mantén todos los paquetes `remotion` / `@remotion/*` alineados.
4. No uses el antiguo `<Audio>` de `remotion`. Usa `<Audio>` de `@remotion/media`.
5. Las plantillas visuales están separadas en animations, subtitles, hooks, broll y motion-graphics.
6. Los sonidos están en `public/sfx/`.
7. `sound-map.json` y `src/audio/soundMap.ts` son la fuente de verdad para archivo, volumen y offset.
8. `visual-component-map.json` vincula los componentes visuales con sus IDs estables.
9. Las 27 animaciones tipográficas tienen dos looks de fuente (Montserrat y Playfair), pero comparten el mismo SFX según el movimiento.

IMPLEMENTACIÓN
- Crea un registro central de presets con:
  id, nombre, categoría, componente visual, variantes de fuente, thumbnail/preview, sfxId, volumen, offsetFrames y duración.
- Categorías visibles en UI:
  Subtítulos / Hooks / Tipografía / B-roll / Motion Graphics.
- En Tipografía, permitir seleccionar Montserrat o Playfair sin cambiar el preset de sonido.
- En B-roll mostrar tres presets separados: Arriba / Centro / Abajo.
- Cada tarjeta de preset debe tener preview al pasar/tocar, nombre y botón Aplicar.
- Al aplicar una plantilla:
  a) insertar componente visual en el playhead;
  b) insertar automáticamente su SFX usando `ZentryPresetSfx`;
  c) respetar `offsetFrames`;
  d) respetar `defaultVolume`;
  e) agrupar visual + SFX como un solo elemento lógico editable.
- Añadir controles:
  SFX ON/OFF;
  volumen SFX 0–100%;
  reemplazar SFX;
  resetear SFX al original;
  cambiar duración visual sin deformar el audio;
  mover visual y audio juntos;
  opción para desvincular audio manualmente.
- Evitar clipping: volumen final por defecto nunca superior a 1.
- Si existe voz principal, aplicar ducking conceptual: dejar los SFX cortos y discretos; no reducir inteligibilidad de la voz.
- Pre-cargar o premontar audio para evitar retrasos de playback.
- Al exportar/renderizar, verificar que todos los SFX aparezcan en el archivo final y queden sincronizados.

ARQUITECTURA RECOMENDADA
- `src/zentry/animations/`
- `src/zentry/subtitles/`
- `src/zentry/hooks/`
- `src/zentry/broll/`
- `src/zentry/motion-graphics/`
- `src/zentry/audio/`
- `public/sfx/`
- `src/zentry/registry.ts`

DATOS
Lee `sound-map.json`; no escribas a mano rutas alternativas si ya existen.
Usa `presetId` como clave estable.
Si una plantilla visual no tiene mapping, no inventes sonido: registra el error en desarrollo y deja SFX apagado para ese preset.

PRUEBAS OBLIGATORIAS
- Abrir cada categoría.
- Aplicar al menos un preset de cada categoría.
- Probar ambas fuentes en Tipografía.
- Confirmar B-roll arriba, centro y abajo.
- Confirmar sincronización visual/SFX en preview y render.
- Confirmar mute, volumen y movimiento en timeline.
- Confirmar que cambiar de fuente no duplique el audio.
- Render de prueba H.264 con audio.
- Ejecutar build/typecheck/tests existentes.
- Corregir errores antes de finalizar.

ENTREGA
Al terminar:
1. enumera archivos creados/modificados;
2. explica dónde quedó el registro de presets;
3. confirma cuántas plantillas visuales y cuántos SFX quedaron activos;
4. confirma que preview y render de producción incluyen audio;
5. informa cualquier incompatibilidad real encontrada, sin reemplazar silenciosamente componentes.
