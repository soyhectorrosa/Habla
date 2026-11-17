# HABLA — marco de contenidos motores basado en ASHA (borrador de producto)

Estado: **propuesta educativa pendiente de evaluación clínica y pruebas de usabilidad**. No es un tratamiento aprobado, ni la American Speech-Language-Hearing Association (ASHA) avala HABLA.

## Alcance

Tomamos como referencia **apraxia adquirida del habla en adultos**, no apraxia infantil. ASHA explica que la apraxia adquirida afecta a la planificación/programación fonética y prosódica; puede coexistir con afasia o disartria. El diagnóstico diferencial y la individualización corresponden a profesionales clínicos.

**Fuente primaria**: https://www.asha.org/practice-portal/clinical-topics/acquired-apraxia-of-speech/

**Síntesis de evidencia ASHA 2023**: https://apps.asha.org/EvidenceMaps/Articles/ArticleSummary/c839b734-25c7-ed11-8145-005056834e2b

**Revisión sistemática**: https://pubs.asha.org/doi/10.1044/2022_AJSLP-21-00236

## Qué procede de ASHA

- Los abordajes articulatorio-cinemáticos trabajan planificación y programación del movimiento del habla.
- La estimulación integral combina modelos auditivos y visuales, imitación, producción simultánea y retirada gradual del modelo.
- Sound Production Treatment (SPT) utiliza objetivos problemáticos **individualizados** y una jerarquía de respuesta con modelado, repetición y pistas; no equivale a ejecutar una lista fija de ejercicios.
- También se describen abordajes de control del ritmo/prosodia y ayudas sensoriales, adecuados según perfil.
- La selección de blancos, tipo de práctica, frecuencia de retroalimentación y progresión dependen del caso.
- La comunicación aumentativa/alternativa puede ser importante. HABLA debe conservar «Comunicarme».

## Decisiones de diseño de HABLA (NO protocolos prescritos por ASHA)

La interfaz tendrá cinco **filtros** o familias de estímulos y no cinco niveles de gravedad:

1. Inicio y secuencias sencillas
2. Transiciones articulatorias entre sílabas
3. Transiciones vocálicas (incluye diptongos o hiatos cuando sean relevantes)
4. Grupos consonánticos y estructuras complejas
5. Frases funcionales, ritmo y prosodia

Estas familias son **taxonomía propia del producto**, no categorías clínicas oficiales ASHA. No existen pruebas en las fuentes citadas para ordenar automáticamente a todos los pacientes por ellas. No afirmar que los diptongos sean siempre el problema central.

Cada estímulo tendrá: `id`, `text`, `family`, `speechTargets`, `syllablePattern`, `transition`, `functional`, `support`, `reviewStatus`, `sourceBasis`. No asignar porcentajes de mejora ni dificultad universal.

## Ilustraciones

Los modelos se construirán como SVG originales, sin IA generativa ni imágenes externas. Una vista frontal puede apoyar el cierre/redondeo labial; un corte sagital puede ilustrar lengua, reborde alveolar y paladar. Un SVG estático **no demuestra el movimiento temporal exacto** ni valida la pronunciación. Marcar materiales como orientativos hasta revisión por especialista; evitar presentar un dibujo esquemático como anatomía verificada.

## Registros y controles

- Ofrecer un modelo auditivo, una ayuda visual opcional, práctica y reproducción del intento.
- La transcripción automática NO identifica de manera fiable errores articulatorios ni determina el progreso clínico.
- Registrar intentos, autopercepción y apoyo usado sin emitir diagnóstico ni puntuaciones terapéuticas.
- No forzar repeticiones ni velocidades universales. Permitir descansar y ocultar pistas cuando sea apropiado.
- Mantener visibles las cuatro herramientas: Mis palabras y frases, Repasar lo que me cuesta, Mi progreso, Comunicarme.
- Probar accesibilidad WCAG 2.2 AA, especialmente lectura, botones, contraste, pantalla reducida y lector de pantalla.

## Pendientes antes de publicación clínica

1. Revisar con fonoaudiólogo/logopeda y hablantes de español de la población destinataria.
2. Validar la exactitud anatómica de cada SVG y la naturalidad de cada modelo auditivo.
3. Revisar los metadatos fonéticos del español (diptongos, hiatos, silabificación y dialectos).
4. Probar que los ejemplos no sean interpretados como una pauta terapéutica universal.
5. Documentar privacidad y limitaciones del reconocimiento por voz en navegadores.
