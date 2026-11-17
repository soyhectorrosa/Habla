/* Catálogos de apoyo sin dependencias, compartidos por todas las prácticas. */
window.HABLA_CONTENT=(()=>{'use strict';
const SYL={salud:'sa-lud',pelota:'pe-lo-ta',mariposa:'ma-ri-po-sa',mamá:'ma-má',papá:'pa-pá',agua:'a-gua',casa:'ca-sa',mano:'ma-no',mesa:'me-sa',pato:'pa-to',luna:'lu-na',cama:'ca-ma',sopa:'so-pa',camisa:'ca-mi-sa',zapato:'za-pa-to',comida:'co-mi-da',tomate:'to-ma-te',plato:'pla-to',brazo:'bra-zo',fruta:'fru-ta',trabajo:'tra-ba-jo',problema:'pro-ble-ma',teléfono:'te-lé-fo-no',chocolate:'cho-co-la-te',medicina:'me-di-ci-na',familia:'fa-mi-lia',gracias:'gra-cias',hola:'ho-la',baño:'ba-ño',dolor:'do-lor'};
const COORDINATION=[["PA — PA — PA","Repite PA tres veces, lentamente y con comodidad."],["TA — TA — TA","Repite TA tres veces, manteniendo cada sonido claro."],["KA — KA — KA","Repite KA tres veces sin apresurarte."],["PA — TA","Alterna PA y TA, una vez cada una."],["TA — KA","Alterna TA y KA, una vez cada una."],["PA — KA","Alterna PA y KA, una vez cada una."],["PA — TA — KA","Di PA, TA y KA en secuencia. Prioriza claridad, no velocidad."],["PA — TA — KA · PA — TA — KA","Repite la secuencia dos veces, con una pausa si la necesitas."],["MA — ME — MI — MO — MU","Practica las vocales cambiando lentamente después de M."],["PA — PE — PI — PO — PU","Cambia las vocales manteniendo el inicio P."],["TA — TE — TI — TO — TU","Cambia las vocales manteniendo el inicio T."],["KA — KE — KI — KO — KU","Practica sonidos similares a KA, usando KE y KI como guía escrita."],["PATO","Escucha y di PATO completo."],["TACO","Escucha y di TACO completo."],["PAQUETE","Escucha y di PAQUETE. Si cuesta, practica por partes."],["TRABAJO","Escucha y di TRABAJO a velocidad cómoda."],["Necesito una pausa","Practica una frase funcional sin apresurarte."],["Quisiera explicar mi idea","Practica esta frase útil para conversar en el trabajo."]].map((x,i)=>({id:'COORD-'+i,track:'coordinacion',goal:i<12?'Secuencia de sílabas':'Llevar la práctica a palabras y frases',prompt:x[0],ttsText:x[0].replace(/ — /g,', ').replace(/ · /g,', '),instruction:x[1],responseMode:'speech'}));

/* Familias de práctica: organización de producto inspirada en ASHA, NO protocolo clínico validado. */
const MOTOR_FAMILIES=[
{id:'inicio',label:'Iniciar el habla',description:'Sonidos y sílabas cortas',icon:'sound'},
{id:'transiciones',label:'Coordinar sonidos',description:'Cambios entre posiciones',icon:'repeat'},
{id:'vocales',label:'Unir vocales',description:'Transiciones vocálicas',icon:'sound'},
{id:'complejos',label:'Combinar sonidos',description:'Grupos consonánticos',icon:'repeat'},
{id:'funcional',label:'Hablar con claridad',description:'Frases de uso cotidiano',icon:'chat'}
];
const MOTOR_LIBRARY=[
['inicio','MA','Inicio con labios juntos y vocal abierta','m','a'],
['inicio','PA','Cierre de labios y salida hacia A','p','a'],
['inicio','MAMÁ','Dos sílabas con inicio bilabial','m','a'],
['inicio','PAPA','Dos sílabas con inicio bilabial','p','a'],
['transiciones','PA – TA','Cambio de articulación de labios a lengua',null,null],
['transiciones','MA – NA','Cambio entre sonidos nasales',null,null],
['transiciones','TA – KA','Cambio de articulación anterior a posterior',null,null],
['transiciones','PA – TA – KA','Secuencia de posiciones distintas',null,null],
['vocales','PIE','Transición vocálica en una palabra breve','i','e'],
['vocales','AIRE','Transición de A hacia I','a','i'],
['vocales','PUERTA','Transición vocálica dentro de una palabra','u','e'],
['vocales','AUTO','Transición de A hacia U','a','u'],
['complejos','PLATO','Grupo consonántico PL',null,null],
['complejos','BRAZO','Grupo consonántico BR',null,null],
['complejos','TREN','Grupo consonántico TR',null,null],
['complejos','FRUTA','Grupo consonántico FR',null,null],
['funcional','Dame agua.','Pedir algo cotidiano',null,null],
['funcional','Necesito ayuda.','Pedir asistencia',null,null],
['funcional','Quiero descansar.','Comunicar una necesidad',null,null],
['funcional','¿Puedes repetir?','Pedir que otra persona repita',null,null]
].map(([family,prompt,goal,positionStart,positionEnd],i)=>({
id:'MOTOR-'+String(i+1).padStart(2,'0'),family,track:'motor_asha',goal,prompt,
ttsText:prompt.replace(/ – /g,' '),instruction:'Escucha el ejemplo. Practica a tu ritmo y escucha tu grabación.',
responseMode:'speech',positionStart,positionEnd,
reviewStatus:'sin-validacion-clinica',sourceBasis:'ASHA: principios articulatorio-cinemáticos, selección concreta realizada por HABLA'
}));

return {SYL,COORDINATION,MOTOR_FAMILIES,MOTOR_LIBRARY};
})();
