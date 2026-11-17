(()=>{'use strict';
const TRACKS=[['comunicacion','Comunicación esencial','Mensajes cotidianos para expresar necesidades.','chat'],['automatico','Lenguaje automático','Secuencias y expresiones conocidas.','repeat'],['comprension','Comprensión','Responder preguntas con sí o no.','ear'],['repeticion','Repetir palabras y frases','Escuchar y practicar a tu ritmo.','sound'],['denominacion','Encontrar palabras','Pistas que ayudan a recordar.','search'],['semantica','Completar ideas','Relacionar palabras y significados.','puzzle'],['frases','Construir frases','Practicar mensajes completos.','chat'],['motor_habla','Sílabas y palabras','Practicar secuencias en palabras reales.','sound'],['disartria','Habla clara','Practicar pausas y claridad sin esfuerzo.','sound'],['lectura','Lectura con apoyo','Leer, escuchar o señalar.','book'],['conversacion','Conversación guiada','Practicar respuestas cotidianas.','chat'],['laboral','Situaciones laborales','Frases para trabajo y reuniones.','briefcase']];
const ICONS={chat:'<path d="M4 5h16v12H9l-5 4z"/>',repeat:'<path d="M4 7h13l-3-3m3 3-3 3M20 17H7l3 3m-3-3 3-3"/>',ear:'<path d="M12 21c-4 0-4-5-1-7 2-1 3-2 3-5 0-4-6-4-6 0M6 9a6 6 0 0 1 12 0c0 5-4 6-5 8"/>',sound:'<path d="M4 9v6h4l5 4V5L8 9zm12-1q4 4 0 8m2-11q7 7 0 14"/>',search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',puzzle:'<path d="M4 4h6v3a2 2 0 0 0 4 0V4h6v6h-3a2 2 0 0 0 0 4h3v6h-6v-3a2 2 0 0 0-4 0v3H4v-6h3a2 2 0 0 0 0-4H4z"/>',book:'<path d="M12 6q-4-3-9-2v15q5-1 9 2 4-3 9-2V4q-5-1-9 2zm0 0v15"/>',briefcase:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V4h8v3M3 13h18"/>',cup:'<path d="M7 4h10l-1 15H8zM17 7h4v4l-4 3M6 21h13"/>',food:'<path d="M4 3v7m3-7v7M4 7h3M5.5 10v11M16 3v18m0-18q-6 7 0 11"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.8 2.8 0 0 1 5 1c0 2-2.5 2-2.5 4m0 3v.2"/>',bath:'<path d="M5 10h14v5a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6zM7 10V6a3 3 0 0 1 6 0"/>',bed:'<path d="M3 6v15m0-5h18v5m-18-9h6V9H3zm6-4h12v8H9z"/>',pain:'<path d="M12 21s-9-5.3-9-11A5 5 0 0 1 12 7a5 5 0 0 1 9 3c0 5.7-9 11-9 11zM12 9v6m-3-3h6"/>',yes:'<path d="m4 12 5 5L20 6"/>',no:'<path d="M5 5 19 19M19 5 5 19"/>',slow:'<path d="M5 12h14M12 5l-7 7 7 7"/>',person:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',home:'<path d="m3 11 9-8 9 8v10h-7v-7h-4v7H3z"/>'};
const svg=(name)=>`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]||ICONS.chat}</svg>`;
const escapeHtml=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let session={active:false,paused:false,elapsed:0,start:0,target:600,notified:false},timerInterval=null,recognition=null;
let transcriptionFinal="";
let attemptStarted=0,recordSeconds=0,wordAttempts=0,transcriptEnabled=false,wordTranscriptAttempts=[];
const SYL=window.HABLA_CONTENT.SYL;
function syllablesFor(a){
 const word=String(voiceWord(a)||(a?.track==='motor_asha'&&/^[\p{L}]{2,20}$/u.test(String(a.prompt||''))?a.prompt:'')).toLowerCase();
 if(SYL[word])return SYL[word];
 if(!/^[a-záéíóúüñ]{2,20}$/i.test(word))return null;
 // División orientativa para palabras sin guía revisada; se preservan dígrafos y grupos comunes.
 const vowels='aeiouáéíóúü',strong='aeoáéó',clusters=new Set(['pr','br','tr','dr','cr','gr','fr','fl','pl','bl','cl','gl','ch','ll','rr']);
 const isV=c=>vowels.includes(c);
 let cuts=[];let last=0;
 for(let i=0;i<word.length-1;i++){
  if(!isV(word[i]))continue;
  let j=i+1;while(j<word.length&&!isV(word[j]))j++;
  if(j===word.length)break;
  const consonants=word.slice(i+1,j),next=word[j];
  if(!consonants.length){if(strong.includes(word[i])&&strong.includes(next))cuts.push(i+1);continue}
  let boundary;
  if(consonants.length===1)boundary=i+1;
  else if(consonants.length===2)boundary=clusters.has(consonants)?i+1:j-1;
  else boundary=clusters.has(consonants.slice(-2))?j-2:j-1;
  if(boundary>last){cuts.push(boundary);last=boundary}
 }
 const parts=[],positions=[0,...new Set(cuts),word.length];for(let i=1;i<positions.length;i++){const part=word.slice(positions[i-1],positions[i]);if(part)parts.push(part)}
 return parts.length>1?parts.join('-'):word;
}
function syllableHelp(){
 const el=$('#clue'),v=syllablesFor(items[idx]);
 if(!el)return;el.hidden=false;
 const parts=v?v.split('-'):[];
 el.innerHTML=parts.length>1?
 '<strong>Pronuncia por partes</strong><p>'+escapeHtml(parts.join(' — '))+'</p>'+
 '<div class="actions">'+btn('▶ Escuchar con pausas','syllableSequence','button primary')+
 '<label class="syllable-pause-label" for="syllablePause">Pausa <select id="syllablePause" aria-label="Duración de la pausa entre sílabas"><option value="350">Corta</option><option value="650" selected>Media</option><option value="1000">Larga</option></select></label></div>'+
 '<div class="actions">'+parts.map((part,i)=>btn('🔊 '+escapeHtml(part),'syl:'+i,'button secondary')).join('')+'</div>'+
 '<p class="motor-caveat">Después escucha la palabra completa: las pausas solo ayudan a reconocer las partes.</p>':
 'Todavía no hay una división por sílabas revisada para esta palabra.';
}
let syllablePlaybackToken=0,syllablePauseTimer=null;
function stopSyllablePlayback(){
 syllablePlaybackToken++;
 if(syllablePauseTimer!==null){clearTimeout(syllablePauseTimer);syllablePauseTimer=null}
 if('speechSynthesis' in window)speechSynthesis.cancel();
}
function playSyllablesWithPauses(){
 const parts=(syllablesFor(items[idx])||'').split('-').filter(Boolean);
 if(parts.length<2){notify('Esta palabra no tiene sílabas separadas disponibles.');return}
 if(!('speechSynthesis' in window)){notify('La voz no está disponible en este navegador.');return}
 stopSyllablePlayback();
 const token=syllablePlaybackToken,delay=Math.min(1000,Math.max(350,Number($('#syllablePause')?.value)||650));
 const speakPart=index=>{
  if(token!==syllablePlaybackToken||index>=parts.length)return;
  const u=new SpeechSynthesisUtterance(parts[index]);
  u.lang='es-NI';u.rate=Number(prefs.speechRate)||.9;
  const voices=speechSynthesis.getVoices();
  const v=voices.find(v=>v.lang==='es-NI')||voices.find(v=>v.lang.toLowerCase().startsWith('es'));
  if(v)u.voice=v;
  u.onend=()=>{if(index+1<parts.length&&token===syllablePlaybackToken)
   syllablePauseTimer=setTimeout(()=>{syllablePauseTimer=null;speakPart(index+1)},delay)};
  u.onerror=()=>{if(token===syllablePlaybackToken)notify('No se pudo reproducir esta sílaba.')};
  speechSynthesis.speak(u);
 };
 speakPart(0);
}

const VOICE_TRACKS=new Set(['repeticion','motor_habla','disartria','lectura']);
const shuffle=a=>{const out=[...a];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out};
function voiceWord(a){const word=String(a.expectedAnswer||'').trim();return /^[\p{L}]{2,20}$/u.test(word)?word:null}
function voicePool(){return data.filter(a=>VOICE_TRACKS.has(a.track)&&voiceWord(a))}
function startVoicePractice(){startSession();const p=voiceProgress();const hard=new Set(Object.entries(p.words).filter(([,w])=>w.harder>w.easier).map(([id])=>id));const pool=shuffle(voicePool());const preferred=pool.filter(a=>hard.has(a.id));const fresh=pool.filter(a=>!hard.has(a.id));items=preferred.length?shuffle([...preferred.slice(0,Math.min(12,preferred.length)),...fresh.slice(0,Math.min(12,fresh.length))]):pool;if(stats.lastVoice&&items.length>1&&items[0].id===stats.lastVoice)[items[0],items[1]]=[items[1],items[0]];idx=0;route='voicePractice';renderActivity()}
function voiceProgress(){return read('habla.voiceProgress',{attempts:0,easier:0,harder:0,words:{}})}
function recognitionHistory(){return read('habla.recognitionScores',[])}
function saveRecognition(exercise,text,score){
 if(!exercise)return;
 const history=recognitionHistory();
 history.push({id:exercise.id,word:voiceWord(exercise)||exercise.prompt,at:new Date().toISOString(),score,recognized:text.slice(0,100),recordSeconds:recordSeconds||null,attemptNumber:wordAttempts||null,matched:normalizeWords(text).includes(normalizeWords(voiceWord(exercise)||'').join(' ')),engine:'browser-text-v2'});
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
function audioInstruction(){const a=items[idx];if(a.track==='coordinacion'){speak(a.instruction);return}const word=voiceWord(a)||a.prompt;speak('Escucha la palabra. Luego intenta decir: '+word+'. Graba tu voz. Escúchate y vuelve a intentarlo. Si cuesta, habla despacio y por partes.')}
let data=[],route='home',track='comunicacion',level='all',items=[],idx=0,recording=null,stream=null,recChunks=[],audioURL=null,recAudio=null;
const $=s=>document.querySelector(s);const app=$('#app');const prefs=Object.assign({largeText:false,contrast:false,reduceMotion:false,showIcons:true,speechRate:'0.9'},read('habla.prefs',{}));let stats=read('habla.stats',{done:{},favorites:[],last:null});
function read(key,def){try{return JSON.parse(localStorage.getItem(key))||def}catch{return def}}function save(key,value){try{localStorage.setItem(key,JSON.stringify(value));window.HABLA_STORAGE?.mirror(key,value)}catch{notify('No se pudo guardar en este dispositivo.')}}
function notify(msg){let el=$('#feedback');if(el)el.textContent=msg;else $('#footState').textContent=msg}
function setPage(html){stopSyllablePlayback();stopRecognition();stopAudio();app.innerHTML=html;window.scrollTo({top:0,behavior:'instant'});$('#main').focus({preventScroll:true})}
function btn(label,action,cls='button',attrs=''){return `<button type="button" class="${cls}" data-action="${action}" ${attrs}>${label}</button>`}
function personalEntries(){return read('habla.personal',[])}
function personalItem(x){return {id:x.id,track:'personal',prompt:x.text,ttsText:x.text,expectedAnswer:x.text,goal:x.kind==='nombre'?'Practicar un nombre':x.kind==='frase'?'Practicar una frase personal':'Practicar una palabra personal',instruction:'Escucha, pronuncia, graba tu voz y repite cuando quieras.',responseMode:'speech',personalKind:x.kind}}
function practicePriority(a){
 const w=voiceProgress().words[a.id]||{easier:0,harder:0};
 // La priorización se basa en la percepción registrada, no en el reconocedor de voz.
 const difficulty=Math.max(0,(w.harder||0)-(w.easier||0));
 const unseen=!(w.attempts);
 return {priority:difficulty*4,unseen};
}
function adaptiveQueue(pool,limit=12){
 const unique=[...new Map(pool.map(x=>[x.id,x])).values()];
 const shuffled=shuffle(unique);
 const needs=shuffled.filter(x=>practicePriority(x).priority>0).sort((a,b)=>practicePriority(b).priority-practicePriority(a).priority);
 const fresh=shuffled.filter(x=>practicePriority(x).unseen);
 const familiar=shuffled.filter(x=>!practicePriority(x).unseen);
 const chosen=[],add=x=>{if(x&&!chosen.some(y=>y.id===x.id))chosen.push(x)};
 // Mezcla de refuerzo y novedad: nunca obliga a repetir lo mismo en bucle.
 const goal=Math.min(limit,unique.length);
 let reviewQuota=Math.min(Math.ceil(goal*.6),needs.length);
 for(const x of needs.slice(0,reviewQuota))add(x);
 for(const x of fresh){if(chosen.length>=goal)break;add(x)}
 for(const x of familiar){if(chosen.length>=goal)break;add(x)}
 for(const x of shuffled){if(chosen.length>=goal)break;add(x)}
 return shuffle(chosen);
}

const COORDINATION=window.HABLA_CONTENT.COORDINATION;

const MOTOR_FAMILIES=window.HABLA_CONTENT.MOTOR_FAMILIES||[];
const MOTOR_LIBRARY=window.HABLA_CONTENT.MOTOR_LIBRARY||[];
const MOTOR_LEVELS=window.HABLA_CONTENT.MOTOR_LEVELS||[];
const MOTOR_LEVEL_ITEMS=window.HABLA_CONTENT.MOTOR_LEVEL_ITEMS||[];
const VOCAL_TARGETS=window.HABLA_CONTENT.VOCAL_TARGETS||[];
function motorChoose(family){
 const familyInfo=MOTOR_FAMILIES.find(x=>x.id===family);if(!familyInfo)return;
 if(session.active)pauseSession();route='motorChooser';
 const pool=MOTOR_LIBRARY.filter(x=>x.family===family);
 const resume=read('habla.motorResume',{}),last=pool.find(x=>x.id===resume[family]);
 setPage(`<div class="toolbar">${btn('← Inicio','home')}</div><span class="eyebrow">Práctica motora</span><h1 class="section-title">${escapeHtml(familyInfo.label)}</h1><p class="muted">${escapeHtml(familyInfo.description)}. ${pool.length} ejercicios para explorar, sin niveles obligatorios.</p><div class="motor-modes"><button class="card clickable" data-action="motorGuided:${family}"><h2>Práctica guiada</h2><p>Seis objetivos breves, priorizando los que marcaste como difíciles.</p></button><button class="card clickable" data-action="motorBrowse:${family}"><h2>Elegir ejercicios</h2><p>Explora el banco y comienza desde el ejercicio que prefieras.</p></button></div>${last?`<div class="actions">${btn('Retomar: '+escapeHtml(last.prompt),'motorResume:'+family,'button secondary')}</div>`:''}<p class="hint">Las actividades no sustituyen una evaluación profesional. Repite cada objetivo cuando lo necesites.</p>`);
}
function motorBrowse(family){
 const familyInfo=MOTOR_FAMILIES.find(x=>x.id===family);if(!familyInfo)return;
 if(session.active)pauseSession();route='motorBrowser';
 const pool=MOTOR_LIBRARY.filter(x=>x.family===family);
 setPage(`<div class="toolbar">${btn('← Categoría','motor:'+family)}</div><h1 class="section-title">${escapeHtml(familyInfo.label)}</h1><p class="muted">Elige un ejercicio. Puedes seguir con los siguientes o volver aquí.</p><div class="motor-exercise-list">${pool.map((x,i)=>`<button type="button" class="motor-exercise-item" data-action="motorItem:${family}:${x.id}"><strong>${i+1}. ${escapeHtml(x.prompt)}</strong><span>${escapeHtml(x.goal)}</span></button>`).join('')}</div>`);
}
function motorStart(family,mode='guided',selectedId=''){
 const pool=MOTOR_LIBRARY.filter(x=>x.family===family);if(!pool.length)return;
 const resume=read('habla.motorResume',{}),progress=voiceProgress().words||{};
 if(mode==='guided'){
  const difficult=pool.filter(x=>(progress[x.id]?.harder||0)>(progress[x.id]?.easier||0));
  const ordered=[...difficult,...pool.filter(x=>!difficult.includes(x))];
  const offset=Number(read('habla.motorRotation',{})[family]||0)%Math.max(1,ordered.length);
  items=[...ordered.slice(offset),...ordered.slice(0,offset)].slice(0,Math.min(6,ordered.length));
  const rotation=read('habla.motorRotation',{});rotation[family]=(offset+6)%ordered.length;save('habla.motorRotation',rotation);
 }else{
  items=pool;
 }
 const found=items.findIndex(x=>x.id===(selectedId||(mode==='resume'?resume[family]:'')));
 idx=Math.max(0,found);
 startSession();route='motorPractice';renderActivity();
}

function startMotorLevel(level){
 const pool=MOTOR_LEVEL_ITEMS.filter(x=>x.level===level);
 if(!pool.length){notify('Todavía no hay ejercicios en este nivel.');return}
 startSession();items=pool;idx=0;route='motorLevels';renderActivity();
}
function startVocalPractice(){
 if(!VOCAL_TARGETS.length){notify('No hay ejercicios disponibles.');return}
 startSession();items=VOCAL_TARGETS;idx=0;route='vocalPractice';renderActivity();
}
function motorPositionShape(code){
 // Dibujo frontal esquemático. No muestra posición interna de lengua ni movimiento temporal.
 const shape=code==='i'?{rx:57,ry:15,inner:9}:code==='u'?{rx:23,ry:28,inner:18}:code==='a'?{rx:40,ry:40,inner:29}:code==='e'?{rx:49,ry:25,inner:17}:code==='m'||code==='p'?{rx:51,ry:10,inner:2}:null;
 if(!shape)return '';
 return '<svg class="motor-mouth" viewBox="0 0 160 110" role="img" aria-label="Esquema frontal de apertura de labios para '+escapeHtml(code)+'">'
 +'<path d="M12 55 Q80 15 148 55 Q80 96 12 55Z" fill="#d88991" stroke="#98515d" stroke-width="2.5"/>'
 +'<ellipse cx="80" cy="55" rx="'+shape.rx+'" ry="'+shape.inner+'" fill="#633c47"/>'
 +'<path d="M18 54 Q80 26 142 54" fill="none" stroke="#f4afb6" stroke-width="2.4" opacity=".8"/>'
 +'</svg>';
}
function motorPositionPanel(item){
 const box=document.querySelector('#motorPosition');
 if(!box)return;
 const a=item.positionStart,b=item.positionEnd;
 const labels={m:'Labios juntos',p:'Cierre labial',a:'Apertura amplia',e:'Apertura media',i:'Labios extendidos',u:'Labios redondeados'};
 box.hidden=false;
 box.innerHTML=a&&b?
 '<div class="motor-position-grid"><figure>'+motorPositionShape(a)+'<figcaption>'+escapeHtml(labels[a])+'</figcaption></figure><span aria-hidden="true">→</span><figure>'+motorPositionShape(b)+'<figcaption>'+escapeHtml(labels[b])+'</figcaption></figure></div><p class="motor-caveat">Esquema orientativo de labios. No representa los movimientos internos de lengua ni sustituye un modelo de pronunciación.</p>':
 '<p class="motor-caveat">Todavía no hay una ilustración anatómica revisada para esta secuencia. Puedes escuchar el ejemplo y practicar sin apoyo visual.</p>';
 if(a&&b){const state=read('habla.motorSupport',{});state[item.id]=(state[item.id]||0)+1;save('habla.motorSupport',state)}
}

function startCoordination(){startSession();items=COORDINATION;idx=0;route='practice';renderActivity()}
function startSelection(kind){startSession();const own=personalEntries().map(personalItem);let source=[];if(kind==='palabras'){source=data.filter(x=>['repeticion','motor_habla'].includes(x.track)).map(x=>({...x,prompt:voiceWord(x)||x.prompt,ttsText:voiceWord(x)||x.ttsText})).filter(x=>voiceWord(x));}
else if(kind==='frases'){source=data.filter(x=>['frases','disartria','laboral'].includes(x.track)&&!voiceWord(x));source.push(...["Necesito revisar el informe","Estoy de acuerdo con la propuesta","Tengo una pregunta sobre el proyecto","Podemos reunirnos mañana","Voy a enviar el documento","Quisiera explicar mi punto de vista","Necesito un momento para responder","¿Podría repetir la última parte?","La reunión comienza a las nueve","Debemos revisar el presupuesto","El trabajo está terminado","Tengo una sugerencia para el equipo","Vamos a organizar las tareas","Necesito comunicarme con mi colega","Podemos cambiar la fecha de entrega","Este resultado necesita una revisión","Quiero participar en la conversación","Necesito hablar con el encargado","¿Podemos hablar de los próximos pasos?","Quiero compartir una idea","Me gustaría expresar mi opinión","No estoy de acuerdo con esa decisión","¿Podemos discutir otra alternativa?","Voy a consultar con mi equipo"].map((text,i)=>({id:'WORK-'+i,track:'laboral',goal:'Comunicación laboral y social',prompt:text,ttsText:text,instruction:'Escucha la frase y practícala a tu propio ritmo.',responseMode:'speech'})));}
else if(kind==='personal'){source=own;}else return;
const pool=kind==='personal'?source:[...source,...own.filter(x=>kind==='palabras'?x.personalKind!=='frase':x.personalKind==='frase')];items=adaptiveQueue(pool,12);idx=0;route='practice';if(items.length)renderActivity();else personalPage()}
function reinforcementPractice(){
 const own=personalEntries().map(personalItem);
 const originals=data.filter(x=>['repeticion','motor_habla','frases','disartria','laboral'].includes(x.track)).map(x=>['repeticion','motor_habla'].includes(x.track)&&voiceWord(x)?{...x,prompt:voiceWord(x),ttsText:voiceWord(x)}:x);
 const all=[...VOCAL_TARGETS,...MOTOR_LEVEL_ITEMS,...MOTOR_LIBRARY,...originals,...own];
 const difficult=all.filter(x=>practicePriority(x).priority>0);
 if(!difficult.length){notify('Aún no hay palabras marcadas como difíciles. Practica y usa «Me costó» para identificarlas.');return}
 startSession();items=adaptiveQueue(difficult,12);idx=0;route='practice';renderActivity();
}
function personalPage(){if(session.active)pauseSession();route='personal';const own=personalEntries();setPage(`<div class="toolbar">${btn('← Inicio','home')}</div><h1>Mis palabras, nombres y frases</h1><p>Agrega expresiones relevantes para tu vida personal o laboral. Se guardan únicamente en este dispositivo.</p><form id="personalForm" class="card"><label class="field">Tipo<select id="personalKind"><option value="palabra">Palabra</option><option value="nombre">Nombre propio</option><option value="frase">Frase u oración</option></select></label><label class="field">Texto<input id="personalText" type="text" maxlength="140" required placeholder="Ejemplo: Necesito revisar el informe" style="width:100%;padding:12px;border:1px solid var(--border);border-radius:12px"></label><button class="button primary" type="submit">+ Guardar</button></form><div class="actions">${btn('▶ Practicar personalizados','selection:personal','button primary')}</div><div class="categories">${own.map(x=>`<div class="card"><b>${escapeHtml(x.text)}</b><p>${escapeHtml(x.kind)}</p>${btn('Eliminar','deletePersonal:'+x.id,'button compact')}</div>`).join('')||'<p>Todavía no agregaste palabras o frases.</p>'}</div><p id="feedback" role="status"></p>`)}
function home(){if(session.active)pauseSession();route='home';setPage(`<section class="hero"><span class="eyebrow">Bienvenido a HABLA</span><h1>Practica el habla a tu ritmo.</h1><p>Elige dónde quieres practicar. No es necesario superar los niveles en orden.</p>${btn('Practicar vocales y diptongos →','vocalPractice','button primary')}</section><h2 class="section-title">Vocales y diptongos</h2><section class="grid"><button class="card clickable" data-action="vocalPractice">${svg('sound')}<h2>Mis expresiones cotidianas</h2><p>Quiero agua, puedo, agua fría y caliente, oír.</p></button></section><h2 class="section-title">Práctica por niveles</h2><p class="motor-caveat">Complejidad orientativa, no gravedad ni recuperación. Elige cualquier nivel.</p><section class="grid motor-home-grid">${MOTOR_LEVELS.map(f=>`<button class="card clickable" data-action="level:${f.id}">${svg(f.icon)}<h2>${escapeHtml(f.label)} · ${escapeHtml(f.title)}</h2><p>${escapeHtml(f.description)}</p></button>`).join('')}</section><h2 class="section-title">Mis herramientas</h2><section class="grid"><button class="card clickable" data-action="personal">${svg('person')}<h2>Mis palabras y frases</h2><p>Agrega palabras y oraciones propias.</p></button><button class="card clickable" data-action="reinforcement">${svg('repeat')}<h2>Repasar lo que me cuesta</h2><p>Vuelve a practicar lo que marcaste como difícil.</p></button><button class="card clickable" data-action="progress">${svg('book')}<h2>Mi progreso</h2><p>Mis intentos y mi actividad.</p></button><button class="card clickable" data-action="board">${svg('chat')}<h2>Comunicarme</h2><p>Mensajes para mostrar o escuchar.</p></button></section><p class="motor-caveat">Ejercicios educativos basados en principios descritos por ASHA, sin validación clínica individual.</p>`)}
function catalog(){home()}
function openTrack(t,lev='all',daily=false){startSession();track=t;level=lev;items=shuffle(data.filter(x=>x.track===t&&(level==='all'||x.difficulty===Number(level))));idx=0;route=daily?'dailyPractice':'practice';renderActivity()}
function getSequence(){startSession();const ids=['HAB-0002','HAB-0004','HAB-0006','HAB-0101','HAB-0141','HAB-0211','HAB-0341','HAB-0311'];items=shuffle(ids.map(id=>data.find(x=>x.id===id)).filter(Boolean));idx=0;route='dailyPractice';renderActivity()}
function renderActivity(){
 wordAttempts=0;recordSeconds=0;attemptStarted=0;wordTranscriptAttempts=[];
 if(!session.active)startSession();
 const a=items[idx];if(!a){catalog();return}
 if(route==='motorPractice'&&a.family){const last=read('habla.motorResume',{});last[a.family]=a.id;save('habla.motorResume',last)}
 const favorite=stats.favorites.includes(a.id);const voiceMode=route==='voicePractice';const target=voiceWord(a);
 const isWordExercise=!!target&&['repeticion','motor_habla','lectura','comunicacion','disartria','personal'].includes(a.track)&&a.personalKind!=='frase';
 const displayWord=isWordExercise?target:a.prompt;
 const spokenModel=isWordExercise?target:(a.ttsText||a.prompt);
 const choices=a.type==='comprehension'?'<div class="choices yes-no">'+a.options.map((o,i)=>btn(escapeHtml(o),'choice:'+i,'button choice-button')).join('')+'</div><div id="choiceResult" class="choice-result" role="status" aria-live="polite"></div>':'';
 let hints='';if(a.semanticHint)hints+=btn('Pista de significado','hintSemantic','button secondary');if(a.phoneticHint)hints+=btn('Pista de sonido','hintPhonetic','button secondary');if(a.expectedAnswer||a.answer){const expected=String(a.expectedAnswer||a.answer);const same=normalizeWords(expected).join(' ')===normalizeWords(a.prompt).join(' ');if(!same&&!isWordExercise&&!(voiceMode&&target))hints+=btn('Mostrar respuesta','answer','button secondary')}if(a.syllables)hints+=btn('Ver apoyo','support','button secondary');if(isWordExercise||voiceMode||(a.track==='motor_asha'&&/^[\p{L}]{2,20}$/u.test(String(a.prompt||''))))hints=btn('🧩 Sílabas','syllableHelp','button secondary syllable-toggle')+hints;
 setPage(`<div class="practice"><div class="practice-nav">${btn('← Volver','catalog','button compact-back')}<span class="pill">${route==='dailyPractice'?'Mi práctica':route==='vocalPractice'?'Vocales y diptongos':route==='motorLevels'?'Nivel '+a.level:route==='motorPractice'?escapeHtml(MOTOR_FAMILIES.find(f=>f.id===a.family)?.label||'Práctica motora'):escapeHtml(TRACKS.find(x=>x[0]===a.track)?.[1])}</span><span class="activity-number">${idx+1}/${items.length}</span></div><div class="progressbar" aria-label="Progreso de la serie"><span style="width:${((idx+1)/items.length)*100}%"></span></div><section class="activity" aria-label="Ejercicio"><span class="eyebrow">${escapeHtml(a.goal)}</span><div class="practice-guidance"><p class="instruction">${escapeHtml(voiceMode||isWordExercise?'Escucha la palabra, intenta decirla y vuelve a practicar cuando quieras.':a.instruction)}</p>${voiceMode||isWordExercise?btn('🔊 Escuchar instrucciones','audioInstruction','button secondary'):''}</div><h1 class="word">${escapeHtml(displayWord)}</h1><p id="activityStatus" class="activity-status" role="status" aria-live="polite">Listo para practicar</p><section class="practice-model" aria-label="Escuchar el ejemplo">${btn('🔊 Escuchar','speak','button primary model-listen','id="modelListen"')}</section>${choices}<section class="user-practice" aria-label="Grabar, escuchar tu voz y ver transcripción"><div class="practice-controls">${btn('🎙 Grabar','record','button practice-record','id="recordButton"')}${btn('▶ Mi voz','playRecording','button practice-play','id="listenRecording" disabled')}<button type="button" class="button secondary transcript-toggle" data-action="toggleTranscript" aria-controls="transcriptPanel" aria-expanded="${transcriptEnabled?'true':'false'}">${transcriptEnabled?'📝 Cerrar':'📝 Texto'}</button></div><div class="compact-transcript" aria-label="Opciones de transcripción"><div id="transcriptPanel" ${transcriptEnabled?'':'hidden'}><p class="transcript-title">Transcripción <span id="transcribeState" role="status" aria-live="polite"></span></p><p id="recognizedText" class="recognized-text">Graba tu voz para ver el texto reconocido.</p><div id="attemptLog" class="attempt-log" aria-live="polite"></div><p id="attemptInfo" role="status"></p><div class="transcript-actions">${btn('🎤 Reconocer de nuevo','recognize','button secondary compact','id="retryTranscribe"')}${btn('■ Detener escucha','stopRecognition','button compact','id="stopRecognition" hidden')}</div><div id="matchResult" class="match-result" hidden aria-live="polite"></div><small id="scoreSaved" role="status"></small><small class="transcript-disclaimer">La transcripción es aproximada: no detecta todos los sonidos ni permite contar errores reales de pronunciación.</small></div></div></section><section class="practice-support" aria-label="Ayudas disponibles"><div class="actions help-actions">${a.track==='motor_asha'?btn('Posición','motorPosition','button secondary'):''}${hints}</div><div id="motorPosition" class="motor-position" hidden></div><div id="clue" class="hintbox" hidden></div></section>${a.type==='dialogue'?'<label class="field">Respuesta escrita (opcional)<textarea id="answerText"></textarea></label>':''}<div id="feedback" class="feedback" role="status" aria-live="polite"></div>${(voiceMode||a.responseMode==='speech'||isWordExercise)?`<div class="voice-evaluation"><h2>¿Cómo me fue?</h2><div class="actions">${btn('🙂 Mejor','rateEasy','button primary')}${btn('🔁 Me costó','rateHard','button secondary')}</div><p id="selfRating" role="status" aria-live="polite"></p><small>Tu percepción es importante. La transcripción automática no evalúa la pronunciación.</small></div>`:`<div class="finish-actions">${btn(favorite?'★ Guardado':'☆ Guardar','favorite','button compact')}${btn('✓ Practicado','complete','button secondary compact')}</div>`}</section><div class="step-nav">${btn('Anterior','prev','button',idx===0?'disabled':'')}${btn('Siguiente','next','button primary')}</div></div>`);
}
const BOARD=[['Sí','yes'],['No','no'],['Quiero agua','cup'],['Tengo hambre','food'],['Necesito ayuda','help'],['Quiero ir al baño','bath'],['Quiero descansar','bed'],['Me duele','pain'],['No entiendo','help'],['Hable más despacio','slow'],['Llame a mi familia','person'],['Repita, por favor','repeat']];
function board(){if(session.active)pauseSession();route='board';setPage(`<div class="toolbar">${btn('← Inicio','home')}</div><span class="eyebrow">Comunicación cotidiana</span><h1 class="section-title">¿Qué necesitas decir?</h1><p class="muted">Pulsa una frase para mostrarla y escucharla. Puedes señalarla si la voz no está disponible.</p><div class="board">${BOARD.map(([txt,ico],i)=>`<button class="card clickable" data-phrase="${i}">${prefs.showIcons?svg(ico):''}<b>${escapeHtml(txt)}</b></button>`).join('')}</div><div class="card" style="margin-top:18px"><label for="customPhrase"><b>Mi propio mensaje</b></label><textarea id="customPhrase" maxlength="200" placeholder="Escribe una frase corta..."></textarea>${btn('🔊 Leer mensaje','customSpeak','button primary')}</div><p id="feedback" class="feedback" role="status" aria-live="polite"></p>`)}
function progress(){if(session.active)pauseSession();route='progress';const vp=voiceProgress();const summary=scoreSummary();const visualSupport=read('habla.motorSupport',{});const done=Object.keys(stats.done).length;const total=Object.values(stats.done).reduce((s,n)=>s+n,0);setPage(`<div class="toolbar">${btn('← Inicio','home')}</div><span class="eyebrow">Mi actividad</span><h1 class="section-title">Tu práctica</h1><div class="grid"><div class="card"><h2>${Object.values(visualSupport).reduce((sum,count)=>sum+count,0)}</h2><p>Ayudas de posición consultadas</p></div><div class="card"><h2>${summary.h.length}</h2><p>Intentos con reconocimiento de voz</p></div><div class="card"><h2>${summary.avg===null?'—':summary.avg+'%'}</h2><p>Coincidencia media de texto de los últimos 10 intentos reconocidos (no mide pronunciación)</p></div><div class="card"><h2>${vp.attempts}</h2><p>Intentos de pronunciación registrados</p></div><div class="card"><h2>${vp.easier}</h2><p>Veces que sentiste que te salió mejor</p></div><div class="card"><h2>${Object.keys(vp.words).length}</h2><p>Palabras diferentes practicadas</p></div><div class="card"><h2>${done}</h2><p>Actividades distintas practicadas</p></div><div class="card"><h2>${total}</h2><p>Veces que marcaste «Ya practiqué»</p></div><div class="card"><h2>${stats.favorites.length}</h2><p>Ejercicios guardados</p></div><div class="card"><h2>Sin presión</h2><p>No medimos aciertos ni calificamos tu voz.</p></div></div><section class="card"><h2>Palabras para seguir practicando</h2><p>Según los últimos resultados de reconocimiento, no una evaluación de pronunciación.</p>${summary.challenging.length?'<div class="categories">'+summary.challenging.map(x=>'<div class="category"><b>'+escapeHtml(x.word)+'</b> · '+x.score+'% de coincidencia</div>').join('')+'</div>':'<p>Aún no hay resultados de reconocimiento.</p>'}</section><div class="actions">${btn('Practicar mi pronunciación','voicePractice','button primary')}${btn('Practicar mis guardados','favorites','button primary')}${btn('Borrar mi progreso','clearProgress','button')}</div><p id="feedback" class="feedback" role="status" aria-live="polite"></p><p class="hint">Los registros se guardan solamente en este navegador. Si borras sus datos, se perderán.</p>`)}
function showClue(kind){const a=items[idx];let t=kind==='hintSemantic'?a.semanticHint:kind==='hintPhonetic'?a.phoneticHint:kind==='support'?a.syllables:(a.expectedAnswer||a.answer);const el=$('#clue');el.hidden=false;el.textContent=t||'No hay pista adicional para esta actividad.'}
function setCue(id,message){const status=$('#activityStatus');if(status&&message)status.textContent=message;const key=id==='cueListen'?'modelListen':id==='cueRecord'?'recordButton':'listenRecording';const el=$('#'+key);if(el)el.classList.add('action-used')}
function playTarget(textValue){speak(textValue);setCue('cueListen','🔊 Reproduciendo el modelo de voz…');const b=$('[data-action="speak"]');if(b){b.classList.add('audio-activated');setTimeout(()=>{if(b.isConnected)b.classList.remove('audio-activated')},2500)}}
function speak(textValue){stopSyllablePlayback();if(!('speechSynthesis' in window)){notify('La lectura de voz no está disponible. Puedes leer o mostrar el texto.');return}try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(textValue);u.lang='es-NI';u.rate=Number(prefs.speechRate)||.9;const voices=speechSynthesis.getVoices();const v=voices.find(v=>v.lang==='es-NI')||voices.find(v=>v.lang.toLowerCase().startsWith('es'));if(v)u.voice=v;u.onerror=()=>notify('La voz no está disponible ahora. Puedes leer o mostrar el mensaje.');speechSynthesis.speak(u)}catch{notify('No se pudo reproducir la voz.')}}
function stopAudio(){if(recording&&recording.state==='recording')recording.stop();if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}if(recAudio){recAudio.pause();recAudio=null}if(audioURL){URL.revokeObjectURL(audioURL);audioURL=null}}
async function record(){
 if(recording&&recording.state==='recording'){
  transcribeState('Procesando transcripción…');
  recordSeconds=attemptStarted?Math.round((performance.now()-attemptStarted)/100)/10:0;
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
   const recordButton=$('#recordButton');if(recordButton)recordButton.classList.remove('recording-active');
   if(audioURL)URL.revokeObjectURL(audioURL);
   audioURL=URL.createObjectURL(new Blob(recChunks,{type:recording.mimeType||'audio/webm'}));
   const play=$('#listenRecording');if(play)play.disabled=false;
   const b=$('[data-action="record"]');if(b)b.textContent='🎙 Grabar';
   setCue('cueRecord','✅ Grabación terminada. Ahora puedes escuchar tu voz.');notify('Grabación lista. Puedes escuchar tu voz.');
  };
  transcriptionFinal='';updateTranscript('',false);
  recording.start();attemptStarted=performance.now();wordAttempts++;setCue('cueRecord','🔴 Grabando tu voz…');
  const recordButton=$('#recordButton');if(recordButton){recordButton.classList.add('recording-active');recordButton.textContent='⏹ Detener grabación'}
  const info=$('#attemptInfo');if(info)info.textContent='Intento '+wordAttempts;
  if(transcriptEnabled)startRecognitionForRecording(true);
  const b=$('[data-action="record"]');if(b)b.textContent='⏹ Detener grabación';
  notify('Grabando. Pulsa detener cuando termines.');
 }catch{transcribeState('No se pudo acceder al micrófono.');notify('No se pudo grabar. Revisa los permisos.')}
}
function listen(){if(!audioURL){notify('Primero graba tu voz.');return}if(recAudio)recAudio.pause();recAudio=new Audio(audioURL);recAudio.onplay=()=>setCue('cueReview','▶ Escuchando tu grabación…');recAudio.onended=()=>setCue('cueReview','✅ Ya escuchaste tu voz. Puedes repetir o continuar.');recAudio.play().catch(()=>notify('No se pudo reproducir la grabación.'))}

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
function showAttemptLog(){const box=$('#attemptLog');if(!box)return;box.innerHTML=wordTranscriptAttempts.map((r,i)=>'<p><strong>Grabación '+(i+1)+':</strong> '+escapeHtml(r.text||'Sin texto reconocido')+(r.seconds?' · '+r.seconds+' s':'')+(r.matched?' · Palabra reconocida':'')+'</p>').join('')}
function toggleTranscript(){transcriptEnabled=!transcriptEnabled;const panel=$('#transcriptPanel'),button=$('[data-action="toggleTranscript"]');if(panel)panel.hidden=!transcriptEnabled;if(button){button.setAttribute('aria-expanded',String(transcriptEnabled));button.textContent=transcriptEnabled?'📝 Cerrar':'📝 Texto'}if(transcriptEnabled){transcribeState('Se mostrará en la próxima grabación.');showAttemptLog()}}
function updateTranscript(value,final=false){
 const el=$('#recognizedText');if(el)el.textContent=value.trim()||'No se captaron palabras.';
 const result=$('#matchResult');if(!result)return;
 const exercise=items[idx];
 if(!final||!value.trim()||!exercise){result.hidden=true;return}
 const expected=voiceWord(exercise)&&['repeticion','motor_habla','lectura','comunicacion','disartria'].includes(exercise.track)?voiceWord(exercise):(exercise.ttsText||exercise.expectedAnswer||exercise.answer||exercise.prompt);
 const score=textSimilarity(expected,value);
 if(final){const matched=normalizeWords(value).includes(normalizeWords(expected).join(' '));wordTranscriptAttempts.push({text:value,seconds:recordSeconds,matched});showAttemptLog();saveRecognition(exercise,value,score);const info=$('#attemptInfo');if(info)info.textContent=(wordAttempts?'Intentos: '+wordAttempts+'. ':'')+(recordSeconds?'Grabación: '+recordSeconds+' segundos. ':'')+(normalizeWords(value).includes(normalizeWords(expected).join(' '))?'Palabra reconocida.':'Puedes intentar de nuevo.');}
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
   if(recognized){updateTranscript(recognized,true);transcribeState('Texto reconocido.');}
   else transcribeState(errorMessage||'No se detectó voz. Puedes intentar transcribir otra vez.');
  };
  r.start();
 }catch{recognition=null;recognitionControls(false);transcribeState('No se pudo iniciar la transcripción automática. Puedes intentarla después.')}
}
function recognizeSpeech(){recordSeconds=0;startRecognitionForRecording()}
function stopTranscription(){if(recognition){try{recognition.stop()}catch{}}}
function settingsApply(){document.body.classList.toggle('large',prefs.largeText);document.body.classList.toggle('contrast',prefs.contrast);document.body.classList.toggle('no-motion',prefs.reduceMotion);for(const k of ['largeText','contrast','reduceMotion','showIcons','speechRate']){const el=$('#'+k);el&&(el.type==='checkbox'?el.checked=!!prefs[k]:el.value=prefs[k])}}
app.addEventListener('click',e=>{const phrase=e.target.closest('[data-phrase]');if(phrase){const msg=BOARD[Number(phrase.dataset.phrase)][0];notify(`Mensaje: ${msg}`);speak(msg);return}const category=e.target.closest('[data-track]');if(category){openTrack(category.dataset.track);return}const el=e.target.closest('[data-action]');if(!el)return;const a=el.dataset.action;if(a==='home')home();else if(a.startsWith('selection:'))startSelection(a.split(':')[1]);else if(a==='personal')personalPage();else if(a==='coordination')startCoordination();else if(a.startsWith('motor:'))motorChoose(a.slice(6));else if(a.startsWith('level:'))startMotorLevel(Number(a.slice(6)));else if(a==='vocalPractice')startVocalPractice();else if(a.startsWith('motorGuided:'))motorStart(a.slice(12),'guided');else if(a.startsWith('motorBrowse:'))motorBrowse(a.slice(12));else if(a.startsWith('motorItem:')){const [,family,id]=a.split(':');motorStart(family,'free',id)}else if(a.startsWith('motorResume:'))motorStart(a.slice(12),'resume');else if(a==='motorPosition')motorPositionPanel(items[idx]);else if(a==='reinforcement')reinforcementPractice();else if(a.startsWith('deletePersonal:')){const id=a.split(':')[1];save('habla.personal',personalEntries().filter(x=>x.id!==id));personalPage()}else if(a==='catalog')catalog();else if(a==='board')board();else if(a==='progress')progress();else if(a==='daily')getSequence();else if(a==='voicePractice')startVoicePractice();else if(a==='audioInstruction')audioInstruction();else if(a==='toggleTranscript')toggleTranscript();else if(a==='syllableHelp')syllableHelp();else if(a==='syllableSequence')playSyllablesWithPauses();else if(a.startsWith('syl:')){const v=syllablesFor(items[idx]);if(v){const part=v.split('-')[Number(a.split(':')[1])];if(part)speak(part)}}else if(a==='rateEasy')rateVoice(true);else if(a==='rateHard')rateVoice(false);else if(a==='speak'){const ex=items[idx];playTarget(voiceWord(ex)&&['repeticion','motor_habla','lectura','comunicacion','disartria','personal'].includes(ex.track)?voiceWord(ex):(ex.ttsText||ex.prompt))}else if(a==='record')record();else if(a==='playRecording')listen();else if(a==='recognize')recognizeSpeech();else if(a==='stopRecognition')stopTranscription();else if(a==='prev'&&idx>0){idx--;renderActivity()}else if(a==='next'){if(idx===items.length-1){endSession();progress()}else{idx++;renderActivity()}}else if(a==='hintSemantic'||a==='hintPhonetic'||a==='answer'||a==='support')showClue(a);else if(a.startsWith('choice:')){const ex=items[idx],chosen=ex.options[Number(a.split(':')[1])];app.querySelectorAll('.choices .button').forEach(b=>{b.classList.remove('choice-selected','choice-correct','choice-incorrect');b.removeAttribute('aria-pressed')});el.classList.add('choice-selected');el.setAttribute('aria-pressed','true');const correct=normalizeWords(chosen).join(' ')===normalizeWords(ex.answer).join(' ');el.classList.add(correct?'choice-correct':'choice-incorrect');const out=$('#choiceResult');if(out){out.className='choice-result '+(correct?'is-correct':'is-incorrect');out.textContent=correct?'✓ Correcto':'✕ Intenta de nuevo';}}else if(a==='complete'){const id=items[idx].id;stats.done[id]=(stats.done[id]||0)+1;stats.last=id;save('habla.stats',stats);notify('Actividad registrada. Puedes repetirla o continuar.')}else if(a==='favorite'){const id=items[idx].id;stats.favorites=stats.favorites.includes(id)?stats.favorites.filter(x=>x!==id):[...stats.favorites,id];save('habla.stats',stats);el.textContent=stats.favorites.includes(id)?'★ Guardado':'☆ Guardar'}else if(a==='favorites'){startSession();items=data.filter(x=>stats.favorites.includes(x.id));idx=0;route='practice';if(items.length)renderActivity();else notify('Todavía no guardaste actividades.')}else if(a==='clearProgress'){if(confirm('¿Borrar el historial y los ejercicios guardados en este dispositivo?')){stats={done:{},favorites:[],last:null};save('habla.stats',stats);save('habla.voiceProgress',{attempts:0,easier:0,harder:0,words:{}});save('habla.recognitionScores',[]);save('habla.motorSupport',{});progress()}}else if(a==='customSpeak'){const txt=$('#customPhrase').value.trim();if(txt)speak(txt);else notify('Escribe primero el mensaje.')}});
app.addEventListener('submit',e=>{if(e.target.id!=='personalForm')return;e.preventDefault();const input=$('#personalText'),kind=$('#personalKind').value,textValue=input.value.trim().replace(/\\s+/g,' ');if(!textValue||textValue.length>140){notify('Introduce una palabra o frase válida.');return}const own=personalEntries();if(own.length>=100){notify('Máximo de 100 entradas personalizadas.');return}own.push({id:'USER-'+Date.now()+'-'+Math.floor(Math.random()*1e5),kind,text:textValue});save('habla.personal',own);personalPage()});
$('#settingsBtn').addEventListener('click',()=>$('#settings').showModal());$('#brand').addEventListener('click',home);for(const k of ['largeText','contrast','reduceMotion','showIcons','speechRate'])$('#'+k).addEventListener('change',e=>{prefs[k]=e.target.type==='checkbox'?e.target.checked:e.target.value;save('habla.prefs',prefs);settingsApply();if(route==='board')board()});
function connection(){const online=navigator.onLine;$('#connection').textContent=online?'● Con conexión':'● Sin conexión';$('#connection').style.color=online?'#28795f':'#ad6429'}window.addEventListener('online',connection);window.addEventListener('offline',connection);connection();settingsApply();
fetch('./data/catalogo.json').then(r=>{if(!r.ok)throw Error('no data');return r.json()}).then(arr=>{data=arr;home()}).catch(()=>setPage('<div class="hero"><h1>No se pudo cargar la biblioteca</h1><p>Para usarla sin conexión, abre HABLA una vez conectado a internet y vuelve a intentarlo.</p><button class="button primary" onclick="location.reload()">Reintentar</button></div>'));
window.HABLA_UPDATES?.init(()=>Boolean(recording&&recording.state==='recording'));
window.HABLA_STORAGE?.migrate();
})();
