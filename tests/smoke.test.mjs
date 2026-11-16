/* Pruebas estáticas y contratos básicos; no sustituyen pruebas reales de micrófono. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('JavaScript de los módulos compila',()=>{
 for(const path of ['app.js','js/content.js','js/storage.js','js/updates.js','sw.js'])assert.doesNotThrow(()=>new vm.Script(read(path),{filename:path}));
});
test('PWA precachea todo el código necesario',()=>{
 const sw=read('sw.js'),html=read('index.html');
 for(const file of ['./app.js','./styles.css','./js/content.js','./js/storage.js','./js/updates.js','./data/catalogo.json'])assert.ok(sw.includes("'"+file+"'"),file);
 for(const file of ['./js/content.js','./js/storage.js','./js/updates.js','./app.js'])assert.ok(html.includes('src="'+file+'"'),file);
});
test('Interfaz de práctica comparte exactamente tres controles principales',()=>{
 const app=read('app.js');
 assert.match(app,/class="practice-controls"/);
 assert.match(app,/data-action="toggleTranscript"/);
 assert.match(app,/id="recordButton"/);
 assert.match(app,/id="listenRecording"/);
 assert.doesNotMatch(app,/class="activity-cues"/);
});
test('Respaldo contiene formato versionado y claves personales',()=>{
 const source=read('js/storage.js');
 for(const key of ['habla.personal','habla.voiceProgress','habla.recognitionScores','HABLA-BACKUP'])assert.ok(source.includes(key));
});
test('El nuevo service worker requiere aprobación al actualizar',()=>{
 const sw=read('sw.js'),update=read('js/updates.js');
 assert.ok(sw.includes("SKIP_WAITING"));
 assert.ok(update.includes('recordingBusy()'));
 assert.ok(update.includes("controllerchange"));
});
test('El catálogo base sigue siendo JSON válido',()=>{
 const data=JSON.parse(read('data/catalogo.json'));
 assert.ok(data.length>300);
 assert.equal(new Set(data.map(x=>x.id)).size,data.length);
});
