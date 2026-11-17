# HABLA — instrucciones para asistentes de desarrollo

## Modern Web Guidance

Antes de modificar HTML, CSS, JavaScript, APIs de voz o la PWA, consultar las recomendaciones pertinentes del proyecto [Modern Web Guidance](https://github.com/GoogleChrome/modern-web-guidance).

En un entorno con Node.js/npm:

```sh
npx modern-web-guidance@latest install
npx modern-web-guidance@latest search "accessible responsive buttons"
npx modern-web-guidance@latest search "progressive web app offline service worker"
npx modern-web-guidance@latest legacy-scan .
```

La instalación es interactiva y depende del agente local. No afirmar que se instaló o que se ejecutaron las comprobaciones sin evidencia de ejecución. No activar funciones experimentales de forma predeterminada. Verificar Baseline y ofrecer degradación progresiva cuando sea necesario.

## Requisitos permanentes del producto

- HABLA es una PWA estática y gratuita para practicar comunicación y lenguaje, orientada también a adultos mayores.
- Mantener controles con nombres accesibles, foco visible, contraste suficiente, tamaños táctiles adecuados y diseño flexible al ampliar el texto.
- Favorecer HTML semántico y funciones nativas del navegador, con alternativas cuando una API no está disponible.
- Mantener las tres acciones de práctica («Grabar», «Mi voz», «Texto») ordenadas y utilizables en móvil sin provocar desbordamiento horizontal.
- Nunca presentar el reconocimiento de voz o la coincidencia textual como diagnóstico o puntuación clínica. Puede fallar con trastornos del habla.
- El reconocimiento de voz puede procesarse fuera del dispositivo. Explicar límites de privacidad y permitir practicar sin transcribir.
- No hacer cambios que eliminen grabación, reproducción, categorías, progreso, exportación de datos o uso sin conexión.
- Probar permisos de micrófono, carga y actualización de service worker, modo offline, instalación en Android Chrome y controles de teclado.
- No introducir librerías pesadas sin necesidad comprobada.

## Comprobaciones antes de integrar

1. Servir por HTTP local o HTTPS; no probar desde `file://`.
2. Verificar comportamiento en viewport estrecho, zoom de texto 200 %, teclado y lectores de pantalla.
3. Comprobar primera carga, actualización de caché y funcionamiento sin conexión.
4. Registrar versiones de navegador y dispositivo para pruebas reales de grabación y transcripción.
5. Revisar hallazgos de `legacy-scan` manualmente: no aplicar cambios masivos automáticos.

## Auditoría inicial

Consultar `docs/modern-web-audit.md` antes de planificar cambios.
