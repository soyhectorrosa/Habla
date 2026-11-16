# ArquiVoz — Herramienta Complementaria de Práctica Logopédica (PWA)

Aplicación web progresiva (PWA) estática, gratuita y de código abierto diseñada como apoyo complementario para la rehabilitación vocal y neurolingüística en adultos tras un ictus (ACV), con enfoque funcional y profesional.

> **Aviso Clínico Importante:** Esta herramienta es exclusivamente un recurso de práctica complementaria en casa. **No sustituye** la evaluación, el diagnóstico ni el tratamiento presencial de un logopeda o fonoaudiólogo. Se recomienda que un profesional valide el nivel de dificultad y la secuencia de ejercicios según el cuadro clínico individual.

## Características Principales

- **100% Offline y Privada (Sin Backend):** Funciona sin conexión a internet tras la primera carga. Todos los registros de práctica, configuraciones y frases personalizadas se almacenan exclusivamente en el dispositivo del usuario (`localStorage`).
- **Tolerante a Pausas (Afasia):** El reconocimiento de voz continuo reanuda automáticamente la captura ante pausas prolongadas de búsqueda léxica sin penalizar el silencio.
- **Autoevaluación Guiada + Grabación Real:** Permite grabar y escuchar la propia voz para compararla con el modelo, evitando depender de puntuaciones automáticas engañosas.
- **Catálogo Modular en JSON:** Ejercicios organizados por áreas clínicas (Calentamiento orofacial, Voz y volumen, Articulación, Lenguaje/Léxico y Guiones funcionales) editables sin tocar el código fuente.
- **Accesibilidad:** Tipografía escalable, modo de alto contraste y selector de variante de español (`es-NI`, `es-MX`, `es-US`, `es-ES`).
- **Exportación Clínica:** Descarga de historial en formato JSON para compartir el progreso con el terapeuta.

## Estructura del Proyecto

```text
/
├── index.html               # Interfaz principal y modal de configuración
├── styles.css               # Estilos nativos responsivos y de alto contraste
├── app.js                   # Lógica clínica, audio y gestión local
├── manifest.json            # Metadatos PWA para instalación en Android/iOS
├── sw.js                    # Service Worker para caché offline
└── data/
    ├── calentamiento.json
    ├── voz_articulacion.json
    ├── lenguaje.json
    └── funcional.json
