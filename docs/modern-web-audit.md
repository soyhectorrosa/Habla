# HABLA — primera auditoría Modern Web Guidance

Fecha: 2026-11-17. Alcance: revisión estática de archivos del repositorio. **No** se ha ejecutado el CLI, ni Lighthouse, ni pruebas en navegador/dispositivo.

## Lo identificado

| Área | Evidencia | Acción recomendada | Prioridad |
| --- | --- | --- | --- |
| PWA | `index.html` enlaza a `manifest.webmanifest` y `js/updates.js` registra `sw.js`. El manifiesto incluye PNG 192 y 512 y `display: standalone`. | Verificar instalación real en Chrome Android y recursos de iconos; no dar por rota la PWA solo por existir otro manifiesto antiguo. | Alta |
| Manifiestos | También existe `manifest.json` de «ArquiVoz», distinto al enlazado desde `index.html`. | Comprobar referencias antes de eliminar un archivo posiblemente legado; evitar confundir usuarios y mantenedores. | Media |
| Caché | `sw.js` usa `habla-lite-v21` con precaché de archivos principales y estrategia network-first para solicitudes GET del mismo origen. | Comprobar offline, actualización, caché de respuestas y navegación en Android. | Alta |
| Accesibilidad | Hay enlace «Ir al contenido», estados anunciables y ajustes de tamaño/contraste/movimiento. | Probar WCAG 2.2 AA, zoom 200 %, foco y lectura por tecnologías de apoyo. | Alta |
| Grabación | `app.js` usa `MediaRecorder`; transcripción mediante API de reconocimiento dependiente del navegador. | Probar permisos, soporte, resultados vacíos, tiempos de espera y experiencia posterior a «Detener». | Alta |
| Interfaz de práctica | `app.js` genera los controles «Grabar», «Mi voz» y «Texto», y navegación «Anterior»/«Siguiente». | Revisar anchos y desbordes en móviles y con texto grande; no reducir el objetivo táctil para hacer caber etiquetas. | Alta |
| Documentación | `README.md` contiene secciones de distintas versiones y afirmaciones históricas. | Consolidar requisitos vigentes y casos de prueba, después de confirmar el código en producción. | Media |

## Plan de validación

1. Instalar Modern Web Guidance en un entorno de desarrollo con Node.js: `npx modern-web-guidance@latest install`.
2. Ejecutar `npx modern-web-guidance@latest legacy-scan .` y guardar los hallazgos para revisión. El CLI no se ha ejecutado como parte de esta auditoría.
3. Abrir HABLA mediante HTTPS y medir Lighthouse (Performance, Accessibility, Best Practices, PWA donde aplique).
4. Probar en Android Chrome: instalación, primer inicio, micrófono, detener grabación, audio, transcripción disponible/no disponible, actualización y offline.
5. Corregir problemas en PR separados, preservando la rama principal hasta validar pruebas.

## Criterios de aceptación

- Los tres controles de práctica siguen visibles y utilizables en el ancho objetivo, sin colisiones ni recortes.
- La transcripción no bloquea las funciones principales cuando el navegador no la soporta.
- No se expone una calificación clínica generada a partir de coincidencia de texto.
- El sitio puede actualizarse y abrirse sin conexión tras precaché correcto.
- Se documentan pruebas manuales con modelos de dispositivos y navegadores concretos.

Documentación oficial: https://github.com/GoogleChrome/modern-web-guidance
