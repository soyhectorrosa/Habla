/* ArquiVoz - Motor Clínico de Práctica Logopédica (Offline-First PWA) */

const DEFAULT_SETTINGS = {
  locale: 'es-NI',
  difficulty: 2,
  targetWords: 4,
  fontScale: 1.15,
  highContrast: false,
  speechRate: 0.9
};

const STATE = {
  settings: { ...DEFAULT_SETTINGS },
  catalog: {
    calentamiento: [],
    voz: [],
    articulacion: [],
    lenguaje: [],
    funcional: [],
    personalizados: []
  },
  currentBlock: 'calentamiento',
  currentSubCat: '',
  filteredExercises: [],
  currentIndex: 0,
  sessionSeconds: 0,
  // Audio & Reconocimiento
  isRecordingSpeech: false,
  recognition: null,
  accumulatedTranscript: '',
  mediaRecorder: null,
  audioChunks: [],
  lastAudioUrl: null,
  // Medidor exclusivo de volumen (Bloque Voz)
  isMeterActive: false,
  audioCtx: null,
  analyser: null,
  micStream: null,
  meterAnimId: null,
  sustainStart: null,
  // Cronómetro de fluidez (60s)
  fluencyInterval: null,
  // Progreso local
  history: []
};

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', async () => {
  registerServiceWorker();
  loadLocalState();
  applySettingsToUI();
  startSessionClock();
  await loadCatalogData();
  bindEvents();
  switchBlock('calentamiento');
});

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

function loadLocalState() {
  try {
    const savedSettings = JSON.parse(localStorage.getItem('arquivoz_settings'));
    if (savedSettings) STATE.settings = { ...DEFAULT_SETTINGS, ...savedSettings };

    const savedCustom = JSON.parse(localStorage.getItem('arquivoz_custom'));
    if (Array.isArray(savedCustom)) STATE.catalog.personalizados = savedCustom;

    const savedHistory = JSON.parse(localStorage.getItem('arquivoz_history'));
    if (Array.isArray(savedHistory)) STATE.history = savedHistory;
  } catch (e) {
    console.warn('Error leyendo almacenamiento local', e);
  }
}

function saveLocalState() {
  localStorage.setItem('arquivoz_settings', JSON.stringify(STATE.settings));
  localStorage.setItem('arquivoz_custom', JSON.stringify(STATE.catalog.personalizados));
  localStorage.setItem('arquivoz_history', JSON.stringify(STATE.history));
}

async function loadCatalogData() {
  const files = [
    { key: 'calentamiento', url: './data/calentamiento.json' },
    { key: 'voz', url: './data/voz_articulacion.json', filterBlock: 'voz' },
    { key: 'articulacion', url: './data/voz_articulacion.json', filterBlock: 'articulacion' },
    { key: 'lenguaje', url: './data/lenguaje.json' },
    { key: 'funcional', url: './data/funcional.json' }
  ];

  for (const item of files) {
    try {
      const res = await fetch(item.url);
      const data = await res.json();
      STATE.catalog[item.key] = item.filterBlock
        ? data.filter(ex => ex.block === item.filterBlock)
        : data;
    } catch (err) {
      console.error(`No se pudo cargar ${item.url}`, err);
    }
  }
}

function startSessionClock() {
  setInterval(() => {
    STATE.sessionSeconds++;
    const mins = String(Math.floor(STATE.sessionSeconds / 60)).padStart(2, '0');
    const secs = String(STATE.sessionSeconds % 60).padStart(2, '0');
    document.getElementById('sessionTimer').textContent = `${mins}:${secs}`;
  }, 1000);
}

// --- CONFIGURACIÓN Y ACCESIBILIDAD ---
function applySettingsToUI() {
  const s = STATE.settings;
  document.documentElement.style.setProperty('--font-scale', s.fontScale);
  document.body.classList.toggle('high-contrast', Boolean(s.highContrast));

  const levelNames = { 1: 'Básico', 2: 'Intermedio', 3: 'Avanzado' };
  document.getElementById('profileBadge').textContent =
    `Nivel: ${levelNames[s.difficulty] || 'Intermedio'} · ${s.locale}`;

  document.getElementById('cfgLocale').value = s.locale;
  document.getElementById('cfgDifficulty').value = String(s.difficulty);
  document.getElementById('cfgTargetWords').value = String(s.targetWords);
  document.getElementById('cfgFontScale').value = String(s.fontScale);
  document.getElementById('cfgHighContrast').checked = Boolean(s.highContrast);
  document.getElementById('cfgSpeechRate').value = String(s.speechRate);
  updateProgressSummary();
}

function updateProgressSummary() {
  const total = STATE.history.length;
  const claros = STATE.history.filter(h => h.rating === 'logrado').length;
  document.getElementById('progressSummary').textContent =
    `Ejercicios registrados en este dispositivo: ${total} (${claros} marcados como claros).`;
}

// --- NAVEGACIÓN DE BLOQUES Y SUBCATEGORÍAS ---
function switchBlock(blockName) {
  stopAllAudioHardware();
  STATE.currentBlock = blockName;

  document.querySelectorAll('#blockTabs .tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.block === blockName);
  });

  const isCustom = blockName === 'personalizados';
  document.getElementById('customEditorCard').classList.toggle('hidden', !isCustom);

  const items = STATE.catalog[blockName] || [];
  const subCats = [...new Set(items.map(i => i.subCategory || 'General'))];
  STATE.currentSubCat = subCats[0] || 'General';

  renderSubCategoryPills(subCats);
  filterAndRenderExercises();
}

function renderSubCategoryPills(subCats) {
  const container = document.getElementById('subCategoryNav');
  container.replaceChildren();

  if (subCats.length <= 1) return;

  subCats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'sub-pill' + (cat === STATE.currentSubCat ? ' active' : '');
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      stopAllAudioHardware();
      STATE.currentSubCat = cat;
      document.querySelectorAll('.sub-pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      filterAndRenderExercises();
    });
    container.appendChild(btn);
  });
}

function filterAndRenderExercises() {
  const all = STATE.catalog[STATE.currentBlock] || [];
  const maxDiff = Number(STATE.settings.difficulty);

  let filtered = all.filter(item => {
    const matchCat = (item.subCategory || 'General') === STATE.currentSubCat;
    const matchDiff = !item.difficulty || item.difficulty <= maxDiff || STATE.currentBlock === 'personalizados';
    return matchCat && matchDiff;
  });

  if (filtered.length === 0) {
    filtered = all.filter(item => (item.subCategory || 'General') === STATE.currentSubCat);
  }

  STATE.filteredExercises = filtered;
  STATE.currentIndex = 0;
  renderCurrentExercise();
}

function renderCurrentExercise() {
  stopAllAudioHardware();
  clearInterval(STATE.fluencyInterval);

  const list = STATE.filteredExercises;
  const counterEl = document.getElementById('exCounter');

  if (!list || list.length === 0) {
    document.getElementById('exGoal').textContent = 'Sin ejercicios en esta categoría';
    document.getElementById('exInstruction').textContent =
      STATE.currentBlock === 'personalizados'
        ? 'Use el formulario de abajo para agregar sus propias frases o términos de arquitectura.'
        : 'Ajuste el nivel de dificultad en Perfil para ver más ejercicios.';
    document.getElementById('exPrompt').textContent = '—';
    document.getElementById('exSyllables').textContent = '';
    counterEl.textContent = '0 / 0';
    return;
  }

  const ex = list[STATE.currentIndex];
  counterEl.textContent = `${STATE.currentIndex + 1} / ${list.length}`;

  document.getElementById('exGoal').textContent = `${ex.subCategory || 'Práctica'} · ${ex.goal || 'Entrenamiento'}`;
  document.getElementById('exInstruction').textContent = ex.instruction || '';
  document.getElementById('exPrompt').textContent = ex.prompt;
  document.getElementById('exSyllables').textContent = ex.syllables || '';

  // Estímulo visual SVG seguro (para Nominación)
  const visBox = document.getElementById('visualStimulus');
  visBox.replaceChildren();
  if (ex.svgIcon) {
    visBox.classList.remove('hidden');
    const parser = new DOMParser();
    const doc = parser.parseFromString(ex.svgIcon, 'image/svg+xml');
    if (doc.documentElement.nodeName === 'svg') {
      visBox.appendChild(document.importNode(doc.documentElement, true));
    }
  } else {
    visBox.classList.add('hidden');
  }

  // Pistas progresivas
  const hintsBox = document.getElementById('hintsContainer');
  const hintText = document.getElementById('hintText');
  hintText.textContent = '';
  if (ex.semanticHint || ex.phoneticHint) {
    hintsBox.classList.remove('hidden');
  } else {
    hintsBox.classList.add('hidden');
  }

  // Cronómetro de fluidez (60s)
  const fluencyBox = document.getElementById('fluencyTimerBox');
  if (ex.type === 'fluency_60s') {
    fluencyBox.classList.remove('hidden');
    document.getElementById('fluencyCountdown').textContent = '60s';
  } else {
    fluencyBox.classList.add('hidden');
  }

  // Alternar interfaz según tipo de bloque (Voz vs Comprensión vs Habla)
  const isVoiceMeter = STATE.currentBlock === 'voz';
  const isComprehension = ex.type === 'comprehension';

  document.getElementById('voiceMeterBox').classList.toggle('hidden', !isVoiceMeter);
  document.getElementById('comprehensionBox').classList.toggle('hidden', !isComprehension);
  document.getElementById('speechPracticeBox').classList.toggle('hidden', isVoiceMeter || isComprehension);

  // Resetear feedback
  document.getElementById('transcriptText').textContent = 'Presione el botón rojo para hablar...';
  document.getElementById('structureFeedback').textContent = '';
  document.getElementById('btnPlayMyVoice').disabled = true;

  // Opciones de comprensión
  if (isComprehension && Array.isArray(ex.options)) {
    const compOpts = document.getElementById('compOptions');
    const compRes = document.getElementById('compResult');
    compOpts.replaceChildren();
    compRes.textContent = '';

    ex.options.forEach(opt => {
      const b = document.createElement('button');
      b.className = 'btn btn-outline';
      b.textContent = opt;
      b.addEventListener('click', () => {
        const ok = opt === ex.answer;
        compRes.textContent = ok
          ? '✓ Correcto. Comprensión verificada.'
          : `Respuesta esperada: "${ex.answer}". Escuche de nuevo si lo desea.`;
        compRes.style.color = ok ? 'var(--success)' : 'var(--warning)';
        recordEvaluation(ok ? 'logrado' : 'repetir');
      });
      compOpts.appendChild(b);
    });
  }
}

// --- SÍNTESIS DE VOZ (TTS MODELO) ---
function speakModel(slow = false) {
  const ex = STATE.filteredExercises[STATE.currentIndex];
  if (!ex || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const textToSpeak = ex.ttsText || ex.prompt.replace(/_+/g, ' ... ');
  const utter = new SpeechSynthesisUtterance(textToSpeak);
  utter.lang = STATE.settings.locale;
  utter.rate = slow ? 0.65 : Number(STATE.settings.speechRate);

  const voices = window.speechSynthesis.getVoices();
  const preferred =
    voices.find(v => v.lang === STATE.settings.locale) ||
    voices.find(v => v.lang.startsWith('es-'));
  if (preferred) utter.voice = preferred;

  window.speechSynthesis.speak(utter);
}

// --- RECONOCIMIENTO CONTINUO + GRABACIÓN REAL ---
async function toggleSpeechPractice() {
  if (STATE.isRecordingSpeech) {
    stopSpeechPractice();
  } else {
    await startSpeechPractice();
  }
}

async function startSpeechPractice() {
  const btn = document.getElementById('btnRecordSpeech');
  const transcriptEl = document.getElementById('transcriptText');
  STATE.accumulatedTranscript = '';
  STATE.audioChunks = [];
  document.getElementById('structureFeedback').textContent = '';

  // 1. Iniciar grabación real para autoescucha
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    STATE.micStream = stream;
    STATE.mediaRecorder = new MediaRecorder(stream);
    STATE.mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) STATE.audioChunks.push(e.data);
    };
    STATE.mediaRecorder.onstop = () => {
      const blob = new Blob(STATE.audioChunks, { type: 'audio/webm' });
      if (STATE.lastAudioUrl) URL.revokeObjectURL(STATE.lastAudioUrl);
      STATE.lastAudioUrl = URL.createObjectURL(blob);
      document.getElementById('btnPlayMyVoice').disabled = false;
    };
    STATE.mediaRecorder.start();
  } catch (err) {
    transcriptEl.textContent = 'No se pudo acceder al micrófono. Verifique permisos en Chrome.';
    return;
  }

  // 2. Iniciar Web Speech API en modo continuo resistente a pausas
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRec) {
    STATE.recognition = new SpeechRec();
    STATE.recognition.lang = STATE.settings.locale;
    STATE.recognition.continuous = true;
    STATE.recognition.interimResults = true;

    STATE.recognition.onresult = event => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const txt = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          STATE.accumulatedTranscript += (STATE.accumulatedTranscript ? ' ' : '') + txt.trim();
        } else {
          interim += txt;
        }
      }
      const full = (STATE.accumulatedTranscript + ' ' + interim).trim();
      transcriptEl.textContent = full || 'Escuchando... tómese su tiempo para pausar.';
    };

    // Reinicio automático si el navegador corta en una pausa larga del paciente
    STATE.recognition.onend = () => {
      if (STATE.isRecordingSpeech) {
        try {
          STATE.recognition.start();
        } catch (e) {}
      }
    };

    try {
      STATE.recognition.start();
    } catch (e) {}
  } else {
    transcriptEl.textContent = 'Grabando audio (reconocimiento automático no disponible en este navegador)...';
  }

  STATE.isRecordingSpeech = true;
  btn.classList.add('recording');
  btn.textContent = '⏹️ Terminar y Revisar';
}

function stopSpeechPractice() {
  STATE.isRecordingSpeech = false;
  const btn = document.getElementById('btnRecordSpeech');
  btn.classList.remove('recording');
  btn.textContent = '🎙️ Empezar a Hablar (Sin límite de pausas)';

  if (STATE.recognition) {
    try { STATE.recognition.stop(); } catch (e) {}
    STATE.recognition = null;
  }
  if (STATE.mediaRecorder && STATE.mediaRecorder.state !== 'inactive') {
    STATE.mediaRecorder.stop();
  }
  if (STATE.micStream) {
    STATE.micStream.getTracks().forEach(t => t.stop());
    STATE.micStream = null;
  }

  evaluateStructure(STATE.accumulatedTranscript);
}

function evaluateStructure(spokenText) {
  const ex = STATE.filteredExercises[STATE.currentIndex];
  const fbEl = document.getElementById('structureFeedback');
  if (!ex || !spokenText) return;

  const words = spokenText.trim().split(/\s+/).filter(Boolean);
  const targetLen = Number(STATE.settings.targetWords);

  if (ex.type === 'dialogue' || ex.type === 'fluency_60s') {
    const metLength = words.length >= targetLen;
    let keywordNote = '';
    if (Array.isArray(ex.expectedKeywords) && ex.expectedKeywords.length > 0) {
      const lower = spokenText.toLowerCase();
      const found = ex.expectedKeywords.filter(k => lower.includes(k.toLowerCase()));
      keywordNote = ` · Ideas clave detectadas: ${found.length}/${ex.expectedKeywords.length}`;
    }
    fbEl.textContent = `Extensión: ${words.length} palabras (objetivo configurado: ${targetLen})${metLength ? ' ✓' : ''}${keywordNote}`;
  } else if (ex.expectedAnswer) {
    const cleanSpoken = spokenText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const cleanTarget = ex.expectedAnswer.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const matched = cleanSpoken.includes(cleanTarget);
    fbEl.textContent = matched
      ? `✓ Coincidencia léxica detectada con "${ex.expectedAnswer}". Escúchese para confirmar claridad.`
      : `Palabra esperada: "${ex.expectedAnswer}". Escuche su grabación y compare.`;
  }
}

// --- MEDIDOR EXCLUSIVO DE VOZ (SIN SPEECH RECOGNITION SIMULTÁNEO) ---
async function toggleVoiceMeter() {
  if (STATE.isMeterActive) {
    stopVoiceMeter();
  } else {
    await startVoiceMeter();
  }
}

async function startVoiceMeter() {
  const btn = document.getElementById('btnToggleMeter');
  const fill = document.getElementById('volumeFill');
  const durEl = document.getElementById('sustainDuration');

  try {
    STATE.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    STATE.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = STATE.audioCtx.createMediaStreamSource(STATE.micStream);
    STATE.analyser = STATE.audioCtx.createAnalyser();
    STATE.analyser.fftSize = 256;
    source.connect(STATE.analyser);

    const dataArray = new Uint8Array(STATE.analyser.frequencyBinCount);
    STATE.isMeterActive = true;
    STATE.sustainStart = null;
    btn.classList.add('recording');
    btn.textContent = '⏹️ Detener Medición';

    const updateMeter = () => {
      if (!STATE.isMeterActive) return;
      STATE.analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const pct = Math.min(100, Math.round((avg / 110) * 100));
      fill.style.width = `${pct}%`;
      fill.style.backgroundColor = pct > 30 ? 'var(--success)' : 'var(--warning)';

      if (pct > 25) {
        if (!STATE.sustainStart) STATE.sustainStart = performance.now();
        const elapsed = ((performance.now() - STATE.sustainStart) / 1000).toFixed(1);
        durEl.textContent = `${elapsed} s`;
      } else {
        STATE.sustainStart = null;
      }
      STATE.meterAnimId = requestAnimationFrame(updateMeter);
    };
    updateMeter();
  } catch (err) {
    durEl.textContent = 'Sin acceso al micrófono';
  }
}

function stopVoiceMeter() {
  STATE.isMeterActive = false;
  if (STATE.meterAnimId) cancelAnimationFrame(STATE.meterAnimId);
  if (STATE.audioCtx) {
    STATE.audioCtx.close().catch(() => {});
    STATE.audioCtx = null;
  }
  if (STATE.micStream) {
    STATE.micStream.getTracks().forEach(t => t.stop());
    STATE.micStream = null;
  }
  const btn = document.getElementById('btnToggleMeter');
  btn.classList.remove('recording');
  btn.textContent = '🎙️ Medir Voz Sostenida';
  document.getElementById('volumeFill').style.width = '0%';
}

function stopAllAudioHardware() {
  if (STATE.isRecordingSpeech) stopSpeechPractice();
  if (STATE.isMeterActive) stopVoiceMeter();
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

// --- AUTOEVALUACIÓN Y PROGRESO LOCAL ---
function recordEvaluation(rating) {
  const ex = STATE.filteredExercises[STATE.currentIndex];
  if (!ex) return;

  STATE.history.push({
    date: new Date().toISOString(),
    block: STATE.currentBlock,
    subCategory: ex.subCategory || 'General',
    prompt: ex.prompt,
    rating
  });
  saveLocalState();
  updateProgressSummary();

  const fb = document.getElementById('structureFeedback');
  const labels = {
    logrado: 'Registrado: Claro ✓',
    casi: 'Registrado: Con esfuerzo ~',
    repetir: 'Marcado para repetir ↺'
  };
  fb.textContent = labels[rating];
}

// --- EVENTOS UI ---
function bindEvents() {
  document.querySelectorAll('#blockTabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchBlock(btn.dataset.block));
  });

  document.getElementById('btnSpeakNormal').addEventListener('click', () => speakModel(false));
  document.getElementById('btnSpeakSlow').addEventListener('click', () => speakModel(true));
  document.getElementById('btnRecordSpeech').addEventListener('click', toggleSpeechPractice);
  document.getElementById('btnToggleMeter').addEventListener('click', toggleVoiceMeter);

  document.getElementById('btnPlayMyVoice').addEventListener('click', () => {
    if (STATE.lastAudioUrl) {
      const audio = new Audio(STATE.lastAudioUrl);
      audio.play();
    }
  });

  document.getElementById('btnHint1').addEventListener('click', () => {
    const ex = STATE.filteredExercises[STATE.currentIndex];
    if (ex?.semanticHint) document.getElementById('hintText').textContent = `Pista: ${ex.semanticHint}`;
  });

  document.getElementById('btnHint2').addEventListener('click', () => {
    const ex = STATE.filteredExercises[STATE.currentIndex];
    if (ex?.phoneticHint) document.getElementById('hintText').textContent = `Empieza por: ${ex.phoneticHint}`;
  });

  document.getElementById('btnStartFluency').addEventListener('click', () => {
    clearInterval(STATE.fluencyInterval);
    let left = 60;
    const badge = document.getElementById('fluencyCountdown');
    badge.textContent = '60s';
    STATE.fluencyInterval = setInterval(() => {
      left--;
      badge.textContent = `${left}s`;
      if (left <= 0) {
        clearInterval(STATE.fluencyInterval);
        badge.textContent = '¡Tiempo!';
      }
    }, 1000);
  });

  document.querySelectorAll('[data-eval]').forEach(btn => {
    btn.addEventListener('click', () => recordEvaluation(btn.dataset.eval));
  });

  document.getElementById('btnPrevEx').addEventListener('click', () => {
    if (STATE.currentIndex > 0) {
      STATE.currentIndex--;
      renderCurrentExercise();
    }
  });

  document.getElementById('btnNextEx').addEventListener('click', () => {
    if (STATE.currentIndex < STATE.filteredExercises.length - 1) {
      STATE.currentIndex++;
      renderCurrentExercise();
    }
  });

  // Guardar frase personalizada (sin innerHTML)
  document.getElementById('btnSaveCustom').addEventListener('click', () => {
    const phrase = document.getElementById('customPhraseInput').value.trim();
    const syllables = document.getElementById('customSyllablesInput').value.trim();
    if (!phrase) return;

    STATE.catalog.personalizados.push({
      subCategory: 'Mis Frases',
      goal: 'Vocabulario Personalizado',
      instruction: 'Escuche el modelo, articule con pausa y evalúe su claridad.',
      prompt: phrase,
      syllables
    });
    saveLocalState();
    document.getElementById('customPhraseInput').value = '';
    document.getElementById('customSyllablesInput').value = '';
    switchBlock('personalizados');
  });

  // Modal de Configuración
  const modal = document.getElementById('settingsModal');
  document.getElementById('btnOpenSettings').addEventListener('click', () => modal.classList.add('open'));
  document.getElementById('btnCloseSettings').addEventListener('click', () => {
    STATE.settings.locale = document.getElementById('cfgLocale').value;
    STATE.settings.difficulty = Number(document.getElementById('cfgDifficulty').value);
    STATE.settings.targetWords = Number(document.getElementById('cfgTargetWords').value);
    STATE.settings.fontScale = Number(document.getElementById('cfgFontScale').value);
    STATE.settings.highContrast = document.getElementById('cfgHighContrast').checked;
    STATE.settings.speechRate = Number(document.getElementById('cfgSpeechRate').value);
    saveLocalState();
    applySettingsToUI();
    filterAndRenderExercises();
    modal.classList.remove('open');
  });

  // Exportar / Importar Progreso JSON
  document.getElementById('btnExportData').addEventListener('click', () => {
    const payload = {
      app: 'ArquiVoz',
      exportedAt: new Date().toISOString(),
      settings: STATE.settings,
      customExercises: STATE.catalog.personalizados,
      progressHistory: STATE.history
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-arquivoz-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('importFileInput').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.settings) STATE.settings = { ...DEFAULT_SETTINGS, ...data.settings };
        if (Array.isArray(data.customExercises)) STATE.catalog.personalizados = data.customExercises;
        if (Array.isArray(data.progressHistory)) STATE.history = data.progressHistory;
        saveLocalState();
        applySettingsToUI();
        switchBlock(STATE.currentBlock);
      } catch (err) {
        alert('El archivo JSON no es válido.');
      }
    };
    reader.readAsText(file);
  });
}