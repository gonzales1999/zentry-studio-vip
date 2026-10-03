# Auditoría Integral y Arquitectura de Zentry Video Editor

**Fecha:** Septiembre 2026  
**Versión:** 2.5 (Motor Híbrido WebAssembly + Remotion + Zentry Motion 50 Pack + Three.js Local)  
**Ambiente:** 100% Local en Navegador (Privacidad Total, Cero Servidores de Renderizado Externos)

---

## 1. Resumen Ejecutivo

Zentry Video Editor es una suite de edición y postproducción de video vertical (9:16) inspirada en los estándares de **ViroEdit**, **CapCut Desktop** y las mecánicas de retención viral de creadores de alto impacto (**Alex Hormozi**, **MrBeast**).

El sistema procesa video 1080x1920 a 30/60 fps directamente en el cliente mediante **FFmpeg.wasm**, **Whisper.wasm**, **Remotion Client-Side Web Renderer**, aceleración gráfica por GPU (WebGL/Three.js + CSS 3D Transforms) y una arquitectura modular de **50 plantillas maestras Zentry** con efectos de sonido SFX nativos y tipografía cinética sincronizada a la voz humana.

---

## 2. Diagnóstico de Hallazgos y Soluciones Implementadas

### A. Aplicación y Despliegue de Plantillas Zentry (1-Clic)
* **Problema Identificado:** Al seleccionar plantillas de B-roll, Motion Graphics o Tipografía en la barra lateral, los elementos no se reflejaban correctamente en el canvas ni en sus pistas dedicadas del timeline.
* **Solución Aplicada:**
  - Reestructuración de `applyZentryTemplate` en `app/page.tsx`:
    * **Subtítulos (8 plantillas):** Aplica al instante el estilo visual, la familia tipográfica (Montserrat / Playfair / Anton), el color de acento, la animación pop y el SFX de entrada.
    * **Hooks (6 plantillas):** Extrae la frase inicial hablada de la transcripción de Whisper, actualiza el hook activo y reproduce el SFX de impacto.
    * **B-roll (3 plantillas + subcategorías):** Si hay un B-roll seleccionado lo actualiza con el estilo de la plantilla; si no, inserta un nuevo B-roll en la pista con transición `whip-pan` de entrada y `smooth-fade` de salida, ícono y texto sincronizado.
    * **Motion Graphics (6 plantillas):** Inserta o actualiza un elemento 3D en la pista de motion graphics con el texto hablado y su SFX.
    * **Tipografía Cinética (27 presets):** Inserta o actualiza el elemento en la pista Zentry con la animación cinética elegida.
  - Se habilitó la selección directa con clic tanto en la tarjeta como en el video de previsualización.

---

### B. Previsualización y Escalado en el Canvas del Editor
* **Problema Identificado:** Los componentes Zentry fueron diseñados a resolución nativa 1080×1920. Al renderizarse en el contenedor del teléfono (`.phone-canvas`, aprox. 240px de ancho) sin escala matemática, los textos e íconos quedaban fuera de la pantalla. Además, las animaciones iniciaban en opacidad 0 en el frame 0, por lo que al pausar el video en el inicio de un elemento, este permanecía invisible.
* **Solución Aplicada:**
  - Implementación de un contenedor de canvas escalado dinámicamente con `transform: scale(canvasWidth / 1080)` y `transformOrigin: top left`.
  - Configuración de `overrideFrame`: si la reproducción está en pausa al inicio de un elemento, se evalúa en el frame 18 (animación ya asentada al 100% de opacidad y escala), haciéndolo visible de inmediato en el canvas.

---

### C. Transiciones y Tipografía Cinética en B-rolls
* **Problema Identificado:** Los B-rolls en el canvas no mostraban transiciones (`whip-pan`, `zoom-punch`, etc.) y los videos o imágenes B-roll no mostraban texto hablado animado encima del metraje.
* **Solución Aplicada:**
  - Implementación del motor de transiciones en vivo en el canvas de React (`tIn`, `tOut`, `canvasTransform`, `canvasOpacity`, `canvasFilter`), calculando deslizamientos dinámicos, zoom y blur idénticos a los del render final de Remotion.
  - Se agregó una capa de **Tipografía Cinética** sobre cualquier B-roll (video o imagen), asegurando que el texto de la voz hablada aparezca destacado sobre el metraje.
  - Los B-rolls ahora se crean por defecto con `transitionIn: 'whip-pan'` y `transitionOut: 'smooth-fade'`.

---

### D. Funcionamiento del Botón "🔄 Actualizar"
* **Problema Identificado:** Al presionar "Actualizar", no se sincronizaban los cambios de tipografía, B-roll, transiciones ni SFX según la configuración de las herramientas.
* **Solución Aplicada:**
  - `handleUpdateSelectedObject` detecta con precisión el objeto seleccionado o bajo el cabezal de reproducción (B-roll, Motion Graphic, Tipografía Zentry o Subtítulo).
  - Re-sincroniza el texto con las palabras transcritas de la voz en ese intervalo de tiempo exacto.
  - Aplica la transición activa seleccionada en el panel de herramientas (`whip-pan`, `zoom-punch`, `rgb-glitch`, `smooth-fade`).
  - Asigna y previsualiza el SFX correspondiente.
  - Notifica con un mensaje de confirmación qué elemento se actualizó.

---

### E. Concurrencia y Exclusión Mutua de Subtítulos durante B-Roll
* **Problema Identificado:** Duplicidad o interferencia entre los subtítulos inferiores y la tipografía de los B-rolls.
* **Solución Aplicada:**
  - Durante la reproducción de un B-roll que ocupe la pantalla, los subtítulos estándar inferiores se ocultan automáticamente para evitar duplicidad visual con la tipografía cinética del B-roll, y vuelven a aparecer inmediatamente después.

---

### F. Catálogo Central de 50 Plantillas Zentry + 50 SFX Nativos
* **Estructura Implementada:**
  - `src/zentry/registry.ts`: Catálogo maestro que reúne las 50 plantillas organizadas en 5 categorías:
    1. **Subtítulos (8):** Clean Editorial, Yellow Bubble Pro, Gradient Editorial, Yellow Micro Editorial, Dual Font Label, Tutorial Caps Pro, Mint Editorial, Yellow Glow Editorial.
    2. **Hooks (6):** Dual Line, Left Keyword, Question, Number, Gradient, Editorial.
    3. **B-roll (3):** B-roll Superior (Paso 01/Idea), B-roll Central (Caja Flotante), B-roll Inferior (Tarjeta Baja).
    4. **Motion Graphics (6):** Hero Split, Kinetic Stack, Editorial Quote, Stat Punch, Gradient Title, Step Sequence.
    5. **Tipografía Cinética (27):** Presets de animación de texto con física de resorte y doble tipografía (Montserrat / Playfair Display).
  - `src/zentry/audio/soundMap.ts`: 50 efectos de sonido SFX calibrados individualmente con volumen y desfase de fotogramas (`offsetFrames`).

---

## 3. Matriz Comparativa: Zentry vs. ViroEdit vs. CapCut

| Característica | CapCut Desktop | ViroEdit SaaS | Zentry Video Editor VIP |
| :--- | :--- | :--- | :--- |
| **Privacidad de Video** | Requiere cuenta / nube | Nube propietaria | **100% Local en Navegador** |
| **Costo de Suscripción** | Freemium / Pro mensual | Suscripción mensual | **Gratuito / Ilimitado Local** |
| **Detección Viral Semántica de SFX** | Manual por pista | Limitada a presets | **Automática basada en NLP + 50 SFX** |
| **Pila Vertical Cinética 3-4 Palabras** | Edición manual palabra por palabra | Semipredeterminada | **Totalmente Automática por Voz** |
| **Escenas 3D Motion Graphics** | No incluidas / complejas | 4 arquetipos fijos | **6 Escenas 3D + Three.js** |
| **Transiciones B-roll en Canvas** | No disponibles en web | Básicas | **5 Transiciones Físicas en Tiempo Real** |
| **Hosting / Despliegue** | App nativa instalable | Web remota | **Vite / Next.js Web App** |

---

## 4. Estado de Validación y Conclusiones

- **Compilación TypeScript:** `npx tsc --noEmit` completado con **0 errores**.
- **Suite de Pruebas Zentry:** `npx tsx scratch/test_zentry_system.ts` aprobado al **100%** (50 plantillas, 50 archivos SFX verificados, sincronización de audio exacta).
- **Servidor Local:** Ejecutándose en `http://localhost:3000/`.
