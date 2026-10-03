# Análisis de Viroedit como referencia para Zentry

Fecha: 2026-10-02. Fuente: https://viroedit.com/ (página pública y editor con sesión iniciada).

Actualización: se revisó también la vista de escritorio a 1440 × 900, las pistas y la personalización por roles. El plan ampliado está en `PLAN_SUBTITULOS_BROLL_VIROEDIT_2026-10-02.md` y su evidencia en `VIROEDIT_ESCRITORIO_2026-10-02.jpg`. La afirmación de capacidades solo de computadora de la inspección inicial corresponde a la vista estrecha, no a una limitación general del servicio.

## Alcance y evidencia

- [x] Abrir el navegador visible y verificar la sesión iniciada por el usuario.
- [x] Continuar el proyecto de ejemplo guardado `viroedit-demo.mp4`.
- [x] Inspeccionar los paneles Control, Energía y Vibra sin cambiar sus valores.
- [x] Guardar evidencia en `VIROEDIT_REFERENCIA_2026-10-02.jpg`.
- [ ] Verificar equivalencia entre vista previa y exportación: no realizada.
- [ ] Probar capacidades de escritorio adicionales: no realizada en esta vista.

No se modificó el código de Zentry, no se subieron archivos locales a Viroedit y no se pulsó Export. El análisis describe controles observados, no certifica su implementación interna ni su funcionamiento completo. No se extrajo código privado del servicio.

**Incidencia durante la navegación:** después de pulsar Continuar, el saldo visible pasó de 3 a 1 crédito. La interfaz mostró posteriormente “Proceso completado” y enumeró 33 subtítulos, 9 zooms, 3 énfasis, 1 motion graphic generado con IA, 60 efectos y un gancho. No se pulsó una generación explícita. La secuencia sugiere procesamiento asociado a restaurar el ejemplo, pero no permite confirmar la causa del cargo. Se evitaron exportaciones y otras generaciones.

## Funciones realmente visibles

| Área | Lo observado | Qué conviene adaptar a Zentry |
|---|---|---|
| Continuidad | Continuar proyecto guardado; autoguardado en este navegador y advertencia de posible borrado por falta de espacio | Estado claro de guardado y respaldo exportable del proyecto con medios; nunca presentar almacenamiento del navegador como respaldo permanente |
| Vista previa | Botón Ver antes; instrucciones de arrastrar para mover y clic para editar texto | Comparación original/editado en el mismo tiempo; inspector del elemento seleccionado y selección visible en su pista |
| Control | Palabra por palabra, enfoque dinámico, eliminar silencios, mejorar audio, volumen SFX y música de fondo | Panel resumido con controles avanzados desplegables, sin quitar los ajustes actuales |
| Energía | Énfasis, paletas Fuego/Océano/Clásico, colores primario/secundario, gancho Flash/Blur/Cine | Paletas coherentes que puedan aplicarse al grupo seleccionado o a todos, conservando excepciones locales |
| Vibra | 11 estilos: Editorial Story, Impacto Stats, Motivacional, Minimal Clean, Instagram Viral, Magazine Editorial, Simple Basic, Helvetica Bold, Esteban Style, Ani Style y Bold Caps | Catálogo con muestras animadas, identificación inequívoca de plantilla y edición posterior sin bloqueo |
| Subtítulos | Colores de texto/acento, tamaño porcentual, Auto/Arriba/Centro/Abajo, desplazamientos vertical/horizontal, palabras por subtítulo | Ajustes con tamaño relativo al formato, agrupación por palabras y posiciones individuales persistentes |
| Acabado | Sombra, resplandor y degradado | Controles consistentes en subtítulos, texto del B-roll y motion, tanto en preview como en render |
| Recorte | Botón Recortar automático: quitar silencios y muletillas | Antes de aplicar, mostrar intervalos y duración resultante; remapear todas las pistas usando el mismo mapa temporal |
| Adaptación | Texto detrás de ti y overlays indican “Disponible en computadora” | Informar limitaciones reales según dispositivo y capacidad; evitar botones que aparentan funcionar sin soporte |
| Ayuda | Soporte, Tutoriales y asistente con resumen de elementos generados | Resumen verificable con acceso al elemento en la línea de tiempo, no un modal que interrumpa cada ajuste |

La presencia de controles no demuestra detección facial precisa, reducción de ruido eficaz, calidad de animaciones ni fidelidad de exportación. Los mensajes comerciales de velocidad, retención, privacidad y ahorro tampoco constituyen pruebas técnicas.

## Mejoras propuestas para nuestro editor — pendientes, no implementadas aquí

### P1: consistencia antes que nuevas plantillas

1. Un inspector contextual minimalista: seleccionar video, audio, subtítulo, B-roll o motion muestra sus ajustes; selección en canvas y timeline siempre corresponde al mismo ID.
2. Un único mapa temporal para cortes y eliminación: captions, B-roll, hooks, motion, SFX y audio deben recortarse o desplazarse juntos cuando corresponda.
3. Igualdad preview/export: mismas animaciones, tiempos, tipografías, transiciones y ganancias, calculadas desde datos compartidos. Evitar resolver una transición de forma distinta en CSS y Remotion.
4. Sincronización con audio: respetar los 14 clips, velocidad, recortes y silencios; reemplazar subtítulos anteriores y regenerar textos automáticos de B-roll/motion sin duplicarlos ni conservar texto obsoleto.
5. Confirmación previa de tareas con coste: restaurar o abrir un proyecto nunca debe generar IA ni descontar créditos sin una acción explícita.

### P2: experiencia y personalización

6. Comparación antes/después con cursor sincronizado y sin modificar el proyecto.
7. Paletas y estilos editables con alcance “este grupo / todos”. Guardar una plantilla debe persistir configuración completa, no solo nombre; al aplicarla debe actualizar canvas, timeline y exportación.
8. Resumen no bloqueante: listar lo añadido, lo sustituido y lo omitido con razón, y permitir seleccionar cada elemento.
9. Estado de procesamiento por tarea, cancelación y recuperación segura. “Mejorar audio” no debe ocultar qué operación se realiza ni si realmente terminó.
10. Modo simple y modo avanzado: incorporar la claridad de Viroedit manteniendo las pistas, 14 audios y formatos originales que el usuario necesita en Zentry.

### P3: capacidades que requieren evaluación aparte

11. Enfoque dinámico y colocación de texto que evite rostros: evaluar detección local, rendimiento y revisión manual antes de prometer automatización.
12. Superresolución e aislamiento de voz locales: no confundir reescalado con recuperación real de detalle, ni filtrado con separación de voz. Requieren modelos, mediciones y pruebas de dispositivos.

## Validación requerida si se implementan las propuestas

- Edición y exportación de un montaje vertical y otro horizontal sin cambiar su relación de aspecto.
- Restauración del proyecto y de tres plantillas personalizadas tras recargar.
- Sustitución/eliminación de B-roll sin apilar el anterior; texto animado consistente en B-roll local y Pexels.
- Sincronización de 14 audios con revisión del texto hablado, offsets y velocidades; no basta comprobar que la operación termina.
- Comparación de fotogramas del preview y MP4 en entradas, salidas, transiciones y cortes.
- Mezcla de audio verificada con escucha; controles de volumen, silencio, velocidad y eliminación del fragmento.
- Restauración y navegación sin cargos ni tareas nuevas ocultas.

## Conclusión

Viroedit aporta una referencia de interfaz compacta, paletas, agrupación de ajustes y comparación visual. Zentry debe aprovechar esas ideas con implementación propia, priorizando sincronización y edición fiable, sin copiar código privado ni perder herramientas existentes. Este documento termina el análisis de referencia observado; no declara terminadas las mejoras propuestas ni la auditoría completa de Zentry.
