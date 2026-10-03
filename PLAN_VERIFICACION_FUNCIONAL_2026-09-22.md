# Plan de reparación y verificación funcional — 22/09/2026

Referencia: `AUDITORIA_FUNCIONAL_2026-09-20.md`. Una marca tachada significa implementado y verificado; lo demás sigue pendiente. Cada fase se marca **TERMINADO** solo tras sus pruebas.

## Fase 1 — B-roll automático y exportación

- [x] ~~Impedir que un B-roll automático borrado reaparezca en editor y vista previa.~~ La prueba con `Jose1998videoprueba.mp4` lo eliminó también de la pista SFX. La exportación usa ahora solo clips editables; falta inspeccionar fotogramas del MP4.
- [x] ~~Reemplazar un B-roll existente en el mismo intervalo, sin apilar dos capas.~~ En navegador, “Confianza” sustituyó el automático 2 y el total siguió siendo seis clips.
- [ ] Mantener movimiento y audio de B-roll en exportación como en vista previa.
- [ ] Verificar selección, edición, actualización y eliminación en tiempo real para **todos** los tipos. Selección y eliminación de B-roll comprobadas; los demás tipos no están agotados.
- [x] ~~Eliminar la segunda ruta que regeneraba B-roll automático en la exportación.~~ La composición recibe `brollEvents: []` y los clips editables se remapean a la salida.
- [ ] Inspeccionar visualmente los fotogramas del MP4 más reciente; el usuario ya confirmó que «Descargar MP4 generado» sí descarga, por lo que esa observación antigua no es un fallo vigente.

## Fase 2 — Plantilla personal

- [x] ~~Añadir botón para guardar los ajustes elegidos como plantilla personal predeterminada.~~ Guardado comprobado en la cuenta de prueba; el panel mostró fecha y botón de reaplicación.
- [x] ~~Permitir hasta tres plantillas personales, conservar la anterior y elegir una predeterminada.~~ Se guardó «Marca Personal Pro», se marcó como predeterminada, el botón quedó desactivado en 3/3 y se eliminó la plantilla temporal; tras recargar seguían las dos plantillas y la predeterminada correcta.
- [ ] Confirmar visualmente que todos los ajustes de la predeterminada se aplican a un **proyecto sin borrador previo**. El código la aplica tras transcribir si no existe borrador, pero esta condición no se comprobó en navegador.
- [ ] Sincronizar plantillas entre dispositivos, si se requiere: el almacenamiento actual está asociado al ID del usuario **en este navegador**, no en la nube.

## Fase 3 — Medios y formatos

- [ ] Permitir hasta 12 videos por proyecto y mostrar claramente el límite. Interfaz y validación cambiadas a 12 fuentes únicas; falta prueba con doce archivos reales.
- [x] ~~Leer las dimensiones de la fuente durante la carga y dejar «Original» como formato inicial.~~ El archivo 1280×720 abrió en 1920×1080 y el de 720×1280 en 1080×1920, antes de exportar.
- [x] ~~Exportar horizontal en 16:9 y vertical en 9:16 en modo «Original».~~ Dos renders de 10,048 s al 100 %: metadatos del MP4 1920×1080 y 1080×1920 respectivamente.
- [x] ~~Exportar el formato 1:1 elegido manualmente.~~ El tercer render de 10,048 s produjo 1080×1080 y después se dejó el selector otra vez en «Original».
- [ ] Comprobar un video de entrada cuadrado y otras proporciones, además de inspeccionar visualmente el encuadre/fotogramas del archivo final.

## Fase 4 — Auditoría integral del editor

- [ ] Revisar todos los controles relevantes de subtítulos, tipografía, hooks, motion, sonido, transiciones y B-roll.
- [ ] Garantizar que cada elemento de la línea de tiempo se pueda seleccionar, editar, actualizar y eliminar según corresponda.
- [ ] Probar con `Jose1998videoprueba.mp4` en navegador y exportar un resultado verificable. Se probaron B-roll y dos renders (58 s y 8 s) con estado 100%; falta un MP4 accesible en disco y comprobar movimiento de fotogramas.
- [ ] Ejecutar comprobaciones de tipos, compilación y pruebas aplicables; documentar hallazgos y límites.

## Fase 5 — Solicitud B-roll y música del 23/09/2026

- [x] ~~Mantener las tres tarjetas de fondo completo y recuperar los B-roll originales ocultos.~~ Nueve entradas originales visibles bajo las tarjetas actuales.
- [x] ~~Restaurar el acceso a sugerencia B-roll por IA en este panel.~~ Botón por frase visible y conectado al flujo existente.
- [x] ~~Conectar fuente, tamaño y colores B-roll a vista previa y componentes exportables.~~ Probados Pacifico, blanco y `#ffcc00` en el editor; pendiente inspección del MP4.
- [x] ~~Añadir dos líneas Pacifico/Anton con aparición y entrada desde la derecha.~~ Vista previa comprobada y plantilla «Viral Pacifico + Anton» disponible.
- [x] ~~Permitir guardar y reutilizar una plantilla B-roll personal.~~ «Mi B-roll 2» guardada; indicador 2/3 en la cuenta de prueba.
- [x] ~~Subir audio/música a una pista propia sin apilarlo sobre SFX.~~ WAV de prueba cargado, 1 clip de música en fila separada, controles de inicio/duración/volumen visibles.
- [x] ~~Quitar el modal de éxito al actualizar/aplicar.~~ Actualizar dejó 0 modales y 7 clips; error, proceso y exportación conservan panel propio.
- [x] ~~Probar quitar y restaurar B-roll automático.~~ Conteo 7→6→7 mediante Eliminar/Deshacer.
- [x] ~~Revisar el MP4 final exportado de `Jose1998videoprueba.mp4`.~~ Render de 58,816 s y 1080×1920 al 100 %; fotogramas de dos B-roll revisados, y la pista de audio cargada dejó de bloquear el render. Sigue pendiente análisis de audio audible y guardar el archivo de esta sesión en disco.
- [ ] Agotar la prueba botón por botón de herramientas no incluidas en esta fase; no se afirma certificación integral.

## Registro de trabajo

- 22/09/2026: plan creado. ViroEdit se revisó como referencia pública de funciones; no se copiará código privado de terceros.
- 22/09/2026: se detectó la causa del B-roll fantasma: eventos automáticos separados de los clips editables en vista previa, línea de tiempo y exportación. Se consolidó la ruta editable, se añadió sustitución de intervalos solapados y movimiento Ken Burns a imágenes durante Remotion.
- 22/09/2026: se añadió plantilla personal local por ID de usuario, selector de salida original/9:16/16:9/1:1 y límite de 12 fuentes de video; selección de subtítulo en línea de tiempo ahora permite eliminar ese grupo.
- 22/09/2026: TypeScript y build de producción pasaron. El servidor de desarrollo respondió 200. Se inició sesión y se procesó `Jose1998videoprueba.mp4` en navegador.
- 22/09/2026: render completo de 58 s y prueba de 8 s llegaron al 100%; se descontó un crédito en cada exportación. El primero no dejó un archivo localizable. Tras añadir reproductor y enlace persistente, el segundo mostró duración 8 s y resolución 1080×1920, pero al intentar usar los controles el navegador integrado se cerró. No se declara validado el archivo final ni el movimiento del B-roll.
- 22/09/2026: se eliminó la descarga automática que no dejaba un archivo comprobable. El MP4 generado ahora permanece como enlace explícito y vista previa mientras siga abierta la sesión del editor. TypeScript y build volvieron a pasar. Se abrió Chrome para contraste, pero su selector de archivos rechazó la carga automatizada; requiere carga manual para cerrar la prueba externa. No se consumieron más créditos después de las dos exportaciones indicadas.
- 22/09/2026: el servidor siguió respondiendo HTTP 200. El lint global se interrumpió tras más de un minuto sin salida; el lint limitado a los dos archivos editados encontró 56 errores y 17 advertencias, en su mayoría reglas de tipado/React preexistentes en `app/page.tsx`. La compilación y TypeScript pasan, pero **el lint no pasa** y se mantiene como deuda de la auditoría integral.
- 22/09/2026: ampliada Marca a tres plantillas por usuario/navegador, con guardar, aplicar, actualizar, elegir predeterminada y eliminar; migración no destructiva de la plantilla única anterior. Las cuentas nuevas reciben «Zentry Viral». En la cuenta de prueba se guardó «Marca Personal Pro» como predeterminada y se verificó su persistencia tras recarga. La plantilla temporal usada para probar 3/3 se eliminó.
- 22/09/2026: metadatos de fuente leídos con Mediabunny durante la carga (fallback del elemento video); la pantalla de procesamiento identifica orientación. Renders reales en el navegador: fuente horizontal 1280×720 → MP4 1920×1080; fuente vertical 720×1280 → MP4 1080×1920; salida 1:1 manual → MP4 1080×1080. Los tres tenían duración 10,048 s y `readyState` 4. Créditos 997→994 (uno por exportación). El enlace blob de descarga no produjo un archivo visible en `C:\Users\jose1\Downloads`; por eso la descarga y el examen visual siguen pendientes.
- 23/09/2026: el usuario confirmó que la descarga MP4 sí funciona; se mantiene únicamente la revisión visual del render más reciente como pendiente. La app se abrió de nuevo en `localhost:3000`, se cargó `Jose1998videoprueba.mp4` y se verificaron B-roll, eliminación/Deshacer, actualización sin modal, plantilla personal Pacifico/Anton y música en pista separada. TypeScript y build pasaron. La nueva exportación está en curso.
- 23/09/2026: el primer render con música `blob:` falló al 18 % sin descontar crédito; se migró a `data:` local y se repitió con éxito. El recorte anterior del proyecto causó un primer MP4 de 25,834667 s; se extendió la salida del clip a 58,77 s. El render completo y luego el definitivo con texto más legible dieron MP4 de 58,816 s a 1080×1920, 100 %, con fotogramas de las dos plantillas revisados. Créditos 992→991→990→989 en los tres renders exitosos. Un clic automatizado no dejó el último MP4 detectable en Descargas; el enlace permanece abierto para descarga manual. Lint de cinco archivos: 60 errores y 20 advertencias, por lo que la auditoría integral continúa.
- 23/09/2026: se separaron en carriles verticales los B-roll y motion/Zentry que coinciden en tiempo; prueba visual en el proyecto abierto mostró dos carriles de motion. Marca ahora guarda y reaplica capas y estilos por grupo, y «Mi estilo predeterminado» se actualizó a 7 B-roll y 3 capas conservando su estilo. Se guardó/aplicó una plantilla de subtítulos Pacifico+rojo frente a Anton+verde y se borró el artefacto temporal. El video de prueba mide 58,77 s y ocupa el 100 % de la pista. Se eliminó el recorte automático de 60 s en clips secundarios y se protege la recuperación de borradores antiguos; falta probar la subida de un archivo secundario >60 s en UI. TypeScript y build aprobaron. No hubo nueva exportación ni consumo de crédito en esta revisión.
- 23/09/2026: se corrigió la superposición dentro del fotograma, distinta de la superposición visual en la línea de tiempo. Editor y Remotion seleccionan la misma escena activa entre B-roll/motion/Zentry; se comprobó en el cruce de 5,8 s con un único contenedor visual sobre el video base. Se incorporó volumen visible para audio subido (0–100 %): WAV local cargado al 12 % y reducido al 5 %, después retirado. TypeScript y build pasaron; falta exportación nueva para inspección final de este cambio.
- 23/09/2026: corregida la carrera que regeneraba B-roll automático al cargar un borrador o una plantilla con capas: ahora se usa el archivo en proceso, no el `videoFile` potencialmente obsoleto. TypeScript y build pasaron. Pendiente prueba UI de recarga de una edición manual nueva; el borrador previo ya había perdido esa personalización antes del arreglo.
- 23/09/2026: «Hero Split» con frase corta repetía texto arriba y abajo. Se dividieron las palabras en inserciones nuevas y se normalizan clips antiguos en vista previa/exportación. Tras recargar `Jose1998videoprueba.mp4`, la escena de 5,8 s mostró dos partes distintas de la frase y una sola capa visual. Build y TypeScript pasaron; exportación nueva pendiente.

## Fase 6 — Paquete automático y edición de música (24/09/2026)

- [x] ~~Aplicar los cinco botones del Pack Zentry sin un paso adicional.~~ Clean probado en vivo: cambia vista, estilo, B-roll y añade motion; se restauró la edición anterior con Deshacer.
- [x] ~~Cortar el clip de video seleccionado y eliminar el fragmento cortado.~~ Prueba 58→26 s; las capas posteriores se retiraron/ajustaron y Deshacer recuperó video y duración.
- [x] ~~Permitir mover, dividir y eliminar por separado la música.~~ MP3 de prueba arrastrado a 17,9 s, cortado a 26,4 s, borrado por fragmentos y retirado del proyecto.
- [x] ~~Recalcular duración al Deshacer/Rehacer.~~ Regla recuperó 0:58 tras la eliminación del fragmento.
- [x] ~~Comprobar tipos, build y consola del navegador.~~ Sin errores; queda un aviso no bloqueante de tamaño de bundle.
- [ ] Exportar un MP4 con una pista musical partida y comprobar visualmente/auditivamente que no se reproduce el tramo eliminado.
- [ ] Completar la auditoría botón por botón de los paneles no ejercitados en esta fase.

## Estado de fases

- Fase 1: EN CURSO — exportación visual y archivo externo pendientes.
- Fase 2: EN CURSO — reaplicación exacta a proyecto nuevo sin borrador y persistencia entre dispositivos pendientes.
- Fase 3: EN CURSO — prueba de doce fuentes, otros aspectos y archivo descargado pendientes; 16:9, 9:16 y 1:1 sí fueron renderizados y medidos.
- Fase 4: EN CURSO — auditoría exhaustiva botón por botón pendiente.
- Fase 5: PARCIALMENTE TERMINADA — controles señalados y MP4 probados; quedan auditoría exhaustiva, calidad de lint y archivo de esta sesión guardado fuera del navegador.
- Fase 6: PARCIALMENTE TERMINADA — interacciones y pruebas en navegador aprobadas; exportación de música dividida pendiente.

## Fase 7 — SFX, hook y Pexels (24/09/2026)

- [x] ~~Permitir desplazar los efectos de sonido de la pista ♪ y reflejar el nuevo tiempo en Audio.~~ Probado 11,4→15,1 s y Deshacer a 11,4 s.
- [x] ~~Mantener el hook visible hasta la duración configurada aunque entre un B-roll.~~ Probado en vista previa con 8 s y restaurado a 4,8 s.
- [x] ~~Diagnosticar Pexels y diferenciar sus resultados del respaldo local.~~ Llave válida; el servidor anterior carecía de acceso de salida. El servidor actual entrega vídeos reales; la UI avisa del fallback.
- [x] ~~Mostrar subtítulos encima de un B-roll real de Pexels y sincronizar el vídeo al pausar/buscar.~~ Escena temporal visible a 42–44 s y luego deshecha; vídeo pausado y situado en el tiempo local correcto.
- [x] ~~Comprobar tipos, build y errores de navegador.~~ Sin errores; aviso de tamaño del bundle no bloqueante.
- [ ] Exportar un MP4 nuevo con Pexels, hook prolongado y un efecto de sonido desplazado para verificar imagen y sonido finales.

**Estado de fase 7:** PARCIALMENTE TERMINADA — editor y pruebas en vivo correctos; render final pendiente.

## Fase 8 — Recorte, inspector y procesamiento (26/09/2026)

- [x] ~~Corregir contraste del menú B-roll.~~ Opción y selector oscuros con texto claro en navegador.
- [x] ~~Eliminar subtítulos y capas del tramo de video recortado.~~ 58→10 s, subtítulos 42→9, B-roll 7→1; Deshacer restauró el proyecto.
- [x] ~~Arrastrar el cabezal rojo con clic izquierdo.~~ Probado 0:29→0:35.
- [x] ~~Abrir inspector compacto al seleccionar video y ajustar clip/todos.~~ Pestañas Video/Audio, brillo, contraste, saturación, nitidez, silencio y volumen; vista previa probada.
- [x] ~~Permitir elegir FPS 24, 30 y 60.~~ Selector probado en 60 y restaurado a 30; MP4 pendiente.
- [x] ~~Procesar una reducción básica de ruido al seleccionar el botón.~~ Pista local WAV de 58,77 s, sincronizada en la vista previa; se retiró la prueba.
- [ ] Integrar superresolución auténtica con modelo, procesamiento de fotogramas y prueba 320p→1080p. Sin WebGPU en el navegador actual; no confundir con redimensionado.
- [ ] Integrar aislamiento real de voz con un modelo de separación de fuentes y previsualización inmediata.
- [ ] Renderizar MP4 de prueba con ajustes por clip, audio procesado y 24/60 FPS; comprobar imagen, sonido y metadatos.

**Estado de fase 8:** PARCIALMENTE TERMINADA — correcciones/editor probados; funciones de IA avanzada y render final pendientes.

## Fase 9 — Audios múltiples y superresolución local (26/09/2026)

- [x] ~~Permitir hasta 14 archivos de audio sin reemplazar los anteriores.~~ Dos MP3 probados juntos; 14 es el límite de interfaz/código, sin prueba de estrés aún.
- [x] ~~Agregar sincronización manual de subtítulos desde los audios subidos.~~ Whisper local generó frases del audio de prueba; Deshacer restauró las 42 frases originales.
- [x] ~~Agregar un nuevo SFX cada vez que se pulse un botón.~~ Dos clics dieron dos clips independientes; faltan prueba auditiva de exportación y repetición intensiva.
- [x] ~~Evitar la nitidez agresiva que deformaba los contornos.~~ Intensidad de convolución acotada en vista previa y composición; comparación visual con 320p pendiente.
- [x] ~~Probar carga simultánea de 14 audios y el límite.~~ 14 MP3 distintos, contador 14/14 y botón deshabilitado; Deshacer devolvió 0/14.
- [ ] Probar 14 audios largos (memoria, posiciones, recortes, eliminación y exportación).
- [ ] Exportar MP4 con varias pistas y SFX repetidos; comprobar audio y subtítulos finales.
- [ ] Integrar y probar un modelo real de superresolución local por fotograma con audio sincronizado; no llamar «mejora IA» al cambio actual de dimensiones.

**Estado de fase 9:** PARCIALMENTE TERMINADA — funciones de audio comprobadas en vivo; superresolución y validación de MP4 pendientes.
