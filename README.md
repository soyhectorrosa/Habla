# HABLA Lite — prototipo funcional PWA

Web app estática para práctica autónoma del lenguaje en adultos. Usa HTML, CSS, JavaScript y SVG, sin dependencias externas, registro, servidor ni imágenes descargadas. Incluye las 395 actividades del catálogo facilitado. Material pendiente de revisión logopédica: no es tratamiento ni sustituye atención profesional.

## Probar localmente

Desde esta carpeta: `python3 -m http.server 8080`, luego visitar `http://localhost:8080` en el navegador. **No abrir index.html por file://**: el catálogo y el service worker requieren HTTP o HTTPS. Para probar desde un móvil, publicar en HTTPS; el acceso al micrófono requiere contexto seguro y permiso del usuario.

## Publicar en GitHub Pages

Esta carpeta contiene una **app independiente**, no un parche directo del repositorio original. Respaldar primero la versión actual. Copiar los archivos de esta carpeta a la raíz de una rama nueva o nuevo repositorio para revisar antes de reemplazar el sitio publicado. GitHub Pages debe servir `index.html` desde la raíz elegida. Revisar su URL de publicación y actualizar el caché `CACHE` en `sw.js` al cambiar versiones.

## Funcionalidades

- Inicio simplificado; catálogo 12 áreas y 395 ejercicios; práctica corta guiada.
- Lectura por voz sintetizada (si la voz está disponible); grabación local temporal (MediaRecorder); pistas escalonadas, respuestas revelables y controles de navegación.
- Tablero de comunicación con 12 mensajes y pictogramas SVG **integrados en app.js**; también admite texto sin pictogramas y mensajes propios.
- Ajustes: texto grande, contraste alto, reducción de movimiento, visualización de pictogramas, velocidad de voz.
- Progreso y favoritos guardados en localStorage, con borrado voluntario. Sin puntuación de pronunciación.
- App instalable según compatibilidad del navegador; assets precacheados por service worker tras primera carga.

## Limitaciones y validación pendiente

- Los SVG son **íconos provisionales**, no pictogramas validados para comunicación aumentativa. Validar reconocimiento con usuarios reales, sobre todo para conceptos abstractos.
- Algunas actividades del catálogo tienen consignas genéricas. Revisar por logopeda/fonoaudiólogo antes de ofrecer como material validado.
- La voz síntesis del sistema puede no estar disponible sin conexión, ni con acento regional. Nunca depender de ella para completar una actividad.
- MediaRecorder no envía las grabaciones desde el código de HABLA: quedan en memoria y se descartan al cambiar de pantalla o cerrar. En navegadores/sistemas particulares, las garantías de privacidad dependen del entorno del usuario.
- No se implementa reconocimiento del habla ni métricas clínicas.
- Requiere evaluación WCAG 2.2 AA, pruebas manuales con teclado/lector de pantalla, pruebas offline/móviles económicos y pruebas con personas con afasia, apraxia o disartria.
- Icono SVG del manifiesto: algunos navegadores requieren PNG para instalación completa. Puede agregarse un PNG generado desde el SVG si hace falta.
