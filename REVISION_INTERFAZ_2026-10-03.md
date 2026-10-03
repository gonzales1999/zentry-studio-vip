# Revisión de interfaz — 03/10/2026

## Alcance y plan

- [x] Leer completas las guías compartidas `web-design-guidelines.md` y `design-an-interface.md`.
- [x] Consultar reglas actuales: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
- [x] Comparar 3 propuestas independientes, sin cambios de código por los agentes.
- [x] Simplificar explicaciones de Audio, B-roll, Motion, Zentry, Marca y reducción de ruido; conservar acciones y avisos relevantes.
- [x] Ayudas desplegables por teclado, foco visible, nombres accesibles y controles dentro del ancho del panel.
- [x] TypeScript, build, regresión de audio y comprobación visual local.

## Alternativas de diseño

La segunda guía trata interfaces de módulos/API. Se aplicó su método de comparación a la superficie del editor; no se rediseñó la API ni el motor de edición. Las implementaciones posteriores corresponden a la petición del usuario de mejorar la interfaz.

### 1. Superficie mínima

Forma conceptual: `Panel { añadir, editar, sincronizar, ayuda }`.
Uso: añadir audio → seleccionar pista → ajustar volumen. Instrucciones y opciones secundarias se muestran al pedir ayuda.
Oculta: documentación permanente y complejidad avanzada.
Tradeoff: lectura rápida, pero ocultar controles frecuentes añade clics y dificulta descubrirlos.

### 2. Flexibilidad por secciones

Forma conceptual: `Panel { pestaña: pistas | sonidos, selección, controles, detalles }`.
Uso: abrir Pistas para editar música; Sonidos para buscar SFX.
Oculta: separación de bibliotecas, categorías y ajustes avanzados.
Tradeoff: facilita crecer, pero introduce pestañas nuevas y navegación entre controles existentes.

### 3. Contexto de selección

Forma conceptual: `Inspector { elementoSeleccionado, ajustes, acciones, ayuda }`.
Uso: seleccionar audio en timeline → volumen/tiempo/velocidad del audio. Sin selección, biblioteca.
Oculta: controles no aplicables y explicaciones repetidas.
Tradeoff: reduce ruido, pero exige identificar siempre con claridad qué elemento está seleccionado.

### Síntesis aplicada

Mantener operaciones existentes y la selección contextual ya implementada; simplificar títulos, quitar duplicados y mover explicaciones a `<details>`. No se crearon pestañas ni menús nuevos para controles frecuentes. Se conservan nombres claros, límites de carga, estados de procesamiento, advertencia de reemplazo de subtítulos y limitaciones de ruido/archivos locales. Dimensiones exteriores sin cambios.

## Hallazgos corregidos — formato de revisión

### app/page.tsx

app/page.tsx:5498 - Aviso de reemplazo conservado; documentación extensa trasladada a ayuda.
app/page.tsx:5593 - Ayuda de audio semántica, plegada inicialmente y accesible por teclado.
app/page.tsx:5751 - Búsqueda B-roll con nombre accesible; placeholder/estado de carga con elipsis correcta.
app/page.tsx:6106 - Ayuda B-roll separada de controles frecuentes; plantillas existentes conservadas.
app/page.tsx:6568 - Persistencia/archivos locales explicados en ayuda de plantillas.
app/page.tsx:7771 - Limitaciones reales de reducción de ruido conservadas en ayuda.
app/page.tsx:7847 - Negrita/cursiva con nombres accesibles y estado; alineación con nombre explícito.

### app/globals.css

app/globals.css:2690 - Ayuda con texto legible y despliegue nativo.
app/globals.css:2708 - Foco visible en controles y ayudas del editor.

## Pendientes fuera de esta simplificación

app/page.tsx:4247 - Botón «Cerrar panel» sin manejador; no se eliminó ni se cambió el comportamiento/dimensiones del panel en esta revisión.
app/page.tsx:4487 - Persisten transiciones `all` en controles antiguos; reducción de movimiento solo ajustada para tarjetas de estilo/rail, no para animaciones del contenido exportado.

Esta es una revisión enfocada en la interfaz del editor, no certificación de cumplimiento íntegro de todas las reglas en toda la aplicación.

## Validación — TERMINADO en este alcance

- `npx tsc --noEmit`: aprobado.
- `npm run build`: aprobado; avisos existentes sobre tamaño de chunks y clasificación de rutas.
- `node scripts/test-audio-timeline.mjs`: aprobado.
- Sesión existente: Jose1998videoprueba, audio del usuario `Yo_No_Vendo_Humo_audio_completo.mp3`, volumen 14%, velocidad 1×; no se modificaron.
- Audio/B-roll/Zentry: panel 239 px y contenido 239 px; ningún botón, input o select desborda horizontalmente en los paneles inspeccionados.
- Ayuda de audio: Enter abre y cierra; DOM confirma `open=true` y texto conservado.
- B-roll mantiene fondos blanco/rojo/negro, catálogo original, 2 plantillas guardadas, búsqueda Pexels, 6 clips y sus acciones.
- Zentry conserva 53 plantillas, pack automático y categorías.
- Sin nuevas cargas, transcripciones, exportaciones ni cambios de volumen/plantilla durante estas pruebas. No se consumieron créditos.
- Evidencia: `VALIDACION_INTERFAZ_COMPACTA_2026-10-03.jpg`.
