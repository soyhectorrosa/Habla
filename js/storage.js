/* Almacenamiento progresivo. Se conservan claves locales para compatibilidad. */
window.HABLA_STORAGE=(()=>{
 'use strict';
 const KEYS=['habla.stats','habla.voiceProgress','habla.recognitionScores','habla.personal','habla.sessions','habla.prefs','habla.sessionTarget'];
 const DB='habla-data',STORE='entries';
 function db(){return new Promise((resolve,reject)=>{if(!window.indexedDB){reject(Error('IndexedDB no disponible'));return}
  const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
 async function mirror(key,value){if(!KEYS.includes(key))return;try{const d=await db();await new Promise((resolve,reject)=>{const tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).put(value,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});d.close()}catch(e){console.warn('No se pudo mantener copia IndexedDB',e)}}
 async function migrate(){for(const key of KEYS){const raw=localStorage.getItem(key);if(raw!==null){try{await mirror(key,JSON.parse(raw))}catch{}}}}
 function exportData(){const entries={};for(const key of KEYS){const raw=localStorage.getItem(key);if(raw!==null){try{entries[key]=JSON.parse(raw)}catch{}}}
  const payload={format:'HABLA-BACKUP',version:1,exportedAt:new Date().toISOString(),entries};
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download='HABLA-respaldo-'+new Date().toISOString().slice(0,10)+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
 }
 async function importData(file){if(!file||file.size>3_000_000)throw Error('El archivo es demasiado grande');const payload=JSON.parse(await file.text());
  if(payload?.format!=='HABLA-BACKUP'||payload.version!==1||!payload.entries||typeof payload.entries!=='object')throw Error('No es un respaldo válido de HABLA');
  if(!confirm('¿Restaurar el respaldo? Reemplazará el progreso y los personalizados actuales.'))return false;
  const validated=[];for(const [key,value] of Object.entries(payload.entries)){if(!KEYS.includes(key))continue;
   if(key==='habla.personal'&&(!Array.isArray(value)||value.length>100))throw Error('Lista de personalizados inválida');
   if(key==='habla.recognitionScores'&&(!Array.isArray(value)||value.length>500))throw Error('Historial de reconocimiento inválido');
   const raw=JSON.stringify(value);if(raw.length>1_500_000)throw Error('Respaldo inválido');validated.push([key,raw,value]);}
  for(const [key,raw,value] of validated){localStorage.setItem(key,raw);await mirror(key,value)}
  return true;
 }
 document.getElementById('exportData')?.addEventListener('click',exportData);
 document.getElementById('importData')?.addEventListener('change',async e=>{const out=document.getElementById('dataMessage');try{const done=await importData(e.target.files?.[0]);if(done){out.textContent='Respaldo restaurado. Recargando HABLA…';setTimeout(()=>location.reload(),400)}}catch(err){out.textContent=err.message||'No se pudo importar el respaldo'}finally{e.target.value=''}});
 return {mirror,migrate,exportData,importData};
})();
