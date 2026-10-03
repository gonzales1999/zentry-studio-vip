# Revisión de código — Zentry Studio — 01/10/2026

## Segunda revisión solicitada — audio original y configuración

Prioridad media/alta: retirada aceleración automática al subir; reproducción individual y velocidad manual hasta 5× añadidas. Ver pruebas y limitaciones en Soluciones y validación.

Hallazgos adicionales corregidos: ganancias de SFX B-roll/teclado/hook no respetaban volumen global (`ZentryComposition.tsx:942`); preview imponía volumen 0,4 a cada efecto (`page.tsx:1894`) y no resolvía el SFX predeterminado de Zentry; opción `none` seguía haciendo fade (`ZentryComposition.tsx:120`); snapshot/autoguardado omitían sombra, pop y volumen original; resincronización conservaba B-roll automático antiguo cuando el nuevo transcript no generaba eventos (`page.tsx`, `syncCaptionsWithUploadedAudio`).

Pendientes accionables:

- **P2, transiciones:** `CustomBrollLayer` resuelve spin global como whip-pan y no tiene ramas slide-up/down pese a existir en el tipo. Además una configuración global no sustituye transitionIn explícito de cada clip. Solución pendiente: modelo único de transición por clip, alcance visible (seleccionado/todos) y funciones de transformación compartidas entre preview y render; tests de cada opción. No se quitó ningún control.
- **P2, precisión de voz musical:** Whisper base produce palabras incompletas/erróneas en los cortes suministrados. La segunda prueba de dos MP3 reconoció solo «Ya!». Una transformación temporal correcta no mejora el modelo lingüístico. Evaluar modelo más preciso con referencia manual y compatibilidad real de CPU/GPU, sin inventar resultados.
- **P2, límites de pruebas:** faltan renders nuevos de todas las combinaciones y medidas de audio, más recarga dedicada de las nuevas opciones persistidas. Se probó upload/playback/speed/sync en navegador y TypeScript/build/tests locales, no la ausencia total de errores.

Skill aplicada: `E:/JOSE/recursos de  clases/creap mini app/zentry_webapp_skills_pack/09-code-review/code-review.md`. Se revisaron corrección, seguridad, rendimiento, mantenimiento y pruebas. Skill Supabase aplicada a los scripts SQL de cuentas.

## Resultado y alcance

Se identificaron 9 hallazgos accionables. Revisión del código fuente actual y comprobaciones locales; no se modificó el funcionamiento ni se ejecutaron escrituras sobre cuentas reales. La validación anterior de 14 audios y exportación al 100 % demuestra que el render termina, pero no demuestra sincronía ni precisión del texto reconocido. La auditoría anterior debe interpretarse con esta corrección.

- [x] Leer la skill solicitada.
- [x] Revisar carga, recorte, reproducción, transcripción y exportación de audio.
- [x] Revisar actualización de B-roll/motion, autoguardado y créditos.
- [x] Ejecutar TypeScript y ESLint.
- [x] Implementar las correcciones locales CR-01 a CR-09 (detalle y límites en Soluciones y validación).
- [x] Añadir pruebas de regresión de intervalos, velocidad, cortes y audio exportado tras eliminar silencios.
- [x] Verificar 14 pistas transcritas, recuperación tras recarga y velocidad de reproducción en navegador.
- [ ] Medir precisión lingüística y sincronía de cada palabra del MP4 contra una transcripción manual de referencia.
- [ ] Verificar en la base desplegada qué funciones y permisos están realmente activos.

## CR-01 — Alta: subtítulos comprimidos sin acelerar el audio

Ubicación: `app/page.tsx:1917`, `app/page.tsx:1885`, `app/page.tsx:3513`, `app/video/ZentryComposition.tsx:1037`.

La carga reduce proporcionalmente la duración visible de los 14 clips. Whisper lee las fuentes completas y multiplica el tiempo de cada palabra por `duration / sourceDuration`, pero reproducción y exportación conservan velocidad normal. El audio queda truncado y el subtítulo aparece antes de la palabra, incluso cuando esa palabra ya no se reproduce.

Reproducción numérica: fuente de 5 s, fragmento visible de 4,19 s, palabra en 4,5 s → subtítulo en 3,771 s, aunque la palabra está fuera del audio audible. Comprobado con Node.

Solución: representar explícitamente recorte y velocidad. Para recorte, transcribir únicamente el intervalo audible y sumar su posición sin escalar. Si se requiere encajar fuentes completas, procesar/acelerar audio y aplicar exactamente la misma transformación a reproducción, exportación y subtítulos, o extender la línea de tiempo.

## CR-02 — Alta: cortar un audio vuelve a transcribir el tramo eliminado

Ubicación: `app/page.tsx:2998`, `app/page.tsx:3484`, `app/page.tsx:3512`.

Dividir conserva `sourceDuration` del archivo original en ambas mitades. La sincronización lee desde `sourceStart` hasta `sourceStart + sourceDuration`, en lugar de terminar en el límite audible del fragmento. La primera mitad vuelve a leer la segunda y comprime sus palabras dentro de la primera; las palabras de la segunda también se generan otra vez. Recortar un fragmento causa el mismo problema.

Solución: calcular un intervalo de fuente por fragmento usando duración y velocidad; transcribir solo ese intervalo. Probar corte en dos, eliminación de la segunda mitad y nueva sincronización.

## CR-03 — Alta: permisos insuficientes en los scripts de créditos

Ubicación: `scripts/setup_vip_daily_and_sync.mjs:60`, `supabase_schema.sql:122`.

El script de renovación recrea `consume_export_credit` con `SECURITY DEFINER` y sin validar que el usuario solicitante sea el dueño. El esquema principal añade una condición, pero la omite cuando `auth.uid()` es NULL. No aparecen restricciones EXECUTE en estos archivos. Si estas definiciones se despliegan con permisos por defecto, un solicitante puede consumir créditos ajenos. No se comprobó la función activa ni se intentó atacar cuentas reales.

Solución: exigir identidad autenticada, comprobar propiedad/rol, restringir EXECUTE, fijar `search_path` y mantener una definición única mediante migraciones. Validar con roles reales dentro de transacciones revertidas. Referencia: [funciones y permisos de Supabase](https://supabase.com/docs/guides/database/functions).

## CR-04 — Media: duración numérica permite superponer música

Ubicación: `app/page.tsx:5356`, comparación con `app/page.tsx:2985`.

El arrastre del borde limita duración al siguiente audio; el campo numérico solo considera fin del video y duración de fuente. Aumentarlo puede invadir otro clip. La vista previa elige una sola pista con `find`, mientras el render exporta todas las pistas coincidentes, por lo que el resultado difiere de la previsualización.

Solución: usar una misma función de validación de intervalos para campo numérico, arrastre, carga y restauración. Probar dos clips contiguos y aumentar la duración del primero.

## CR-05 — Media: autoguardado pierde audio y ajustes

Ubicación: `app/page.tsx:2476`, `app/page.tsx:2504`, `app/page.tsx:2520`.

El borrador guardado y sus dependencias omiten `musicClips`. Las URLs blob no sobreviven a la recarga. Además se retira `processedAudioSrc` y no se guarda `sfxVolumeMultiplier`, aunque la restauración intenta leerlo. El aviso de autoguardado puede aparecer aun cuando estas partes de la edición no se recuperarán.

Solución: persistir medios locales en IndexedDB con referencias estables y guardar todos los ajustes. Restaurar medios, regenerar URLs y comprobar reproducción después de recargar. Si una fuente no está disponible, pedir reconexión explícita.

## CR-06 — Media: capas sin nueva voz conservan texto anterior

Ubicación: `app/page.tsx:3523`, `app/page.tsx:3532`, `app/page.tsx:3536`.

Al sincronizar, las capas sin intersección con nuevos subtítulos se devuelven intactas. Por tanto un B-roll o motion ubicado en una pausa puede conservar frases del video original. Las capas que abarcan varios grupos solo reciben el primer grupo encontrado.

Solución: distinguir texto manual de texto vinculado al transcript; limpiar/regenerar únicamente el texto vinculado y resolver todos los grupos que cubren el intervalo. Probar una capa antes de la primera voz y otra que cubra dos frases.

## CR-07 — Media: una fuente vacía desplaza la asignación de subtítulos

Ubicación: `app/page.tsx:3485`, `app/page.tsx:3510`.

Una forma de onda vacía se omite de `clipWaveforms`/`clipOffsets`, pero la asignación posterior usa `ordered[clipIndex]`. Si la primera fuente queda vacía, el resultado de la segunda se coloca sobre la primera. También se informa el total original como si todas hubieran sido procesadas.

Solución: almacenar juntos ID del clip, intervalo y forma de onda; usar esa colección para transcripción, remapeo y contador. Mostrar cuáles fuentes no pudieron procesarse.

## CR-08 — Media: cargas simultáneas pueden saltarse el límite de 14

Ubicación: `app/page.tsx:1893`, `app/page.tsx:1910`, `app/page.tsx:1938`, `app/page.tsx:5345`.

El límite se verifica antes del trabajo asíncrono usando el estado capturado. Mientras se decodifica, el botón no queda bloqueado por un estado específico de carga. Dos cargas pueden aprobar el límite con el mismo estado anterior; después ambas se anexan mediante actualización funcional, con posiciones calculadas contra listas antiguas.

Solución: serializar cargas o reservar capacidad/intervalos mediante un bloqueo de operación, y validar de nuevo al confirmar. Liberar URLs creadas si la operación falla.

## CR-09 — Media: blobs de audio sin liberación

Ubicación: `app/page.tsx:1898`, `app/page.tsx:1936`, `app/page.tsx:5357`, `app/page.tsx:3775`.

Las URLs se revocan al fallar el probe, pero no cuando se elimina música, se reinicia el proyecto o una carga falla después de decodificar otras fuentes. Repetir cargas de 14 archivos conserva recursos durante la sesión. Deshacer exige conservar algunas referencias, por lo que no basta revocar inmediatamente al eliminar.

Solución: un registro de medios compartido por timeline e historial, con liberación cuando no existan referencias y limpieza al desmontar/cerrar proyecto. Probar varias cargas y borrados observando memoria.

## Comprobaciones y límites

`npx tsc --noEmit`: aprobado, salida 0.

`npm run build`: aprobado, salida 0. Conserva el aviso de chunks mayores de 500 kB y la clasificación incompleta de rutas de vinext; no bloquean la compilación.

ESLint sobre `app/page.tsx`, `app/video`, `lib`, `components` y `app/api`: falló con 103 incidencias, 75 errores y 28 advertencias. Incluye reglas de hooks, tipado `any`, dependencias y variables no utilizadas. No deben interpretarse todas como 103 fallos funcionales distintos; los 9 hallazgos anteriores tienen causas y consecuencias concretas.

No hay script `test` en package.json. Los scripts de scratch inspeccionados simulan aplicación de plantillas, pero no prueban conjuntamente duración audible, subtítulos y audio exportado. Faltan pruebas de regresión para los casos anteriores.

Componente principal de más de 8.000 líneas: aumenta acoplamiento y dificulta comprobar que inspector, timeline y render usan la misma transformación. Extraer operaciones de audio y modelo temporal facilita las correcciones; prioridad posterior a los defectos de sincronía y permisos.

No se garantiza ausencia total de errores con una revisión estática. En esta revisión no se reprodujo el MP4 para medir sincronía ni se verificó el estado remoto de Supabase.
