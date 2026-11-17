/* Catálogos de apoyo sin dependencias, compartidos por todas las prácticas. */
window.HABLA_CONTENT=(()=>{'use strict';
const SYL={salud:'sa-lud',pelota:'pe-lo-ta',mariposa:'ma-ri-po-sa',mamá:'ma-má',papá:'pa-pá',agua:'a-gua',casa:'ca-sa',mano:'ma-no',mesa:'me-sa',pato:'pa-to',luna:'lu-na',cama:'ca-ma',sopa:'so-pa',camisa:'ca-mi-sa',zapato:'za-pa-to',comida:'co-mi-da',tomate:'to-ma-te',plato:'pla-to',brazo:'bra-zo',fruta:'fru-ta',trabajo:'tra-ba-jo',problema:'pro-ble-ma',teléfono:'te-lé-fo-no',chocolate:'cho-co-la-te',medicina:'me-di-ci-na',familia:'fa-mi-lia',gracias:'gra-cias',hola:'ho-la',baño:'ba-ño',dolor:'do-lor'};
// Separaciones explícitas para expresiones funcionales; los diptongos permanecen juntos.
Object.assign(SYL,{
quiero:'quie-ro',puedo:'pue-do',caliente:'ca-lien-te',fría:'frí-a',
oír:'o-ír',puedes:'pue-des',quiere:'quie-re',quieres:'quie-res',
tiene:'tie-ne',nuevo:'nue-vo',bueno:'bue-no',pausa:'pau-sa',
aire:'ai-re',puerta:'puer-ta',escuchar:'es-cu-char'
});
const COORDINATION=[["PA — PA — PA","Repite PA tres veces, lentamente y con comodidad."],["TA — TA — TA","Repite TA tres veces, manteniendo cada sonido claro."],["KA — KA — KA","Repite KA tres veces sin apresurarte."],["PA — TA","Alterna PA y TA, una vez cada una."],["TA — KA","Alterna TA y KA, una vez cada una."],["PA — KA","Alterna PA y KA, una vez cada una."],["PA — TA — KA","Di PA, TA y KA en secuencia. Prioriza claridad, no velocidad."],["PA — TA — KA · PA — TA — KA","Repite la secuencia dos veces, con una pausa si la necesitas."],["MA — ME — MI — MO — MU","Practica las vocales cambiando lentamente después de M."],["PA — PE — PI — PO — PU","Cambia las vocales manteniendo el inicio P."],["TA — TE — TI — TO — TU","Cambia las vocales manteniendo el inicio T."],["KA — KE — KI — KO — KU","Practica sonidos similares a KA, usando KE y KI como guía escrita."],["PATO","Escucha y di PATO completo."],["TACO","Escucha y di TACO completo."],["PAQUETE","Escucha y di PAQUETE. Si cuesta, practica por partes."],["TRABAJO","Escucha y di TRABAJO a velocidad cómoda."],["Necesito una pausa","Practica una frase funcional sin apresurarte."],["Quisiera explicar mi idea","Practica esta frase útil para conversar en el trabajo."]].map((x,i)=>({id:'COORD-'+i,track:'coordinacion',goal:i<12?'Secuencia de sílabas':'Llevar la práctica a palabras y frases',prompt:x[0],ttsText:x[0].replace(/ — /g,', ').replace(/ · /g,', '),instruction:x[1],responseMode:'speech'}));

/* Familias de práctica: organización de producto inspirada en ASHA, NO protocolo clínico validado. */
const MOTOR_FAMILIES=[
{id:'inicio',label:'Iniciar el habla',description:'Sonidos y sílabas cortas',icon:'sound'},
{id:'transiciones',label:'Coordinar sonidos',description:'Cambios entre posiciones',icon:'repeat'},
{id:'vocales',label:'Unir vocales',description:'Transiciones vocálicas',icon:'sound'},
{id:'complejos',label:'Combinar sonidos',description:'Grupos consonánticos',icon:'repeat'},
{id:'funcional',label:'Hablar con claridad',description:'Frases de uso cotidiano',icon:'chat'}
];
// IDs anteriores estables para conservar las marcas y el progreso almacenados en el navegador.
const LEGACY_MOTOR_IDS={"inicio|MA":"MOTOR-01","inicio|PA":"MOTOR-02","inicio|MAMÁ":"MOTOR-03","inicio|PAPA":"MOTOR-04","transiciones|PA – TA":"MOTOR-05","transiciones|MA – NA":"MOTOR-06","transiciones|TA – KA":"MOTOR-07","transiciones|PA – TA – KA":"MOTOR-08","vocales|PIE":"MOTOR-09","vocales|AIRE":"MOTOR-10","vocales|PUERTA":"MOTOR-11","vocales|AUTO":"MOTOR-12","complejos|PLATO":"MOTOR-13","complejos|BRAZO":"MOTOR-14","complejos|TREN":"MOTOR-15","complejos|FRUTA":"MOTOR-16","funcional|Dame agua.":"MOTOR-17","funcional|Necesito ayuda.":"MOTOR-18","funcional|Quiero descansar.":"MOTOR-19","funcional|¿Puedes repetir?":"MOTOR-20"};
const MOTOR_LIBRARY=[["inicio","MA","bilabial /m/","m","a"],["inicio","PA","bilabial /p/","p","a"],["inicio","TA","alveolar /t/",null,null],["inicio","NA","alveolar /n/",null,null],["inicio","LA","lateral /l/",null,null],["inicio","BA","bilabial /b/","b","a"],["inicio","DA","dental /d/",null,null],["inicio","FA","labiodental /f/",null,null],["inicio","SA","fricativa /s/",null,null],["inicio","KA","velar /k/",null,null],["inicio","ME","bilabial y vocal /e/","m","e"],["inicio","MI","bilabial y vocal /i/","m","i"],["inicio","MO","bilabial y vocal /o/","m","o"],["inicio","MU","bilabial y vocal /u/","m","u"],["inicio","PE","bilabial y vocal /e/","p","e"],["inicio","PI","bilabial y vocal /i/","p","i"],["inicio","PO","bilabial y vocal /o/","p","o"],["inicio","PU","bilabial y vocal /u/","p","u"],["inicio","MAMÁ","dos sílabas bilabiales","m","a"],["inicio","PAPÁ","dos sílabas bilabiales","p","a"],["inicio","PAPA","sílabas bilabiales","p","a"],["inicio","PATO","bilabial a alveolar","p","a"],["inicio","TAPA","alveolar a bilabial",null,null],["inicio","MAPA","bilabial y vocales","m","a"],["inicio","PALA","bilabial a lateral","p","a"],["inicio","LATA","lateral a alveolar",null,null],["inicio","MESA","nasal a fricativa","m","a"],["inicio","CASA","velar a fricativa",null,null],["inicio","NANA","nasales repetidas",null,null],["inicio","TITO","alveolares repetidas",null,null],["transiciones","PA – TA","bilabial a alveolar",null,null],["transiciones","TA – KA","alveolar a velar",null,null],["transiciones","PA – KA","bilabial a velar",null,null],["transiciones","MA – NA","bilabial nasal a alveolar nasal",null,null],["transiciones","PA – TA – KA","tres lugares de articulación",null,null],["transiciones","TA – PA","alveolar a bilabial",null,null],["transiciones","KA – TA","velar a alveolar",null,null],["transiciones","KA – PA","velar a bilabial",null,null],["transiciones","NA – MA","alveolar nasal a bilabial",null,null],["transiciones","LA – PA","lateral a bilabial",null,null],["transiciones","PA – LA","bilabial a lateral",null,null],["transiciones","MA – LA","nasal a lateral",null,null],["transiciones","LA – MA","lateral a nasal",null,null],["transiciones","FA – PA","labiodental a bilabial",null,null],["transiciones","PA – FA","bilabial a labiodental",null,null],["transiciones","SA – TA","fricativa a oclusiva",null,null],["transiciones","TA – SA","oclusiva a fricativa",null,null],["transiciones","BA – DA","bilabial a dental",null,null],["transiciones","DA – BA","dental a bilabial",null,null],["transiciones","GA – DA","velar a dental",null,null],["transiciones","DA – GA","dental a velar",null,null],["transiciones","PA – PE – PI","vocales con inicio /p/",null,null],["transiciones","MA – ME – MI","vocales con inicio /m/",null,null],["transiciones","TA – TE – TI","vocales con inicio /t/",null,null],["transiciones","PA – PO – PU","cambio de vocal con /p/",null,null],["transiciones","MA – MO – MU","cambio de vocal con /m/",null,null],["transiciones","LA – LE – LI","cambio de vocal con /l/",null,null],["transiciones","SA – SE – SI","cambio de vocal con /s/",null,null],["transiciones","PATO","bilabial a alveolar en palabra",null,null],["transiciones","TAPA","alveolar a bilabial en palabra",null,null],["transiciones","TACO","alveolar a velar en palabra",null,null],["transiciones","CAMA","velar a bilabial en palabra",null,null],["transiciones","MALO","nasal a lateral en palabra",null,null],["transiciones","PALOMA","múltiples transiciones",null,null],["transiciones","TOMATE","múltiples transiciones",null,null],["vocales","PIE","diptongo /ie/","i","e"],["vocales","AIRE","diptongo /ai/","a","i"],["vocales","PUERTA","diptongo /ue/","u","e"],["vocales","AUTO","diptongo /au/","a","u"],["vocales","BIEN","diptongo /ie/","i","e"],["vocales","TIENE","diptongo /ie/","i","e"],["vocales","SIETE","diptongo /ie/","i","e"],["vocales","NIEVE","diptongo /ie/","i","e"],["vocales","DIENTE","diptongo /ie/","i","e"],["vocales","FUE","diptongo /ue/","u","e"],["vocales","BUENO","diptongo /ue/","u","e"],["vocales","JUEGO","diptongo /ue/","u","e"],["vocales","NUEVO","diptongo /ue/","u","e"],["vocales","FUEGO","diptongo /ue/","u","e"],["vocales","BAILE","diptongo /ai/","a","i"],["vocales","CAUSA","diptongo /au/","a","u"],["vocales","PAUSA","diptongo /au/","a","u"],["vocales","JAULA","diptongo /au/","a","u"],["vocales","PEINE","diptongo /ei/","e","i"],["vocales","REINA","diptongo /ei/","e","i"],["vocales","HOY","diptongo /oi/","o","i"],["vocales","SOY","diptongo /oi/","o","i"],["vocales","AGUA","diptongo /ua/","u","a"],["vocales","CUATRO","diptongo /ua/","u","a"],["vocales","CIUDAD","secuencia vocálica /iu/","i","u"],["complejos","PLATO","grupo /pl/",null,null],["complejos","BRAZO","grupo /br/",null,null],["complejos","TREN","grupo /tr/",null,null],["complejos","FRUTA","grupo /fr/",null,null],["complejos","PLUMA","grupo /pl/",null,null],["complejos","PLAZA","grupo /pl/",null,null],["complejos","PLANTA","grupo /pl/",null,null],["complejos","BLUSA","grupo /bl/",null,null],["complejos","BLANCO","grupo /bl/",null,null],["complejos","BLOQUE","grupo /bl/",null,null],["complejos","CLARO","grupo /kl/",null,null],["complejos","CLASE","grupo /kl/",null,null],["complejos","CLIMA","grupo /kl/",null,null],["complejos","FLOR","grupo /fl/",null,null],["complejos","FLECHA","grupo /fl/",null,null],["complejos","GLOBO","grupo /gl/",null,null],["complejos","PRIMO","grupo /pr/",null,null],["complejos","PRADO","grupo /pr/",null,null],["complejos","PRUEBA","grupo /pr/",null,null],["complejos","BRISA","grupo /br/",null,null],["complejos","BROMA","grupo /br/",null,null],["complejos","TRAPO","grupo /tr/",null,null],["complejos","TRIGO","grupo /tr/",null,null],["complejos","DRAMA","grupo /dr/",null,null],["complejos","CREMA","grupo /kr/",null,null],["complejos","CRUZ","grupo /kr/",null,null],["complejos","GRANO","grupo /gr/",null,null],["complejos","GRITO","grupo /gr/",null,null],["complejos","FRESA","grupo /fr/",null,null],["complejos","FRENO","grupo /fr/",null,null],["funcional","Dame agua.","pedir agua",null,null],["funcional","Necesito ayuda.","pedir ayuda",null,null],["funcional","Quiero descansar.","pedir una pausa",null,null],["funcional","¿Puedes repetir?","solicitar repetición",null,null],["funcional","Buenos días.","saludo",null,null],["funcional","Buenas tardes.","saludo",null,null],["funcional","Buenas noches.","saludo",null,null],["funcional","Hola, ¿cómo estás?","saludo e interrogación",null,null],["funcional","Gracias por ayudarme.","agradecimiento",null,null],["funcional","Por favor, espera.","petición",null,null],["funcional","Necesito un momento.","pedir tiempo",null,null],["funcional","No entiendo.","expresar dificultad",null,null],["funcional","Habla más despacio.","pedir ritmo lento",null,null],["funcional","Quiero ir a casa.","necesidad cotidiana",null,null],["funcional","Tengo hambre.","expresar hambre",null,null],["funcional","Tengo sed.","expresar sed",null,null],["funcional","Me duele aquí.","expresar dolor",null,null],["funcional","Quiero llamar a mi familia.","contacto familiar",null,null],["funcional","¿Qué hora es?","pregunta cotidiana",null,null],["funcional","¿Dónde está mi teléfono?","pregunta cotidiana",null,null],["funcional","Quiero una taza de té.","petición cotidiana",null,null],["funcional","Me siento mejor.","expresar estado",null,null],["funcional","Hoy estoy cansado.","expresar estado",null,null],["funcional","Hoy estoy cansada.","expresar estado",null,null],["funcional","Estoy listo.","afirmación",null,null],["funcional","Estoy lista.","afirmación",null,null],["funcional","¿Me puedes ayudar?","pregunta funcional",null,null],["funcional","Abre la puerta, por favor.","petición funcional",null,null],["funcional","Hasta mañana.","despedida",null,null],["funcional","Quiero decir algo.","tomar turno",null,null]].map(([family,prompt,goal,positionStart,positionEnd],i)=>({
id:LEGACY_MOTOR_IDS[family+'|'+prompt]||'MOTOR-NEW-'+String(i+1).padStart(3,'0'),family,track:'motor_asha',goal,prompt,
ttsText:prompt.replace(/ – /g,' '),instruction:'Escucha el ejemplo. Practica a tu ritmo y escucha tu grabación.',
responseMode:'speech',positionStart,positionEnd,
reviewStatus:'sin-validacion-clinica',sourceBasis:'ASHA: marco articulatorio-cinemático; estímulos propuestos por HABLA, sin validación individual'
}));

const MOTOR_LEVELS=[
{id:1,label:'Nivel 1',title:'Iniciar el habla',description:'Sonidos, sílabas y palabras breves',icon:'sound'},
{id:2,label:'Nivel 2',title:'Coordinar posiciones',description:'Contrastes y sílabas cerradas',icon:'repeat'},
{id:3,label:'Nivel 3',title:'Grupos consonánticos',description:'PL, BR, TR y otras combinaciones',icon:'repeat'},
{id:4,label:'Nivel 4',title:'Secuencias complejas',description:'Palabras largas y transiciones vocálicas',icon:'sound'},
{id:5,label:'Nivel 5',title:'Frases y entonación',description:'Habla funcional, pausas y ritmo',icon:'chat'}
];
// Rutas orientativas para explorar; NO corresponden a una escala clínica ASHA ni implican dominio.
const MOTOR_LEVEL_ITEMS=[
[1,'MA','Inicio bilabial y vocal abierta','inicio','m','a'],
[1,'PA','Cierre labial y vocal abierta','inicio','p','a'],
[1,'MAMÁ','Transición bilabial en dos sílabas','inicio','m','a'],
[1,'TAPA','Sílabas directas con cambio de articulación','inicio',null,null],
[2,'PA – TA','Cambio bilabial a alveolar','transiciones',null,null],
[2,'TA – KA','Cambio alveolar a velar','transiciones',null,null],
[2,'PAN','Sílaba cerrada en nasal','transiciones',null,null],
[2,'SOL','Sílaba cerrada con consonante final','transiciones',null,null],
[3,'PLATO','Grupo consonántico PL','complejos',null,null],
[3,'BRAZO','Grupo consonántico BR','complejos',null,null],
[3,'TREN','Grupo consonántico TR','complejos',null,null],
[3,'FRUTA','Grupo consonántico FR','complejos',null,null],
[4,'AIRE','Transición vocálica AI en palabra','vocales','a','i'],
[4,'PUERTA','Transición vocálica UE en palabra','vocales','u','e'],
[4,'REFRIGERADOR','Secuencia polisilábica con cambios articulatorios','complejos',null,null],
[4,'MEDICAMENTO','Secuencia polisilábica con alternancias','complejos',null,null],
[5,'Dame agua.','Petición funcional','funcional',null,null],
[5,'Necesito ayuda.','Petición funcional','funcional',null,null],
[5,'¿Puedes repetir?','Pregunta cotidiana con entonación','funcional',null,null],
[5,'Quiero descansar.','Frase funcional con continuidad','funcional',null,null]
].map(([level,prompt,goal,family,positionStart,positionEnd],i)=>({
id:'NIVEL-'+String(i+1).padStart(2,'0'),level,family,track:'motor_asha',goal,prompt,
ttsText:prompt.replace(/ – /g,' '),
instruction:'Escucha el ejemplo. Puedes practicarlo de nuevo o avanzar a tu ritmo.',
responseMode:'speech',positionStart,positionEnd,
reviewStatus:'orientativo-sin-validacion-clinica',
sourceBasis:'ASHA: principios de aprendizaje motor y práctica articulatorio-cinemática; ejemplos elegidos por HABLA'
}));

const VOCAL_TARGETS=[
['QUIERO','ie','diptongo','Pedir algo'],
['AGUA','ua','diptongo','Palabra cotidiana'],
['QUIERO AGUA','ie + ua','dos diptongos','Petición funcional'],
['PUEDO','ue','diptongo','Pedir o confirmar capacidad'],
['¿PUEDO TOMAR AGUA?','ue + ua','dos diptongos','Pregunta funcional'],
['CALIENTE','ie','diptongo','Describir temperatura'],
['AGUA CALIENTE','ua + ie','dos diptongos','Expresión cotidiana'],
['FRÍA','í-a','hiato','Contraste vocálico'],
['AGUA FRÍA','ua + í-a','diptongo e hiato','Expresión cotidiana'],
['OÍR','o-ír','hiato','Contraste vocálico'],
['¿ME PUEDES OÍR?','ue + o-ír','diptongo e hiato','Pregunta funcional'],
['TIENE','ie','diptongo','Verbo frecuente'],
['BUENO','ue','diptongo','Palabra cotidiana'],
['AIRE','ai','diptongo','Palabra cotidiana'],
['PAUSA','au','diptongo','Expresión funcional'],
['¿QUIERES AGUA?','ie + ua','dos diptongos','Pregunta funcional']
].map(([prompt,transition,transitionType,goal],i)=>({
id:'VOCAL-'+String(i+1).padStart(2,'0'),
track:'motor_asha',family:'vocales',goal,prompt,ttsText:prompt,
instruction:'Escucha la expresión completa y practícala a tu ritmo.',
responseMode:'speech',transition,transitionType,
reviewStatus:'ejemplos-orientativos-sin-validacion-clinica',
sourceBasis:'ASHA: selección de objetivos funcionales; identificación de diptongos/hiatos por análisis lingüístico'
}));

return {SYL,COORDINATION,MOTOR_FAMILIES,MOTOR_LIBRARY,MOTOR_LEVELS,MOTOR_LEVEL_ITEMS,VOCAL_TARGETS};
})();
