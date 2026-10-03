# Auditoría funcional integral — Zentry Studio

## 03/10/2026 — Pexels y evaluación de «Solo voz»

- [x] Pexels local — TERMINADO: la clave configurada es válida. Una llamada directa respondió HTTP 200; el servidor de desarrollo anterior no podía abrir conexiones externas por restricciones del entorno de ejecución.
- [x] Reiniciado únicamente el servidor local del proyecto con acceso de red autorizado. Actualizado endpoint a `/v1/videos/search`, búsqueda vertical con locale español, timeout de 15 s y motivos de fallback diferenciados. Clave permanece exclusivamente en el servidor.
- [x] API local devuelve 12 videos para «tecnología», 8000 resultados totales y cero recursos locales; enlaces de video de `videos.pexels.com`. Panel muestra 12 resultados reales y las 12 miniaturas cargan. Evidencia: `VALIDACION_PEXELS_2026-10-03.jpg`.
- [x] TypeScript y build aprobados; permanecen avisos existentes de chunks grandes y clasificación de rutas. Sesión de prueba recuperó las capas y música guardadas tras volver a adjuntar Jose1998videoprueba; no se insertaron ni eliminaron B-rolls o audios durante esta comprobación.
- [ ] Pexels en Cloudflare: despliegue y secreto del entorno remoto no comprobados en esta sesión. No se exportó MP4 de stock.
- [x] Evaluación de «Solo voz»: viable mediante separación de fuentes con un modelo de IA local. El filtro actual de `processClipAudio.ts` solo atenúa ruido/frecuencias: NO separa música ni garantiza quitar sonidos superpuestos a la voz.
- [ ] Integrar y validar «Solo voz» antes de presentarlo como funcional. Requiere elegir pesos con condiciones de uso verificadas, descarga/cache del modelo, progreso/cancelación, comparación audible y prueba preview/export. No se añadió un botón que simule esa separación. La viabilidad no equivale a una función terminada ni garantiza calidad igual a CapCut.

## 03/10/2026 — Interfaz con menos texto — TERMINADO en el alcance revisado

- [x] Usadas ambas guías del usuario: reglas visuales/accesibilidad y comparación de 3 alternativas de interfaz.
- [x] Reducidos párrafos y títulos repetidos en Audio, B-roll, Motion/Zentry y Marca. Explicaciones conservadas en ayuda desplegable; sin retirar controles ni cambiar el tamaño exterior.
- [x] Conservadas advertencias de sincronización y limitaciones reales. Etiquetas accesibles en búsqueda y formato de subtítulos, foco visible, botones ajustados al ancho.
- [x] Prueba sobre proyecto y audio actuales del usuario: Audio/B-roll/Zentry sin desbordamiento horizontal; ayuda abre/cierra con Enter. No se modificaron video, audio, volúmenes o plantillas.
- [x] TypeScript, build y regresión de audio aprobados. Detalles y pendientes fuera del alcance: `REVISION_INTERFAZ_2026-10-03.md`. Evidencia `VALIDACION_INTERFAZ_COMPACTA_2026-10-03.jpg`.

## 03/10/2026 — Vista del video y accesibilidad de la línea de tiempo — TERMINADO en código y prueba local

- [x] Corregido recorte de pistas inferiores: altura de contenido explícita, scroll vertical compartido con etiquetas y scroll horizontal independiente. Se conserva el tamaño exterior del editor.
- [x] Pistas vacías colapsadas; etiquetas Video, Audio, SFX, Texto, B-roll y Motion con alturas alineadas. Audio tiene 44 px, controles de recorte más anchos y ancho mínimo de 72 px para poder agarrar audios cortos; nuevo botón «Ver audios». Seleccionar un audio también desplaza la pista a la vista.
- [x] Vista previa respeta `segment.src` también para el primer clip, como timeline/export, evitando mostrar el video original después de eliminar/cambiar el primer fragmento.
- [x] Miniaturas: una instancia por clip en lugar de hasta ocho; carga de fotograma con `preload=auto`, búsqueda actualizada al cambiar `src` y tiempo limitado a la duración del archivo.
- [x] TypeScript sin errores; regresión `test-audio-timeline.mjs` aprobada. Build aprobado antes del último ajuste de auto-scroll/ancho mínimo; TypeScript repetido después, aprobado. Build conserva avisos existentes de tamaño de chunks/clasificación de rutas.
- [x] Comprobación visual con Jose1998videoprueba (58,7 s): preview y miniatura 1080×1920, `readyState=4`; reproducción avanza a 31 s y pausa a 36 s con imagen. «Ver audios» muestra la pista completa; todas las alturas/posiciones de etiquetas coinciden con sus filas (incluyendo Motion de 96 px). Arrastre real de audio temporal de 0 a 17,93 s, conservando duración 0,66 s. Retirado únicamente ese audio temporal al finalizar; eliminación comprobada (cero clips de música). Evidencia `VALIDACION_TIMELINE_2026-10-03.jpg`.
- [ ] Confirmar el problema exacto de la captura original en su sesión: la pestaña disponible inicialmente estaba en ViroEdit, no en el proyecto local.

## 03/10/2026 — Volúmenes independientes — TERMINADO en controles y revisión

- [x] Aclarado control ambiguo «Volumen original»: ahora «Volumen del sonido del video». El audio subido indica si ajusta el seleccionado o todos; ayudas explican que no se cruzan ni afectan SFX.
- [x] Prueba real de controles: video 5%, audio subido 35% inicialmente; audio a 10% mantiene video 5%; video a 0% mantiene audio 10%. Restaurados video 5%, audio 35% y selección vacía.
- [x] Revisadas rutas preview/export: video usa volumen original × volumen del clip; música usa exclusivamente volumen del audio. Corregido fallback preview sin segmentos que no asignaba el volumen del video.
- [ ] No se volvió a exportar MP4 ni se midieron niveles acústicos. Evidencia de controles: `VALIDACION_VOLUMEN_INDEPENDIENTE_2026-10-03.png`.

## 03/10/2026 — Audio largo limitado al video — TERMINADO en código y pruebas

- [x] Eliminado rechazo de audio por duración superior al tiempo disponible. Se recorta el fragmento de timeline sin acelerar ni modificar el archivo original.
- [x] Se busca primero un hueco para el audio completo; si no cabe, se recorta al mayor intervalo libre, sin superponer ni pasar el final del video. Línea llena sigue dando aviso válido.
- [x] Pruebas de audio de 240 s en video de 58,7 s, huecos, vecino, audio corto y cola de subtítulos excluida; regresión de audio y TypeScript pasan.
- [ ] No se certifica carga real de archivo largo ni exportación MP4 con este cambio: verificación de esta sesión realizada mediante pruebas automatizadas.

## 03/10/2026 — Recursos locales de motion — TERMINADO en código y preview

- [x] Añadidos recursos SVG propios y cinco temas: tecnología, dinero, conversación, aprendizaje y crecimiento. Selección automática por subtítulos del clip, contexto estable por intervalo y opción manual.
- [x] Compartida animación temporal de objetos entre preview/export. Conservados iconos clásicos, texto editable y controles; selector permite quitar objetos. Dimensiones de interfaz intactas.
- [x] Probados los ocho modos del selector en vivo con `Jose1998videoprueba`; cambios visibles sin duplicar clips. Estado final automático en el motion del pack existente. Evidencia `VALIDACION_MOTION_LOCAL_2026-10-03.png`.
- [x] Pruebas de recursos, packs/catálogo, hook; TypeScript y build sin errores. ESLint de nuevos componentes pasa, no se afirma limpieza del lint global.
- [ ] MP4 real y persistencia tras recarga pendientes. Recursos 2.5D por SVG, no modelos 3D ni IA generativa.

## 03/10/2026 — Referencia motion Viroedit — INSPECCIÓN TERMINADA

- [x] Revisado motion existente de 5,184 s: profundidad, movimiento de cámara, dos estilos tipográficos y resaltado rojo. Texto presente dentro del MP4.
- [x] Comparado con nuestro renderer de tarjetas/degradados/iconos. Conservar subtítulos editables y sincronizados.
- [ ] Nuevas escenas pendientes de implementación y pruebas. Plan y límites en `PLAN_MOTION_GRAPHICS_VIRO_2026-10-03.md`. Esta inspección no modifica el editor ni consume créditos.

## 02/10/2026 — Catálogo completo y packs a 58 — TERMINADO en código y navegador

- [x] Probados botones del catálogo autenticado con `Jose1998videoprueba`: 8 subtítulos (A todos), 6 hooks, 27 tipografías, 6 B-roll y 6 motion. Inserciones de prueba deshechas; comprobadas capas en lienzo y controles a 58. Esto no acredita reproducción/exportación completa de cada una de las 53 escenas.
- [x] Probados los cinco packs en vivo y el botón Generar Automáticamente. Todos establecen captions/hook/B-roll/motion a 58 y doble fuente. Estado final: Viral aplicado, siete B-roll automáticos existentes y un motion del pack, sin duplicar clips del pack al generar otra vez.
- [x] Fuentes inferiores: Viral Anton; Clean Inter; Luxury Pacifico; Neon Oswald; Bold Bebas Neue. Arriba Montserrat; Mont/Play conserva la elección de Playfair Display como alternativa superior.
- [x] Dos entradas temporizadas para B-roll/motion de cada pack: primera línea aparece; segunda entra desde la derecha. Ambos tamaños base 58. El tamaño visible del preview escala con el ancho del lienzo, no cambia las dimensiones del editor.
- [x] Eliminado multiplicador 1,5 del tamaño B-roll y factor 0,75 de su primera línea. Herencia de estilo usa ahora el tamaño real; presets guardados conservan sus valores hasta que se aplica otro pack/edición.
- [x] Plantillas nativas: contexto de tamaño para ReferenceTextAnimation y prop fontSize a 58 en preview/export; nuevo control por capa de letra, separado de escala proporcional. Los diseños que usan tamaños relativos internos conservan esa proporción.
- [x] Corregida fuga de cursiva de Luxury hacia otros packs. Hook conserva independencia y nuevo pack/hooks establecen 2 s por defecto.
- [x] Fallo hallado: hooks del catálogo cambiaban fuentes/SFX sin cambiar el estilo de hook. Añadido mapeo de los seis IDs al estilo correspondiente del editor; no se afirma identidad píxel a píxel con los videos del catálogo.
- [x] Fallo hallado: reserva de espacios consideraba subtítulos como escenas ocupadas y medía 1,8 s para clips de 2,2/2,5 s. Ahora excluye subtítulos y reserva las duraciones reales, también entre nuevos clips del pack.
- [x] Fallo hallado: `delete-letters` interpolaba con rango descendente [1,0], provocando excepción de Remotion. Invertidos rango/salidas conservando la animación de desaparición.
- [x] Fallo visual: motion automático de doble fuente repetía captions normales detrás. El motion sincronizado es dueño de ese texto, incluso flotante; un motion flotante manual conserva la regla anterior. Hook no se oculta ni desplaza por esto.
- [x] Prueba técnica: 5 packs × 2 variantes, dos fuentes distintas, cambios temporales, tamaño 58 y ausencia de duplicación. Render aislado de las 53 plantillas en frames 1/30, con reloj/config de composición simulado; no es prueba MP4. Regresiones de captions/B-roll/hook/layout aprobadas; TypeScript y build aprobados.
- [ ] ESLint general no está limpio: 58 errores/21 avisos en la revisión amplia (tipos any, reglas React, prefer-const, comillas). Los componentes nuevos de texto/pack pasan lint dirigido. Se registran sin declarar auditoría total terminada.
- [ ] Exportación e inspección de un MP4 con cada plantilla pendiente; no hubo consumo de créditos por exportación en esta prueba.

Evidencia: `VALIDACION_PACKS_ZENTRY_58_2026-10-02.png` y `VALIDACION_BROLL_DOBLE_FUENTE_58_2026-10-02.png`.

## 02/10/2026 — Hook independiente de 2 segundos — TERMINADO en código y preview

- [x] Criterio confirmado por el usuario: hook separado; no debe ocultar ni desplazar captions ni bloquear motion/B-roll. Sustituye la propuesta de prioridad conjunta del diagnóstico anterior.
- [x] Duración predeterminada de ambas líneas: 2 segundos. Ajustados también los dos controles del proyecto abierto `Jose1998videoprueba` a 2,0 s; no se sobrescriben otros presets guardados.
- [x] Preview y exportación comparten `hookLineOpacity`: fin exclusivo exacto, fundidos proporcionales y duración reducible hasta 0,1 s. Eliminada la ocultación/desplazamiento de captions por el hook.
- [x] Motion 3D automático obtiene páginas de captions actuales; no repite título como subtítulo y no muestra frase de demostración durante silencios. Texto marcado como manual conserva su contenido. Añadido interruptor para elegir sincronizado/manual.
- [x] Preview y exportación comparten regla de captions: motion flotante permite captions; escena completa usa su texto propio. El hook queda independiente por encima, sin suprimir otras capas.
- [x] Prueba real: a ~1,8 s se ven hook y motion con texto actual «compré ni lo descargue», sin duplicación de la frase antigua. Al reducir ambas duraciones a 1 s el hook desaparece en ese mismo instante. Restaurado a 2 s; a ~4,2 s no aparece. No se borraron capas ni se alteró el tamaño del editor.
- [x] Pruebas `test-opening-layers`, `test-caption-timing`, `test-zentry-layout`, `test-broll-text-render`, ESLint y compilación de producción aprobadas. Avisos de bundle/clasificación de rutas permanecen.
- [ ] Exportación MP4 real de esta corrección pendiente; no confundir compilación/pruebas del renderizador con inspección del archivo final.

Evidencia: `VALIDACION_HOOK_INDEPENDIENTE_2026-10-02.jpg`. Los diagnósticos anteriores se conservan como historial, no como estado vigente de esta corrección.

## 02/10/2026 — Diagnóstico del choque de apertura (sin corregir aún)

- [x] Reproducido en proyecto abierto `Jose1998videoprueba`, detenido en inicio del tercer grupo (~1,8 s). Se movió solo el cabezal/selección; no se cambió contenido ni se exportó. Créditos observados: 998.
- [x] Hook superior dura 3,6 s y principal 4,8 s; motion «es... Ah... lo de...» ocupa 1,2–4,7 s. Coinciden durante 3,5 s y ambos renderizadores muestran texto al mismo tiempo.
- [x] `isHookActive` de preview depende solo del tiempo/texto, no de la escena elegida. Exportación monta HookLayer también sin comprobar la escena. El selector de escena única no incluye el hook.
- [x] Texto del motion no coincide con captions actuales: tercer grupo «descargue ChatGT está construyendo»; motion mantiene «es... Ah... lo de...». Preview/renderer leen `mg.title`/`item.title`, no los captions nuevos. No se confirmó de dónde provenía ese título antiguo ni si fue escrito manualmente: no sobrescribir sin distinguir texto manual.
- [x] Repetición observada: la tarjeta muestra el texto pequeño superior y vuelve a mostrar la misma frase en las palabras principales. La imagen confirma duplicación.
- [x] Diferencia de código preview/export: preview oculta captions con cualquier motion activo; CaptionLayer exportado solo los oculta si `displayMode !== 'floating'`. Las dos rutas no siguen la misma regla.
- [ ] Definir/aplicar prioridad compartida hook/escena/captions sin borrar capas ni acortar tiempos del usuario.
- [ ] Actualización segura de texto automático de motion tras retranscribir, preservando los manuales.
- [ ] Evitar subtítulo de tarjeta idéntico a su título y validar preview/MP4 con el mismo criterio.

Evidencia: `AUDITORIA_CHOQUE_INICIO_2026-10-02.jpg`. Esta sección es diagnóstico, no solución aplicada.

## 02/10/2026 — Zentry Motion: tamaño y posición por capa

- [x] Causa: `ZentryTemplateItem` no guardaba posición/escala; las plantillas fijaban su propio diseño y el inspector no tenía esos controles. Los controles globales de captions no afectan esas capas.
- [x] Añadidos tamaño proporcional 25–250%, desplazamiento X/Y y restablecer en el inspector de la plantilla seleccionada. Se escala el diseño completo de la plantilla, conservando proporciones entre sus letras y elementos gráficos; no es un tamaño absoluto en px por palabra.
- [x] Arrastre en el lienzo para la capa Zentry seleccionada, con checkpoint inicial y actualización por ID; no modifica otras capas. Seleccionar primero su clip en la línea de tiempo.
- [x] Preview y composición de exportación usan `getZentryLayout` con dimensiones reales. Valores ausentes mantienen el diseño anterior. Los nuevos campos forman parte del objeto serializado y de sus duplicados/presets.
- [x] Corregido preview pausado: dejaba un mínimo ficticio de 18 fotogramas durante los primeros 0,6 s; ahora usa el tiempo real y FPS seleccionado.
- [x] Prueba técnica de valores predeterminados, escala, desplazamientos vertical/horizontal, formatos 9:16/16:9, límites, valores no finitos y serialización.
- [x] Conflicto adicional: subtítulos Zentry ya no ganan prioridad sobre escenas B-roll/motion, ni siquiera con grupos que empiezan después. Sobre video normal siguen apareciendo.
- [x] Cambiar una tipografía solo reemplaza una capa seleccionada de la misma categoría; no transforma accidentalmente un motion en tipografía.
- [x] Una plantilla explícita `templateId` de B-roll mantiene su renderizador propio; ya no es ignorada por `autoGenerated`/efecto editorial.
- [x] Prueba real autenticada con `Jose1998videoprueba`: tamaño a 95%, X=51/Y=49 producen `translate(10.8px, -19.2px) scale(0.95)`; arrastre modifica coordenadas; restablecer devuelve `translate(0px, 0px) scale(1)`. Captura guardada.
- [x] Aplicar Clean Editorial a todos conserva el B-roll automático 2 visible (mismo ID y captions «transcripción, edición»); sobre Hero Split conserva el mismo ID del motion. Cambios temporales deshechos; clip Clean Editorial de prueba eliminado con recuperación disponible. Créditos permanecen en 999, sin exportación y consola sin errores.
- [ ] Reapertura del guardado y MP4 real todavía pendientes; se verificó serialización técnica, no persistencia visual tras recarga.

Evidencias: `VALIDACION_ZENTRY_MOTION_2026-10-02.jpg`, `VALIDACION_CONFLICTO_BROLL_ZENTRY_2026-10-02.jpg`.


## 02/10/2026 — B-roll automático sin texto animado y vista previa

- [x] Causa en código: `brollOwnsAnimatedText` solo reconocía doble fuente/efecto editorial. Los automáticos antiguos (`spring`/`typewriter`) quedaban fuera del renderizador compartido, conservando subtítulos independientes.
- [x] Todos los clips `autoGenerated` usan ahora el renderizador compartido de captions y excluyen la segunda capa de subtítulos, tanto en preview como exportación. No requiere borrar/regenerar los clips guardados.
- [x] Nuevos B-roll automáticos y pack automático usan entrada editorial; los clips antiguos mantienen su efecto elegido, incluyendo `none` si el usuario desactivó animación. Se conserva texto manual explícito.
- [x] Prueba de regresión: clip automático antiguo con título «AUTOMÁTICOS» y texto viejo produce captions actuales, cambia su render con el tiempo y no repite título en silencios.
- [x] Botones B-roll limitados al ancho disponible y permiten ajustar texto a varias líneas; botón IA con texto 10 px y altura mínima 34 px, sin cambiar dimensiones del editor.
- [ ] Comprobar visualmente todos los controles y la captura concreta: el navegador sigue devolviendo timeout al conectar con la pestaña local. No se declara auditoría integral terminada ni MP4 verificado.
- [ ] Si el texto «AUTOMÁTICOS» forma parte de los píxeles del medio importado, esta corrección no lo borra: requiere identificar ese archivo. No se ha confirmado ese supuesto en la captura.


## 02/10/2026 — Controles B-roll desbordados

- [x] Identificados selectores sin límites de ancho y campos nativos de color/hex que excedían las columnas del inspector.
- [x] Añadido alcance `.broll-controls`: tamaño de texto compacto, ancho limitado al panel y `min-width: 0` en columnas/etiquetas. Se mantienen dimensiones generales y todas las opciones existentes.
- [ ] Validación visual en navegador pendiente: la pestaña local devuelve timeout de conexión CDP al intentar inspeccionarla; no se ha recargado ni alterado el proyecto del usuario.
- [x] El usuario comparó con la versión anterior y confirmó que no falta ninguna configuración. No se añade ni se elimina ninguna opción.
- [x] Corregido un fallo adicional: los campos hexadecimales usaban `defaultValue` con una clave fija y podían mostrar un color antiguo tras cambiarlo con el selector o aplicar una plantilla. Ahora se reinicializan cuando cambia el color guardado.
- [x] Columnas de fuentes y colores usan `minmax(0, 1fr)` para no forzar el ancho del panel.
- [x] Regresión técnica: pruebas de tiempos de captions, render animado B-roll y línea de tiempo de 14 audios aprobadas. Esto no sustituye la validación visual pendiente.


## 02/10/2026 — Corrección de transcripción de video

- [x] Causa confirmada: `processSubtitles` calculaba una transcripción nueva, pero `applyDraft` priorizaba `draft.captions`, sustituyéndola por el texto antiguo (incluso el de audios externos).
- [x] Restauración inicial conserva estilos/medios del borrador, pero recibe captions nuevos explícitamente. Reprocesar desde el editor ya no restaura un borrador ni reaplica la marca predeterminada; crea checkpoint de deshacer y reemplaza la transcripción actual.
- [x] Extracción con límite de 120 segundos y mensajes de lectura/decodificación; no se cambia el decodificador ni se atribuye el caso observado a un codec sin evidencia. La extracción inicial terminó.
- [x] Clips adicionales comprueban/cargan modelo antes de transcribir; descargas concurrentes de modelos distintos no comparten la misma promesa.
- [x] Prueba real con `Jose1998videoprueba` cargado en sesión: 29 grupos antiguos → 42 nuevos, primera frase «Esto que ves, no», sin errores de consola y sin exportación/créditos consumidos.
- [x] Pruebas unitarias de recuperación y timeout; TypeScript y lint del helper pasan.
- [ ] Precisión lingüística: todavía hay errores del modelo tiny, por ejemplo «ChatGT». La prueba confirma actualización y funcionamiento, no una transcripción perfecta.
- [ ] Validar retranscripción de proyectos multiclip ya recortados y su remapeo de timestamps; esta prueba fue sobre el video completo.

Evidencia: `VALIDACION_TRANSCRIPCION_VIDEO_2026-10-02.jpg`, `scripts/test-transcription-recovery.mjs`.

## 02/10/2026 — Texto editorial y B-roll: primera etapa implementada

- [x] Unificar grupos de cuatro captions entre preview y exportación, sin primera frase repetida en silencios.
- [x] Añadir renderer compartido de aparición/entrada derecha con énfasis por palabra y fuentes duales, para fondos y B-roll de video/Pexels.
- [x] Mantener tiempos cortos originales y proteger texto manual en el renderer nuevo; ocultar caption normal cuando el B-roll dibuja texto propio.
- [x] Añadir Seguir estilo de subtítulos, guardarlo en plantillas B-roll y desactivar herencia al personalizar fuente/tamaño/acento.
- [x] Normalizar nombres de 11 presets sin duplicar ni cambiar IDs. No se modificaron dimensiones ni `globals.css`.
- [x] Tests de tiempos, renderer React estático, regresión de 14 audios, TypeScript, lint enfocado y build aprobados. Build conserva avisos de bundles grandes y rutas sin clasificar.
- [ ] Validación visual integrada: herramienta del navegador no permite enfocar localhost; servidor registra GET / 200. Esto no prueba que la UI funcione completa.
- [ ] Exportar y comparar nuevo MP4; no se consumió crédito de Zentry en esta etapa.
- [ ] Resto del plan: transiciones de fondo unificadas, tercer rol tipográfico independiente, importación de fuentes y validación integral de plantillas/motion.

Evidencia: `scripts/test-caption-timing.mjs`, `scripts/test-broll-text-render.mjs`, `scripts/test-audio-timeline.mjs`. Detalles y pendientes: `PLAN_SUBTITULOS_BROLL_VIROEDIT_2026-10-02.md`. No se declara auditada de nuevo toda la app ni replicada exactamente una animación Pexels de Viroedit.

## 01/10/2026 — Audio original, velocidad manual y segunda revisión

Esta corrección sustituye el ajuste proporcional automático descrito anteriormente: **las nuevas cargas entran completas a 1×**. Se mantiene el límite de 14, pero no se acelera un lote para hacerlo caber en un video más corto. Si no hay espacio, la operación se rechaza completa, libera sus recursos y explica que hay que añadir más video o cargar menos pistas. Los borradores anteriores mantienen sus velocidades guardadas; no se alteran decisiones existentes silenciosamente.

- [x] Eliminar aceleración automática durante subida.
- [x] Selector de audio y reproductor independiente con pausa, reproducción y búsqueda.
- [x] Velocidad por fragmento: 0,5 / 0,75 / 1 / 1,25 / 1,5 / 2 / 3 / 4 / 5×; 1× Original.
- [x] Cambiar velocidad conserva el intervalo de fuente; rechaza solapamientos y valores fuera de rango. Es reversible.
- [x] Mantener la transformación temporal compartida con transcripción y exportación; avisar que se debe sincronizar de nuevo al editar velocidad.
- [x] Corregir volumen global de SFX en B-roll, teclado y hook; preview respeta volumen individual y Zentry resuelve el sonido predeterminado de su registro.
- [x] Corregir «Corte seco / Ninguno»: no hace fundido en preview ni render. Corregir fallback de Fundido Suave en el render.
- [x] Guardar/recuperar sombra, animación pop y volumen original en borrador e historial.
- [x] Retirar B-roll automático del transcript anterior al sincronizar nuevamente; regenerar desde el nuevo audio y conservar texto editado manualmente.
- [ ] Resolver qué hacer cuando el audio completo excede la duración del video: se preguntó si ampliar el montaje o recortar la cola. Sin esa elección no se prolonga ni recorta silenciosamente.
- [ ] Unificar todas las transiciones por grupo: la opción global Giro 3D no tiene correspondencia completa en B-roll personalizado; slide-up/down están tipadas pero sin rama de transformación en CustomBrollLayer.
- [ ] Mejorar exactitud lingüística en audio musical. La prueba de dos MP3 produjo solo el grupo «Ya!». No demuestra transcripción completa del canto.

Pruebas en navegador: dos MP3 reales quedaron en 0–5 y 5–10 s con velocidad 1×; reproductor independiente `readyState=4`, reproducción activa a 1×. 1,5× reduce el segundo a 3,33 s y 1× recupera 4,99 s. Prueba a 5× en un fragmento anterior: duración 1 s y playbackRate=5. Intento de bajar a 1× sin espacio rechazado sin modificar la pista. TypeScript, build y pruebas de intervalos aprobaron. Evidencia: `VALIDACION_AUDIO_ORIGINAL_2026-10-01.jpg`. No se declara probada cada combinación de todos los presets ni se realizó una exportación nueva en esta segunda revisión.

Prueba adicional aprobada: nueva sincronización 2/2 elimina los B-roll automáticos anteriores aunque no genere nuevos eventos. Se restauró después la edición previa con 14/14 mediante Deshacer; mantiene sus velocidades antiguas (1,19×) hasta que el usuario escoja extender el montaje o recortar de forma explícita.

## Actualización 01/10/2026 — revisión y correcciones de audio

Esta sección prevalece sobre las conclusiones históricas siguientes. Una exportación al 100 % no demuestra por sí sola exactitud de Whisper ni sincronía de cada palabra.

- [x] CR-01: velocidad explícita compartida entre reproducción, subtítulos y Remotion.
- [x] CR-02: transcribir únicamente las muestras audibles después de recortar/dividir.
- [x] CR-04: limitar duración numérica por fuente, siguiente audio y final del video.
- [x] CR-05: guardar música, fuentes locales y audio procesado en IndexedDB; recuperar el borrador con sus medios.
- [x] CR-06: actualizar todas las frases intersectadas en B-roll/motion y limpiar texto generado sin voz; respetar texto manual.
- [x] CR-07: mantener correspondencia entre forma de onda válida y clip transcrito, incluso al omitir archivos vacíos.
- [x] CR-08: bloquear cargas simultáneas y conservar límite de 14.
- [x] CR-09: liberar medios sin referencias respetando Deshacer/Rehacer.
- [x] Corrección adicional: exportar intervalos de audio separados al eliminar silencios, con desplazamiento correcto de la fuente.
- [x] Corrección adicional: no revocar medios activos cuando StrictMode/Fast Refresh repite efectos.
- [x] CR-03: endurecer los scripts SQL locales (identidad, propietario/admin, search_path y permisos).
- [ ] CR-03: comprobar y desplegar funciones en Supabase remoto. El conector denegó acceso al proyecto real; no se modificaron cuentas mediante otra vía.

Pruebas realizadas: 14 MP3 reales `corte_000`–`corte_013`, video `Jose1998videoprueba.mp4`; sincronización completada con 29 grupos. Recuperación tras recarga: 14 pistas presentes, autoguardado correcto. Campo duración de la primera pista: introducir 8 s conserva 4,2 s por límite del vecino. Reproducción HTML observada a 1,191×, igual a la velocidad usada en el remapeo de palabras. Pruebas matemáticas automatizadas de 14 pistas, cortes, eliminación, compatibilidad y exportación con silencios aprobadas.

El primer intento de render falló por archivos liberados durante la actualización del código; se corrigió su ciclo de vida y se repitió desde una carga nueva. El resultado final del MP4 se registra en Soluciones y validación. Quedan fuera de esta validación la ausencia absoluta de errores, la precisión lingüística palabra por palabra y el saneamiento completo de las incidencias ESLint históricas.

- [x] Exportación final local al 100 %: MP4 1080×1920, 58,816 s; reproducción comprobada hasta 53,19 s sin error del elemento multimedia. Captura `VALIDACION_EXPORTACION_2026-10-01.jpg`.
- [ ] Precisión lingüística: persisten palabras mal reconocidas; requiere referencia manual y evaluación de un modelo más preciso. No confundir 14 pistas procesadas con reconocimiento perfecto.
- [ ] Copia del MP4 en disco: enlace disponible, pero el control automatizado de descarga no devolvió confirmación. Se dejó la pestaña abierta para el usuario.

**Fecha:** 2026-09-20  
**Archivo de prueba disponible:** `kit infantiles.mp4`  
**Alcance:** pantalla pública, autenticación, controles del editor por inspección de flujos, transcripción, subtítulos, B-roll, motion graphics, SFX y exportación Remotion.

## Resultado general

La compilación de TypeScript y el build de producción son correctos. La página pública funciona y los botones de acceso abren el formulario correspondiente. Se encontraron cinco defectos funcionales en la ruta de edición/render; todos fueron corregidos en esta intervención y están detallados en el documento de soluciones.

## Pruebas realizadas

| Prueba | Resultado | Evidencia |
|---|---|---|
| TypeScript | Aprobada | `npx tsc --noEmit` sin errores después de las correcciones. |
| Build de producción | Aprobado | `npm run build` completó las 5 fases de Vinext. |
| Inicio de servidor | Aprobado | `http://localhost:3000/` respondió correctamente. |
| Navegación pública | Aprobada | Chromium cargó la página con título `Zentry Studio — VIP Suite Activa`. |
| Botones de acceso | Aprobados | Se verificaron 13 botones públicos; “Iniciar Sesión” abre el modal con email y contraseña. |
| Recursos durante apertura del modal | Aprobados | No hubo respuestas HTTP fallidas en esa interacción. |
| Caso de subtítulos de `kit infantiles` | Aprobado | Script de continuidad confirmó texto sincronizado durante los intervalos B-roll definidos. |
| Recursos SFX | Aprobado anteriormente y reconfirmado por rutas | Las rutas estáticas usadas por presets existen en `public/`. |

## Errores encontrados y corregidos

### AF-01 — “A todos” no aplicaba la plantilla visual real a los subtítulos

**Impacto:** alto. El botón cambiaba fuentes/colores generales, pero no instanciaba los componentes de las 8 plantillas Zentry para cada fragmento de la transcripción. El editor podía parecer correcto por el estilo base, pero no entregaba el diseño seleccionado como capa real en el MP4.

**Causa:** la rama `mode === 'all'` de `applyZentryTemplate()` terminaba antes de crear items de categoría `subtitles`.

**Estado:** corregido. Ahora se crea un item de plantilla por grupo real de cuatro palabras, con el texto y rango temporal de Whisper.

### AF-02 — Los B-roll de las plantillas Zentry perdían la referencia de la plantilla

**Impacto:** alto. Al pulsar una plantilla de B-roll se aplicaban colores y transiciones antiguas, pero el objeto no guardaba `templateId`. Por ello no podía resolver el componente visual del catálogo Zentry ni su efecto de sonido asociado al renderizar.

**Estado:** corregido. Los B-roll nuevos y los actualizados guardan identificador de plantilla, variante tipográfica y la preferencia de SFX.

### AF-03 — Los B-roll de vídeo normales ocultaban subtítulos reales

**Impacto:** alto. Pexels, vídeo local e imagen B-roll no aportan necesariamente texto de reemplazo, pero `CaptionLayer` ocultaba subtítulos para cualquier B-roll manual. Había voz sin subtítulo durante esos bloques.

**Estado:** corregido. Solo los B-roll con plantilla tipográfica de pantalla completa ocultan el subtítulo base. B-roll de vídeo/imágenes mantienen los subtítulos reales sobre el metraje.

### AF-04 — La exportación ignoraba el resultado de compatibilidad de WebCodecs

**Impacto:** medio. Se llamaba a `canRenderMediaOnWeb()` pero no se validaba su resultado. En navegadores sin WebCodecs/MP4 compatible, el usuario recibía un error tardío y poco explicativo.

**Estado:** corregido. Se detiene antes del render e informa los motivos de compatibilidad devueltos por Remotion.

### AF-05 — El contrato TypeScript de B-roll estaba incompleto

**Impacto:** medio. `CustomBrollItem` no declaraba los datos necesarios para plantilla, fuente y SFX; esto impedía que la integración de plantillas fuera verificable por TypeScript.

**Estado:** corregido. Se añadieron los campos opcionales al tipo y se validó con TypeScript.

### AF-06 — No se podía volver a escoger el mismo archivo de B-roll

**Impacto:** medio. Después de eliminar o reemplazar un B-roll, volver a seleccionar exactamente la misma imagen podía no disparar `onChange` del selector de archivos. El usuario recibía la impresión de que el botón de B-roll no funcionaba.

**Causa:** a diferencia del selector de vídeo principal, el selector de imagen B-roll conservaba el valor del archivo anterior.

**Estado:** corregido. El selector se restablece justo después de leer el archivo, por lo que el mismo recurso se puede añadir de nuevo cuantas veces sea necesario.

### AF-07 — La plantilla B-roll no se renderizaba visualmente

**Impacto:** alto. Las plantillas B-roll se guardaban con `templateId` y su SFX se programaba, pero la composición no montaba `visualComponent`; el resultado enseñaba uno de los tres fondos genéricos en lugar de la plantilla seleccionada.

**Causa:** `CustomBrollLayer` usaba `brollStyle` como única decisión visual e ignoraba el componente resuelto desde el registro.

**Estado:** corregido. La composición resuelve el B-roll por `templateId`, monta su componente Remotion, sincroniza el texto con las palabras del intervalo y conserva la transición/SFX del item.

### AF-08 — Seis B-roll extraídos no estaban disponibles en la aplicación

**Impacto:** alto. `Zentry_Video8_Broll` estaba extraído en el proyecto con seis composiciones (Center Keyword, Corner Label, Step, Stat, Callout y Quote Stack), pero ninguna estaba registrada, por lo que no podía seleccionarse ni llegar a Remotion.

**Estado:** corregido. Las seis composiciones se añadieron al registro central. El catálogo de B-roll pasa de 3 a 9 plantillas funcionales. Reutilizan los tres SFX B-roll existentes y verificados, evitando referencias de audio inexistentes.

### AF-09 — Tres plantillas de subtítulos podían mostrar texto de demostración

**Impacto:** alto. Clean Editorial, Yellow Bubble Pro y Gradient Editorial recibían el texto real en `customProps.text`, pero `resolveText()` daba prioridad a `top/main` procedentes de `defaultProps`. La animación funcionaba, aunque el contenido podía seguir siendo el ejemplo del catálogo.

**Estado:** corregido. `text` sincronizado tiene ahora prioridad y se divide en dos líneas cuando contiene más de dos palabras. Los ocho componentes mantienen sus efectos por frame mediante `ReferenceTextAnimation` o `useCurrentFrame`.

### AF-10 — Los efectos contextuales no eran aleatorios

**Impacto:** medio. B-roll y motion graphics elegían sonidos con `índice % biblioteca`, produciendo siempre la misma secuencia predecible.

**Estado:** corregido. Cada entrada selecciona un SFX aleatorio de su biblioteca y evita repetir inmediatamente el sonido anterior de la misma categoría. Los eventos se almacenan antes del render, por lo que la exportación conserva exactamente la selección escuchada en el proyecto.

### AF-11 — El teclado no sonaba en B-roll manual ni en plantillas

**Impacto:** alto para el acabado solicitado. El teclado solo se programaba sobre los eventos B-roll automáticos; las nueve plantillas y los B-roll colocados manualmente quedaban fuera.

**Estado:** corregido. Cada B-roll manual/plantilla obtiene golpes de teclado mecánico sincronizados con palabras reales de sus captions. Se conserva el control “Sonido de escritura” para activarlo o desactivarlo.

### AF-12 — “En posición” reemplazaba el subtítulo seleccionado

**Impacto:** medio. Después de crear un clip, el siguiente clic sobre “En posición” podía actualizar el clip seleccionado en lugar de crear otro, haciendo que parecieran faltar plantillas.

**Estado:** corregido y validado en navegador. Las plantillas de subtítulos ignoran la selección previa en esa acción y siempre crean una nueva capa en el intervalo de la frase activa. La prueba con las ocho plantillas produjo ocho clips independientes.

## Inventario de paquetes y recursos

- No se encontró ningún archivo comprimido (`.zip`, `.rar`, `.7z`, `.tar` o `.gz`) dentro de los paquetes de Zentry; no fue necesario descomprimir ni borrar archivos.
- El registro contiene 56 plantillas: 8 subtítulos, 6 hooks, 9 B-roll, 6 motion graphics y 27 animaciones tipográficas.
- Se verificaron 23 previews de categorías y 50 referencias SFX del mapa central contra `public/`: faltantes **0**. Además existen previews de las 27 tipografías en ambas variantes Montserrat y Playfair.

## Verificación de seguimiento — sesión iniciada por el usuario

El 2026-09-20 se probó el flujo completo en un navegador visible conectado a `http://localhost:3000/`, con la sesión VIP ya iniciada por el usuario. No se automatizó el ingreso de credenciales.

Se ejecutaron las comprobaciones de producción:

| Prueba | Resultado |
|---|---|
| Servidor local | Disponible en `http://localhost:3000/`. |
| Soporte público y modal de acceso | Carga correcta; los botones públicos y el modal siguen disponibles. |
| Validación de entrada Whisper | `/api/whisper-model?model=invalid` devuelve 400 correctamente. |
| Selector de B-roll repetido | Corregido por código y cubierto por TypeScript/build. |
| TypeScript posterior a AF-06 | Aprobado: `npx tsc --noEmit`. |
| Build posterior a AF-06 | Aprobado: `npm run build`. |
| Build posterior a AF-07 y AF-08 | Aprobado: TypeScript y las 5 fases de Vinext completaron correctamente. |
| Texto real en las 8 plantillas de subtítulos | Aprobado en navegador: se crearon 8 clips independientes con texto de Whisper y animación visible. |
| SFX aleatorio B-roll/motion | Aprobado: 4 eventos contextuales visibles en el panel de audio, sin errores de reproducción. |
| Teclado en B-roll manual/plantilla | Aprobado: el control “Sonido de escritura” quedó activado y usa `keyboard-mechanical.wav`. |
| Exportación | Aprobada: descarga MP4 completada y validada con pista AVC de vídeo y AAC de audio. |

### Evidencia de la sesión real

- `kit infantiles.mp4` fue subido y transcrito localmente: 19 grupos de captions, duración aproximada 25,3 s.
- Se aplicaron subtítulos, hook, B-roll, motion graphic y tipografía; el contador de overlays de error fue 0 y la consola del navegador no reportó errores.
- Se detectó y corrigió durante la prueba el problema por el que “En posición” reemplazaba el clip seleccionado. Ahora cada pulsación crea un nuevo subtítulo en el intervalo activo.
- Exportación autorizada completada: `kit-infantiles-zentry-verificado.mp4`, 25,685 s, 19.993.359 bytes, vídeo AVC y audio AAC. El crédito pasó de 992 a 991.

## Hallazgo no bloqueante pendiente

1. **Tamaño de bundle.** El build advierte chunks superiores a 500 KB. No rompe la app, pero puede retrasar la primera carga en conexiones lentas.

## Matriz de botones revisados

| Área | Estado |
|---|---|
| Inicio / Editor VIP | Navegación pública disponible. |
| Entrar / Iniciar sesión | Abre modal, con inputs de correo y contraseña. |
| Registrarse / 3 créditos | Disponible en el mismo modal; no enviado para no crear una cuenta de prueba. |
| Aplicar subtítulo a todos | Corregido y cubierto por TypeScript. |
| Aplicar subtítulo en posición | Conserva texto y duración reales de la frase activa. |
| Plantilla B-roll | Corregida: guarda componente y SFX reales. |
| Plantilla motion graphic | Ya usa secuencias locales y SFX en la composición. |
| Quitar/Sincronizar SFX contextual | Ya conserva la desactivación al exportar. |
| Exportar | Ahora valida compatibilidad antes de iniciar el render. |

## Prueba final recomendada con `kit infantiles.mp4`

1. Iniciar sesión en Zentry Studio.
2. Subir `kit infantiles.mp4`.
3. Esperar la transcripción y usar una plantilla de subtítulos con **A todos**.
4. Añadir un B-roll de vídeo y uno de plantilla Zentry; confirmar que el primero conserva subtítulos y el segundo muestra tipografía propia/SFX.
5. Añadir un motion graphic y activar SFX contextual.
6. Exportar y comparar los segundos 5–8, 12–15 y 20–23 con el canvas.

## Segunda fase — plantillas, personalización y botones

### AF-13 — Motion Graphic insertaba el MP4 de demostración

**Impacto:** alto. Los estilos 3D usaban el vídeo del catálogo como fondo de producción y las plantillas Zentry Motion se convertían a otra escena distinta.

**Estado:** corregido. Las seis plantillas Zentry Motion montan ahora su componente Remotion real. Los cuatro estilos 3D generan fondos, luces y profundidad con capas CSS animadas; no queda ninguna referencia de producción a `motion-3d/*.mp4`.

### AF-14 — Las plantillas B-roll parecían duplicadas

**Impacto:** medio. Seis plantillas diferentes reutilizaban `B01.mp4`, `B02.mp4` y `B03.mp4`, por lo que el catálogo mostraba tarjetas visualmente repetidas.

**Estado:** corregido. Se conectaron las seis vistas previas originales del paquete Video8. Las nueve rutas B-roll son ahora únicas y respondieron HTTP 200. Solo las tres plantillas declaradas de fondo completo sustituyen el fondo; las otras seis funcionan como overlays.

### AF-15 — Un único estilo y posición afectaban todos los subtítulos

**Impacto:** alto. Mover o cambiar el estilo base modificaba todos los grupos.

**Estado:** corregido. Cada grupo puede seleccionarse desde la transcripción o la pista CC, recibir un estilo diferente y moverse de forma independiente. Los overrides también se remapean al cortar silencios o segmentos antes de exportar.

### AF-16 — No existían plantillas personalizadas persistentes

**Impacto:** medio. Una combinación de fuente, color, tamaño, animación, sombra y posición no podía reutilizarse fielmente.

**Estado:** corregido. “Guardar como plantilla” conserva todos esos parámetros en almacenamiento local. Al volver a elegirla se restaura exactamente; guardar el mismo nombre reemplaza la versión anterior y elimina duplicados heredados.

### AF-17 — Algunos elementos no reaparecían tras actualizar

**Impacto:** alto. El guardado automático omitía `zentryItems`, B-roll, motion graphics y estilos por grupo.

**Estado:** corregido. El borrador guarda y restaura esas cuatro colecciones, además de los ajustes existentes.

### Verificación de botones y servicios

| Control | Resultado |
|---|---|
| Seleccionar grupo CC | Aprobado: 19 grupos detectados y el panel indicó “Grupo 1”. |
| Elegir estilo con grupo seleccionado | Aprobado: crea un override solo para ese grupo. |
| Guardar/aplicar/eliminar plantilla personalizada | Aprobado; persistencia y deduplicación activas. |
| Categorías Zentry | Aprobado: 8 subtítulos, 6 hooks, 27 tipografías, 9 B-roll y 6 motion. |
| Aplicar Motion | Aprobado: añadió un clip Zentry a la línea de tiempo y no creó vídeo `motion-3d`. |
| Previews B-roll | Aprobado: 9 rutas distintas, todas HTTP 200. |
| Buscar Pexels | Aprobado: el endpoint devolvió resultados verticales 1080×1920. |
| Subtítulos sobre Pexels | Aprobado por composición y preview: los B-roll de vídeo no ocultan `CaptionLayer`. |
| Actualizar / eliminar / duplicar clips | Conectados al estado seleccionado y cubiertos por TypeScript/build. |
| Servidor y build | HTTP 200, sin overlay; `npx tsc --noEmit` y las cinco fases del build aprobadas. |

Tras reiniciar el servidor, Supabase devolvió 401 al refrescar el perfil de la sesión existente. Es una respuesta externa de autenticación/permisos, no un error de render ni de los botones del editor; la interfaz siguió cargando sin overlay.

## Tercera fase — edición completa de B-roll y exportación final

### AF-18 — El B-roll no exponía todos sus atributos editables

**Impacto:** alto. La escena podía insertarse, pero no había una ruta completa para cambiar su tipografía, tamaño, efecto de texto, colores, fondo, sonido y volumen desde el editor.

**Estado:** corregido. Cada B-roll conserva esos campos de forma independiente. La vista previa y la composición exportada consumen el mismo estado; “Actualizar” actúa sobre el clip seleccionado y no sobre una selección anterior.

### AF-19 — Los SFX propios de B-roll no aparecían en la pista de audio

**Impacto:** alto. El sonido podía existir en la composición sin una representación verificable en el editor.

**Estado:** corregido. La pista de audio muestra marcadores para SFX manuales, contextuales, B-roll y Zentry. En la prueba final aparecieron siete marcadores después de personalizar el B-roll y ejecutar la sincronización viral.

### AF-20 — Proyectos antiguos podían restaurar subtítulos excesivamente grandes

**Impacto:** medio. Aunque el valor inicial nuevo era normal, un borrador previo con 112 px lo restauraba al abrir el editor.

**Estado:** corregido. El tamaño inicial es 72 px; los presets se limitan a 84 px y los borradores/estados históricos mayores de 84 px se normalizan a 72 px. La plantilla “Previon Viral” se guardó y probó a 64 px.

### Prueba funcional final con el video crudo

| Comprobación | Resultado |
|---|---|
| Carga y transcripción | 19 grupos de subtítulos generados. |
| Plantilla global de subtítulos | Aplicada con texto real y tamaño normal. |
| Hook y tipografía | Insertados en posiciones distintas. |
| B-roll de fondo completo | Insertado; tipografía, glow, colores, fondo y teclado mecánico editados. |
| Motion graphic | Insertado como componente real. |
| Elementos visuales en timeline | 22 elementos motion/Zentry visibles. |
| SFX en timeline | 7 marcadores visibles tras sincronización. |
| Plantilla personalizada | “Previon Viral” guardada una sola vez y reutilizable. |
| Catálogo Pexels | 12 resultados disponibles y botones “Superponer Aquí” operativos. |
| Overlay de error | 0. |
| Exportación | Aprobada: `kit-infantiles-zentry-personalizado.mp4`. |

El archivo final tiene 19.131.088 bytes y 25,685 s. Mediabunny confirmó MP4 vertical 1080×1920, vídeo AVC y audio AAC estéreo a 48 kHz.

## Cuarta fase — eliminación de B-roll duplicados

### AF-21 — Plantillas y clips B-roll duplicados

**Impacto:** medio. Los tres fondos completos también aparecían en el catálogo Zentry y una doble pulsación podía crear dos clips idénticos en el mismo intervalo.

**Estado:** corregido.

- Los fondos Blanco, Rojo y Negro se muestran una sola vez en el panel B-roll.
- Las versiones históricas permanecen resolubles para no romper proyectos guardados, pero ya no aparecen duplicadas en el catálogo.
- El catálogo Zentry B-roll muestra seis plantillas adicionales únicas.
- Las inserciones y restauraciones se deduplican por recurso/plantilla, inicio y duración.
- El mismo B-roll sigue pudiendo reutilizarse legítimamente en otro segundo del video.

**Prueba:** se pulsó dos veces “Fondo Blanco” en 5,0 s. El resultado fue un B-roll en el inspector y un clip en la línea de tiempo. El editor terminó con 19 grupos CC, 4 marcadores de audio y 0 overlays de error.

**Exportación:** `kit-infantiles-zentry-sin-duplicados.mp4`, 18.073.177 bytes, 25,685 s, 1080×1920, AVC/AAC estéreo a 48 kHz.

## Quinta fase — edición individual, plantilla dual y exportación de Jose1998videoprueba

### AF-22 — Los ajustes de subtítulos no seguían al grupo seleccionado

**Impacto:** crítico. Elegir una línea de subtítulos no permitía cambiar únicamente su fuente, tamaño, color, animación, alineación, sombra o posición.

**Estado:** corregido. Los controles de diseño leen y escriben el override del grupo activo. En la prueba, el grupo 2 conservó Poppins, 54 px, color rojo y animación pop desactivada después de seleccionar otro grupo y volver.

### AF-23 — Faltaba una plantilla real de doble tipografía

**Impacto:** alto. No era posible reproducir la composición solicitada de letra manuscrita arriba y serif editorial abajo.

**Estado:** corregido. Se añadieron `dualFontEnabled`, `topFontFamily` y `bottomFontFamily` al estado global, a los overrides por grupo, al autoguardado y a la composición Remotion. Se guardó desde la interfaz la plantilla **Historia Editorial Doble**, con Great Vibes arriba y Playfair Display abajo.

### AF-24 — Guardar una plantilla dependía de `window.prompt`

**Impacto:** alto. El navegador integrado devuelve `prompt() is not supported`, por lo que el botón no guardaba nada.

**Estado:** corregido. Se sustituyó por un diálogo accesible propio con nombre, Guardar y Cancelar. La prueba confirmó una sola plantilla guardada y cierre correcto del diálogo.

### AF-25 — Los B-roll automáticos eran una vista calculada, no clips editables

**Impacto:** crítico. No podían personalizarse, actualizarse o eliminarse como elementos reales.

**Estado:** corregido. Los eventos automáticos se materializan como `CustomBrollItem`, aparecen en inspector y línea de tiempo y conservan tipografía, estilo, efecto, SFX, volumen y transiciones. La prueba mostró siete controles de actualizar/eliminar; tras confirmación del usuario se eliminó uno y el contador pasó de 7 a 6.

### AF-26 — El overlay Film Burn bloqueaba la exportación

**Impacto:** crítico. El primer intento terminó con `delayRender()` agotado al extraer el fotograma 0,1 de `film-burn.mp4`.

**Estado:** corregido. Los overlays Film Burn, Fireflies, Flash y Glitch se renderizan ahora como efectos CSS deterministas cuadro a cuadro, sin decodificar MP4 auxiliares. La segunda exportación superó ese punto y llegó al 100 %.

### Evidencia funcional con `Jose1998videoprueba.mp4`

| Comprobación | Resultado |
|---|---|
| Carga/transcripción | 42 grupos, 58,77 s. |
| Edición individual | Grupo 2 persistió Poppins, 54 px, rojo y pop desactivado. |
| Plantilla personalizada | `Historia Editorial Doble`, Great Vibes + Playfair Display. |
| B-roll automático | 7 clips editables; eliminar redujo correctamente a 6. |
| Diseño de B-roll | Fuente, fondo, glow, teclado, entrada/salida y volumen editables. |
| Catálogo Zentry | 8 subtítulos, 6 hooks, 27 tipografías, 6 B-roll y 6 motion. |
| SFX contextual | 10 eventos activos, variados y sin repetición consecutiva; catálogo de 36 sonidos. |
| Línea de tiempo | 6 B-roll, 3 capas motion/Zentry y 20 marcadores de audio durante la prueba. |
| Silencios | 2 pausas detectadas; 1,0 s reducible al exportar. |
| TypeScript/build | `npx tsc --noEmit` y las cinco fases de `npm run build` aprobadas. |
| Exportación | 100 %, MP4 1080p VIP sin marca de agua; crédito 986 → 985. |

**Archivo descargado por el navegador:** `Jose1998videoprueba-1080p.mp4`.

### AF-27 — Pexels podía dejar el panel B-roll en HTTP 500

**Impacto:** medio. Cuando la clave no está configurada o el servicio remoto no responde, el catálogo en vivo quedaba vacío y el servidor registraba error 500.

**Estado:** corregido. La ruta `/api/pexels` conserva los resultados remotos cuando están disponibles y devuelve HTTP 200 con cinco recursos locales verticales compatibles cuando Pexels falla. El botón sigue mostrando tarjetas utilizables y la respuesta incluye `fallback: true` y una advertencia visible para diagnóstico.

**Prueba:** `GET /api/pexels?query=tecnologia&per_page=12` respondió 200 con cinco vídeos 1080×1920 locales de respaldo.

## Ampliación de auditoría — 22/09/2026: formatos y Marca personal

Esta sección documenta pruebas nuevas; no convierte las afirmaciones históricas anteriores en una certificación de todos los botones. El seguimiento de tareas abiertas está en `PLAN_VERIFICACION_FUNCIONAL_2026-09-22.md`.

### AF-28 — La proporción original dependía de la vista previa

**Riesgo:** exportar inmediatamente después de la carga podía usar el valor inicial 1080×1920 antes de recibir el evento `loadedmetadata` de la vista previa, aun si la fuente era horizontal.

**Solución:** leer ancho y alto del archivo durante `beginVideo()` con Mediabunny y un fallback del video nativo; iniciar cada proyecto en «Original». La pantalla de procesamiento muestra Vertical, Horizontal o Cuadrado según la fuente.

| Fuente de prueba | Selector | Metadatos del MP4 generado | Resultado |
|---|---|---|---|
| 1280×720, 10 s | Original | 1920×1080, 10,048 s | Aprobado, 16:9. |
| 720×1280, 10 s | Original | 1080×1920, 10,048 s | Aprobado, 9:16. |
| 720×1280, 10 s | 1:1 | 1080×1080, 10,048 s | Aprobado, salida cuadrada manual. |

Los tres renders llegaron al 100 % en el navegador y se descontó un crédito por cada uno (997→994). La lectura de dimensiones proviene del elemento de video del MP4 renderizado (`readyState: 4`), **no** del nombre sugerido para la descarga.

**Pendiente:** el enlace `blob:` no creó un archivo comprobable en Descargas dentro del navegador integrado; tampoco se inspeccionaron los fotogramas exportados. No debe interpretarse el resultado como descarga local o calidad visual certificadas.

### AF-29 — Marca personal solo permitía una plantilla

**Solución:** colección de máximo tres plantillas asociada al ID de usuario en almacenamiento local del navegador. Se conserva/migra la plantilla previa, se incluye «Zentry Viral» para cuentas nuevas y se permite guardar con nombre, aplicar, actualizar, elegir predeterminada y eliminar. Un proyecto nuevo sin borrador carga la predeterminada tras la transcripción.

**Prueba:** se guardó «Marca Personal Pro» como segunda plantilla y se estableció como predeterminada. En 3/3 el botón Guardar quedó inhabilitado. La tercera plantilla temporal se eliminó; después de recargar la app y reabrir el proyecto, seguían las dos plantillas y «Marca Personal Pro» predeterminada.

**Límite conocido:** las plantillas no se sincronizan entre navegadores/dispositivos. Tampoco se ha comprobado visualmente la reaplicación exacta a un proyecto sin borrador previo.

## Ampliación de auditoría — 23/09/2026: B-roll, música y controles de producción

Esta ampliación corresponde a `Jose1998videoprueba.mp4` (58 s en el editor). Corrige una afirmación histórica: el usuario confirmó que el botón **Descargar MP4 generado sí descarga**; la imposibilidad de localizar el archivo en Descargas dentro de una prueba anterior del navegador integrado no era un fallo demostrado del producto.

### AF-30 — Texto B-roll estático o ausente

**Causa:** el exportador imprimía el titular completo del B-roll de imagen/video incluso cuando había palabras transcritas; a la vez, `CaptionLayer` ocultaba esos subtítulos porque un evento automático antiguo seguía cubriendo el intervalo del B-roll editable. La vista previa también ocultaba la capa por `activeBroll`.

**Corrección:** el titular independiente solo se usa si no hay palabras habladas. Si existe un B-roll editable, los eventos automáticos solapados no suprimen sus subtítulos. La vista previa vuelve a dibujar el texto sobre la imagen; las imágenes conservan movimiento cuadro a cuadro en Remotion.

### AF-31 — Plantillas históricas B-roll no visibles

**Causa:** tres plantillas originales (`broll_top`, `broll_center`, `broll_bottom`) se habían ocultado del catálogo. Las tres tarjetas Blanco/Rojo/Negro seguían presentes, pero no daban acceso a aquellos componentes.

**Corrección:** la sección «✦ PLANTILLAS B-ROLL (FONDO COMPLETO)» conserva las tres tarjetas y ahora expone también las nueve plantillas originales del registro central (tres históricas y seis adicionales), además de las plantillas personales guardadas. Se restauró a la vista el botón «IA: sugerir B-roll para esta frase».

### AF-32 — Fuente y colores de B-roll no se aplicaban de extremo a extremo

**Causa:** la previsualización de subtítulos sobre B-roll de imagen/video tomaba el estilo global. Dos fondos completos forzaban Anton en la palabra destacada. Los seis componentes B-roll del paquete original tenían fuentes y colores literales, por lo que ignoraban el inspector al exportar. El selector de color nativo no era fiable durante la prueba automatizada.

**Corrección:** los subtítulos de B-roll usan fuente, tamaño, color y acento del clip; los componentes Remotion originales reciben esas propiedades; se añadió entrada hexadecimal junto a cada selector de color. La selección de otra plantilla reinicia su doble tipografía y colores base para evitar arrastrar el diseño previo. Los controles de efecto de texto y transición siguen presentes.

**Prueba en navegador:** en un B-roll automático se cambiaron tipografía y color; `#ffcc00` apareció en los subtítulos de la vista previa. En Center Keyword, Pacifico y blanco aparecieron sobre el fondo rojo. La selección de una plantilla guardada sustituyó al B-roll del mismo intervalo sin subir de 7 clips.

### AF-33 — Faltaba pista de música subida por el usuario

**Corrección:** subida de MP3/WAV/M4A/AAC/OGG a una única pista de música con inicio, duración y volumen editables; la pista es independiente de SFX y se incluye en la composición exportable. Subir otra pista reemplaza la anterior en vez de apilarla. Se remapea el intervalo si se aplican cortes de silencios.

**Prueba en navegador:** `keyboard-mechanical.wav` se cargó como audio de prueba. Se observaron dos filas distintas: SFX a 732 px y música a 768 px, ambas de 36 px, con un solo clip en la fila de música.

**Límite conocido:** el audio subido vive en la sesión actual del navegador. No se guarda el contenido del archivo en el borrador local; tras recargar la página hay que volver a adjuntarlo. No se simula persistencia de un archivo de hasta 50 MB en `localStorage`.

### AF-34 — Aviso modal bloqueante al aplicar o actualizar

**Corrección:** el modal grande permanece para procesamiento, errores y exportación terminada; los estados de éxito de acciones corrientes se descartan sin cubrir el editor.

**Prueba en navegador:** «Actualizar» dejó 0 `.job-backdrop` y 7 B-roll en la línea de tiempo. Eliminar un B-roll automático produjo 7→6; Deshacer restauró 6→7.

### AF-35 — Plantilla reutilizable Pacifico + Anton

Se añadió «Viral Pacifico + Anton» a las plantillas B-roll de esta cuenta, con primera línea que aparece y segunda que entra desde la derecha. La vista previa mostró Pacifico arriba y Anton abajo sobre fondo blanco. Se guardó además «Mi B-roll 2» desde el inspector; el panel indicó 2/3 plantillas. El guardado es local por cuenta/navegador, no sincronizado en la nube.

**Validación técnica inicial:** `npx tsc --noEmit` y `npm run build` aprobaron durante esta fase; el servidor respondió HTTP 200. El resultado de la inspección posterior del MP4 figura al final de esta ampliación. Continúa pendiente una auditoría manual exhaustiva de *todos* los botones no cubiertos aquí.

### AF-36 — La música local detenía el render

**Reproducción:** el primer intento con `keyboard-mechanical.wav` usado como pista musical llegó al 18 % y falló: `@remotion/media` no pudo extraer audio desde una URL `blob:` del navegador. No consumió crédito.

**Solución:** leer archivos de audio de hasta 50 MB como URL `data:` en el cliente, que también permite escucharlos en la vista previa. La repetición superó el 18 % y exportó con la pista musical presente.

### AF-37 — Un recorte guardado acortaba la exportación del video de prueba

El proyecto restaurado tenía la salida de su clip principal en **25,83 s**, aunque la fuente/transcripción llegaba a **58,77 s**. Por eso el primer MP4 exitoso de esta fase duró 25,834667 s; no era un fallo del selector de formato. Se corrigió la salida del clip desde el inspector a 58,77 s para la prueba de metraje completo.

### Resultado de exportación y límites de la auditoría

| Prueba | Resultado |
|---|---|
| Audio local `blob:` | Falló al 18 %; sin crédito consumido. |
| Audio local `data:` + recorte previo | MP4 de 25,834667 s, 1080×1920; crédito 992→991. |
| Clip completo, Pacifico/Anton y B-roll clásico | MP4 de 58,816 s, 1080×1920; crédito 991→990. |
| Render final con tipografía B-roll más legible | MP4 de 58,816 s, 1080×1920; crédito 990→989; vista previa al 100 %. |

En el MP4 final se inspeccionaron fotogramas del fondo blanco con doble tipografía alrededor de 5,2 s y de la plantilla clásica de fondo completo alrededor de 13,7 s; el contenido cambia entre el metraje y ambas escenas. El enlace «Descargar MP4 generado» permanece abierto en el navegador. Un clic automatizado no generó un archivo nuevo detectable en `C:\Users\jose1\Downloads`, por lo que **no se afirma haber guardado este MP4 en disco**; esto no contradice la confirmación del usuario de que la descarga funciona cuando la realiza desde su navegador.

`npx tsc --noEmit` y `npm run build` pasaron después de los cambios. El lint acotado a cinco archivos terminó con **60 errores y 20 advertencias**, principalmente deuda previa de `app/page.tsx`; por tanto, no se declara calidad de lint aprobada ni cobertura de todos los botones del proyecto.

## Revisión del 23/09/2026 — línea de tiempo, plantillas y duración

### AF-38 — Capas coincidentes se dibujaban una encima de otra

**Causa:** B-roll, motion y plantillas Zentry usaban una sola franja fija de 38 px aunque varios clips coincidieran en el tiempo; además la altura de las etiquetas no seguía la de las pistas.

**Solución:** asignación de carriles por intervalo, calculando también el ancho mínimo visible del clip. La altura de cada pista y de su etiqueta crece con el número de carriles. No se cambiaron los tiempos de las capas ni su orden de render.

**Prueba en vivo:** la pista de motion del proyecto pasó a 66 px para dos carriles. Los clips que visualmente se tocaban quedaron en coordenadas verticales distintas (649 y 679 px); la pista B-roll permaneció en 38 px al no haber solapamientos.

### AF-39 — Marca guardaba solo el aspecto global y no restauraba la edición

**Causa:** la estructura de plantilla excluía estilos por grupo, B-rolls, motion y plantillas Zentry. Los estilos por grupo existentes podían anular visualmente el estilo global aplicado.

**Solución:** las nuevas plantillas guardan capas editables y estilos por grupo, además del estilo global, sombra y animación. Al aplicar, reconstruyen las filas de la línea de tiempo; para otro video escalan los intervalos y adaptan los estilos a sus grupos. Se evita almacenar archivos `blob:`/`data:` como B-roll en la plantilla y se informa si el almacenamiento local no puede guardar. Las plantillas antiguas se identifican como «Solo estilo» y se pueden completar con «Actualizar con la edición actual».

**Prueba en vivo:** se guardó una plantilla temporal con 7 B-rolls y 3 capas motion/Zentry; se eliminó un B-roll (7→6), se aplicó la plantilla y reapareció (6→7). Después se retiró la plantilla temporal. «Mi estilo predeterminado» se actualizó conservando su estilo original y ahora muestra 7 B-rolls y 3 capas.

### AF-40 — Guardado y aplicación de estilo de subtítulos eran difíciles de comprobar

**Causa:** al aplicar una plantilla a «Editar todos», los estilos por grupo seguían teniendo prioridad; además, fuentes guardadas como `Montserrat, sans-serif` no coincidían con ninguna opción literal del selector y este mostraba Anton aunque se dibujara Montserrat.

**Solución:** aplicar a todos limpia las excepciones por grupo; el selector reconoce correctamente las fuentes con lista de respaldo. Guardar plantilla comprueba el almacenamiento antes de mostrar éxito y da una confirmación discreta.

**Prueba en vivo:** se guardó «Prueba subtítulos 23-09» con Pacifico y rojo; después de cambiar a Anton y verde, al aplicarla regresaron Pacifico y `#ff305f`. Se borró la plantilla temporal y permanece la plantilla del usuario «Historia Editorial Doble».

### AF-41 — Un video secundario se insertaba truncado a 60 s

**Causa:** `addSequentialClip` aplicaba `Math.min(60, measured)` incluso si el archivo duraba más. Un borrador antiguo con un solo segmento corto también podía volver a imponer ese recorte al cargar la fuente.

**Solución:** los clips añadidos usan su duración medida completa; la etiqueta del botón ya no promete un límite de 60 s. Los borradores nuevos registran si hubo recorte manual; un borrador antiguo de un solo clip, sin esa marca y más corto que la fuente, se recupera a la duración íntegra. Los recortes manuales nuevos se conservan.

**Prueba en vivo:** `Jose1998videoprueba.mp4` informa 58,77 s y 1080×1920; su único clip ocupa el 100 % de la pista y la regla termina en 0:58. No se cargó en esta revisión un segundo archivo de más de 60 s, por lo que esa ruta queda comprobada por código y build, no por reproducción UI. Tampoco se hizo una nueva exportación en esta revisión.

**Validación técnica:** `npx tsc --noEmit` y `npm run build` aprobaron. Sigue pendiente la auditoría exhaustiva de controles ajenos a estos cuatro fallos.

### AF-42 — B-roll, motion y plantillas se mezclaban sobre el mismo fotograma

**Reproducción:** en torno a 5,8 s de `Jose1998videoprueba.mp4`, el B-roll de fondo (4,2–7,4 s) coincidía con «Hero Split» (5,8–8,8 s). El editor mostraba los dos y también podía añadir subtítulos normales encima. La separación en carriles de la línea de tiempo no había corregido la composición visual.

**Solución:** selector único de escena activa compartido por vista previa y composición Remotion. Conserva todos los clips editables en la línea de tiempo, pero dibuja un solo B-roll/motion/Zentry por instante. Los B-roll automáticos ceden a una plantilla manual; entre elementos manuales prevalece el que entra más tarde. La capa normal de subtítulos y el overlay global no se apilan sobre una plantilla Zentry activa. Los subtítulos siguen disponibles sobre B-rolls de video o imagen que los necesitan.

**Prueba en vivo:** tras recargar el proyecto, en el cruce se observaron únicamente el video base y un contenedor de plantilla (`.phone-canvas > *`), sin contenedor B-roll adicional. La escena «Hero Split» quedó visible y el B-roll automático siguió en la línea de tiempo para editarlo. No se hizo un nuevo MP4 en esta revisión.

### AF-43 — El volumen del audio subido no era visible hasta cargar un archivo

**Solución:** control «Volumen del audio subido» siempre visible, de 0 a 100 %, con paso de 1 %. El valor elegido antes de cargar se usa como volumen inicial; después de subirlo ajusta la pista al instante. La vista previa y la composición usan ese volumen de pista.

**Prueba en vivo:** se fijó 12 %, se cargó `keyboard-mechanical.wav`, la pista apareció en la línea de tiempo y el control conservó 12 %. Después de la carga se bajó a 5 %. Se retiró el WAV de prueba y se devolvió el control a 35 % para no alterar el audio final del proyecto.

**Validación técnica:** `npx tsc --noEmit` y `npm run build` aprobaron. Sigue pendiente inspeccionar un MP4 nuevo de esta combinación en una exportación posterior.

### AF-44 — La recarga podía volver a generar B-roll sobre una edición restaurada

**Causa:** al terminar la transcripción, la restauración del borrador consultaba `videoFile` del render anterior. Durante la primera carga este valor podía ser `null` aunque `sourceFile` ya estuviera disponible. El efecto de B-roll automático consideraba entonces que aún no había materializado sus sugerencias y las insertaba de nuevo, desplazando o sustituyendo clips editados. La misma carrera afectaba a una plantilla personal con capas aplicada por defecto.

**Solución:** la restauración y la aplicación inicial de Marca marcan como procesado el archivo real que se está transcribiendo. Las capas guardadas siguen siendo las autoritativas; la generación automática solo actúa cuando no hay una restauración con B-roll.

**Validación:** TypeScript y build aprobaron tras la corrección. La ruta de recarga de una edición manual anterior no se pudo demostrar de nuevo en navegador porque el borrador abierto ya mostraba los siete B-roll automáticos tras la carrera previa; queda pendiente probar persistencia de un B-roll manual recién editado a través de una nueva carga. No se exportó un MP4 nuevo.

### AF-45 — «Hero Split» duplicaba una frase corta en dos líneas

**Causa:** para grupos de cuatro palabras o menos, el título recibía las cuatro y el subtítulo volvía a recibir el texto completo. La plantilla parecía una segunda máscara superpuesta aunque provenía de un único clip.

**Solución:** las nuevas inserciones reparten la frase entre ambas líneas. Al dibujar un clip antiguo con título y subtítulo idénticos, la vista previa y Remotion los separan sin alterar los datos guardados.

**Prueba en vivo:** se volvió a cargar y transcribir `Jose1998videoprueba.mp4`. Al seleccionar «Hero Split» en 5,8 s, la vista mostró una línea blanca y otra magenta con partes distintas de la frase, sin el B-roll blanco simultáneo. TypeScript y build aprobaron. El MP4 posterior a este ajuste sigue pendiente.

## Octava fase — paquete automático, corte y música editable (24/09/2026)

### AF-46 — Los cinco botones del Pack Zentry parecían no aplicar nada

**Causa:** al elegir Viral, Clean, Luxury, Neon o Bold se seleccionaba el pack, pero el cambio real dependía de pulsar otro botón. La generación anterior solo ajustaba rasgos globales, sin crear una escena motion ni conectar el aspecto de los B-roll automáticos existentes. Los estilos particulares de grupos podían tapar el nuevo estilo.

**Solución:** cada botón aplica inmediatamente hook, subtítulos, SFX, B-roll y motion sincronizados. La generación reemplaza únicamente elementos anteriores del mismo pack y busca huecos libres para no superponer nuevas escenas. Se actualiza el aspecto de los B-roll automáticos; las escenas manuales se preservan.

**Prueba en vivo:** con `Jose1998videoprueba.mp4`, pulsar Clean cambió el estilo activo a Minimal Clean, la animación global y la vista previa, y mostró «7 B-roll y 1 motion» en la línea de tiempo. Deshacer devolvió el estilo Editorial Story previo. No se exportó este pack a MP4 en esta fase.

### AF-47 — Cortar y borrar video dejaba duración/capas incoherentes

**Causas:** al cortar podía tener prioridad un B-roll o motion seleccionado en lugar del clip de video; la eliminación podía apuntar a una selección residual. «Deshacer» recuperaba el segmento, pero no la duración total, por lo que una pista de 58 s podía mostrarse como 10 s. Las capas posteriores al metraje borrado no seguían el desplazamiento temporal.

**Solución:** selección exclusiva por tipo de pista, corte del objeto seleccionado, pausa de los reproductores antes de retirar un segmento, recálculo de duración en Deshacer/Rehacer y desplazamiento/recorte de B-roll, motion, plantillas, grupos de subtítulos, música y SFX contextuales al eliminar metraje. Los recursos locales del clip se conservan durante la sesión para que Deshacer pueda restaurarlos. Eliminar un clip ya no crea dos puntos de Deshacer.

**Prueba en vivo:** a 26 s se cortó el video en dos y se eliminó el fragmento derecho: la duración bajó de 58 s a 26 s y desaparecieron los B-roll que solo existían después del corte. Un Deshacer restauró el segundo fragmento y las capas; otro deshizo el corte. La regla volvió a 0:58. También se probó el corte a 10 s: la regla terminó en 0:10 y solo quedó el primer segmento en la pista. No se renderizó MP4 tras esta corrección.

### AF-48 — Música fija y no divisible

**Causa:** la música se representaba como un único intervalo global sin controles independientes de arrastre y corte.

**Solución:** clips de música editables en su pista, con posición, bordes, volumen, corte y eliminación por fragmento; los intervalos se envían también a Remotion como secuencias independientes. El arrastre evita invadir otro fragmento; Deshacer conserva los clips en memoria.

**Prueba en vivo:** se subió `scratch/descarga1_audio.mp3`, se acortó a 15 s, se arrastró de 0 s a 17,9 s, se dividió a 26,4 s (dos fragmentos) y se borró solo el derecho (quedó uno). Después se retiró el audio de prueba. La pista SFX permaneció separada. Un intento de corte fuera del fragmento produjo el aviso correcto y no alteró el audio.

**Estado:** `npx tsc --noEmit` y `npm run build` pasan; consola del navegador sin errores durante estas pruebas. La exportación MP4 de música dividida y una auditoría botón por botón de todos los paneles siguen pendientes. No se inspeccionó ni copió código privado de CapCut; se usó únicamente su comportamiento público como referencia de interacción.

## Novena fase — SFX, duración del hook y Pexels (24/09/2026)

### AF-49 — Los efectos de sonido de la pista ♪ no se podían mover

**Causa:** los marcadores solo tenían acción de selección/búsqueda; no había un tiempo editable independiente del B-roll, evento contextual o plantilla que originó el sonido.

**Solución:** arrastre horizontal y campo numérico «Inicio del efecto de sonido» en Audio. Se guarda la nueva posición en borrador y Deshacer/ Rehacer; vista previa y composición de exportación usan el mismo tiempo. Los sonidos de B-roll o Zentry desplazados se reproducen como secuencias independientes para no sonar dos veces.

**Prueba en vivo:** el sonido del B-roll automático 2 se desplazó de 11,4 a 15,1 s y el campo Audio y marcador reflejaron 15,1 s. Deshacer restauró 11,4 s. **Pendiente:** escuchar un MP4 nuevo con SFX desplazado.

### AF-50 — El hook se ocultaba antes de acabar su duración

**Causa:** la vista previa y Remotion lo ocultaban en cuanto comenzaba cualquier B-roll/motion/Zentry, incluso si la duración principal seguía activa.

**Solución:** el hook se dibuja según sus duraciones de línea superior y principal, sin depender de otra escena visual.

**Prueba en vivo:** duración principal temporal de 8 s: texto visible a 4,2 s sobre B-roll y a ~6 s sobre Hero Split; ausente a ~8,5 s. Se devolvió la duración original de 4,8 s. **Pendiente:** inspección de MP4 nuevo.

### AF-51 — Pexels no mostraba resultados en este entorno y el estado de respaldo era confuso

**Causa comprobada:** la llave de Pexels era válida (HTTP 200), pero el proceso anterior del servidor no tenía acceso de salida a `api.pexels.com` y devolvía recursos locales como respaldo sin identificarlo claramente. El respaldo además se etiquetaba siempre «technology» aunque se buscara otra palabra.

**Solución:** servidor local reiniciado con acceso de red; la interfaz ahora distingue Pexels real de respaldo y muestra un aviso si no puede consultar la API. Las etiquetas del respaldo toman la búsqueda solicitada. No se expuso la llave.

**Prueba en vivo:** `/api/pexels?query=technology&per_page=2` devolvió dos vídeos remotos y ningún fallback; la UI mostró doce miniaturas reales. Se insertó temporalmente un clip Pexels a 42,9 s, se observaron imagen y subtítulos animados encima, y luego se deshizo. Detectado en esa prueba: el `<video>` remoto avanzaba aun con el editor pausado. Se sincronizó su tiempo y estado de reproducción; a 43,80 s del editor estaba pausado en 0,90 s local, y al buscar 44,34 s quedó pausado en 1,44 s local. Sin errores de consola. **Pendiente:** MP4 exportado con Pexels y prueba tras reiniciar la app en otro entorno de red.

**Validación técnica:** `npx tsc --noEmit` y `npm run build` correctos; permanece un aviso no bloqueante de tamaño del bundle. No se exportó MP4 ni se consumieron créditos en esta fase.

## Décima fase — recorte sincronizado e inspector de clip (26/09/2026)

### AF-52 — El desplegable B-roll mostraba opciones blancas ilegibles

**Causa:** el menú nativo heredaba colores del tema del sistema incompatibles con la interfaz oscura.

**Solución/prueba:** select y option usan esquema oscuro y texto claro. En el navegador, ambos dieron fondo `rgb(17,17,17)` y letra `rgb(245,245,245)`.

### AF-53 — Recortar video dejaba subtítulos y capas fuera de la duración

**Causa:** mover los bordes solo recalculaba la pista de video; no retiraba el intervalo descartado de las demás pistas. El cálculo anterior también confundía tiempo del proyecto con tiempo fuente en algunos clips.

**Solución:** el recorte confirmado quita el mismo intervalo de subtítulos, B-roll, motion, plantillas, música y sonidos, y desplaza el material posterior. Los subtítulos que cruzan el borde se acortan; Deshacer conserva el estado anterior. La posición del cabezal queda dentro de la nueva duración.

**Prueba en vivo:** `Jose1998videoprueba.mp4` pasó de 58 a 10 s; subtítulos 42→9 y B-roll 7→1. Un Deshacer restauró 58 s, 42 subtítulos y 7 B-roll. El video de prueba quedó restaurado.

### AF-54 — No se podía arrastrar el cabezal rojo

**Solución/prueba:** la regla y el triángulo rojo admiten pulsar y arrastrar con el botón izquierdo. En la prueba el cabezal pasó de 0:29 a 0:35 por arrastre directo, sin mover clips.

### AF-55 — Faltaban ajustes por clip de imagen y audio

**Solución:** al seleccionar un clip de video, la columna derecha pasa a un inspector compacto con pestañas Video y Audio del video; se puede volver a Diseño. Hay interruptor «Aplicar a todos los clips», brillo, contraste, saturación, nitidez por convolución, silencio y volumen por clip. La vista previa y Remotion reciben los ajustes. Se incorporó selector 24/30/60 FPS para exportación.

**Pruebas:** al seleccionar la pista de video aparecieron ambos paneles. Brillo 110 % cambió el filtro del reproductor y se devolvió a 100 %. El selector 60 FPS se activó y se devolvió a 30. Falta renderizar un MP4 para comprobar los ajustes de imagen/audio y los tres FPS.

### AF-56 — Reducción de ruido solo al exportar, sin progreso visible

**Solución parcial:** botón por clip que decodifica el audio local, filtra frecuencias fuera de la voz y atenúa ruido de bajo nivel en las pausas con indicador de etapas. El resultado se usa inmediatamente en la vista previa, y la composición exportable silencia el audio original y mezcla la pista procesada. No se envía el archivo a un servidor. No es aislamiento completo de voz por IA; ese control no se presenta como funcional.

**Prueba en vivo:** el clip de 58,77 s generó una pista WAV procesada de igual duración (`readyState` 4); video original silenciado, audio procesado reproduciéndose con desvío menor de 0,1 s. Se retiró el procesamiento de prueba al finalizar. Falta exportación con esta opción.

### AF-57 — Superresolución real y aislamiento de voz: pendientes

La app actual exporta a un tamaño fijo según aspecto; cambiar píxeles o aplicar nitidez no recupera detalle de 320p. La superresolución real requiere un modelo y preprocesar todos los fotogramas antes del render. El navegador integrado de esta máquina no expone WebGPU, y no hay motor/modelo local instalado para estas operaciones. El aislamiento de voz requiere separación de fuentes, distinta del filtro básico de ruido. **No se añadieron controles engañosos ni se declara que estas dos funciones estén terminadas.** Debe decidirse un motor local externo (CPU/GPU) o un servicio remoto autorizado, con prueba de rendimiento, privacidad y exportación.

**Estado técnico:** TypeScript y build pasan; consola del navegador sin errores durante la prueba de audio. Build mantiene aviso no bloqueante de tamaño del bundle. No se consumió crédito ni se exportó MP4 en esta fase.

### AF-58 — La carga de otro audio reemplazaba el anterior

**Causa:** el manejador tomaba solo `files[0]` y llamaba `setMusicClips([newClip])`. Además convertía el archivo completo a base64, innecesario para 14 pistas.

**Corrección/prueba (26/09):** el selector acepta varios archivos, conserva los clips existentes y limita el total a 14. Cada clip nuevo ocupa un hueco libre, usa una URL local del navegador y conserva edición de inicio, duración y volumen. En `Jose1998videoprueba.mp4` se cargaron dos MP3 simultáneos: aparecieron separados en 0–4,2 y 4,2–4,9 s. También se cargaron 14 MP3 distintos de una vez: el panel indicó 14/14, el botón de subida quedó deshabilitado y Deshacer devolvió 0/14. **Pendiente:** estrés con 14 audios largos y exportación MP4 con varias pistas.

### AF-59 — No había subtítulos manuales desde audios subidos

**Corrección/prueba (26/09):** botón «Sincronizar subtítulos con audio». Usa Whisper local sobre los intervalos audibles de los clips de la pista, remapea las palabras a sus posiciones y sustituye los subtítulos del video solo al pulsarlo; Deshacer conserva los anteriores. No necesita desmutear el video. Prueba con dos MP3: la línea de tiempo mostró frases del audio («Este vídeo que viene…») en lugar de las 42 frases originales; Deshacer recuperó las 42. El segundo archivo era un efecto sin voz, que no añadió frases.

**Corrección adicional (26/09):** los audios subidos ya no se recortan silenciosamente a `duración del video / 14`. Ese límite descartaba el final de cortes de 5 s antes de Whisper. Cada clip conserva ahora toda su duración disponible (hasta el siguiente clip o el final del video); el límite de 14 archivos permanece activo.

**Validación adicional (26/09):** con `corte_000.mp3` del paquete `Audio_Yo_No_Vendo_Humo/cortes_5_segundos`, el editor mostró una duración de 5,0 s y el botón de sincronización completó la operación. No apareció ningún rechazo «send was called before connect» en la consola tras reiniciar el servidor.

### AF-63 — Rechazo engañoso de Vite durante la transcripción

**Causa:** cuando el WebSocket HMR se reiniciaba o aún no estaba conectado, el cliente de Vite intentaba reenviar un `unhandledrejection` y generaba el mensaje secundario `send was called before connect`. La transcripción de la aplicación ya captura sus errores y muestra el estado en el editor.

**Corrección (26/09):** `vite.config.ts` conserva el reenvío normal de consola, pero desactiva únicamente el reenvío de rechazos no controlados durante la reconexión (`server.forwardConsole.unhandledErrors = false`). Esto elimina el mensaje secundario sin ocultar los logs normales ni cambiar el flujo de transcripción.

**Validación:** servidor reiniciado, carga de `Jose1998videoprueba.mp4`, subida del corte MP3 y sincronización local completadas; consola sin el rechazo reportado.

### AF-64 — La transcripción desde varios audios no actualizaba todas las capas

**Causa:** la transcripción sustituía el arreglo `captions`, pero los B-roll ya materializados conservaban sus posiciones y textos derivados del video. El filtro de limpieza también podía descartar una pista hablada de bajo nivel, y no existía una acción explícita para quitar primero los subtítulos del video.

**Corrección (26/09):** los audios usan el modelo Whisper `base` en español, con una limpieza menos agresiva y un respaldo que conserva palabras válidas aunque la energía sea baja. Se añadió «Eliminar subtítulos del video actuales», reversible con Deshacer. La sincronización actualiza `captions`, limpia estilos antiguos, regenera los B-roll automáticos según los nuevos tiempos y reescribe el texto de B-roll y motion graphics existentes. La carga múltiple y la sincronización aceptan las 14 pistas completas; no hay un límite funcional de cinco. Para evitar acumulación de memoria, las 14 pistas se combinan con separadores de silencio y se procesan en una sola invocación de Whisper; luego los segmentos se remapean a cada intervalo de audio.

**Prueba en vivo:** se cargaron cinco cortes MP3 (`corte_000`–`corte_004`) sobre `Jose1998videoprueba.mp4`; el contador mostró 5/14, se eliminaron los subtítulos originales, Whisper produjo cinco grupos visibles («Yeah! Música…», «No es no moedy…», etc.) y los B-roll automáticos reaparecieron en 15–19 s y 20–24,2 s, alineados con el nuevo audio. Se exportó un MP4 1080×1920 a 30 FPS correctamente y se reprodujo en la pantalla de resultado. Se consumió 1 crédito VIP como autorizó el usuario.

**Validación completa (26/09):** se cargaron los 14 archivos `corte_000.mp3`–`corte_013.mp3` del paquete `Audio_Yo_No_Vendo_Humo/cortes_5_segundos`. El panel mostró 14/14 y los clips quedaron ordenados, sin solapamientos, ajustados proporcionalmente al límite temporal del video. La sincronización terminó sin cierre del navegador, mostró 29 grupos de subtítulos remapeados a la pista de audio y regeneró 7 B-roll automáticos; no hubo errores de consola. Se exportó el MP4 1080×1920 a 30 FPS al 100 %, con enlace de descarga reproducible; se consumió 1 crédito VIP autorizado. El primer intento individual por audio alcanzó 14/14 pero cerró el navegador por acumulación de buffers; la transcripción combinada corrige ese fallo de producción.

### AF-60 — Pulsar de nuevo un SFX lo reemplazaba

**Causa:** todos los sonidos manuales compartían el estado `sfxSrc` y el identificador `manual-sfx`.

**Corrección/prueba (26/09):** cada clic crea un clip de efecto con ID propio, visible en la pista ♪, desplazable y eliminable por separado. Dos clics en Whoosh Rápido produjeron dos marcadores; la composición Remotion incluye ambos. Se deshicieron tras la prueba. **Pendiente:** escuchar ambos en un MP4 exportado.

### AF-61 — Nitidez excesiva distorsionaba contornos

**Causa:** la convolución llegaba a centro 5 y vecinos -1 en el máximo del control, amplificando ruido y halos.

**Corrección (26/09):** intensidad acotada a centro 1,32 y vecinos -0,08 tanto en vista previa como en Remotion, preservando alfa. Tipado/build pasan. **Pendiente:** comparación visual y exportación con un video 320p real.

### AF-62 — Superresolución local de 320p a 1080p aún no está implementada

La salida actual escala el lienzo a 1080p, pero no reconstruye detalle. Se investigaron ONNX Runtime Web y Real-ESRGAN local con WASM/WebGPU; procesar *cada fotograma*, mantener audio y sincronía y preservar el rendimiento exige una tubería nueva, no solo descargar un modelo. El navegador de prueba no expone WebGPU y el respaldo WASM para video puede ser muy lento. **No se etiqueta el escalado actual como mejora real ni se declara terminada esta petición.** Falta prototipo, prueba comparativa 320p→1080p, prueba de exportación y presupuesto de tiempo/memoria.
