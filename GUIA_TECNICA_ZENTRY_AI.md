# GUÍA TÉCNICA MAESTRA: SISTEMA ZENTRY VIDEO EDITOR
> **Documento de Referencia y Transferencia para Agentes IA y Desarrolladores**  
> **Última actualización:** Septiembre 2026  
> **Versión del Sistema:** 2.5 (Zentry Motion 50 Pack + Motor Híbrido Local)

---

## 1. Propósito de este Documento

Esta guía técnica está diseñada para que cualquier otra Inteligencia Artificial o desarrollador que trabaje en este repositorio comprenda **de inmediato y con máxima precisión**:
- Dónde está cada archivo y recurso del proyecto.
- Qué función cumple cada módulo, componente y tipo de dato.
- Cómo fluyen los datos (desde la carga del video y transcripción con IA, hasta el canvas en vivo y el renderizado final con Remotion).
- Cómo están configuradas las 50 plantillas maestras y sus 50 efectos de sonido (SFX).
- Qué problemas históricos existían, qué soluciones exactas se implementaron y qué reglas críticas deben respetarse para no romper el sistema.

---

## 2. Mapa de Estructura de Archivos ("Dónde está cada cosa")

```text
editor de videos zentry/
├── app/
│   ├── page.tsx                      <- NÚCLEO DEL EDITOR (Estados, Timeline, Canvas, Inspector, Eventos)
│   ├── globals.css                   <- Estilos globales, temas oscuros, animaciones CSS, diseño Viro/Zentry
│   ├── layout.tsx                    <- Shell principal de Next.js
│   ├── api/
│   │   ├── pexels/route.ts           <- Búsqueda de B-rolls gratuitos en Pexels
│   │   └── whisper-model/route.ts    <- Descarga/Proxy de modelos Whisper para transcripción
│   └── video/
│       ├── ZentryComposition.tsx     <- COMPOSICIÓN MAESTRA DE REMOTION (Render final 1080x1920)
│       ├── CaptionLayer.tsx          <- Capa de subtítulos animados (pop, bounce, karaoke, etc.)
│       ├── MotionGraphicsLayer.tsx   <- Render de escenas 3D (stats, cards, quotes, pills, notif)
│       ├── contextualSoundEngine.ts  <- Detección de palabras clave y asignación inteligente de SFX
│       ├── presets.ts                <- Presets de subtítulos (Viro, Hormozi, Minimal, etc.)
│       ├── types.ts                  <- Definiciones de TypeScript para composición y edición
│       ├── cleanWhisperCaptions.ts   <- Limpieza y normalización de textos de transcripción
│       └── safeInterpolate.ts        <- Interpolaciones seguras sin NaN para físicas de movimiento
│
├── src/
│   └── zentry/
│       ├── registry.ts               <- REGISTRO CENTRAL DE LAS 50 PLANTILLAS ZENTRY
│       ├── Root.tsx                  <- Punto de entrada de Remotion para preview de plantillas
│       ├── library.ts                <- Mapeo de categorías y componentes
│       ├── fonts.ts                  <- Carga y definición de fuentes (Montserrat, Playfair, Anton)
│       ├── subtitles/
│       │   └── SubtitleTemplates.tsx <- 8 Componentes visuales de subtítulos Zentry
│       ├── hooks/
│       │   └── HookTemplates.tsx     <- 6 Componentes visuales de hooks virales Zentry
│       ├── broll/
│       │   └── BRollTemplates.tsx    <- 3 Componentes visuales de B-roll (Top, Center, Bottom)
│       ├── motion-graphics/
│       │   └── MotionGraphicTemplates.tsx <- 6 Escenas 3D / Motion Graphics Zentry
│       ├── animations/
│       │   ├── presets.ts            <- 27 Presets de animación tipográfica cinética
│       │   ├── ReferenceTextAnimation.tsx <- Motor de animación de texto basado en frames
│       │   └── DualFontAnimation.tsx <- Animación combinando dos fuentes simultáneas
│       └── audio/
│           ├── soundMap.ts           <- MAPA DE LOS 50 SFX (IDs, rutas, volumen, frame offset)
│           ├── ZentryPresetSfx.tsx   <- Componente Remotion <Audio> sincronizado con offset
│           └── editorRegistry.ts     <- Helper para consultar SFX desde el editor
│
├── public/
│   ├── sfx/                          <- 50+ Archivos de audio (WAV, MP3) para impactos y transiciones
│   ├── zentry-previews/              <- Videos MP4 de vista previa para el catálogo de la app
│   │   ├── subtitles/ (S01.mp4 a S08.mp4)
│   │   ├── hooks/ (H01.mp4 a H06.mp4)
│   │   ├── broll/ (B01.mp4 a B03.mp4)
│   │   ├── motion-graphics/ (M01.mp4 a M06.mp4)
│   │   └── typography/ (T01.mp4 a T27.mp4)
│   └── stickers/                     <- Íconos PNG, flechas y elementos decorativos
│
├── scratch/
│   └── test_zentry_system.ts         <- SCRIPT DE VALIDACIÓN COMPLETA DEL SISTEMA ZENTRY
│
├── AUDITORIA_APP_ZENTRY.md           <- Resumen ejecutivo y diagnóstico técnico
└── GUIA_TECNICA_ZENTRY_AI.md         <- ESTE ARCHIVO (Manual maestro para desarrolladores e IAs)
```

---

## 3. Definición y Roles de Módulos ("Qué es cada cosa")

### A. `app/page.tsx` (El Orquestador Central)
Es el componente React principal (`Home`). Maneja todo el ciclo de vida de la aplicación:
1. **Estados del proyecto:**
   - `videoUrl`, `duration`, `currentTime`, `playing`: Control de reproducción del video base.
   - `captions`: Lista de segmentos de subtítulos transcritos por Whisper (`start`, `end`, `text`).
   - `customBrolls`: Lista de elementos B-roll (`CustomBrollItem`).
   - `motionGraphicsItems`: Lista de escenas 3D (`MotionGraphicItem`).
   - `zentryItems`: Lista de plantillas Zentry activas en la línea de tiempo (`ZentryTemplateItem`).
   - `audioTracks`: Pistas de audio secundarias y efectos de sonido en el timeline.
2. **Timeline y pistas visuales:**
   - Pista de Subtítulos.
   - Pista de B-rolls con transiciones individuales.
   - Pista de Motion Graphics 3D.
   - Pista de Tipografía Zentry.
   - Pista de Video Principal con transiciones de corte.
   - Pista de Audio con visor de onda y SFX sincronizados.
3. **Canvas del Editor (`.phone-canvas`):**
   - Renderiza el reproductor de video en formato vertical 9:16.
   - Aplica capas en tiempo real: subtítulos, B-rolls con transiciones interpoladas por CSS, escenas 3D y tipografías cinéticas.
   - Contiene el escalador dinámico `scale(canvasWidth / 1080)` para que componentes diseñados a 1080x1920 se adapten exactamente a cualquier tamaño de pantalla.

### B. `src/zentry/registry.ts` (Catálogo Central de 50 Plantillas)
Unifica todas las plantillas del sistema bajo una interfaz estricta `ZentryTemplateDefinition`:
- `id`: Identificador único (ej. `subtitle_01_clean_editorial`, `hook_01_dual_line`, `typography_01_slide_up_lines`).
- `name`: Nombre legible en la interfaz.
- `category`: `'subtitles' | 'hooks' | 'typography' | 'broll' | 'motion-graphics'`.
- `visualComponent`: Componente React/Remotion que dibuja el diseño.
- `sfxId`: ID del sonido asociado en `ZENTRY_SFX_MAP`.
- `defaultVolume`: Volumen calibrado (ej. `0.45`).
- `offsetFrames`: Desfase de fotogramas para que el impacto sonoro coincida con la animación (ej. `-2` frames).
- `preview`: Ruta al video MP4 de vista previa en `/zentry-previews/`.
- `duration`: Duración predeterminada en segundos.

### C. `src/zentry/audio/soundMap.ts` (Motor de Efectos de Sonido)
Contiene la calibración acústica de los 50 efectos de sonido nativos. Cada entrada define:
- `file`: Archivo dentro de `public/sfx/` (ej. `whoosh-cinematic.wav`, `slam.mp3`, `glitch.wav`, `cash.mp3`).
- `volume`: Nivel de ganancia óptimo (entre `0.2` y `0.8`) para evitar distorsión o solapamiento con la voz.
- `offsetFrames`: Ajuste milimétrico para sincronizar el pico sonoro con la animación visual.

### D. `app/video/ZentryComposition.tsx` (Composición Remotion)
Es el componente que Remotion ejecuta tanto para el reproductor del cliente como para la exportación de video final MP4:
- Recibe las props completas del proyecto (`videoUrl`, `captions`, `customBrolls`, `motionGraphicsItems`, `zentryItems`, `audioTracks`).
- Gestiona la concurrencia: si un B-roll está activo, oculta los subtítulos base y renderiza la tipografía cinética sobre el B-roll.
- Renderiza los componentes `<Audio>` con sus respectivos volúmenes y offsets temporales exactos.

---

## 4. Flujo de Datos y Lógica de Funcionamiento ("Cómo funciona cada cosa")

### 1. Carga de Video y Transcripción Local
1. El usuario sube un video a través del `<input type="file">`.
2. Se genera una URL de objeto (`URL.createObjectURL(file)`) para la reproducción inmediata.
3. Se invoca `@remotion/whisper-web` mediante WebAssembly. La voz se extrae a 16kHz y se transcribe en local (100% privado).
4. La transcripción se transforma en una lista de palabras y segmentos con marcas de tiempo (`start`, `end`, `text`).

### 2. Aplicación de Plantillas (`applyZentryTemplate`)
Cuando el usuario hace clic en una plantilla de la biblioteca lateral:
- **Si es Subtítulos:** Se actualiza `selectedStyle` en el editor, aplicando tipografía, color de acento, animación de pop y asignando el SFX al motor.
- **Si es Hook:** Se busca el texto hablado en los primeros 2-3 segundos de la transcripción, se actualiza el hook activo y se posiciona el cabezal en el segundo 0.
- **Si es B-roll:** Si hay un B-roll seleccionado se actualizan sus propiedades; si no, se crea un nuevo `CustomBrollItem` con `transitionIn: 'whip-pan'`, `transitionOut: 'smooth-fade'`, ícono representativo y el texto hablado del intervalo correspondiente.
- **Si es Motion Graphics:** Se inserta un `MotionGraphicItem` 3D en la pista correspondiente, con el texto de la voz hablada y el SFX de entrada.
- **Si es Tipografía:** Se inserta un `ZentryTemplateItem` en la pista Zentry con la animación cinética elegida.

### 3. Motor de Transiciones de B-roll en Canvas
En el canvas del editor (`app/page.tsx`), las transiciones no son estáticas; se calculan en vivo según `currentTime`:
- `tIn = Math.min(1, Math.max(0, (currentTime - broll.start) / 0.35))` (progreso de entrada, 0 a 1).
- `tOut = Math.min(1, Math.max(0, (broll.end - currentTime) / 0.35))` (progreso de salida, 1 a 0).
- Según la transición seleccionada (`whip-pan`, `zoom-punch`, `rgb-glitch`, `smooth-fade`):
  - **Whip Pan:** Aplica `translateX` con aceleración y desenfoque horizontal (`blur`).
  - **Zoom Punch:** Aplica `scale` desde `1.35` con efecto de rebote y opacidad progresiva.
  - **RGB Glitch:** Aplica microdesplazamiento horizontal y saturación de contraste.
  - **Smooth Fade:** Disolvencia cinematográfica progresiva en `opacity`.

### 4. Capa de Tipografía Cinética sobre B-roll
Todo B-roll (sea video de Pexels, video local o imagen) tiene una capa superpuesta con `zIndex: 4` que busca en tiempo real los subtítulos del video en ese rango de tiempo. Si hay voz hablada, dibuja las palabras en una tarjeta de alto contraste con animación de entrada, evitando que el B-roll quede mudo o desincronizado con el mensaje.

### 5. Botón "🔄 Actualizar" (`handleUpdateSelectedObject`)
Ubicado junto al botón de eliminar, permite al usuario re-sincronizar cualquier elemento con un solo clic:
1. Detecta qué objeto está seleccionado o bajo el cabezal de tiempo:
   - `selectedBrollId` o B-roll en tiempo actual.
   - `selectedMotionGraphicId` o Motion Graphic en tiempo actual.
   - `selectedZentryItemId` o elemento Zentry en tiempo actual.
   - Subtítulos activos en el segundo actual.
2. Extrae las palabras habladas de las captions en ese rango exacto y las inyecta en el objeto.
3. Lee la transición activa del panel de herramientas (`brollTransition`) y la aplica a `transitionIn`.
4. Asigna el SFX configurado y reproduce una vista previa de audio instantánea (`playSfxPreview`).
5. Emite un toast de confirmación: `"B-roll actualizado con texto y audio actual"`.

### 6. Escalado Matemático del Canvas (Resolución 1080x1920)
El editor móvil renderiza en un contenedor CSS de ancho flexible (`.phone-canvas`, ~240px). Para evitar que componentes Zentry de 1080px se desborden o recorten:
- Un `ResizeObserver` mide el ancho real del contenedor (`canvasWidth`).
- Los elementos Zentry se envuelven en un contenedor de tamaño fijo:
  ```tsx
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: 1080,
    height: 1920,
    transform: `scale(${canvasWidth / 1080})`,
    transformOrigin: 'top left',
    pointerEvents: 'none',
    zIndex: 10,
  }}>
  ```
- Al pausar el video en el inicio de un elemento (`localSec < 0.6`), se asigna `overrideFrame = 18` para que la animación se renderice ya asentada al 100% de opacidad y escala, garantizando visibilidad inmediata en reposo.

---

## 5. Historial de Reparaciones y Cambios Realizados ("Qué se ha hecho")

1. **Corrección de `applyZentryTemplate`**:
   - Antes creaba elementos no tipados en una sola pista genérica.
   - Ahora rutea con precisión según categoría: subtítulos van al motor de subtítulos, hooks al hook inicial, B-rolls a `customBrolls`, Motion Graphics a `motionGraphicsItems` y Tipografías a `zentryItems`.
2. **Escalado y Visibilidad en Pausa del Canvas**:
   - Se resolvió el recorte de elementos y la invisibilidad inicial fijando el contenedor a 1080x1920 con escala `canvasWidth / 1080` y `overrideFrame = 18` en pausa.
3. **Transiciones en Canvas y Remotion**:
   - Se sincronizaron las 5 transiciones físicas (`whip-pan`, `zoom-punch`, `film-burn`, `rgb-glitch`, `smooth-fade`) tanto en la previsualización del editor como en la composición de renderizado final.
4. **Tipografía Cinética en B-rolls**:
   - Se añadió la capa de texto sobre metraje en `app/page.tsx` y en `app/video/ZentryComposition.tsx`.
5. **Implementación y Ampliación de "🔄 Actualizar"**:
   - Se programó `handleUpdateSelectedObject` para re-capturar la voz hablada, aplicar transiciones del selector y sincronizar SFX en tiempo real.
6. **Integración Completa del Catálogo de 50 Plantillas y 50 SFX**:
   - Se verificaron y enlazaron los 50 archivos de audio en `public/sfx/` con sus volúmenes y desfases en `src/zentry/audio/soundMap.ts`.
   - Se verificaron los videos de previsualización en `public/zentry-previews/`.
7. **Resolución de Error de Compilación TypeScript (TS1128)**:
   - Se eliminó un bloque duplicado accidental en `handleUpdateSelectedObject` que cerraba anticipadamente la función del componente `Home`.
   - La suite completa de TypeScript compila con **0 errores**.

---

## 6. Reglas de Oro para Futuras Modificaciones (Para la Próxima IA)

> [!IMPORTANT]
> **1. NO eliminar el escalado `transform: scale(canvasWidth / 1080)` del canvas:**  
> Si se renderizan componentes Zentry directamente sin el contenedor de 1080x1920 escalado, las fuentes de 80px a 180px desbordarán la pantalla del teléfono.

> [!IMPORTANT]
> **2. Respetar el `overrideFrame = 18` al estar en pausa:**  
> Los componentes de texto inician en opacidad 0 en el frame 0. Si se pasa `overrideFrame = 0` con el reproductor en pausa, el usuario verá una pantalla vacía y creerá que la plantilla no se aplicó.

> [!IMPORTANT]
> **3. Exclusión mutua de subtítulos durante B-roll:**  
> En `CaptionLayer.tsx`, cuando un B-roll está activo, los subtítulos base deben ocultarse. El B-roll renderiza su propia tipografía cinética. No mostrar ambos a la vez para no duplicar el texto en pantalla.

> [!IMPORTANT]
> **4. Calibración de SFX:**  
> En `src/zentry/audio/soundMap.ts`, nunca dejar `volume > 0.8` ni eliminar los `offsetFrames`. Los offsets negativos (ej. `-2` frames) son necesarios para compensar el tiempo de subida del transitorio de audio y lograr sincronía con el ojo humano.

> [!IMPORTANT]
> **5. Botón "🔄 Actualizar":**  
> Debe mantenerse visible en la cabecera de edición junto al botón "🗑️ Eliminar". Permite al usuario refrescar el elemento seleccionado con el estado actual de las herramientas sin tener que borrarlo y volverlo a crear.

---

## 7. Comandos de Validación Rápida

Para verificar el estado del sistema en cualquier momento:

```bash
# 1. Comprobar tipos de TypeScript (debe devolver 0 errores)
npx tsc --noEmit

# 2. Ejecutar validación del catálogo Zentry (50 plantillas y 50 SFX)
npx tsx scratch/test_zentry_system.ts

# 3. Servidor de desarrollo
npm run dev
```
