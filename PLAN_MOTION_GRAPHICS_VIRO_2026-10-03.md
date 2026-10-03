# Motion graphics: referencia Viroedit y mejoras para Zentry

## Implementación local — 03/10/2026 — TERMINADA en código y preview

- [x] Seis SVG propios: teléfono, engranaje, burbuja, moneda, gráfica y libro; cinco conjuntos temáticos.
- [x] Selección local por palabras clave de los subtítulos completos del intervalo del motion, sin IA remota. Si no hay coincidencia se usa tecnología. Contexto estable entre páginas; los textos siguen los subtítulos actuales.
- [x] Selector `Recursos del motion`: automático, cinco temas, icono clásico y sin objetos. Elegir un icono existente activa el modo clásico, conservando ese control.
- [x] Perspectiva 2.5D, sombras, entradas escalonadas, oscilación, rotación y acercamiento suave con tiempo explícito. No son modelos 3D ni video generado.
- [x] Componente `MotionSceneObjects` compartido en preview y exportación; escala según el ancho del lienzo, no cambia dimensiones de la interfaz. Se conserva texto, tamaño 58, fuentes, fondos y ajustes anteriores.
- [x] Probado en navegador con `Jose1998videoprueba`: motion existente del pack, los cinco temas, icono, apagado y vuelta a automático. Cambios inmediatos en DOM/lienzo. Evidencia `VALIDACION_MOTION_LOCAL_2026-10-03.png`.
- [x] Test de cinco temas, movimiento, repetibilidad al buscar tiempo, escala, contexto estable y controles; regresión de packs/catálogo y hook. TypeScript, ESLint de nuevos componentes y build pasan. Build mantiene aviso de chunks grandes y clasificación de rutas.
- [ ] Exportación MP4 real y persistencia tras recargar pendientes; no se gastaron créditos. Los sonidos de escritura por tiempos de palabra y nuevas escenas editoriales de fondo completo siguen pendientes.

La lista histórica de abajo refleja la propuesta original completa; no debe interpretarse como que todos sus puntos ya se implementaron. Se empezó por recursos propios y selector, sin sustituir el renderer de tarjetas ni copiar recursos externos.

## Implementación local — 03/10/2026 — TERMINADA en código y preview

- [x] Seis SVG propios: teléfono, engranaje, burbuja, moneda, gráfica y libro; cinco conjuntos temáticos.
- [x] Selección local por palabras clave de los subtítulos completos del intervalo del motion, sin IA remota. Si no hay coincidencia se usa tecnología. Contexto estable entre páginas; los textos siguen los subtítulos actuales.
- [x] Selector `Recursos del motion`: automático, cinco temas, icono clásico y sin objetos. Elegir un icono existente activa el modo clásico, conservando ese control.
- [x] Perspectiva 2.5D, sombras, entradas escalonadas, oscilación, rotación y acercamiento suave con tiempo explícito. No son modelos 3D ni video generado.
- [x] Componente `MotionSceneObjects` compartido en preview y exportación; escala según el ancho del lienzo, no cambia dimensiones de la interfaz. Se conserva texto, tamaño 58, fuentes, fondos y ajustes anteriores.
- [x] Probado en navegador con `Jose1998videoprueba`: motion existente del pack, los cinco temas, icono, apagado y vuelta a automático. Cambios inmediatos en DOM/lienzo. Evidencia `VALIDACION_MOTION_LOCAL_2026-10-03.png`.
- [x] Test de cinco temas, movimiento, repetibilidad al buscar tiempo, escala, contexto estable y controles; regresión de packs/catálogo y hook. TypeScript, ESLint de nuevos componentes y build pasan. Build mantiene aviso de chunks grandes y clasificación de rutas.
- [ ] Exportación MP4 real y persistencia tras recargar pendientes; no se gastaron créditos. Los sonidos de escritura por tiempos de palabra y nuevas escenas editoriales de fondo completo siguen pendientes.

La lista histórica de abajo refleja la propuesta original completa; no debe interpretarse como que todos sus puntos ya se implementaron. Se empezó por recursos propios y selector, sin sustituir el renderer de tarjetas ni copiar recursos externos.

## 03/10/2026 — Inspección TERMINADA; implementación pendiente

Revisión del motion existente del proyecto guardado `viroedit-demo.mp4`, no de todo el catálogo. Se restauró el proyecto y se reprodujo en el navegador el recurso MP4 ya cargado. No se generó contenido, exportó, gastó créditos ni descargó/copió el video o código privado.

## Observaciones verificadas

- [x] Clip vertical de 5,184 s. Comprobados reproducción y fotogramas de inicio, 2,13 s aproximadamente y final.
- [x] Escena monocroma clara: suelo punteado, iluminación diagonal, sombras y profundidad.
- [x] Teléfono inclinado con gráficas, burbuja y engranaje flotantes; la composición cambia durante el clip.
- [x] Tipografía manuscrita fina combinada con sans serif gruesa. Familia exacta no identificada.
- [x] Palabras clave sobre bloque rojo; el texto cambia entre la parte intermedia y el cierre.
- [x] Texto presente dentro del MP4 al abrir ese recurso sin el editor. Esto no demuestra que todos los motions de Viroedit funcionen así.
- [x] Evidencia: `REFERENCIA_MOTION_VIRO_2026-10-03.png`, aproximadamente 2,13 s.

## Comparación con Zentry

`app/video/MotionGraphicsLayer.tsx` construye degradados, tarjetas, sombras, perspectiva CSS e iconos emoji. Tiene entradas y oscilación, pero no objetos 3D equivalentes al ejemplo. Los nombres `photoreal-3d` y `3d-scene` no convierten estos elementos en modelos reales.

Conservar el texto editable desde los subtítulos actuales mediante `AnimatedMotionText`: dos fuentes, tamaño 58 y entradas por página. No reemplazarlo por un MP4 con texto fijo.

## Mejoras propuestas — NO implementadas todavía

- [ ] Crear una escena editorial clara propia con teléfono, conversación y engranaje; no reutilizar el recurso de Viroedit.
- [ ] Separar fondo, objetos y texto, manteniendo fuentes, colores, tamaño y posición editables.
- [ ] Incorporar cámara/parallax suave y entradas escalonadas, determinadas por el tiempo del editor.
- [ ] Añadir resaltado rectangular de palabra clave configurable; conservar las dos tipografías y entradas actuales.
- [ ] Adaptar composición al texto y al formato, sin cambiar dimensiones de interfaz ni quitar configuraciones.
- [ ] Sincronizar escritura con los tiempos reales de palabra: el renderer actual usa `wIdx * 3.5` frames para esa secuencia.
- [ ] Compartir renderer de objetos entre preview y exportación.
- [ ] Probar entrada, movimiento, cambios de frase, silencios, salida, duración reducida y ausencia de texto duplicado.
- [ ] Probar selección, tamaño, posición, reemplazo, eliminación y persistencia de plantilla.
- [ ] Validar 9:16/16:9 y 24/30/60 fps; exportar una prueba cuando se solicite la implementación/exportación.

## Límites

El editor mostrado ofrece controles móviles y señala algunas herramientas como disponibles en computadora. La ampliación temporal no cambió el ancho observado; se restableció después. No se afirma haber probado el panel completo de motion de Viroedit. Sí se verificó su recurso existente. Sincronización completa con la voz original pendiente. No se han cambiado renderers ni aplicado una nueva plantilla a Zentry en esta inspección.
