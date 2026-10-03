# Changelog de Mejoras Estilo ViroEdit & CapCut — Zentry Video Editor VIP

**Versión:** 2.1.0  
**Fecha:** Septiembre 2026  
**Desarrollo:** 100% Local (Navegador, Cero Dependencias de Servidores Externos)

---

## 🚀 Resumen de Actualizaciones Mayores

Este documento detalla todas las correcciones, integraciones y mejoras implementadas en Zentry Video Editor a partir de los 5 reportes visuales (Capturas 1 a 5) y la ingeniería inversa de los estándares de retención viral de **ViroEdit** y **CapCut Desktop**.

---

## 📋 Detalle de Cambios por Componente

### 1. Panel de Subtítulos y Acciones Rápidas (Captura 1)
* **Archivo Modificado:** `app/globals.css`, `app/page.tsx`
* **Cambios:**
  - Rediseñado `.transcript-line` para reemplazar el grid rígido de 3 columnas (`min-height: 57px`) por un diseño de tarjeta flexible en columna (`padding: 10px 12px`, `height: auto`).
  - Cada tarjeta cuenta ahora con cabecera superior con índice numérico (`#1`, `#2`, etc.), botón de salto temporal directo (`⏱️ 0:04`) y área de texto responsiva que nunca colapsa.
  - La botonera de acciones con IA (`.line-ai-actions`) es ahora totalmente visible y accesible al pie de cada frase:
    * `⚡ + Motion 3D`: Inserta una tarjeta o escena 3D exactamente en el rango de tiempo de la frase.
    * `🎬 + B-Roll IA`: Busca e inserta un clip de Pexels para esa frase.
    * `⚪ Blanco`: Inserta la plantilla Fondo Blanco Minimal (Tesla / Elon Musk) sincronizada con la frase.
    * `🔴 Rojo`: Inserta la plantilla Fondo Rojo Impacto sincronizada con la frase.

### 2. Motor de Audio Viral Inteligente y SFX Contextual (Captura 2)
* **Archivos Creados/Modificados:** `app/video/contextualSoundEngine.ts`, `app/video/ZentryComposition.tsx`, `app/video/types.ts`, `app/page.tsx`
* **Cambios:**
  - Creado el módulo `contextualSoundEngine.ts` que analiza semánticamente las transcripciones y genera una línea de tiempo de eventos sonoros (`ContextualSfxEvent[]`).
  - Detección de disparadores clave:
    * **Hook Inicial (0:00 - 0:02):** Efecto viral garantizado para máxima retención (`vine-boom`, `rising-swoosh`, `bass-drop-boom` o `cinematic-thud`).
    * **Finanzas y Dinero:** Sonido de caja registradora (`cha-ching-cash.wav`) al detectar palabras como *dinero, dólares, ventas, facturar, ganancia, riqueza*.
    * **Alerta y Peligro:** Glitch estático y ding de advertencia (`glitch-static.wav`, `bell-ding.wav`) para palabras como *alerta, error, cuidado, nunca, trampa*.
    * **Secretos y Revelaciones:** Whoosh hit cinematográfico (`whoosh-hit.mp3`) para palabras como *secreto, truco, hack, método, revelar*.
    * **Logros y Éxito:** Chime de victoria (`success-chime.wav`) para palabras como *listo, logrado, fácil, solución, victoria*.
    * **Entradas de B-Rolls y Motion Graphics:** Whoosh rápido y cinemático al aparecer cada capa.
  - En `ZentryComposition.tsx`, los eventos contextuales se reproducen mediante secuencias sincronizadas de Remotion `<Audio />`.
  - En el panel de Audio, se incorporó el módulo interactivo **"⚡ Auto-Sincronizador Viral IA"** con preescucha de cada sonido detectado.

### 3. Transiciones Pro de Entrada y Salida para B-Rolls (Captura 3)
* **Archivos Modificados:** `app/video/types.ts`, `app/video/ZentryComposition.tsx`, `app/page.tsx`
* **Cambios:**
  - Agregadas las propiedades `transitionIn` y `transitionOut` a la interfaz `CustomBrollItem`.
  - Soporte para 5 efectos cinemáticos interpolados por GPU:
    1. `whip-pan`: Desplazamiento horizontal rápido (Whip Pan 3D) con rotación y blur.
    2. `zoom-punch`: Golpe visual elástico hacia el frente con overshoot `back(1.4)`.
    3. `film-burn`: Destello y sobreexposición cálida tipo película analógica de 35mm.
    4. `rgb-glitch`: Separación de canales RGB y jitter horizontal estilo CapCut.
    5. `smooth-fade`: Disolvencia y fundido suave anamórfico.
    6. `none`: Corte seco sin animación extra.
  - Selectores desplegables independientes de Entrada y Salida en el panel lateral de B-roll.

### 4. Integración de Subtítulos sobre Video B-Roll (Captura 4)
* **Archivos Modificados:** `app/video/CaptionLayer.tsx`, `app/page.tsx`
* **Cambios:**
  - Se eliminó la supresión indiscriminada de subtítulos durante clips de video B-Roll (Pexels y videos locales).
  - La exclusión mutua ahora opera exclusivamente bajo la bandera `isAnyTextTemplateBrollActive`, silenciando subtítulos **únicamente** cuando se reproducen plantillas gráficas con tipografía de pantalla completa (`white-minimal`, `red-impact`, `black-oled`).
  - En videos de Pexels, los subtítulos se superponen con capa superior (`z-index: 10`) manteniendo los estilos tipográficos seleccionados.

### 5. Tipografía Cinética en Pila Vertical de 3 a 4 Palabras (Captura 5)
* **Archivos Modificados:** `app/video/ZentryComposition.tsx`, `app/page.tsx`
* **Cambios:**
  - Sustituida la visualización horizontal de 2 palabras por un apilamiento vertical (`pageSize = 4`).
  - Las palabras se agrupan en bloques de 3 o 4 palabras:
    * Línea 1: Palabra 1
    * Línea 2: Palabra 2
    * Línea 3: Palabra 3
    * Línea 4: Palabra 4
  - Cada línea entra secuencialmente desde abajo hacia arriba (o desde los laterales según la dirección seleccionada) con física elástica `spring(stiffness: 180, damping: 13)` conforme avanza la voz del hablante.
  - La última palabra del bloque se enfatiza con un badge/píldora de alto contraste:
    * En Blanco Minimal: Píldora negra profunda con tipografía blanca.
    * En Rojo Impacto: Píldora amarilla neón con tipografía negra.
    * En Negro OLED: Píldora menta neón `#00F5C8` con tipografía negra.
  - El icono 3D transparente flota sobre la pila con levitación sinusoidal continua.

### 6. Previsualización Dinámica de Motion Graphics en el Canvas
* **Archivo Modificado:** `app/page.tsx`
* **Cambios:**
  - Se implementó interpolación reactiva en tiempo real en `phone-canvas` durante la reproducción y el arrastre del cabezal de tiempo (`currentTime`).
  - Los motion graphics ahora ejecutan su animación de entrada (`slide-up`, `slide-left`, `slide-right`, `pop-3d`) y salida directamente en el lienzo del editor.

### 7. Organización y Scrollbar Vertical del Timeline
* **Archivo Modificado:** `app/globals.css`
* **Cambios:**
  - Incorporado scrollbar vertical estilizado (`overflow-y: auto`, `max-height: 240px`) en `.timeline-body`.
  - Alturas y espacios normalizados para todas las pistas: Subtítulos (`cc-track`), B-Rolls (`broll-track`), Motion Graphics (`motion-track`), Video Clips (`video-track`) y Audio Waveform (`audio-track`).

### 8. Transiciones entre Clips Múltiples de Video
* **Archivo Modificado:** `app/page.tsx`
* **Cambios:**
  - Se añadió la propiedad `transitionToNext` a `EditSegment`.
  - Conector visual interactivo (`⚡ corte / whip-pan / zoom-punch / fade / glitch`) situado en la unión de clips adyacentes en la pista de video del timeline, permitiendo alternar la transición con un solo clic.

### 9. Barra Superior de 4 Plantillas Maestras ViroEdit
* **Archivos Modificados:** `app/page.tsx`, `app/globals.css`
* **Cambios:**
  - Barra superior `.viro-master-templates-bar` con 4 botones de acceso rápido:
    1. **Viro 1 — Storytelling Pro:** Estilo `editorialStory`, Playfair Display + Montserrat, Cyan `#00F5C8`, Fundido Suave, Hook Editorial.
    2. **Viro 2 — Marca Personal:** Estilo `estebanStyle`, Montserrat + Great Vibes, Neon Mint `#00F5C8`, Whip Pan 3D, Hook Viro.
    3. **Viro 3 — Editorial Aesthetic:** Estilo `magazineEditorial`, Playfair Display, Acento Dorado `#EAB308`, Zoom Punch, Hook Editorial.
    4. **Viro 4 — Hormozi Viral:** Estilo `hormozi`, Anton, Amarillo Retención `#FFD400`, Glitch RGB, Hook Impacto con sonido Vine Boom.

---

## 🔒 Compromisos de Seguridad y Privacidad
* **100% Local:** Ningún frame de video, audio o transcripción se sube a servidores externos.
* **Credenciales Protegidas:** No se modificaron ni expusieron las credenciales locales de Cloudflare ni Supabase.
