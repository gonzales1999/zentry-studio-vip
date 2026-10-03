# Plan de adaptación: subtítulos, plantillas y B-roll

Fecha: 2026-10-02. Referencia observada: https://viroedit.com/.
Complementa `ANALISIS_VIROEDIT_2026-10-02.md`.

## Implementación local — primera etapa 02/10/2026

- [x] Crear renderer compartido `AnimatedBrollText.tsx` para aparición y entrada lateral de dos líneas, incluyendo video/Pexels y los tres fondos.
- [x] Añadir efecto Editorial animado en el selector existente. Las nuevas inserciones de fondo completo usan Pacifico/Anton; las ediciones guardadas no se fuerzan a cambiar.
- [x] Añadir Seguir estilo de subtítulos; heredado por B-roll automático y opcional en los demás. Cambiar fuente/tamaño/acento propio desactiva la herencia. Persistir el ajuste en plantillas B-roll guardadas.
- [x] Usar cuatro captions por grupo tanto en preview como exportación; quitar repetición del primer grupo durante silencio.
- [x] Usar pulso por tiempo en palabras, sin animación CSS ni transición de color de reloj real.
- [x] Normalizar nombres de los 11 presets existentes, conservando sus IDs y sin duplicados.
- [x] Mantener `globals.css`, dimensiones de composición y distribución del editor sin cambios.
- [x] Pruebas de tiempos y render estático React, TypeScript y lint de los tres módulos de captions.
- [ ] Validación visual real: navegador integrado bloqueado al seleccionar la pestaña local, aunque el servidor devolvió GET / 200.
- [ ] Comparación del nuevo MP4 con preview: no exportado en esta etapa.

Los cambios están implementados en código, no se certifica todavía la experiencia visual completa. El resto de tareas del plan sigue pendiente; no se completó una réplica exacta de Viroedit ni se observó un B-roll Pexels real allí. Las animaciones implementadas son propias y responden a la aparición/entrada derecha solicitadas.

## Estado de esta etapa

- [x] Cambiar la vista a escritorio 1440 × 900, con panel izquierdo, preview, efectos y timeline visibles. Es un tamaño de prueba elegido, no una supuesta resolución original universal de Viroedit.
- [x] Abrir B-Rolls y personalización completa de estilos.
- [x] Inspeccionar roles tipográficos e importación de fuentes.
- [x] Reproducir y pausar el ejemplo: el cursor avanzó y el texto visible cambió con el tiempo.
- [x] Comparar los nombres de las 11 plantillas con el catálogo local.
- [x] Guardar captura `VIROEDIT_ESCRITORIO_2026-10-02.jpg`.
- [x] Preparar este plan con criterios de prueba.
- [ ] Insertar y observar un B-roll Pexels real en Viroedit. El ejemplo restaurado no tiene un clip Pexels visible en sus pistas; el panel ofrece IA y Mi vídeo. No se activaron generaciones adicionales ni se subieron archivos del usuario.
- [ ] Medir animaciones de las 11 plantillas con muestras equivalentes.
- [ ] Implementar y verificar los cambios enumerados abajo en Zentry.

En la etapa original de análisis no se modificó el editor. Después se implementó la primera etapa indicada arriba. No se extrajo código privado de Viroedit. Los controles y el comportamiento visible sirven como referencia para una implementación propia, no prueban cómo está construido el servicio.

## Lo nuevo que permite ver el modo escritorio

- Timeline con pistas diferenciadas de video, subtítulos, Impact, Motion IA, Textos, Hook y SFX. Los efectos muy próximos muestran indicadores agrupados (`×16`, `×15`, etc.). No deben confundirse esos indicadores con pistas amontonadas ni con una prueba de mezcla correcta.
- Botones para añadir subtítulos en huecos, énfasis y SFX en el indicador temporal; deshacer/rehacer y zoom de timeline.
- Ajustes avanzados separados de presets rápidos y panel de efectos.
- Personalización de cada rol: **texto base**, **palabra destacada**, **acento cursivo**, cada uno con fuente y tamaño relativo. En Esteban Style se observaron Montserrat, Great Vibes y Montserrat respectivamente, escala 1×.
- Importación de fuentes WOFF2/WOFF/TTF/OTF: la interfaz indica hasta 10 fuentes y 5 MB por archivo, guardadas en este dispositivo. No se importaron ni validaron archivos.
- Panel B-Rolls: ofrece IA/Pexels vertical y video propio; anuncia que conservan transiciones y efectos. Es una descripción del producto, no una verificación de B-roll reproducido.

### Movimiento realmente observado

Al reproducir el ejemplo, el texto fue cambiando por frases/palabras mientras avanzaba el cursor; en 0:16 aproximadamente se vio «una nueva» y al pausar en 0:31.2 «probando la aplicación». El preview también separa texto de énfasis y subtítulo. Esto justifica separar roles y tiempos en Zentry, pero **no permite afirmar** duraciones de entrada exactas, curvas de easing, comportamiento de Pexels ni equivalencia con el MP4.

## 1. Actualizar plantillas existentes, sin duplicarlas

Los 11 estilos de referencia ya están declarados en `app/video/presets.ts`. La actualización debe reemplazar la definición/implementación correspondiente **en su mismo ID**; no añadir otra tarjeta con el mismo nombre. Los nombres locales tienen sufijos descriptivos, pero son las mismas entradas de catálogo.

| Referencia | ID existente que debe conservarse |
|---|---|
| Editorial Story | `editorialStory` |
| Impacto Stats | `impactoStats` |
| Motivacional | `motivacionalDual` |
| Minimal Clean | `minimalistaClean` |
| Instagram Viral | `instagramOrange` |
| Magazine Editorial | `magazineEditorial` |
| Simple Basic | `simpleBasic` |
| Helvetica Bold | `helveticaBold` |
| Esteban Style | `estebanStyle` |
| Ani Style | `aniStyle` |
| Bold Caps | `boldCaps` |

No borrar presets clásicos diferentes ni sobrescribir automáticamente plantillas personales del usuario. Para estas últimas, conservar su snapshot de configuración y versión; actualizar los presets del sistema no debe alterar una edición personalizada ya guardada.

- [ ] Definir una versión de presets y migración compatible con proyectos existentes.
- [ ] Usar nombres canónicos en el catálogo y descripciones separadas, sin presentar estilos propios como código oficial de Viroedit.
- [ ] Actualizar cada preset solo cuando su comportamiento haya sido especificado y probado.
- [ ] Comprobar unicidad por ID y alias normalizado de nombre.

## 2. Modelo de subtítulo con roles y alcance

Crear una configuración serializable por grupo con tres roles opcionales, tamaños relativos, colores, contorno, sombra, posición, animaciones de entrada/salida y énfasis. Reutilizar las propiedades actuales de fuente dual y `captionGroupStyles` en lugar de introducir un estado paralelo incompatible.

Precedencia propuesta: preset del sistema → personalización del proyecto → ajustes del grupo → ajustes de palabra, si existen. Una acción sobre el grupo seleccionado nunca modifica los demás sin elegir «Aplicar a todos».

- [ ] Texto base editable independientemente de palabra destacada y acento.
- [ ] Dos fuentes por línea cuando el usuario lo pida; preset personal Pacifico arriba/Anton abajo con aparición y entrada desde la derecha, como configuración propia solicitada previamente, no como efecto confirmado de Viroedit.
- [ ] Tamaños normales relativos al ancho útil del formato, con ajuste por longitud y líneas; no tomar 98/110 px del catálogo como garantía de lectura.
- [ ] Agrupación Auto/por palabras conservando timestamps originales.
- [ ] Guardar y aplicar todos los campos de plantilla, no solo nombre; límite de tres plantillas personales según el requisito previo.

## 3. Animaciones compartidas entre preview y exportación

El código local ya utiliza `@remotion/captions`, `Sequence`, `spring`, `interpolate` y frames en `app/video/CaptionLayer.tsx`. No es necesario sustituirlo por un video de ejemplo ni por una plantilla estática. La skill `remotion-captions` orienta a mantener JSON con tiempos de palabra y agrupación; este proyecto necesita su renderer personalizado por los roles y edición interactiva.

Separar datos de animación de componentes: una función pura recibe tiempo local, FPS y configuración y devuelve opacidad, desplazamiento, escala y color. Tanto el preview como Remotion deben consumirla. Evitar depender de transiciones CSS de reloj real para cambios de palabra: en `CaptionLayer.tsx` se observó `transition: 'color 0.12s ease'`, cuyo resultado en fotogramas aislados debe auditarse antes de mantenerlo.

**Valores de partida propuestos, NO medidos en Viroedit:** aparición 120–200 ms; entrada derecha 180–300 ms con desplazamiento relativo al ancho; pop de palabra suave 1→1.04→1; salida máxima 120 ms, recortada al fin del segmento. Todos editables, desactivables y compatibles con 24/30/60 FPS.

- [ ] Crear evaluador compartido de entrada, salida y énfasis activo.
- [ ] Mantener el texto legible durante el resto del segmento, sin hacerlo desaparecer al terminar la entrada.
- [ ] Tratar duraciones cortas y segmentos vacíos sin NaN ni escalas extremas.
- [ ] Medir diferencias preview/MP4 en principio, mitad y final de cada animación.

## 4. Subtítulos dentro de B-roll y motion

El B-roll cambia el fondo, no debe congelar ni reemplazar toda la transcripción con un párrafo estático. La capa de subtítulos permanece temporalmente activa sobre video original, video Pexels o fondo generado, salvo que un bloque de texto sea una sustitución explícita.

Reglas propuestas:

1. B-roll = fuente visual + rango + encuadre + transiciones. Texto = referencia a grupos de subtítulos + overrides, no una copia obsoleta de `text`.
2. Texto automático enlazado a la transcripción actual; texto manual protegido al resincronizar.
3. Si la escena muestra sus propios subtítulos, asignar un propietario del texto para no dibujarlo dos veces desde capas diferentes.
4. Sustituir B-roll seleccionado actualiza su mismo ID/rango y elimina su antiguo recurso cuando no esté referenciado; no insertar encima por defecto.
5. Igual resolución de estilos para subtítulos normales, texto del B-roll y motion.
6. Transición del video/fondo independiente de animación de texto. Sonido de teclado opcional sincronizado al texto, no reproducción constante por todo el clip.

Puntos de integración locales: `app/page.tsx`, `app/video/types.ts`, `app/video/CaptionLayer.tsx`, `app/video/ZentryComposition.tsx` (contiene `CustomBrollLayer`), `src/zentry/broll/BRollTemplates.tsx` y componentes de motion. Confirmar las rutas antes de editar; no asumir un archivo independiente `CustomBrollLayer.tsx`.

- [ ] Unificar resolución del texto automático y estilos.
- [ ] Definir política de visibilidad y evitar dobles subtítulos.
- [ ] Unificar transiciones de preview y render, incluyendo None/Spin/Slide.
- [ ] Editar fuente, color, animación, fondo y SFX desde el B-roll seleccionado.
- [ ] Sustituir, cortar, mover y eliminar sin dejar recursos o elementos fantasma.

## 5. Timeline e inspector

- [ ] Inspector contextual con sección simple y avanzada; no eliminar herramientas actuales.
- [ ] Selección coherente por ID entre canvas, pista e inspector.
- [ ] Carriles separados para elementos solapados; indicadores agrupados solo para ayudar a navegar, nunca para ocultar clips no editables.
- [ ] Recortes con remapeo de todas las capas, preservando referencia de origen de audios y palabras.
- [ ] Actualización inmediata y checkpoint de deshacer por operación completa.

## 6. Orden de implementación y aceptación

1. **Modelo/roles y resolución común:** pruebas unitarias de precedencia, serialización y migraciones.
2. **Motor de animación compartido:** pruebas en 24/30/60 FPS y comparación visual sin exportaciones con coste hasta tener preview correcto.
3. **B-roll/motion enlazados:** reemplazo y sincronización de texto, transiciones y SFX sin duplicados.
4. **Actualización de los 11 presets existentes:** una definición por ID; fuente dual, color, tamaño y animación se siguen pudiendo editar.
5. **Plantillas personales e inspector:** guardar tres, recargar, aplicar, actualizar y eliminar con verificaciones de timeline y datos exportados.
6. **Validación integral:** video vertical/horizontal, audios a 1× y velocidades explícitas, subtítulos y efectos en sus rangos; exportación y revisión del MP4.

La prueba debe incluir `Jose1998videoprueba.mp4` local, los 14 audios del requisito anterior, un B-roll local, un Pexels, los tres fondos y motion real. No subir esos archivos a terceros como parte de esta comparación.

### Matriz mínima por preset

Seleccionar → cambiar fuente/color/tamaño → animar → mover un grupo sin mover todos → usar sobre B-roll → guardar plantilla → recargar → aplicar → deshacer → exportar y revisar.

**Condición de terminado:** los textos responden a sus tiempos hablados, los presets no se duplican, los ajustes persisten y el MP4 coincide con el preview. Un nombre actualizado o una captura estática no basta.

## Código y derechos de la referencia

No hay un repositorio público ni una licencia de código aportados en esta conversación. Por ello no se ha copiado el código del servicio. Se propone desarrollar funciones equivalentes propias sobre la arquitectura ya presente en Zentry; si el usuario dispone de código con autorización de reutilización, se podrá evaluar por separado.
