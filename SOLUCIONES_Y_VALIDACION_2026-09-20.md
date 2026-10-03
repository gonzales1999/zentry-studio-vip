# Soluciones aplicadas y validación — Zentry Studio

## 03/10/2026 — Pexels habilitado localmente — TERMINADO

**Causa comprobada:** `PEXELS_API_KEY` existía y era válida. La llamada a Pexels con el proceso restringido fallaba por permisos del socket; la misma consulta con acceso de red autorizado respondió HTTP 200. El servidor iniciado en ese entorno devolvía el fallback, aunque hubiese clave. No era necesario sustituir ni exponer la clave.

**Cambios:** `app/api/pexels/route.ts` usa el endpoint actual `https://api.pexels.com/v1/videos/search`, `orientation=portrait`, `locale=es-ES`, clave con trim y timeout de 15 s. Se diferencian clave ausente/rechazada, cuota, HTTP y fallo de conexión. Se mantiene biblioteca local de respaldo. Se reinició el servidor del proyecto con acceso de red autorizado (`npm run dev -- --host 127.0.0.1 --port 3000`); no se desactivaron controles del sistema. Si se vuelve a iniciar dentro de un proceso sin salida de red, el fallback reaparecerá: hay que permitir al servidor conectar a Pexels, no poner la clave en el frontend.

**Pruebas:** API local para «tecnología»: 12 videos reales, 8000 resultados totales, cero rutas locales y enlaces de `videos.pexels.com`. En navegador integrado, búsqueda manual muestra 12 autores/videos y las 12 miniaturas de `images.pexels.com` cargan. TypeScript aprobado. Evidencia `VALIDACION_PEXELS_2026-10-03.jpg`. Se usó la guía de verificación del navegador; no se modificaron las capas de edición del proyecto recuperado ni se consumieron créditos de exportación. Build registrado al finalizar esta validación. Cloudflare y exportación MP4 no probados aquí.

**Build:** aprobado al finalizar; permanecen avisos existentes de chunks grandes y clasificación de rutas. **Referencia oficial:** https://www.pexels.com/api/documentation/

### «Solo voz» del video — VIABILIDAD REVISADA, IMPLEMENTACIÓN PENDIENTE

El procesador actual usa Web Audio, filtros pasa-altos/pasa-bajos y una puerta de ruido. Esto no identifica fuentes mezcladas: no debe llamarse aislamiento de voz. Existen implementaciones de separación musical client-side con ONNX Runtime Web, WebGPU y fallback WASM, por ejemplo `web-audio-separation` (https://github.com/incidentist/web-audio-separation). Descargan modelos; el audio puede procesarse en el dispositivo. Separar voces de música tampoco garantiza eliminar todos los efectos ni distinguir narrador de voces cantadas.

Antes de implementar: verificar condiciones de los pesos elegidos, medir calidad con voz hablada + música y efectos, procesar con progreso/cancelación y cachear resultados por fuente. Integrar el resultado exclusivamente en el audio del video seleccionado o sus clips, conservando música subida/SFX independientes y audio original reversible. Las rutas existentes de `processedAudioSrc` permiten reutilizar el resultado tanto en preview como export; eso fue revisado, no probado con separación real. No se descargó ni integró un modelo en esta sesión. No se presenta «Solo voz» como terminado.

## 03/10/2026 — Simplificación de interfaz — TERMINADO en el alcance revisado

**Guías usadas:** `web-design-guidelines.md` para microcopy, accesibilidad/foco y ajuste de contenido; `design-an-interface.md` para comparar 3 enfoques independientes antes de sintetizar. La segunda es una guía de API/módulos: se adaptó su comparación al editor, sin rediseñar su motor.

**Cambios:** explicaciones extensas de volúmenes, sincronización, B-roll, plantillas y reducción de ruido pasan a `<details>` con acceso por teclado. Se acortan títulos promocionales, botones y nombres duplicados; desaparece la instrucción de «captura 3/captura 2». Advertencia de reemplazo de subtítulos permanece visible. Controles existentes, estados/errores, límites y datos de edición se conservan. Botones sin desbordamiento, foco visible, búsqueda/formatos con nombres accesibles. No se cambia la geometría del editor.

**Pruebas:** TypeScript/build/regresión audio aprobados. En navegador, Audio/B-roll/Zentry miden 239 px de panel/contenido, sin controles saliéndose. Ayuda Audio se abre y cierra con Enter. Sesión conserva video Jose1998videoprueba y audio del usuario a 14%/1×. No se accionaron exportación, sincronización, generación ni eliminación. Evidencia `VALIDACION_INTERFAZ_COMPACTA_2026-10-03.jpg`; comparación y hallazgos `REVISION_INTERFAZ_2026-10-03.md`. No se certificó cumplimiento global de toda la aplicación.

## 03/10/2026 — Pistas accesibles y fuente de vista previa

**Hallazgos:** el contenedor vertical tenía 184 px fijos, pero el scroll horizontal interior ocultaba las pistas que excedían su propia altura. Las pistas vacías ocupaban espacio y las etiquetas usaban alturas diferentes de Video/SFX/Audio. La vista previa del primer segmento ignoraba su fuente y siempre usaba `videoUrl`. Las miniaturas creaban hasta ocho elementos de video por clip, solo cargaban metadatos y no reaccionaban al cambio de fuente.

**Solución:** altura interior calculada con las mismas medidas de las filas, scroll vertical compartido, filas vacías ocultas y etiquetas descriptivas. Audio subido aumenta a 44 px (clip 35 px y asas 10 px), ancho mínimo 72 px para no solapar todos los controles en audios cortos, acceso «Ver audios», desplazamiento automático al seleccionar audio y barra de herramientas desplazable. Mantiene tamaño general del editor y los controles existentes. Se respeta fuente individual del segmento; una miniatura por clip reduce decodificadores, carga fotograma y limita su posición al archivo.

**Validación — TERMINADO local:** `npx tsc --noEmit` y `node scripts/test-audio-timeline.mjs` aprobados. `npm run build` aprobado antes del ajuste final de auto-scroll/ancho mínimo; TypeScript repetido después, aprobado. Navegador con Jose1998videoprueba de 58,7 s: imagen en preview/miniatura, datos 1080×1920 y readyState 4; video reproduciendo a 31 s y pausado con imagen a 36 s. Medición DOM: etiquetas y filas coinciden (Texto 38, B-roll 38, Motion 96, Video 48, SFX 36, Audio 44 px). Botón «Ver audios» permite ver el clip completo; arrastre izquierdo real de audio temporal desde 0 a 17,93 s, sin cambiar duración 0,66 s. Guardada evidencia `VALIDACION_TIMELINE_2026-10-03.jpg`; eliminado después solo el audio temporal añadido por la prueba (confirmado cero clips de música). La prueba usa la guía de verificación del navegador con CUA para controlar el navegador integrado.

**Límites:** no se confirmó la causa exacta de la pérdida de imagen en la sesión de la captura original (al comenzar solo estaba abierta ViroEdit). Se corrigieron los defectos de fuente/miniaturas detectados y se validó una sesión local. No se exportó MP4 ni se cambiaron cuentas/créditos. Las recargas de desarrollo por modificaciones del código devolvieron la app a Inicio; se volvió a adjuntar el archivo para cada prueba, sin borrar sus capas guardadas.

## 03/10/2026 — Video y audio subido: controles independientes — TERMINADO

**Hallazgo:** el estado y las rutas de mezcla ya estaban separados, pero «Volumen original» dentro de Audio controlaba el video y su nombre era ambiguo. En la sesión del usuario estaba en 5% mientras el audio subido seguía en 35%. No se encontró un multiplicador global aplicado a ambos en la exportación.

**Cambios:** etiquetas explícitas y ayudas de alcance; checkpoints al arrastrar. Música seleccionada ajusta solo ese archivo; sin selección se conserva el ajuste de todos los audios subidos, ahora explicado. El preview de video sin segmentos ahora asigna su volumen a `videoRef`, como ya hacía el de segmentos. No se alteraron ganancias de SFX ni el renderer de exportación.

**Prueba de navegador:** sobre el proyecto abierto del usuario con un audio subido se seleccionó ese audio, se ajustó a 10% y se comprobó video 5%; después video 0%, audio todavía 10%. Restaurados los valores iniciales 5%/35% y selección vacía. Se validaron valores DOM de sliders y separación de rutas en código, no una medición acústica del MP4. Evidencia `VALIDACION_VOLUMEN_INDEPENDIENTE_2026-10-03.png`. No se consumieron créditos ni se eliminaron archivos.

## 03/10/2026 — Corregido rechazo de audio largo — TERMINADO en código y pruebas

**Causa:** `uploadMusic` exigía que cada audio cupiera completo a 1× y lanzaba la pantalla de error si excedía el hueco disponible.

**Solución:** helper puro `audioUploadSlot` en `audioTimeline.ts` calcula huecos libres dentro del video. Prefiere colocar completo; si no puede, usa el mayor hueco y limita la duración. La subida mantiene `sourceDuration` original, `sourceStart:0` y `playbackRate:1`; solo cambia inicio/duración del fragmento editable. Informa cuántos audios se recortaron. Conserva límite 14, validaciones de archivo, deshacer y rechazo cuando no queda espacio. En lotes que agotan todos los huecos sigue vigente la operación atómica: el lote se rechaza si alguno no puede insertarse; este cambio no crea pistas superpuestas.

**Pruebas:** `test-audio-timeline.mjs`: 240 s → 58,7 s; 180 s → 50 s tras vecino de 10 s; hueco de 20 s sin solapar; audio corto completo; timeline llena y duración inválida; cola recortada no genera captions en timeline. Regresiones de sincronía/corte/export remapping y `npx tsc --noEmit` pasan. No se ha cargado/exportado un archivo largo real en esta sesión.

## 03/10/2026 — Motion según subtítulos con recursos propios — TERMINADO en código y preview

**Qué se implementó:** `motionObjects.ts` selecciona temas por palabras clave normalizadas en español/inglés. `resolveMotionText` deriva `objectContext` desde todas las captions que intersectan el clip para evitar cambiar objetos en cada página de palabras. Las captions originales no se mutan.

**Recursos y animación:** `MotionSceneObjects.tsx` dibuja teléfono, libro, gráfica, moneda, engranaje y mensajes propios en SVG. Entradas escalonadas, sombras, perspectiva y movimiento dependen del tiempo recibido. Componente usado por `MotionGraphicsLayer` y canvas del editor; el preview adapta tamaño al formato. No se añadieron dependencias ni servicios remotos. Eliminada transición CSS de la tarjeta del preview para que no retrase los cambios al buscar un tiempo.

**Edición:** campo serializable opcional `objectSet` y selector accesible en el inspector. Automático y cinco temas, clásico y apagado. Los botones de emoji existentes cambian a clásico; texto manual antiguo conserva clásico por defecto. Texto sincronizado antiguo gana recursos locales por defecto. La selección queda dentro de los snapshots existentes, pero no se ha probado recarga de persistencia en esta sesión.

**Validación:** `scripts/test-pack-typography.mjs` ampliado con cinco temas, overrides, apagado, clásico, movimiento, escala, determinismo y estabilidad entre páginas. Regresiones de 53 plantillas/packs y apertura/hook pasan. TypeScript sin errores; lint de nuevos componentes sin errores; build pasa con avisos existentes de tamaño/clasificación. En navegador se cargó el video autorizado, se reprodujo un motion del pack y se seleccionaron los ocho modos con cambios reales en el lienzo. Estado final automático, sin nueva inserción ni eliminación de clips. Evidencia `VALIDACION_MOTION_LOCAL_2026-10-03.png`. MP4 no exportado; calidad de transcripción completa, alineación de SFX por palabra y equivalencia completa de tarjeta preview/export no se certifican con estas pruebas.

## 03/10/2026 — Análisis motion Viroedit — TERMINADO solo en inspección

Restaurado el proyecto guardado y reproducido su motion ya existente sin nueva generación ni gasto. Verificados fotogramas de inicio, parte intermedia y cierre; evidencia `REFERENCIA_MOTION_VIRO_2026-10-03.png`. Inspeccionado `MotionGraphicsLayer.tsx` para comparar. La referencia es un MP4 con objetos y texto incorporado; nuestra mejora propuesta conserva texto editable y construye objetos propios. Lista de pendientes en `PLAN_MOTION_GRAPHICS_VIRO_2026-10-03.md`. No se implementó ni exportó una nueva escena durante esta revisión.

## 02/10/2026 — 53 plantillas y cinco packs: tamaño 58 / doble tipografía — TERMINADO en código y preview

**Configuración:** `packTypography.ts` centraliza tamaño 58, doble fuente, efecto editorial y herencia de captions. Superior Montserrat o Playfair según Mont/Play; inferiores por pack: Viral Anton, Clean Inter, Luxury Pacifico, Neon Oswald, Bold Bebas Neue. Cada selección actualiza captions, ambas líneas del hook, B-roll automático y motion sincronizado, conservando texto manual y otras capas. Los packs reemplazan sus propios IDs y la capa de estilo de subtítulos, no generan duplicados. Duración hook 2/2 s.

**Dos animaciones:** `AnimatedMotionText.tsx` comparte preview/export para primera línea que aparece y segunda desde la derecha, usando `textEntrance` y el inicio de la página hablada. `resolveMotionText` entrega ese inicio sin mutar la edición. `AnimatedBrollText` usa esas entradas y ahora ambas líneas reciben el mismo tamaño base. No se emplean animaciones CSS de reloj independiente. El preview de motion escala el texto por ancho del lienzo/formato, igual que B-roll.

**Tamaños:** eliminados factores B-roll ×1,5 y primera línea ×0,75. El valor de 58 ya no se convierte en 87. `ReferenceTextAnimation` recibe un contexto de tamaño por capa y los componentes nativos reciben `fontSize`; se conservan proporciones internas en diseños que las usan. Añadidos controles de letra Zentry/motion independientes de escala/posición. Valores iniciales, hook, nuevos B-roll y aplicación de subtítulos usan 58; no se reescriben las plantillas personales antiguas de forma silenciosa.

**Errores adicionales solucionados:** cursiva heredada tras Luxury; hooks sin cambio de estilo al aplicar desde catálogo (mapeo al estilo del editor, no réplica exacta del MP4 de demostración); búsqueda de huecos bloqueada por todos los subtítulos; duración de reserva menor que el clip; falta de reserva entre nuevas escenas; excepción de `delete-letters` por interpolación descendente; captions duplicados detrás de motion flotante automático con doble fuente. Este último muestra el texto hablado una sola vez; el hook sigue independiente.

**Pruebas de botones reales:** se aplicaron/deshicieron individualmente 8 subtítulos, 6 hooks, 27 tipografías, 6 B-roll y 6 motion. Lienzo presente y controles de tamaño 58 en las categorías editables. Se aplicaron los cinco packs y Generar Automáticamente; comprobadas fuentes y tamaño en DOM. Estado final Viral, siete B-roll conservados y un motion del pack; captura de B-roll muestra texto hablado actual, Montserrat/Anton y control 58. No se dejaron las inserciones temporales de catálogo.

**Pruebas automatizadas:** `scripts/test-pack-typography.mjs`: cinco packs × dos variantes, dos fuentes distintas, tamaño 58, entradas que cambian con tiempo, sin NaN/CSS independiente, y las 53 plantillas nativas en frames 1/30. La segunda prueba es un render aislado con reloj/config simulado, no integración del exportador. Pasan también pruebas de hook, captions, B-roll y layout Zentry, TypeScript y build. Revisión React orientó componentes puros y resolución por props, sin crear estado derivado para cada frame.

**Limitaciones registradas:** lint amplio devuelve 58 errores/21 avisos en archivos existentes; lint dirigido de los nuevos componentes/pack aprobado. No se exportó un MP4 ni se revisó de principio a fin cada animación en archivo final; no se declara toda la app libre de errores. No cambiaron dimensiones del editor ni se eliminaron opciones.

Evidencias: `VALIDACION_PACKS_ZENTRY_58_2026-10-02.png`, `VALIDACION_BROLL_DOBLE_FUENTE_58_2026-10-02.png`.

## 02/10/2026 — Hook independiente, duración exacta y motion actualizado — TERMINADO en código y preview

**Decisión del usuario:** hook independiente de las escenas/subtítulos, duración inicial de 2 s en ambas líneas. No se impone exclusión entre hook y captions ni se cambian posiciones de otras capas. Los presets previos conservan sus tiempos salvo ajuste explícito; el proyecto abierto quedó en 2,0/2,0 s.

**Solución:** nuevo `app/video/hookTiming.ts` centraliza valor predeterminado y opacidad temporal. `page.tsx` y `ZentryComposition.tsx` usan el mismo fin exclusivo/fundidos proporcionales; sliders permiten 0,1–10 s. `CaptionLayer.tsx` deja de ocultar o desplazar captions durante el hook. Capa hook con z-index 30 en ambas rutas, independiente del selector de escena.

**Motion:** `resolveMotionText` en `captionTiming.ts` resuelve escenas 3D automáticas desde páginas de captions temporizados, sin mutar los objetos guardados. Los antiguos sin `textSource` se consideran sincronizados; los marcados `manual` conservan título. El inspector ofrece interruptor sincronizado/manual, y escribir título/subtítulo lo marca manual. Se elimina visualmente el subtítulo idéntico al título y el fallback de texto de demostración. `motionHidesCaptions` unifica preview/export para escenas completas/flotantes. El mínimo de duración del renderer motion pasa de 15 a 1 fotograma.

**Prueba real:** `Jose1998videoprueba`, ~1,8 s: hook y motion visibles por separado, texto actual «compré ni lo descargue», en lugar de «es... Ah... lo de...» duplicado. Cambiar ambas duraciones a 1 s oculta inmediatamente el hook allí; restaurar 2 s lo muestra nuevamente; a ~4,2 s ya no aparece. Valores finales 2/2. Captura `VALIDACION_HOOK_INDEPENDIENTE_2026-10-02.jpg`.

**Validación técnica:** `scripts/test-opening-layers.mjs` comprueba 0,1/0,5/1/2 s, límites a 24/30/60 FPS, captions nuevos, silencios, texto manual, duplicados e inmutabilidad. También pasan pruebas de captions, B-roll animado y layout Zentry, TypeScript, ESLint y build de producción. La guía Remotion orientó usar el reloj de composición, no animaciones CSS independientes; revisión React mantiene resolución pura y cambios por ID.

**Límite:** no se exportó ni inspeccionó un MP4 en esta comprobación. Persisten errores lingüísticos de transcripción observados (p. ej. «ChatGT»); no se declara auditoría integral de toda la app terminada. Los apartados previos de diagnóstico quedan como historial.

## 02/10/2026 — Choque inicial: diagnóstico pendiente de corrección

**Revisión en vivo:** proyecto abierto `Jose1998videoprueba`, ~1,8 s. Hook «Esto / que ves, no» permanece hasta 3,6/4,8 s y coincide con motion de 1,2–4,7 s que muestra «es... Ah... lo de...» dos veces. Captura `AUDITORIA_CHOQUE_INICIO_2026-10-02.jpg`. No se modificó contenido del proyecto ni se consumieron créditos (998 observados).

**Causas comprobadas:** hook fuera del selector de escena única en preview y exportación; motion conserva títulos independientes de los captions actuales; presentación de tarjeta duplica texto de título/subtítulo; exclusión de captions durante motion flotante difiere entre preview y CaptionLayer exportado. La frase vieja no concuerda con el tercer grupo transcrito actual.

**Corrección propuesta, NO implementada en esta revisión:** usar una regla compartida de visibilidad hook/escena/captions, respetando las duraciones guardadas; resolver texto de motion automático desde captions actuales sin tocar manuales; filtrar subtítulos de tarjeta idénticos al título; usar el mismo renderizador/política en preview y exportación. Se necesita probar el intervalo 0–5 s y un MP4 después de implementarlo. No se atribuye todo el problema a Remotion ni se declara solucionado.

## 02/10/2026 — Ajustar letras y posición de Zentry Motion

**Causa:** las plantillas usan tamaños internos fijos, mientras la capa de timeline no tenía propiedades de escala/posición ni controles propios. Cambiar fuente/tamaño de subtítulos normales no transformaba las plantillas Zentry.

**Implementación:** `ZentryTemplateItem` añade `textScale`, `positionX` y `positionY`. El inspector de la capa seleccionada ofrece tamaño proporcional, X, Y y restablecer. `getZentryLayout` transforma la capa completa, preservando las proporciones de títulos, subtítulos y gráficos. 100% y X/Y=50 conservan exactamente la ubicación interna anterior; X/Y son desplazamientos relativos, no el centro medido de cada letra. El mismo helper se usa en preview y exportación con las dimensiones de cada formato.

**Arrastre:** seleccionar primero la capa en timeline, después arrastrar sobre el lienzo; solo esa capa recibe cambios, se pausa la reproducción y se crea un checkpoint al iniciar. Se libera captura y listeners al terminar/cancelar el gesto. No se eliminan controles de sonido o fuente.

**Otro fallo corregido:** el preview pausado adelantaba artificialmente la animación a frame 18 al inicio del clip. Ahora usa el tiempo local real y los FPS elegidos, sin esa excepción.

**Conflictos de plantillas:** el selector compartido de escena daba la misma prioridad a subtítulos Zentry y a escenas B-roll/motion: cada grupo nuevo podía ocultar la escena. Ahora los subtítulos tienen menor prioridad que escenas visuales. Además, aplicar tipografía solo reemplaza una selección de esa categoría, no motion de otra categoría. Finalmente, `brollOwnsAnimatedText` excluye clips con `templateId` explícito para respetar la plantilla escogida en lugar de ignorarla por ser automático. Pruebas de estas tres rutas añadidas/aprobadas; una plantilla de escena nueva sigue siendo una inserción intencional, no se prometen varias escenas completas simultáneas.

**Pruebas:** `scripts/test-zentry-layout.mjs` aprobado; transformación predeterminada idéntica, formatos vertical/horizontal, límites y serialización. Compilación de producción aprobada con avisos existentes de tamaño de bundle y clasificación de rutas. Revisión React: actualizaciones funcionales por ID, controles accesibles por etiqueta y CSS local sin ampliar el editor. La guía Remotion orientó mantener transformaciones independientes de relojes CSS.

**Validación real:** tras iniciar sesión, se cargó `Jose1998videoprueba` y completó transcripción. En una capa existente de tipografía, tamaño 95%, X=51/Y=49 cambiaron la transformación del DOM a `translate(10.8px, -19.2px) scale(0.95)`; arrastre del lienzo cambió a `translate(102.878px, 103.563px) scale(0.95)`; Restablecer devolvió identidad. Captura `VALIDACION_ZENTRY_MOTION_2026-10-02.jpg`. Los valores de prueba fueron restablecidos.

**Conflicto probado en vivo:** Clean Editorial → A todos sobre B-roll automático 2 mantuvo el ID `auto-broll-12616-1` y el texto hablado «transcripción, edición», sin capa Zentry encima; captura `VALIDACION_CONFLICTO_BROLL_ZENTRY_2026-10-02.jpg`. Sobre Hero Split mantuvo el mismo ID de motion antes/después. Ambos cambios de estilo se deshicieron; se eliminó solo el clip Clean Editorial creado para la prueba (recuperable vía deshacer). Consola sin errores, créditos 999 sin consumo.

**Pendiente:** reapertura del guardado y exportación MP4 real. La prueba de serialización no sustituye esa comprobación de persistencia/exportación.


## 02/10/2026 — Texto hablado animado en B-roll automático

**Hallazgo:** el criterio compartido de propiedad del texto excluía automáticos guardados con efectos `spring`/`typewriter`. Por ello podían conservar una presentación estática y la capa inferior de captions. La captura no permite determinar si su título también viene incrustado en el archivo de fondo.

**Solución:** `brollOwnsAnimatedText` incluye `autoGenerated`; preview, composición y `CaptionLayer` ya consumen ese mismo criterio. Los automáticos leen captions actuales a través de `AnimatedBrollText` y suprimen la segunda capa, usando los tiempos hablados. Las nuevas generaciones/pack usan `editorial`; los guardados conservan su efecto, fuentes y colores, así como texto manual explícito. No se modifica la transcripción ni el metraje.

**Interfaz:** CSS de alcance B-roll para ancho máximo, ajuste de texto de botones y tamaño legible del botón IA. No se oculta contenido ni se elimina herramienta.

**Pruebas:** `test-caption-timing.mjs` verifica propiedad del texto en automáticos antiguos y en modo sin animación; medios manuales ordinarios mantienen captions normales. `test-broll-text-render.mjs` verifica captions nuevos en vez de «AUTOMÁTICOS»/texto viejo, cambio de render temporal y ausencia de repetición en silencios. Ambas pasan y TypeScript pasa. La guía Remotion Captions orientó el uso de captions temporizados y un render independiente de relojes CSS. No se reemplazó el editor por un elemento de captions estático.

**Pendiente:** inspección visual y exportación real del caso de la captura; conexión a la pestaña local bloqueada por timeout. No se acredita revisión de todos los botones ni toda la app.


## 02/10/2026 — Panel B-roll compacto sin eliminar herramientas

**Causa:** los selectores de fuentes/efectos y campos de color/hex no tenían reglas locales de tamaño; su ancho mínimo nativo forzaba las columnas y desbordaba el panel. Las etiquetas de las dos tipografías heredaban texto demasiado grande.

**Solución:** clase `broll-controls` en el panel de B-roll y reglas CSS limitadas a ese panel: `min-width: 0`, `box-sizing: border-box`, campos al 100% del espacio disponible, texto de 10 px y colores de 25 px de alto. Los switches conservan su tamaño y comportamiento. No se cambia el tamaño del editor ni los subtítulos del video; no se elimina ningún control ni se altera la edición guardada.

**Validación:** pendiente de revisión visual; la pestaña existente sigue fallando por timeout de conexión, incluso al pedir captura. El usuario confirmó que no falta ninguna configuración, tras comparar la versión anterior: no hay que restaurar opciones.

**Corrección adicional:** los campos hexadecimales mostraban `defaultValue` y no se renovaban al cambiar su color mediante selector/plantilla. Sus claves ahora incluyen el color guardado, renovando el valor visible cuando cambia, sin impedir escribir un hex completo antes de perder el foco. Las columnas de dos fuentes y tres colores utilizan `minmax(0, 1fr)`.

**Regresión ejecutada:** `node scripts/test-caption-timing.mjs`, `node scripts/test-broll-text-render.mjs` y `node scripts/test-audio-timeline.mjs` pasan: animación compartida, fuentes/colores, silencios, temporización, corte y remapeo de 14 audios. No se declara probado visualmente ni exportado este ajuste de interfaz.


## 02/10/2026 — La transcripción nueva era reemplazada por el borrador

**Hallazgo confirmado:** al terminar Whisper, `processSubtitles` restauraba un proyecto con `applyDraft`; éste elegía `draft.captions ?? fallbackCaptions`, de modo que los captions recién obtenidos no llegaban a mostrarse si existían antiguos. La extracción a 48% parecía detenida, pero posteriormente terminó; no se comprobó un fallo de codec.

**Corrección:** helper `withFreshVideoCaptions` coloca los resultados nuevos dentro del borrador restaurado, sin mutar el original. La restauración completa solo ocurre al entrar inicialmente al editor. Un reintento dentro del editor conserva el estado actual, crea checkpoint y actualiza captions, sin reaplicar presets ni medios del borrador. `withProcessingTimeout` limita la extracción a 120 segundos, limpia sus timers y muestra un error recuperable. No cancela internamente `decodeAudioData`; limita la espera de la interfaz.

**Modelo:** `ensureWhisperModel` distingue modelos tiny/base al compartir descarga; clips adicionales llaman a este cargador antes de ejecutar Whisper.

**Prueba real:** botón Procesar video de `Jose1998videoprueba`; progreso alcanzó 78% y terminó. Los 29 grupos antiguos fueron sustituidos por 42 grupos de voz del video, con inicio «Esto que ves, no / lo compré ni lo / descargue ChatGT está construyendo». Consola sin errores. Guardada evidencia `VALIDACION_TRANSCRIPCION_VIDEO_2026-10-02.jpg`. Sin exportación ni gasto de créditos. Se conserva punto de deshacer.

**Pruebas técnicas:** `test-transcription-recovery.mjs`, `test-caption-timing.mjs`, TypeScript y lint del helper aprobados. Pendientes: calidad lingüística de tiny (ChatGT es un reconocimiento incorrecto) y remapeo de retranscripción en montajes con cortes/múltiples fuentes. No se declara resuelta toda la precisión de Whisper.

## 02/10/2026 — Subtítulos y B-roll: primera etapa implementada

**Problemas:** preview y exportación agrupaban distinto; la primera frase reaparecía en silencios; la animación dual B-roll tenía dos implementaciones con tiempos y escala diferentes.

**Soluciones:** `captionTiming.ts` comparte grupos, entrada y pulso por tiempo. `AnimatedBrollText.tsx` se usa desde `app/page.tsx` y `ZentryComposition.tsx`. Efecto Editorial animado en el selector existente, compatible con video/Pexels y fondos, fuente dual, color, texto manual y desactivación. Nuevos fondos usan Pacifico arriba y Anton abajo. Su caption duplicado se oculta. Los tiempos de palabra no se alargan artificialmente en el renderer nuevo.

**Tiempo real:** Seguir estilo de subtítulos resuelve fuente/tamaño/acento desde ajustes actuales o del grupo. Los B-roll automáticos heredan por defecto; editar sus parámetros desactiva herencia para preservar personalización. Se guarda el flag en plantillas B-roll. Los 11 nombres se normalizaron sin cambiar IDs.

**Pruebas aprobadas:** tests de tiempos, render React estático (cambia según tiempo/fuente/color, no repite palabra única ni texto en silencio), regresión de 14 audios, TypeScript, lint de los tres módulos de captions y build final. Advertencias generales de bundles grandes/rutas sin clasificar permanecen.

**Pendiente:** navegador integrado no permite enfocar la pestaña localhost. Servidor iniciado en http://localhost:3000/ y GET / 200 registrado, pero no hay nueva captura de Zentry ni MP4 revisado. Falta prueba visual y exportación. No se tocó `globals.css`, distribución ni dimensiones. No se copió código privado de Viroedit ni se observó un B-roll Pexels insertado allí. Esta es una implementación parcial del plan, no certificación de toda la app.

**Fecha:** 2026-09-20  
**Cambios de código realizados:** sí, limitados a la cadena de subtítulos, B-roll y exportación.

## Cambios aplicados

| Solución | Archivos | Resultado esperado |
|---|---|---|
| Plantilla de subtítulos global con texto real | `app/page.tsx` | “A todos” genera capas Zentry sincronizadas por grupo de transcripción, no solo un cambio de color/fuente. |
| Duración real al aplicar un subtítulo en posición | `app/page.tsx` | La plantilla se limita al intervalo de la frase activa en vez de durar como mínimo dos segundos. |
| Metadatos de plantilla B-roll | `app/page.tsx`, `app/video/types.ts` | B-roll conserva `templateId`, fuente y preferencia SFX. |
| Render de SFX de B-roll Zentry | `app/video/ZentryComposition.tsx` | El preset de B-roll reproduce su sonido al comenzar la secuencia renderizada. |
| Subtítulos sobre B-roll de vídeo | `app/video/CaptionLayer.tsx` | Solo plantillas gráficas de texto completo sustituyen subtítulos; clips de vídeo/imágenes no los ocultan. |
| Validación previa de WebCodecs | `app/page.tsx` | Exportar muestra un error claro si el navegador no puede generar MP4. |
| Reinicio del selector de B-roll | `app/page.tsx` | El mismo archivo de imagen puede seleccionarse de nuevo tras eliminarlo o reemplazarlo. |
| Montaje visual de B-roll por plantilla | `app/video/ZentryComposition.tsx` | `templateId` resuelve y monta el componente Remotion real, con palabras del intervalo de transcripción. |
| Registro del pack Video8 | `src/zentry/registry.ts` | Las seis plantillas B-roll extraídas pasan a estar disponibles junto a las tres originales. |
| Texto real en todas las plantillas de subtítulos | `src/zentry/subtitles/SubtitleTemplates.tsx` | El contenido de Whisper sustituye siempre los ejemplos del catálogo sin perder la animación propia. |
| Selección aleatoria de SFX | `app/video/contextualSoundEngine.ts` | B-roll y motion eligen al azar y no repiten consecutivamente dentro de cada categoría. |
| Teclado en B-roll manual/plantilla | `app/video/ZentryComposition.tsx`, `app/page.tsx` | Golpes de teclado mecánico se sincronizan con las captions incluidas en cada B-roll. |
| “En posición” siempre crea una capa nueva | `app/page.tsx` | Evita que una plantilla de subtítulos reemplace accidentalmente la capa seleccionada. |

## Validación posterior

| Verificación | Estado |
|---|---|
| `npx tsc --noEmit` | Aprobada. |
| `npm run build` | Aprobada. Se conserva solo el aviso de tamaño de chunk. |
| Comprobación automatizada de Chromium | Aprobada: título, contenido, 13 botones públicos y modal de acceso. |
| Apertura de formulario | Aprobada: aparecen email y contraseña; no hubo recursos fallidos. |
| Prueba de continuidad con `kit infantiles` | Aprobada en navegador autenticado: 19 grupos de captions y 25,3 s de material. |
| SFX / recursos locales | Referencias disponibles bajo `public/`. |
| Exportación real | Aprobada: `kit-infantiles-zentry-verificado.mp4`, AVC/AAC, 25,685 s. |

## Notas de implementación

- Los subtítulos globales creados por “A todos” no reproducen el mismo SFX en cada grupo para evitar una mezcla saturada; se conserva el efecto global de entrada.
- Los cambios respetan el remapeo existente de capas tras cortes/eliminación de silencios.
- No se modificaron usuarios, créditos, Supabase ni credenciales.
- `uploadBroll()` ahora limpia el valor del `input` después de capturar el archivo, igual que ya hacía el flujo de vídeo. Esto no altera el recurso que ya está en la línea de tiempo; únicamente permite seleccionar de nuevo el mismo fichero.
- `CustomBrollLayer` da prioridad al componente del registro cuando un item tiene `templateId`. A los componentes se les entregan texto, título, subtítulo y variantes derivadas de las palabras reales, para que las variantes con propiedades distintas mantengan contenido útil y sincronizado.
- El paquete `Zentry_Video8_Broll` ya estaba extraído. No había archivos comprimidos que borrar. Sus seis componentes se importan directamente desde el paquete y usan los SFX B-roll ya presentes en `public/sfx/broll`.
- Las plantillas Subtitle 01–03 conservan sus composiciones de dos líneas, pero ahora derivan ambas líneas del texto real. Las demás plantillas ya priorizaban `text` y se mantuvieron.
- La elección aleatoria ocurre al generar los eventos contextuales; la lista resultante queda guardada en el estado del proyecto y se reutiliza al exportar.
- El teclado de B-roll cambió al recurso `keyboard-mechanical.wav`, más apropiado para pulsaciones cortas que el audio continuo anterior.

## Validación de seguimiento

- `npx tsc --noEmit`: aprobado tras el ajuste del selector de B-roll y de “En posición”.
- `npm run build`: aprobado tras el ajuste. Permanece únicamente el aviso no bloqueante de chunks por encima de 500 kB.
- `GET /api/whisper-model?model=invalid`: devuelve `400`, por lo que la validación del parámetro no se ha roto.
- Registro y recursos: 56 plantillas centrales; 23 previews de categorías y 50 rutas SFX verificadas, sin faltantes.
- Integración de B-roll Video8: TypeScript y `npm run build` aprobados después de montar las seis plantillas adicionales.
- Prueba aleatoria controlada: tres B-roll y tres motion generaron seis SFX válidos y sin repetición consecutiva.
- TypeScript y las cinco fases del build Vinext aprobaron después de AF-09, AF-10 y AF-11.
- Exportación real completada en navegador: archivo de 19.993.359 bytes; el crédito pasó de 992 a 991, conforme a la autorización del usuario.
- La consola del navegador terminó sin errores y no apareció ningún overlay de error durante la reproducción.

## Resultado de la prueba asistida

El ciclo completo ya fue ejecutado: subida, transcripción, aplicación de las plantillas de subtítulos, hook, B-roll, motion graphic, tipografía, SFX contextual y exportación. El MP4 resultante queda en la raíz del proyecto para revisión.

## Mejoras de la segunda fase

- Motion Zentry usa sus componentes Remotion reales y los estilos 3D generan la escena; los MP4 quedan únicamente como material de catálogo, nunca como capa exportada.
- Las nueve plantillas B-roll tienen previews únicos. Las tres de fondo completo crean el fondo y las seis restantes se superponen al vídeo.
- Pexels conserva los subtítulos porque un B-roll de vídeo ya no bloquea `CaptionLayer`.
- Se añadió estilo y posición independientes por grupo de subtítulos, seleccionable desde la transcripción o la pista CC.
- Los estilos personalizados se pueden guardar, volver a aplicar y borrar. Los nombres repetidos se reemplazan para evitar duplicados.
- El autoguardado incluye elementos Zentry, B-roll, motion graphics y estilos individuales; actualizar la página ya no omite esas capas.
- TypeScript y build de producción aprobaron; el servidor respondió HTTP 200 y las nueve vistas previas B-roll también respondieron 200.

## Mejoras de la tercera fase

- `CustomBrollItem` conserva fuente, tamaño, colores, fondo, efecto de texto, SFX, volumen y estado de activación por clip.
- La previsualización y `ZentryComposition` usan la misma configuración para B-roll de plantilla, imagen o vídeo.
- El selector de efecto admite entrada spring, máquina de escribir, glow y sin efecto.
- El catálogo completo de sonidos está disponible por B-roll; la prueba final dejó seleccionado `keyboard-mechanical.wav`.
- La pista de audio representa SFX manuales, contextuales, B-roll y Zentry mediante marcadores seleccionables.
- “Actualizar” recibe el identificador explícito del B-roll elegido, corrigiendo el desfase que podía editar otro clip.
- Al seleccionar elementos de la línea de tiempo se limpian las selecciones incompatibles para que el panel corresponda siempre al clip visible.
- El tamaño inicial de subtítulos es 72 px y los borradores antiguos con tamaños superiores a 84 px se restauran a 72 px.
- Se creó y dejó guardada la plantilla personalizada **Previon Viral**, con Montserrat y 64 px para el grupo de prueba.

## Validación y exportación final

La prueba autenticada se ejecutó con `kit infantiles.mp4`: 19 grupos CC, una escena B-roll de fondo completo personalizada, hook, tipografía, motion, 22 elementos visuales/Zentry en timeline y 7 marcadores SFX. El editor terminó sin overlay de error.

El resultado se exportó como `kit-infantiles-zentry-personalizado.mp4`:

- 19.131.088 bytes.
- 25,685 s.
- 1080×1920 vertical.
- AVC (`avc1.640029`) y AAC (`mp4a.40.2`).
- Audio estéreo, 48 kHz.

El MP4 se abrió en una segunda pestaña del navegador para reproducción directa y comprobación visual.

## Corrección de B-roll duplicados

- Se separó el registro interno compatible del catálogo visible: tres plantillas históricas siguen disponibles para proyectos guardados, pero no repiten los fondos completos del panel B-roll.
- El selector visible pasó de nueve entradas que incluían equivalentes repetidos a seis B-roll adicionales únicos.
- Se añadió normalización de `customBrolls` al insertar, actualizar, restaurar borradores y recuperar estados de deshacer/rehacer.
- La identidad utiliza plantilla/recurso/estilo, inicio y duración. Así se elimina solo el duplicado exacto y se permite volver a usar el mismo recurso en otro momento.

### Validación

- Doble inserción de “Fondo Blanco” en 5,0 s: **1 tarjeta y 1 clip de timeline**.
- Transcripción del video crudo: **19 grupos**.
- Catálogo B-roll Zentry: **6 acciones únicas**.
- Pista de audio: **4 marcadores**.
- Overlay de error: **0**.
- `npx tsc --noEmit`: aprobado.
- `npm run build`: aprobado; permanece únicamente el aviso no bloqueante de tamaño de chunk.
- Exportación: `kit-infantiles-zentry-sin-duplicados.mp4`, 18.073.177 bytes, 25,685 s, AVC/AAC, 1080×1920.

## Quinta fase — solución integral con Jose1998videoprueba

- Los controles de subtítulos se conectaron al grupo seleccionado. Fuente, tamaño, color, animación, sombra, alineación y posición ya no cambian obligatoriamente todos los grupos.
- La composición y el modelo de datos admiten doble tipografía. La mitad superior e inferior del texto se renderizan con fuentes independientes y salto de línea estable.
- Se creó y guardó **Historia Editorial Doble** con Great Vibes arriba y Playfair Display abajo.
- El antiguo `window.prompt` para nombrar plantillas se reemplazó por un diálogo React accesible, compatible con el navegador integrado.
- Los B-roll generados automáticamente se convierten en clips reales editables. Cada uno se puede seleccionar, actualizar, personalizar y eliminar desde el inspector o la línea de tiempo.
- Al comenzar un video nuevo se limpian las capas del proyecto anterior, evitando arrastres de B-roll, motion o plantillas Zentry.
- Los clips Zentry de la línea de tiempo incorporan controles explícitos de actualizar y eliminar.
- El teclado queda activado para B-roll; la prueba cubrió Teclado CapCut y Teclado Mecánico. Los sonidos también aparecen como marcadores en la pista de audio.
- El motor contextual generó 10 eventos distintos para hook, palabras clave y entradas de B-roll; se verificó el catálogo completo de 36 SFX.
- La exportación falló inicialmente por la decodificación de `film-burn.mp4`. Se sustituyeron los cuatro overlays de vídeo por efectos CSS deterministas compatibles con Remotion, eliminando el `delayRender()` pendiente.

### Validación final

- Video: `Jose1998videoprueba.mp4`, 58,77 s, 42 grupos transcritos.
- Edición por grupo: Poppins, 54 px, rojo y pop desactivado persistieron en el grupo 2.
- Plantilla dual: guardada una vez y reutilizable.
- B-roll: siete clips iniciales; eliminación confirmada 7 → 6 sin tocar el video original.
- Catálogos: 8 subtítulos, 6 hooks, 27 tipografías, 6 B-roll y 6 motion.
- Timeline durante la prueba: 6 B-roll, 3 capas motion/Zentry y 20 marcadores de audio.
- Detección local: 2 silencios, 1,0 s total.
- `npx tsc --noEmit`: aprobado.
- `npm run build`: aprobado en las cinco fases; solo permanece el aviso no bloqueante de tamaño de chunk.
- Exportación real: **100 %**, MP4 1080p sin marca de agua, crédito 986 → 985.
- Descarga generada: `Jose1998videoprueba-1080p.mp4`.

## Corrección final del catálogo Pexels

La integración `/api/pexels` ya no propaga errores 500 al editor. Si la clave falta o Pexels devuelve error/timeout, responde 200 con cinco B-roll verticales locales, `fallback: true` y un mensaje de diagnóstico; si el servicio remoto está disponible, mantiene sus resultados HD. La prueba real devolvió HTTP 200 y recursos 1080×1920 utilizables desde el mismo botón “Usar B-Roll”/“Superponer Aquí”.

## Sexta fase — formato de origen y tres plantillas de Marca (22/09/2026)

**Estado de esta fase: EN CURSO.** Se probaron los renders y la persistencia local, pero no quedó un MP4 nuevo comprobable en Descargas ni se inspeccionaron sus fotogramas.

- La lectura de anchura/altura ahora ocurre durante la carga del archivo, antes de que el usuario pueda exportar. «Original» es el formato inicial por proyecto y conserva la proporción detectada. La pantalla de procesamiento dejó de etiquetar todos los archivos como 9:16.
- Marca admite hasta tres plantillas con nombre, botones de Aplicar, Actualizar, Usar por defecto y Eliminar. La plantilla única anterior se migra sin borrarse. Las cuentas sin plantilla previa reciben «Zentry Viral»; para esta cuenta se guardó «Marca Personal Pro» como predeterminada y se conservó «Mi estilo predeterminado».
- Se comprobó 3/3 y el bloqueo del botón Guardar; la tercera plantilla temporal se eliminó. Tras recargar la página y reabrir el proyecto persistieron las dos plantillas y la selección predeterminada.
- Exportación en navegador, leyendo metadatos del MP4 real: horizontal 1280×720 → **1920×1080**; vertical 720×1280 → **1080×1920**; selector 1:1 → **1080×1080**. Cada resultado duró 10,048 s y llegó al 100 %. Se consumieron tres créditos (997→994).
- `npx tsc --noEmit` y `npm run build` pasan tras los cambios. El build mantiene el aviso no bloqueante de chunk grande. La descarga explícita del navegador integrado no creó un archivo detectable en `C:\Users\jose1\Downloads`; sigue pendiente la comprobación externa del archivo.

## Séptima fase — B-roll personalizable, música y edición sin modal (23/09/2026)

**Estado: PARCIALMENTE TERMINADO.** Los fallos descritos se probaron con MP4 nuevo; la auditoría exhaustiva de todas las herramientas sigue abierta.

1. El texto completo estático de un B-roll de imagen/video ya no tapa los subtítulos reales. Se corrigió también la colisión con el evento automático antiguo que ocultaba el subtítulo en `CaptionLayer` y en la vista previa.
2. Se mantuvieron Fondo Blanco, Fondo Rojo y Fondo Negro; debajo se hicieron accesibles las tres plantillas B-roll históricas y las seis adicionales del registro, sin borrar los componentes ni los proyectos guardados. El botón de sugerencia IA por frase vuelve a estar visible en B-roll.
3. Los ajustes de fuente, tamaño, color y acento del B-roll llegan a la vista previa, a los fondos completos y a los componentes Remotion del paquete `Zentry_Video8_Broll`. Se ofrecen campos hexadecimales editables junto a los selectores de color. La selección de otro diseño reinicia los rasgos incompatibles del anterior.
4. La opción «Dos tipografías animadas» usa Pacifico arriba (aparición) y Anton abajo (entrada desde la derecha), con fuentes cambiables. Se instaló la plantilla inicial **Viral Pacifico + Anton** y se guardó desde el inspector **Mi B-roll 2**; ambas están visibles en «Mis plantillas B-roll (2/3)» de la cuenta de prueba.
5. Se puede subir música/audio a una pista separada de SFX. Inicio, duración, volumen y eliminación son editables. Solo hay un clip de música activo, y el intervalo se remapea a la exportación al aplicar cortes.
6. El aviso de éxito de operaciones habituales deja de tapar el editor. El modal permanece para progreso de render, error y descarga final.

### Pruebas realizadas con `Jose1998videoprueba.mp4`

- El archivo de 71.414.899 bytes cargó y se transcribió hasta abrir el editor con 7 B-roll automáticos.
- Sustituir un B-roll por «Viral Pacifico + Anton» conservó 7 clips; su vista previa mostró la doble fuente. Cambiar a «Center Keyword» conservó el mismo total y dibujó el diseño seleccionado.
- Fuente Pacifico y color blanco se observaron en la vista previa de Center Keyword; el campo hexadecimal `#ffcc00` se reflejó en los subtítulos de un B-roll de imagen.
- Eliminar un B-roll automático redujo 7→6; Deshacer restauró 6→7.
- «Actualizar» conservó 7 clips y no abrió `.job-backdrop`.
- Se subió `keyboard-mechanical.wav` como prueba de audio: una fila para SFX y otra para música, sin solapamiento vertical.
- TypeScript y build de producción aprobaron; el servidor local respondió HTTP 200.

**Nota sobre descargas:** el usuario confirmó que el botón «Descargar MP4 generado» sí funciona. La observación antigua de que no apareció un archivo en Descargas dentro del navegador integrado no debe seguir tratándose como fallo reproducido.

### Fallo detectado durante la exportación y solución

El primer render con música cargada como `blob:` falló al 18 % (`Cannot render audio … Network error`). Se cambió la lectura a `data:` local en el navegador, con límite de 50 MB para evitar un uso excesivo de memoria. Con ese cambio el render terminó al 100 % y no volvió a fallar al extraer el audio. El intento fallido no descontó créditos.

El proyecto de prueba tenía un recorte previo guardado a 25,83 s. La salida del clip se amplió a 58,77 s antes del render completo; esto permite distinguir entre recorte deliberado y un problema de exportación.

### MP4 verificado

- Video `Jose1998videoprueba.mp4`; formato original vertical: **1080×1920**.
- Duración real del MP4 final leída en el reproductor: **58,816 s**.
- Render completo al **100 %**, VIP sin marca de agua; crédito **990→989** en el último intento exitoso.
- Fotogramas revisados aproximadamente a 5,2 s (plantilla Pacifico/Anton de fondo blanco) y 13,7 s (B-roll clásico de fondo completo). Se ajustó la escala del texto exportado tras comprobar que la primera versión quedaba pequeña frente al editor.
- La pista de música local se incluyó sin repetir el fallo de `blob:`.
- `npx tsc --noEmit` y `npm run build`: aprobados. El lint acotado a cinco archivos reporta **60 errores y 20 advertencias**; no se presenta como aprobado.

El enlace de descarga y el reproductor final quedan visibles en el navegador local. Mi clic automatizado no produjo un archivo nuevo localizable en Descargas; no se afirma que el MP4 de esta sesión haya quedado guardado en disco. El usuario puede descargarlo desde el botón abierto.

## 23/09/2026 — Correcciones verificadas en el editor abierto

| Error | Cambio realizado | Verificación |
|---|---|---|
| Clips de motion/Zentry superpuestos en la línea de tiempo | Carriles dinámicos por intervalos y altura sincronizada de pista y etiqueta; B-roll usa el mismo criterio. | Motion creció a 66 px; los dos clips coincidentes quedaron en filas a 30 px de distancia. |
| «Marca» mostraba nombre pero no recuperaba capas | Plantilla personal guarda B-roll, motion, Zentry y estilos de grupos; al aplicar reemplaza las capas actuales. El guardado falla de forma explícita si no hay espacio. | Plantilla temporal con 7 B-rolls/3 capas restauró un B-roll eliminado (6→7). «Mi estilo predeterminado» se actualizó con la edición actual sin perder su estilo original. |
| Guardar/aplicar subtítulo no reflejaba cambios | Aplicar globalmente quita excepciones de grupo; se corrigió el selector cuando la fuente tenía una lista CSS como `Montserrat, sans-serif`. Confirmación discreta tras guardar. | Pacifico + rojo guardados, cambiados a Anton + verde y restaurados desde plantilla. La temporal se borró; «Historia Editorial Doble» sigue disponible. |
| Videos añadidos podían cortarse a 60 s; borrador antiguo podía imponer una salida corta | Se usa toda la duración medida de cada clip secundario. Borradores nuevos distinguen recorte manual; los antiguos sin esa marca y con un único clip corto recuperan toda la fuente. | Video actual: 58,77 s de fuente, clip ocupa 100 % de la pista. No se hizo carga UI de un segundo archivo >60 s ni un nuevo render en esta revisión. |

**Comprobaciones:** TypeScript (`npx tsc --noEmit`) y build (`npm run build`) terminados sin error. Esta validación cubre los fallos anteriores; no equivale a aprobar una auditoría de todos los botones del proyecto. Las plantillas antiguas no pueden recuperar capas que jamás almacenaron: hay que pulsar «Actualizar con la edición actual» para capturarlas.

## 23/09/2026 — Superposición real y volumen de audio

- La reparación anterior separaba carriles, pero no impedía que varias escenas se vieran a la vez. Se añadió `getVisibleVisualLayer` y se usa tanto en `app/page.tsx` como en `app/video/ZentryComposition.tsx`. En cada instante se elige una sola escena B-roll/motion/Zentry sin eliminar las demás de la línea de tiempo. Los subtítulos normales no se superponen a una plantilla Zentry y el overlay global se pausa mientras hay una escena seleccionada.
- En el video abierto, el cruce de 5,8 s quedó con un solo contenedor visual de plantilla sobre el video base; antes mostraba también el B-roll de fondo. El B-roll automático sigue editable en su pista.
- El panel Audio muestra «Volumen del audio subido» incluso antes de cargar música. Se comprobó con un WAV local: 12 % antes de cargar, 12 % al crear la pista y 5 % al mover el control después. El WAV temporal se retiró.
- TypeScript y build aprobaron. **No se hizo nueva exportación MP4 ni se consumió crédito en esta revisión**; la coincidencia visual en un archivo final sigue pendiente de un render posterior.
- Se detectó además una carrera al restaurar borradores/plantillas: `videoFile` aún podía ser `null` mientras `sourceFile` ya existía, por lo que el B-roll automático se materializaba otra vez sobre la edición guardada. La marca de materialización ahora usa `sourceFile` en ambas rutas. TypeScript y build aprobaron; la persistencia manual tras recarga queda por reproducir en UI porque el borrador que ya estaba abierto había sido reemplazado antes de esta corrección.
- «Hero Split» repetía las mismas cuatro palabras en dos líneas, lo que parecía otra máscara. Las inserciones nuevas dividen el texto; los clips antiguos idénticos se normalizan al dibujar en editor y Remotion. Se recargó el video de prueba y en 5,8 s se vieron líneas distintas sin B-roll simultáneo. No se generó un MP4 nuevo.

## 24/09/2026 — Pack Zentry y edición no destructiva de video/música

- Pack Zentry: los botones Viral, Clean, Luxury, Neon y Bold ahora aplican directamente el conjunto; el botón grande permite repetirlo. Se coordinan hook, subtítulos, B-roll existente o nuevo, motion y SFX, sin multiplicar escenas del mismo pack. Prueba: Clean cambió estilo/vista previa y añadió un motion; Deshacer restituyó el estilo previo.
- Corte de video: se limpia la selección incompatible al elegir pista, se corta el objeto elegido y se pausa el video retirado. Al eliminar un fragmento, se ajustan los tiempos de las capas y el audio. Prueba: video 58 s → corte a 26 s → eliminación → 26 s y sin B-roll posterior → Deshacer → 58 s y capas restauradas.
- Deshacer/Rehacer: la captura en memoria conserva las referencias de clips secundarios y al restaurar recalcula la duración. Corrige el caso comprobado en que la pista visual volvía a 58 s pero la regla permanecía en 10 s.
- Música: cada fragmento puede desplazarse por arrastre, recortarse por sus bordes, dividirse con «Cortar», ajustarse de volumen o eliminarse sin tocar los demás. Prueba con `descarga1_audio.mp3`: 0→17,9 s mediante arrastre; corte en 26,4 s; eliminación del tramo derecho; limpieza final del audio de prueba. El render usa secuencias de audio por clip con el desplazamiento de fuente correcto.
- Validación: `npx tsc --noEmit` y `npm run build` terminan sin errores; no hubo errores en consola del navegador. Persiste el aviso no bloqueante de tamaño de bundle. No se hizo MP4 nuevo ni se consumió crédito en esta fase; comprobar el sonido y la imagen de una exportación con música dividida sigue pendiente.
- Referencia CapCut: se imitó el comportamiento público de arrastrar, dividir y borrar clips; no se usaron archivos privados de su instalación.

## 24/09/2026 — SFX móviles, hook completo y B-roll Pexels

- Los marcadores de efectos ♪ ahora se pueden arrastrar o recolocar desde Audio. Sus tiempos se guardan en el borrador, participan en Deshacer/Rehacer, suenan en la vista previa y se remapean para exportación. El SFX del B-roll automático 2 pasó de 11,4 a 15,1 s; Deshacer lo devolvió a 11,4 s.
- El hook ya no desaparece al comenzar un B-roll/motion/plantilla: tanto editor como Remotion respetan la duración de cada línea. Se comprobó a 4,2 s y ~6 s con duración principal temporal de 8 s; a ~8,5 s ya no aparecía. Se restauró 4,8 s.
- Se identificó una restricción de red del proceso servidor anterior, no una llave Pexels inválida. Tras reiniciarlo con acceso de salida, la API devolvió vídeos reales; la interfaz distingue los resultados remotos del respaldo local y avisa si la API falla.
- Se probó un vídeo Pexels temporal a 42,9 s con subtítulos visibles y animados encima. Se corrigió además que el vídeo remoto continuase avanzando al pausar: ahora sigue el cabezal y se detiene. La inserción temporal se deshizo.
- TypeScript, build y consola del navegador sin errores de ejecución. El build conserva solo el aviso de tamaño del bundle. **No hubo exportación MP4 ni gasto de crédito en esta fase**; falta verificar los tres cambios en un render nuevo.

## 26/09/2026 — Editor por clip y recorte sincronizado

- Menú de transición B-roll corregido a fondo oscuro/letra clara, verificado en el navegador.
- Al reducir o borrar video, se retira también el intervalo correspondiente de subtítulos y demás pistas. Prueba: 58→10 s, subtítulos 42→9 y B-roll 7→1; Deshacer devolvió los tres valores iniciales.
- La regla y el cabezal rojo admiten arrastre con el botón izquierdo; prueba 0:29→0:35.
- Seleccionar un video abre un inspector minimalista a la derecha: Video (brillo, contraste, saturación, nitidez) y Audio del video (silencio, volumen). Se puede aplicar al clip o a todos. Los controles alimentan la vista previa y composición de exportación. Selector de salida 24/30/60 FPS incorporado.
- La reducción básica de ruido procesa localmente el clip en el momento de pulsar y muestra el avance. Se comprobó la nueva pista WAV de 58,77 s, el silencio del audio original y reproducción sincronizada; se retiró la prueba del proyecto. No equivale a aislar una voz con IA.
- **Pendientes:** modelo real de superresolución 320p→1080p, aislamiento completo de voz, y MP4 de validación de los nuevos ajustes/FPS/audio. El navegador de prueba no ofrece WebGPU; no se introdujo un selector de «mejora IA» que solo redimensione. `npx tsc --noEmit` y `npm run build` pasan; sin errores de consola observados. Ningún crédito consumido en estas pruebas.

## 26/09/2026 — Carga múltiple, transcripción desde audio y SFX acumulativos

- Hasta 14 audios locales en una carga múltiple o sucesiva; no se reemplazan. Los clips nuevos se sitúan en huecos libres, con controles existentes de movimiento/recorte/volumen. Se usan URLs `blob:` locales para evitar 14 copias base64 en memoria.
- Botón manual «Sincronizar subtítulos con audio»: Whisper transcribe solo los tramos usados por los audios subidos, coloca palabras según la pista y actualiza subtítulos. Las 14 pistas se combinan con separadores de silencio y se procesan en una sola invocación para evitar cierres del navegador por acumulación de memoria; los resultados se remapean a cada clip. La operación es reversible mediante Deshacer; no modifica el audio original ni requiere desmutearlo.
- Los botones de efectos crean un clip nuevo por pulsación. Cada uno tiene marcador, desplazamiento, eliminación individual y secuencia propia en la composición exportable. Se evitó que cambiar el SFX de un B-roll agregara también un SFX manual accidental.
- Se suavizó el filtro de nitidez en el editor y en Remotion; el antiguo máximo producía halos fuertes. Falta prueba visual con material de baja resolución.
- Prueba en navegador con `Jose1998videoprueba.mp4`: dos clics sobre Whoosh Rápido → dos marcadores; subida simultánea de dos MP3 → dos clips en 0–4,2 y 4,2–4,9 s; sincronización → subtítulos del audio («Este vídeo que viene…»); Deshacer → 42 subtítulos originales, 0 audios y 0 SFX manuales. Después se subieron 14 MP3 distintos: contador 14/14, subida bloqueada, Deshacer → 0/14. `npx tsc --noEmit` y build aprobaron. No se exportó ni consumió crédito.
- **Pendiente importante:** superresolución local auténtica 320p→1080p. La investigación identificó inferencia ONNX Web con modelo Real-ESRGAN, pero no hay integración verificada fotograma a fotograma ni sincronización de audio; el escalado actual no recupera detalle. También queda prueba MP4 final de las nuevas pistas.
- Tras pasar los audios a referencias `blob:` locales, se repitió la transcripción con `descarga1_audio.mp3`: aparecieron tres grupos con texto de ese archivo; dos pasos de Deshacer recuperaron 42 grupos originales y 0 audios. Consola sin errores. La subida de 14 archivos y el build siguieron pasando.

- **Validación final de 14 audios (26/09):** se cargaron `corte_000.mp3`–`corte_013.mp3` del directorio `Audio_Yo_No_Vendo_Humo/cortes_5_segundos`; el contador confirmó 14/14 y los clips quedaron secuenciales sin superposición, ajustados al tiempo disponible. La nueva transcripción combinada recibió la duración completa de cada fuente, escaló sus tiempos al intervalo visible y terminó correctamente con 29 grupos de subtítulos; actualizó B-roll/motion graphics y no produjo errores en consola. La exportación 1080×1920 · 30 FPS llegó al 100 % y dejó el MP4 descargable. El primer enfoque (una llamada Whisper por clip) se retiró porque cerraba el navegador en 14/14; el enfoque combinado quedó verificado en producción local.

## 26/09/2026 — Corrección del rechazo HMR y audio completo para Whisper

- El cliente de Vite podía mostrar `Unhandled Promise Rejection: send was called before connect` mientras reconectaba HMR. Se configuró `server.forwardConsole.unhandledErrors = false`; la aplicación sigue mostrando sus errores de transcripción mediante el estado del editor.
- El cargador de música dejó de aplicar el tope artificial `duración del video / 14`. Un corte MP3 de 5 s ahora aparece como 5,0 s y Whisper recibe el tramo completo; se mantiene el límite de 14 archivos y el recorte natural si existe otro clip o termina el video.
- Prueba en navegador (servidor reiniciado): `Jose1998videoprueba.mp4` + `corte_000.mp3` de `Audio_Yo_No_Vendo_Humo/cortes_5_segundos`; el audio quedó en 0–5,0 s, la sincronización finalizó y la consola no registró el rechazo `send was called before connect`. El botón reemplaza los subtítulos existentes por los reconocidos del audio y la operación sigue siendo reversible con Deshacer.
- `npx tsc --noEmit` terminó correctamente. No se exportó MP4 ni se consumieron créditos en esta corrección.

## 26/09/2026 — Transcripción multi-audio y propagación a capas

- Se añadió el botón «Eliminar subtítulos del video actuales» para limpiar explícitamente el transcript anterior antes de sincronizar; Deshacer restaura subtítulos, estilos y capas automáticas.
- Los audios subidos se transcriben con Whisper `base` en español, un filtro de energía más tolerante y un fallback para que una voz baja no termine en una pista vacía. Se pueden cargar y sincronizar los 14 archivos completos; no existe un límite funcional de cinco (la primera prueba solo utilizó cinco).
- Después de sincronizar, los B-roll automáticos se regeneran con los tiempos del audio y los B-roll/motion graphics editables reciben el nuevo texto de sus grupos correspondientes. Así no quedan frases ni intervalos del video original.
- Validación en navegador: cinco MP3 de `Audio_Yo_No_Vendo_Humo/cortes_5_segundos` se cargaron como 0–5, 5–10, 10–15, 15–20 y 20–25 s. La sincronización mostró cinco subtítulos y dos B-roll automáticos en los nuevos intervalos. Exportación MP4 1080×1920 · 30 FPS completada al 100 %, reproducible y descargable; se consumió 1 crédito autorizado.
- `npx tsc --noEmit` terminó correctamente. La salida mantiene el aviso no bloqueante de tamaño del bundle.
## 01/10/2026 — Correcciones derivadas de code-review

Skill usada: `09-code-review/code-review.md`, más referencias de captions/render de Remotion y seguridad de funciones Supabase. Se separaron fallos reproducibles de avisos de estilo y de verificaciones que requieren acceso remoto.

| Error | Causa y solución implementada | Validación |
|---|---|---|
| CR-01, desfase/truncamiento | Se agregó `playbackRate` a las pistas. `audioTimeline.ts` centraliza velocidad e intervalo audible; preview, Whisper y composición utilizan la misma transformación. | 14 pistas encajadas a 1,191×; reproducción DOM y pruebas numéricas coinciden. |
| CR-02, palabras eliminadas reaparecen | Lectura de muestras limitada a `sourceStart + duration × rate`; recortes y divisiones desplazan el origen con esa velocidad. | Tests de dos mitades contiguas y exclusión de palabras de la mitad eliminada. |
| CR-04, música invade al vecino | `maxAudioDuration` compartido para campos numéricos y límites de fuente. | Intento 8 s limitado a 4,2 s en navegador. |
| CR-05, borrador sin audio | `localMediaStore.ts` persiste blobs en IndexedDB y guarda referencias estables; se incluyen música, audio procesado, volumen SFX y fuentes de segmentos. Referencias antiguas expiradas se descartan al cargar. | Recarga del video recuperó 14/14 pistas y autoguardado exitoso. |
| CR-06, texto viejo en capas | Unión de todos los grupos coincidentes, limpieza cuando no hay voz y `textSource` para preservar edición manual. | Revisión de ramas del código; sincronización real generó 29 grupos y actualizó capas. |
| CR-07, waveform vacío desordena pistas | La lista de clips válidos se construye junto a sus muestras y offsets; informa archivos omitidos. | Revisión del flujo; falta un fixture de audio totalmente vacío en navegador. |
| CR-08, cargas paralelas | Bloqueo mediante ref/estado, metadatos con timeout y decodificación secuencial; rollback de URLs al fallar. | 14/14 y botón de carga bloqueado. Carrera verificada por inspección, no por carga simultánea artificial. |
| CR-09, recursos retenidos | Registro de URLs y liberación solo cuando timeline e historial dejan de referenciarlas. Limpieza diferida cancela desmontajes provisionales de Fast Refresh/StrictMode. | Fallo real durante HMR reproducido y corregido; repetir render sin revocación. Falta medición cuantitativa prolongada de memoria. |
| Exportación después de eliminar silencios | `remapAudioToOutput` divide pistas por intervalos conservados y avanza `sourceStart`; ya no reproduce muestras eliminadas. | Test automatizado con hueco eliminado. |
| CR-03, permisos de créditos | Scripts SQL exigen identidad y propiedad/admin; `search_path` fijo; EXECUTE solo authenticated. Se quitó DROP de funciones. | Sintaxis local validada. Despliegue y prueba con roles reales **pendientes**: permiso remoto denegado. |

Comprobaciones: `node scripts/test-audio-timeline.mjs` aprobado; `npx tsc --noEmit` aprobado; `npm run build` aprobado (avisos de chunks grandes y clasificación de rutas de Vinext). No confundir estos resultados con una garantía de transcripción perfecta. La velocidad de ajuste es explícita y altera el ritmo de la voz; no se añadió un modelo de superresolución ni aislamiento de voz en esta corrección.

### Exportación final de la corrección — TERMINADO

El segundo render desde una carga nueva llegó al 100 %. El reproductor del MP4 informó 1080×1920, duración 58,816 s y `readyState=4`, sin error de decodificación. Se inició reproducción y se comprobó avance hasta 53,19 s. La salida se configuró a 30 FPS. Se consumió 1 crédito autorizado (977→976); el intento fallido no consumió crédito. El MP4 permanece en el navegador con «Descargar MP4 generado». La automatización de descarga no devolvió archivo ni evento de descarga dentro del plazo, por lo que **no se afirma que haya una copia guardada en disco**.

Evidencia local: `VALIDACION_EXPORTACION_2026-10-01.jpg`. TypeScript, build final y ESLint de los nuevos módulos `audioTimeline.ts`, `localMediaStore.ts` y `test-audio-timeline.mjs` aprobaron. El resto del lint histórico no se declara saneado. El texto reconocido contiene errores lingüísticos visibles (por ejemplo «Con la hía» y «presición»); la corrección temporal no equivale a corregir automáticamente esas palabras. Mejorar precisión del modelo y medirla contra referencia manual continúa pendiente.
## 01/10/2026 — Segunda corrección: sin aceleración automática

Skill aplicada: la guía `09-code-review/code-review.md` solicitada por el usuario; referencias de captions y audio de Remotion para comprobar intervalos, velocidad y salida. No se añadió WebGPU: este entorno sigue utilizando el modelo local Whisper base instalado.

| Hallazgo | Solución y archivos | Estado / prueba |
|---|---|---|
| Audio acelerado al subir | `uploadMusic` en `app/page.tsx`: retirada compresión proporcional; duration=duración real, playbackRate=1. Busca huecos que admitan el archivo completo; rollback si no cabe. | TERMINADO. Dos MP3 reales de unos 5 s: 0–5 y 5–10 s, ambos 1×. |
| No se puede escuchar una pista sola | Selector «Escuchar y editar audio» y `<audio controls>` independiente. Respeta volumen, velocidad y límites del fragmento; pausa al reproducir montaje o sincronizar. | TERMINADO. Reproducción activa y readyState=4 observados en navegador. |
| No se puede controlar velocidad | `changeAudioRate` en `audioTimeline.ts`; selector hasta 5×. Conserva muestras audibles, calcula duración/rate y rechaza invasión del siguiente clip o final del video. | TERMINADO. 1,5×→3,33 s; Original→4,99 s; 5×→1 s. Tests de retorno a original, límites y solapamiento pasan. |
| SFX exportado ignora volumen general | `ZentryComposition.tsx`: ganancias del B-roll fijo/movido, teclado, hook y SFX legado multiplicadas por volumen general. En preview se utiliza ganancia individual, no el fijo 0,4 para todas las pistas. | Implementado y compilado; falta medición acústica del MP4 nuevo. |
| SFX de Zentry sin ID explícito queda vacío en preview | Resolver `item.sfxId || registro.sfxId` en la pista de sonido. | Implementado por inspección; falta escuchar todos los 53 presets. |
| Corte seco exportado hace fade | `types.ts` admite `none`; CustomBrollLayer fija opacidad 1 para entrada/salida none; preview no hace fade de salida. Fallback fade usa smooth-fade. | Implementado; falta render comparativo fotograma a fotograma. |
| Configuración de subtítulos/audio no persiste | `shadow`, `popAnimation`, `volume` añadidos a snapshot, guardado, restauración y dependencias del autoguardado. | Implementado, TypeScript aprobado; falta nueva recarga dedicada de estas tres opciones. |
| B-roll del texto previo sobrevive a resincronización | Retirar capas automáticas transcript-derived antes de regenerarlas, incluso si el nuevo audio no crea eventos; preservar texto marcado manual. | Fallo observado en navegador con dos audios y un solo grupo; corrección aplicada y repetición registrada abajo. |

Pendientes de revisión: correspondencia global de Giro 3D y de slide-up/down en B-roll personalizado; precisión del canto con Whisper base; matriz completa de estilos/transiciones, medición acústica y MP4 nuevo. El MP4 al 100 % descrito en la sección anterior corresponde a la revisión anterior, no a estas modificaciones.

Importante: cambiar la velocidad no dispara Whisper automáticamente. El aviso indica usar «Sincronizar subtítulos con audio» para regenerar textos y tiempos. Borradores anteriores mantienen su velocidad guardada. Para volver los 14 cortes anteriores a 1× completos hace falta más duración de video; se solicitó al usuario escoger extensión del montaje o recorte explícito. No se fingió que 70 s de audio caben en 58 s sin alterar nada.

Repetición final de sincronización: el panel confirmó «2/2 audios y sus velocidades actuales»; apareció el grupo «Ya!» y desaparecieron todos los marcadores B-roll automáticos heredados. Consola sin errores durante la prueba. Se deshicieron los cambios de demostración y se recuperó el montaje anterior completo: 14/14 y transcript anterior. Por tanto, las pistas antiguas recuperadas todavía muestran su 1,19× guardado: **no se declara resuelto el retorno de esas 14 pistas a 1× hasta decidir la duración del montaje**. Las nuevas cargas sí entran a 1×. Ningún crédito consumido ni exportación nueva en esta segunda intervención.
