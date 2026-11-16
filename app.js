(()=>{'use strict';
const TRACKS=[['comunicacion','Comunicación esencial','Mensajes cotidianos para expresar necesidades.','chat'],['automatico','Lenguaje automático','Secuencias y expresiones conocidas.','repeat'],['comprension','Comprensión','Responder preguntas con sí o no.','ear'],['repeticion','Repetir palabras y frases','Escuchar y practicar a tu ritmo.','sound'],['denominacion','Encontrar palabras','Pistas que ayudan a recordar.','search'],['semantica','Completar ideas','Relacionar palabras y significados.','puzzle'],['frases','Construir frases','Practicar mensajes completos.','chat'],['motor_habla','Sílabas y palabras','Practicar secuencias en palabras reales.','sound'],['disartria','Habla clara','Practicar pausas y claridad sin esfuerzo.','sound'],['lectura','Lectura con apoyo','Leer, escuchar o señalar.','book'],['conversacion','Conversación guiada','Practicar respuestas cotidianas.','chat'],['laboral','Situaciones laborales','Frases para trabajo y reuniones.','briefcase']];
const ICONS={chat:'<path d="M4 5h16v12H9l-5 4z"/>',repeat:'<path d="M4 7h13l-3-3m3 3-3 3M20 17H7l3 3m-3-3 3-3"/>',ear:'<path d="M12 21c-4 0-4-5-1-7 2-1 3-2 3-5 0-4-6-4-6 0M6 9a6 6 0 0 1 12 0c0 5-4 6-5 8"/>',sound:'<path d="M4 9v6h4l5 4V5L8 9zm12-1q4 4 0 8m2-11q7 7 0 14"/>',search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',puzzle:'<path d="M4 4h6v3a2 2 0 0 0 4 0V4h6v6h-3a2 2 0 0 0 0 4h3v6h-6v-3a2 2 0 0 0-4 0v3H4v-6h3a2 2 0 0 0 0-4H4z"/>',book:'<path d="M12 6q-4-3-9-2v15q5-1 9 2 4-3 9-2V4q-5-1-9 2zm0 0v15"/>',briefcase:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V4h8v3M3 13h18"/>',cup:'<path d="M7 4h10l-1 15H8zM17 7h4v4l-4 3M6 21h13"/>',food:'<path d="M4 3v7m3-7v7M4 7h3M5.5 10v11M16 3v18m0-18q-6 7 0 11"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.8 2.8 0 0 1 5 1c0 2-2.5 2-2.5 4m0 3v.2"/>',bath:'<path d="M5 10h14v5a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6zM7 10V6a3 3 0 0 1 6 0"/>',bed:'<path d="M3 6v15m0-5h18v5m-18-9h6V9H3zm6-4h12v8H9z"/>',pain:'<path d="M12 21s-9-5.3-9-11A5 5 0 0 1 12 7a5 5 0 0 1 9 3c0 5.7-9 11-9 11zM12 9v6m-3-3h6"/>',yes:'<path d="m4 12 5 5L20 6"/>',no:'<path d="M5 5 19 19M19 5 5 19"/>',slow:'<path d="M5 12h14M12 5l-7 7 7 7"/>',person:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',home:'<path d="m3 11 9-8 9 8v10h-7v-7h-4v7H3z"/>'};
const svg=(name)=>`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]||ICONS.chat}</svg>`;
const escapeHtml=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let session={active:false,paused:false,elapsed:0,start:0,target:600,notified:false},timerInterval=null,recognition=null;
let transcriptionFinal="";
const VOICE_TRACKS=new Set(['repeticion','motor_habla','disartria','lectura']);
const shuffle=a=>{const out=[...a];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out};
function voiceWord(a){const word=String(a.expectedAnswer||'').trim();return /^[\p{L}]{2,20}$/u.test(word)?word:null}
function voicePool(){return data.filter(a=>VOICE_TRACKS.has(a.track)&&voiceWord(a))}
function startVoicePractice(){startSession();const p=voiceProgress(),recent=recognitionHistory();const low=new Set(recent.slice(-100).filter(x=>x.score<75).map(x=>x.id));const hard=new Set(Object.entries(p.words).filter(([,w])=>w.harder>w.easier).map(([id])=>id));const pool=shuffle(voicePool());const preferred=pool.filter(a=>low.has(a.id)||hard.has(a.id));const fresh=pool.filter(a=>!low.has(a.id)&&!hard.has(a.id));items=preferred.length?shuffle([...preferred.slice(0,Math.min(12,preferred.length)),...fresh.slice(0,Math.min(12,fresh.length))]):pool;if(stats.lastVoice&&items.length>1&&items[0].id===stats.lastVoice)[items[0],items[1]]=[items[1],items[0]];idx=0;route='voicePractice';renderActivity()}
function voiceProgress(){return read('habla.voiceProgress',{attempts:0,easier:0,harder:0,words:{}})}
function recognitionHistory(){return read('habla.recognitionScores',[])}
function saveRecognition(exercise,text,score){
 if(!exercise||route!=='voicePractice')return;
 const history=recognitionHistory();
 history.push({id:exercise.id,word:voiceWord(exercise)||exercise.prompt,at:new Date().toISOString(),score,recognized:text.slice(0,100),engine:'browser-text-v1'});
 save('habla.recognitionScores',history.slice(-500));
 const badge=$('#scoreSaved');if(badge)badge.textContent='Resultado guardado en este dispositivo.';
}
function scoreSummary(){
 const h=recognitionHistory(),byWord=new Map();
 for(const e of h){if(!byWord.has(e.id))byWord.set(e.id,[]);byWord.get(e.id).push(e)}
 const recent=h.slice(-10);
 const avg=recent.length?Math.round(recent.reduce((n,e)=>n+e.score,0)/recent.length):null;
 const challenging=[...byWord.values()].filter(arr=>arr.length).map(arr=>arr[arr.length-1]).sort((a,b)=>a.score-b.score).slice(0,5);
 return {h,avg,challenging};
}
function rateVoice(easy){const a=items[idx];if(!a)return;const p=voiceProgress();p.attempts++;p[easy?'easier':'harder']++;const w=p.words[a.id]||{attempts:0,easier:0,harder:0};w.attempts++;w[easy?'easier':'harder']++;p.words[a.id]=w;save('habla.voiceProgress',p);stats.lastVoice=a.id;save('habla.stats',stats);notify(easy?'¡Bien! Registraste cómo te sentiste.':'Registrado. Puedes repetir con más calma o continuar.');const box=$('#selfRating');if(box)box.textContent=easy?'✓ Hoy la sentiste más fácil.':'✓ Hoy te costó. Practicar también cuenta.'}
function audioInstruction(){const a=items[idx];const word=voiceWord(a)||a.prompt;speak('Escucha la palabra. Luego intenta decir: '+word+'. Graba tu voz. Escúchate y vuelve a intentarlo. Si cuesta, habla despacio y por partes.')}
let data=[],route='home',track='comunicacion',level='all',items=[],idx=0,recording=null,stream=null,recChunks=[],audioURL=null,recAudio=null;
const $=s=>document.querySelector(s);const app=$('#app');const prefs=Object.assign({largeText:false,contrast:false,reduceMotion:false,showIcons:true,speechRate:'0.9'},read('habla.prefs',{}));let stats=read('habla.stats',{done:{},favorites:[],last:null});
function read(key,def){try{return JSON.parse(localStorage.getItem(key))||def}catch{return def}}function save(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{notify('No se pudo guardar en este dispositivo.')}}
function notify(msg){let el=$('#feedback');if(el)el.textContent=msg;else $('#footState').textContent=msg}
function setPage(html){stopRecognition();stopAudio();app.innerHTML=html;window.scrollTo({top:0,behavior:'instant'});$('#main').focus({preventScroll:true})}
function btn(label,action,cls='button',attrs=''){return `<button type="button" class="${cls}" data-action="${action}" ${attrs}>${label}</button>`}
function home(){if(session.active)pauseSession();route='home';const count=Object.keys(stats.done).length;setPage(`<section class="hero"><span class="eyebrow">Bienvenido a HABLA</span><h1>Un espacio para practicar, a tu ritmo.</h1><p>Escucha, intenta y repite las veces que quieras. Con paciencia, a tu propio ritmo.</p>${btn('Practicar mi pronunciación →','voicePractice','button primary')}</section><section class="grid" aria-label="Accesos principales"><button class="card clickable" data-action="voicePractice">${svg('sound')}<h2>Mi práctica de voz</h2><p>Escucha una palabra, pronúnciala y compara con tu propia grabación.</p><span class="tag">Palabras en orden aleatorio</span></button><button class="card clickable" data-action="catalog">${svg('sound')}<h2>Quiero practicar</h2><p>Palabras, frases y conversaciones.</p><span class="tag">395 actividades</span></button><button class="card clickable" data-action="board">${svg('chat')}<h2>Quiero comunicarme</h2><p>Mensajes útiles que puedes mostrar o reproducir.</p><span class="tag">Sin necesidad de hablar</span></button><button class="card clickable" data-action="daily">${svg('repeat')}<h2>Mi práctica de hoy</h2><p>Una selección breve de ejercicios. Puedes detenerte cuando quieras.</p></button><button class="card clickable" data-action="progress">${svg('book')}<h2>Mi actividad</h2><p>${count} actividades practicadas. Guardadas en este dispositivo.</p></button></section>`)}
function catalog(){if(session.active)pauseSession();route='catalog';setPage(`<div class="toolbar">${btn('← Inicio','home')}</div><span class="eyebrow">Biblioteca de práctica</span><h1 class="section-title">Elige qué quieres practicar</h1><p class="muted">Puedes empezar por cualquier categoría. No hay niveles obligatorios.</p><div class="categories">${TRACKS.map(([key,name,desc,icon])=>`<button class="card clickable category" data-track="${key}">${svg(icon)}<span><b>${escapeHtml(name)}</b><small>${data.filter(x=>x.track===key).length} actividades · ${escapeHtml(desc)}</small></span></button>`).join('')}</div>`)}
function openTrack(t,lev='all',daily=false){startSession();track=t;level=lev;items=shuffle(data.filter(x=>x.track===t&&(level==='all'||x.difficulty===Number(level))));idx=0;route=daily?'dailyPractice':'practice';renderActivity()}
function getSequence(){startSession();const ids=['HAB-0002','HAB-0004','HAB-0006','HAB-0101','HAB-0141','HAB-0211','HAB-0341','HAB-0311'];items=shuffle(ids.map(id=>data.find(x=>x.id===id)).filter(Boolean));idx=0;route='dailyPractice';renderActivity()}
function renderActivity(){
 if(!session.active)startSession();
 const a=items[idx];if(!a){catalog();return}
 const favorite=stats.favorites.includes(a.id);const voiceMode=route==='voicePractice';const target=voiceWord(a);
 const choices=a.type==='comprehension'?'<div class="choices yes-no">'+a.options.map((o,i)=>btn(escapeHtml(o),'choice:'+i,'button choice-button')).join('')+'</div><div id="choiceResult" class="choice-result" role="status" aria-live="polite"></div>':'';
 let hints='';if(a.semanticHint)hints+=btn('Pista de significado','hintSemantic','button secondary');if(a.phoneticHint)hints+=btn('Pista de sonido','hintPhonetic','button secondary');if(a.expectedAnswer||a.answer)hints+=btn('Mostrar respuesta','answer','button secondary');if(a.syllables)hints+=btn('Ver apoyo','support','button secondary');
 setPage(`<div class="practice"><div class="practice-nav">${btn('← Volver','catalog','button compact-back')}<span class="pill">${route==='dailyPractice'?'Mi práctica':escapeHtml(TRACKS.find(x=>x[0]===a.track)?.[1])}</span><span class="activity-number">${idx+1}/${items.length}</span></div><div class="progressbar" aria-label="Progreso de la serie"><span style="width:${((idx+1)/items.length)*100}%"></span></div><section class="activity" aria-label="Ejercicio"><span class="eyebrow">${escapeHtml(a.goal)}</span><div class="practice-guidance"><p class="instruction">${escapeHtml(voiceMode?'Escucha o lee la palabra. Dila, grábate y escucha tu voz. Puedes intentarlo varias veces.':a.instruction)}</p>${voiceMode?btn('🔊 Escuchar instrucciones','audioInstruction','button secondary'):''}</div><h1 class="word">${escapeHtml(voiceMode&&target?target:a.prompt)}</h1>${voiceMode?'<div class="word-play">'+btn('🔊 Escuchar palabra','speak','button primary')+'</div>':''}${choices}<div class="core-controls">${voiceMode?'':btn('🔊 Escuchar','speak','button primary')}${btn('🎙 Grabar','record','button','id="recordButton"')}${btn('▶ Mi voz','playRecording','button','id="listenRecording" disabled')}</div><section class="compact-transcript" aria-label="Resultado de la voz"><div class="transcript-title">Lo que escuchó el dispositivo <span id="transcribeState" role="status" aria-live="polite"></span></div><p id="recognizedText" class="recognized-text">Aparecerá después de grabar.</p><div class="transcript-actions">${btn("🎤 Intentar transcripción","recognize","button secondary compact","id=\"retryTranscribe\"")}${btn("■ Detener escucha","stopRecognition","button compact","id=\"stopRecognition\" hidden")}</div><div id="matchResult" class="match-result" hidden aria-live="polite"></div><small id="scoreSaved" role="status"></small></section><div class="actions help-actions">${hints}</div><div id="clue" class="hintbox" hidden></div>${a.type==='dialogue'?'<label class="field">Respuesta escrita (opcional)<textarea id="answerText"></textarea></label>':''}<div id="feedback" class="feedback" role="status" aria-live="polite"></div>${voiceMode?`<div class="voice-evaluation"><p><strong>¿Cómo sentiste tu pronunciación?</strong></p><div class="actions">${btn('🙂 Me salió mejor','rateEasy','button primary')}${btn('🔁 Me costó','rateHard','button secondary')}</div><p id="selfRating" role="status" aria-live="polite"></p><small>Tu percepción es importante. El reconocimiento de texto no mide con precisión la pronunciación.</small></div>`:`<div class="finish-actions">${btn(favorite?'★ Guardado':'☆ Guardar','favorite','button compact')}${btn('✓ Practicado','complete','button secondary compact')}</div>`}</section><div class="step-nav">${btn('← Anterior','prev','button',idx===0?'disabled':'')}${btn('Siguiente →','next','button primary')}</div></div>`);
}
const BOARD=[['Sí','yes'],['No','no'],['Quiero agua','cup'],['Tengo hambre','food'],['Necesito ayuda','help'],['Quiero ir al baño','bath'],['Quiero descansar','bed'],['Me duele','pain'],['No entiendo','help'],['Hable más despacio','slow'],['Llame a mi familia','person'],['Repita, por favor','repeat']];
function board(){if(session.active)pauseSession();route='board';setPage(`<div class="toolbar">${btn('← Inicio','home')}</div><span class="eyebrow">Comunicación cotidiana</span><h1 class="section-title">¿Qué necesitas decir?</h1><p class="muted">Pulsa una frase para mostrarla y escucharla. Puedes señalarla si la voz no está disponible.</p><div class="board">${BOARD.map(([txt,ico],i)=>`<button class="card clickable" data-phrase="${i}">${prefs.showIcons?svg(ico):''}<b>${escapeHtml(txt)}</b></button>`).join('')}</div><div class="card" style="margin-top:18px"><label for="customPhrase"><b>Mi propio mensaje</b></label><textarea id="customPhrase" maxlength="200" placeholder="Escribe una frase corta..."></textarea>${btn('🔊 Leer mensaje','customSpeak','button primary')}</div><p id="feedback" class="feedback" role="status" aria-live="polite"></p>`)}
function progress(){if(session.active)pauseSession();route='progress';const vp=voiceProgress();const summary=scoreSummary();const done=Object.keys(stats.done).length;const total=Object.values(stats.done).reduce((s,n)=>s+n,0);setPage(`<div class="toolbar">${btn('← Inicio','home')}</div><span class="eyebrow">Mi actividad</span><h1 class="section-title">Tu práctica</h1><div class="grid"><div class="card"><h2>${summary.h.length}</h2><p>Intentos con reconocimiento de voz</p></div><div class="card"><h2>${summary.avg===null?'—':summary.avg+'%'}</h2><p>Coincidencia media de texto de los últimos 10 intentos reconocidos (no mide pronunciación)</p></div><div class="card"><h2>${vp.attempts}</h2><p>Intentos de pronunciación registrados</p></div><div class="card"><h2>${vp.easier}</h2><p>Veces que sentiste que te salió mejor</p></div><div class="card"><h2>${Object.keys(vp.words).length}</h2><p>Palabras diferentes practicadas</p></div><div class="card"><h2>${done}</h2><p>Actividades distintas practicadas</p></div><div class="card"><h2>${total}</h2><p>Veces que marcaste «Ya practiqué»</p></div><div class="card"><h2>${stats.favorites.length}</h2><p>Ejercicios guardados</p></div><div class="card"><h2>Sin presión</h2><p>No medimos aciertos ni calificamos tu voz.</p></div></div><section class="card"><h2>Palabras para seguir practicando</h2><p>Según los últimos resultados de reconocimiento, no una evaluación de pronunciación.</p>${summary.challenging.length?'<div class="categories">'+summary.challenging.map(x=>'<div class="category"><b>'+escapeHtml(x.word)+'</b> · '+x.score+'% de coincidencia</div>').join('')+'</div>':'<p>Aún no hay resultados de reconocimiento.</p>'}</section><div class="actions">${btn('Practicar mi pronunciación','voicePractice','button primary')}${btn('Practicar mis guardados','favorites','button primary')}${btn('Borrar mi progreso','clearProgress','button')}</div><p id="feedback" class="feedback" role="status" aria-live="polite"></p><p class="hint">Los registros se guardan solamente en este navegador. Si borras sus datos, se perderán.</p>`)}
function showClue(kind){const a=items[idx];let t=kind==='hintSemantic'?a.semanticHint:kind==='hintPhonetic'?a.phoneticHint:kind==='support'?a.syllables:(a.expectedAnswer||a.answer);const el=$('#clue');el.hidden=false;el.textContent=t||'No hay pista adicional para esta actividad.'}
function speak(textValue){if(!('speechSynthesis' in window)){notify('La lectura de voz no está disponible. Puedes leer o mostrar el texto.');return}try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(textValue);u.lang='es-NI';u.rate=Number(prefs.speechRate)||.9;const voices=speechSynthesis.getVoices();const v=voices.find(v=>v.lang==='es-NI')||voices.find(v=>v.lang.toLowerCase().startsWith('es'));if(v)u.voice=v;u.onerror=()=>notify('La voz no está disponible ahora. Puedes leer o mostrar el mensaje.');speechSynthesis.speak(u)}catch{notify('No se pudo reproducir la voz.')}}
function stopAudio(){if(recording&&recording.state==='recording')recording.stop();if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}if(recAudio){recAudio.pause();recAudio=null}if(audioURL){URL.revokeObjectURL(audioURL);audioURL=null}}
async function record(){
 if(recording&&recording.state==='recording'){
  transcribeState('Procesando transcripción…');
  recording.stop();
  if(recognition){try{recognition.stop()}catch{}}
  else if(!transcriptionFinal.trim())transcribeState('No se pudo reconocer la voz automáticamente. Puedes intentar transcribir.');
  return;
 }
 if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined'){notify('Este navegador no permite grabar.');return}
 try{
  stopRecognition();
  stream=await navigator.mediaDevices.getUserMedia({audio:true});
  recChunks=[];recording=new MediaRecorder(stream);
  recording.ondataavailable=e=>{if(e.data.size)recChunks.push(e.data)};
  recording.onstop=()=>{
   if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}
   if(audioURL)URL.revokeObjectURL(audioURL);
   audioURL=URL.createObjectURL(new Blob(recChunks,{type:recording.mimeType||'audio/webm'}));
   const play=$('#listenRecording');if(play)play.disabled=false;
   const b=$('[data-action="record"]');if(b)b.textContent='🎙 Repetir';
   notify('Grabación lista. Puedes escuchar tu voz.');
  };
  transcriptionFinal='';updateTranscript('',false);
  recording.start();
  startRecognitionForRecording(true);
  const b=$('[data-action="record"]');if(b)b.textContent='■ Detener';
  notify('Grabando. Pulsa detener cuando termines.');
 }catch{transcribeState('No se pudo acceder al micrófono.');notify('No se pudo grabar. Revisa los permisos.')}
}
function listen(){if(!audioURL){notify('Primero graba tu voz.');return}if(recAudio)recAudio.pause();recAudio=new Audio(audioURL);recAudio.play().catch(()=>notify('No se pudo reproducir la grabación.'))}

// Reloj de práctica: cuenta solo el tiempo activo de la página y se pausa al salir.
const mmss=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
function elapsedSeconds(){return Math.floor((session.elapsed+(session.active&&!session.paused?performance.now()-session.start:0))/1000)}
function renderTimer(){const panel=$('#sessionTimer');if(!panel)return;panel.hidden=!session.active;if(!session.active)return;const s=elapsedSeconds();$('#sessionClock').textContent=mmss(s);$('#sessionTarget').textContent=mmss(session.target);$('#sessionToggle').textContent=session.paused?'▶ Continuar':'Ⅱ Pausar';if(s>=session.target&&!session.notified){session.notified=true;$('#sessionNotice').textContent='Has llegado al tiempo orientativo. Puedes descansar, finalizar o continuar sin presión.'}}
function startSession(){if(session.active){resumeSession();return}session={active:true,paused:false,elapsed:0,start:performance.now(),target:Number(read('habla.sessionTarget',600)),notified:false};renderTimer()}
function pauseSession(){if(!session.active||session.paused)return;session.elapsed+=performance.now()-session.start;session.paused=true;renderTimer()}
function resumeSession(){if(!session.active||!session.paused)return;session.paused=false;session.start=performance.now();renderTimer()}
function endSession(){if(!session.active)return;pauseSession();const seconds=elapsedSeconds();const history=read('habla.sessions',[]);history.unshift({date:new Date().toISOString(),seconds});save('habla.sessions',history.slice(0,100));session.active=false;renderTimer();notify(`Sesión terminada: ${mmss(seconds)} de práctica. Puedes descansar cuando lo necesites.`)}
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseSession()});
setInterval(renderTimer,1000);
$('#sessionToggle').addEventListener('click',()=>session.paused?resumeSession():pauseSession());
$('#sessionEnd').addEventListener('click',endSession);
$('#sessionDuration').addEventListener('change',e=>{const val=Number(e.target.value);save('habla.sessionTarget',val);session.target=val;session.notified=false;renderTimer()});
$('#sessionDuration').value=String(read('habla.sessionTarget',600));
function stopRecognition(){if(recognition){try{recognition.abort()}catch{}recognition=null}}
function transcribeState(message){const el=$('#transcribeState');if(el)el.textContent=message}
function normalizeWords(value){return String(value||'').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zñ0-9\s]/g,' ').trim().split(/\s+/).filter(Boolean)}
function textSimilarity(expected,actual){
 const a=normalizeWords(expected),b=normalizeWords(actual);if(!a.length||!b.length)return 0;
 let prev=new Array(b.length+1).fill(0);
 for(const x of a){const next=new Array(b.length+1).fill(0);for(let j=1;j<=b.length;j++)next[j]=x===b[j-1]?prev[j-1]+1:Math.max(next[j-1],prev[j]);prev=next}
 return Math.round(100*prev[b.length]/Math.max(a.length,b.length));
}
function updateTranscript(value,final=false){
 const el=$('#recognizedText');if(el)el.textContent=value.trim()||'No se captaron palabras.';
 const result=$('#matchResult');if(!result)return;
 const exercise=items[idx];
 if(!final||!value.trim()||!exercise){result.hidden=true;return}
 const expected=route==='voicePractice'?(voiceWord(exercise)||exercise.prompt):(exercise.ttsText||exercise.expectedAnswer||exercise.answer||exercise.prompt);
 const score=textSimilarity(expected,value);
 if(route==='voicePractice'&&final)saveRecognition(exercise,value,score);
 result.hidden=false;
 result.innerHTML=`<div class="score-line"><strong>Coincidencia del texto</strong><b>${score}%</b></div><div class="match-meter" role="img" aria-label="Coincidencia de texto: ${score} por ciento"><span style="width:${score}%"></span></div><small>Comparación de lo que el dispositivo creyó escuchar, no calificación de pronunciación. En ejercicios abiertos puede no reflejar una respuesta correcta.</small>`;
}
function recognitionControls(active){
 const retry=$('#retryTranscribe'),stop=$('#stopRecognition');
 if(retry)retry.disabled=active;
 if(stop)stop.hidden=!active;
}
function startRecognitionForRecording(automatic=false){
 if(recording?.state==='recording'&&!automatic){transcribeState('Primero detén la grabación.');return}
 stopRecognition();transcriptionFinal='';updateTranscript('',false);
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){transcribeState('Transcripción no compatible. Puedes escuchar tu grabación.');return}
 if(!navigator.onLine){transcribeState('La transcripción necesita conexión.');return}
 try{
  const r=new SR();recognition=r;r.lang='es-ES';r.interimResults=true;r.continuous=false;
  let finalParts=new Map(),best='',errorMessage='';
  r.onstart=()=>{recognitionControls(true);transcribeState(automatic?'Grabando y reconociendo voz…':'Escuchando. Habla ahora…')};
  r.onresult=e=>{
   let interim='';
   for(let i=0;i<e.results.length;i++){
    const part=e.results[i][0].transcript;
    if(e.results[i].isFinal)finalParts.set(i,part);else interim+=part+' ';
   }
   transcriptionFinal=[...finalParts.values()].join(' ').trim();
   best=(transcriptionFinal+' '+interim).trim()||best;
   updateTranscript(best,false);
  };
  r.onerror=e=>{
   const messages={'not-allowed':'Chrome no permitió reconocer voz.','audio-capture':'El micrófono está ocupado. Puedes intentar transcribir después de grabar.','network':'Falló la conexión de transcripción.','no-speech':'No se detectó voz.','service-not-allowed':'Servicio de transcripción no disponible.'};
   errorMessage=messages[e.error]||'No se pudo transcribir.';
   transcribeState(errorMessage);
  };
  r.onend=()=>{
   if(recognition!==r)return;
   recognition=null;recognitionControls(false);
   const recognized=transcriptionFinal.trim()||best.trim();
   if(recognized){updateTranscript(recognized,true);transcribeState('Transcripción lista.');}
   else transcribeState(errorMessage||'No se detectó voz. Puedes intentar transcribir otra vez.');
  };
  r.start();
 }catch{recognition=null;recognitionControls(false);transcribeState('No se pudo iniciar la transcripción automática. Puedes intentarla después.')}
}
function recognizeSpeech(){startRecognitionForRecording()}
function stopTranscription(){if(recognition){try{recognition.stop()}catch{}}}
function settingsApply(){document.body.classList.toggle('large',prefs.largeText);document.body.classList.toggle('contrast',prefs.contrast);document.body.classList.toggle('no-motion',prefs.reduceMotion);for(const k of ['largeText','contrast','reduceMotion','showIcons','speechRate']){const el=$('#'+k);el&&(el.type==='checkbox'?el.checked=!!prefs[k]:el.value=prefs[k])}}
app.addEventListener('click',e=>{const phrase=e.target.closest('[data-phrase]');if(phrase){const msg=BOARD[Number(phrase.dataset.phrase)][0];notify(`Mensaje: ${msg}`);speak(msg);return}const category=e.target.closest('[data-track]');if(category){openTrack(category.dataset.track);return}const el=e.target.closest('[data-action]');if(!el)return;const a=el.dataset.action;if(a==='home')home();else if(a==='catalog')catalog();else if(a==='board')board();else if(a==='progress')progress();else if(a==='daily')getSequence();else if(a==='voicePractice')startVoicePractice();else if(a==='audioInstruction')audioInstruction();else if(a==='rateEasy')rateVoice(true);else if(a==='rateHard')rateVoice(false);else if(a==='speak')speak(route==='voicePractice'?(voiceWord(items[idx])||items[idx].prompt):(items[idx].ttsText||items[idx].prompt));else if(a==='record')record();else if(a==='playRecording')listen();else if(a==='recognize')recognizeSpeech();else if(a==='stopRecognition')stopTranscription();else if(a==='prev'&&idx>0){idx--;renderActivity()}else if(a==='next'){if(idx===items.length-1){endSession();route==='dailyPractice'?progress():catalog()}else{idx++;renderActivity()}}else if(a==='hintSemantic'||a==='hintPhonetic'||a==='answer'||a==='support')showClue(a);else if(a.startsWith('choice:')){const ex=items[idx],chosen=ex.options[Number(a.split(':')[1])];app.querySelectorAll('.choices .button').forEach(b=>{b.classList.remove('choice-selected','choice-correct','choice-incorrect');b.removeAttribute('aria-pressed')});el.classList.add('choice-selected');el.setAttribute('aria-pressed','true');const correct=normalizeWords(chosen).join(' ')===normalizeWords(ex.answer).join(' ');el.classList.add(correct?'choice-correct':'choice-incorrect');const out=$('#choiceResult');if(out){out.className='choice-result '+(correct?'is-correct':'is-incorrect');out.textContent=correct?'✓ Correcto':'✕ Intenta de nuevo';}}else if(a==='complete'){const id=items[idx].id;stats.done[id]=(stats.done[id]||0)+1;stats.last=id;save('habla.stats',stats);notify('Actividad registrada. Puedes repetirla o continuar.')}else if(a==='favorite'){const id=items[idx].id;stats.favorites=stats.favorites.includes(id)?stats.favorites.filter(x=>x!==id):[...stats.favorites,id];save('habla.stats',stats);el.textContent=stats.favorites.includes(id)?'★ Guardado':'☆ Guardar'}else if(a==='favorites'){startSession();items=data.filter(x=>stats.favorites.includes(x.id));idx=0;route='practice';if(items.length)renderActivity();else notify('Todavía no guardaste actividades.')}else if(a==='clearProgress'){if(confirm('¿Borrar el historial y los ejercicios guardados en este dispositivo?')){stats={done:{},favorites:[],last:null};save('habla.stats',stats);save('habla.voiceProgress',{attempts:0,easier:0,harder:0,words:{}});save('habla.recognitionScores',[]);progress()}}else if(a==='customSpeak'){const txt=$('#customPhrase').value.trim();if(txt)speak(txt);else notify('Escribe primero el mensaje.')}});
$('#settingsBtn').addEventListener('click',()=>$('#settings').showModal());$('#brand').addEventListener('click',home);for(const k of ['largeText','contrast','reduceMotion','showIcons','speechRate'])$('#'+k).addEventListener('change',e=>{prefs[k]=e.target.type==='checkbox'?e.target.checked:e.target.value;save('habla.prefs',prefs);settingsApply();if(route==='board')board()});
function connection(){const online=navigator.onLine;$('#connection').textContent=online?'● Con conexión':'● Sin conexión';$('#connection').style.color=online?'#28795f':'#ad6429'}window.addEventListener('online',connection);window.addEventListener('offline',connection);connection();settingsApply();
fetch('./data/catalogo.json').then(r=>{if(!r.ok)throw Error('no data');return r.json()}).then(arr=>{data=arr;home()}).catch(()=>setPage('<div class="hero"><h1>No se pudo cargar la biblioteca</h1><p>Para usarla sin conexión, abre HABLA una vez conectado a internet y vuelve a intentarlo.</p><button class="button primary" onclick="location.reload()">Reintentar</button></div>'));
if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
