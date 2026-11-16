/* Service worker con actualización consentida y segura durante la grabación. */
window.HABLA_UPDATES=(()=>{
 'use strict';let registration=null,readyToReload=false,recordingBusy=()=>false;
 const banner=document.getElementById('updateBanner'),now=document.getElementById('updateNow'),later=document.getElementById('updateLater');
 function show(){if(registration?.waiting&&navigator.serviceWorker.controller)banner.hidden=false}
 function check(){return navigator.onLine?registration?.update().catch(()=>{}):Promise.resolve()}
 function activate(){if(recordingBusy()){now.textContent='Termina de grabar primero';return}
  if(!registration?.waiting)return;readyToReload=true;now.textContent='Actualizando…';now.disabled=true;registration.waiting.postMessage({type:'SKIP_WAITING'})}
 function init(isRecording){recordingBusy=isRecording;
  if(!('serviceWorker' in navigator)||location.protocol==='file:')return;
  navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(reg=>{
   registration=reg;if(reg.waiting)show();
   reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed')show()})});
   check();
  }).catch(console.warn);
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(readyToReload)location.reload()});
  window.addEventListener('online',check);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
 }
 now?.addEventListener('click',activate);later?.addEventListener('click',()=>banner.hidden=true);
 document.getElementById('checkUpdates')?.addEventListener('click',async()=>{await check();const out=document.getElementById('dataMessage');out.textContent=registration?.waiting?'Hay una actualización disponible.':'Comprobación realizada; si hay novedades se avisará.';show()});
 return {init,check};
})();
