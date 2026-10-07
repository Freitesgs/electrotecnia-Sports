/* Datos de ejemplo (se cargan en Supabase la primera vez que la base está vacía) */
const SEED={
 role:'student',session:null,
 admin:{email:'admin@electrotecnia.cl',password:'Admin123!',rut:'11.111.111-1',name:'Administrador ElectroTecnia'},
 users:[
  {id:'u1',name:'Gabriel Freites',email:'estudiante@electrotecnia.cl',password:'123456',rut:'22.222.222-2',course:'2° Medio',alliance:'Roja',points:450},
  {id:'u2',name:'Valentina Soto',email:'valentina@electrotecnia.cl',password:'123456',rut:'22.222.222-3',course:'2° Medio',alliance:'Azul',points:320},
  {id:'u3',name:'Matías Rojas',email:'matias@electrotecnia.cl',password:'123456',rut:'22.222.222-4',course:'3° Medio',alliance:'Verde',points:280},
  {id:'u4',name:'Profesor Antonio',email:'profesor@electrotecnia.cl',password:'123456',rut:'22.222.222-5',course:'—',alliance:'',points:0,role:'profesor'}
 ],
 championships:[
  {id:'c1',name:'Campeonato de Fútbol',icon:'⚽',teams:['Alianza Roja','Alianza Azul','Alianza Verde','Alianza Amarilla']},
  {id:'c2',name:'Campeonato de Básquetbol',icon:'🏀',teams:['3°A','3°B','3°C','3°G']},
  {id:'c3',name:'Campeonato de Vóleibol',icon:'🏐',teams:['2°A','2°B','3°A','3°B']}
 ],
 matches:[
  {id:'m1',champ:'c1',a:'Alianza Roja',b:'Alianza Azul',date:'28 Ago 2026',time:'10:30',place:'Cancha principal',status:'Próximo',sa:0,sb:0,goals:[],assists:[]},
  {id:'m2',champ:'c1',a:'Alianza Verde',b:'Alianza Amarilla',date:'29 Ago 2026',time:'11:30',place:'Cancha principal',status:'Próximo',sa:0,sb:0,goals:[],assists:[]},
  {id:'m3',champ:'c1',a:'Alianza Verde',b:'Alianza Amarilla',date:'25 Ago 2026',time:'10:00',place:'Cancha 2',status:'Finalizado',sa:3,sb:2,goals:[{player:'Juan Pérez',minute:12},{player:'Juan Pérez',minute:50},{player:'Diego Soto',minute:65},{player:'Carlos Silva',minute:30},{player:'Matías Rojas',minute:70}],assists:[{player:'Diego Soto'},{player:'Carlos Silva'}]},
  {id:'m4',champ:'c2',a:'3°A',b:'3°B',date:'20 Ago 2026',time:'12:00',place:'Gimnasio',status:'Finalizado',sa:58,sb:44,goals:[],assists:[]},
  {id:'m5',champ:'c2',a:'3°C',b:'3°G',date:'22 Ago 2026',time:'12:00',place:'Gimnasio',status:'Finalizado',sa:51,sb:49,goals:[],assists:[]},
  {id:'m6',champ:'c2',a:'3°A',b:'3°C',date:'29 Ago 2026',time:'12:00',place:'Gimnasio',status:'Próximo',sa:0,sb:0,goals:[],assists:[]},
  {id:'m7',champ:'c3',a:'2°A',b:'2°B',date:'18 Ago 2026',time:'09:30',place:'Gimnasio',status:'Finalizado',sa:2,sb:1,goals:[],assists:[]},
  {id:'m8',champ:'c3',a:'3°A',b:'3°B',date:'02 Oct 2026',time:'09:30',place:'Gimnasio',status:'Próximo',sa:0,sb:0,goals:[],assists:[]}
 ],
  activities:[
  {id:'a1',type:'Taller',name:'Taller de Calistenia',date:'Todos los martes',time:'16:30',place:'Gimnasio',cap:30,reg:18,desc:'Entrenamiento de fuerza, movilidad y progresiones.',icon:'💪',mine:false},
  {id:'a2',type:'Taller',name:'Taller de Fútbol',date:'Todos los jueves',time:'16:30',place:'Cancha principal',cap:40,reg:34,desc:'Entrenamiento técnico y táctico.',icon:'⚽',mine:true},
  {id:'a3',type:'Baile',name:'Baile de Cueca',date:'10 Sep 2026',time:'11:00',place:'Patio central',cap:80,reg:51,desc:'Presentación de Fiestas Patrias.',icon:'💃',mine:true},
  {id:'a4',type:'Alianza',name:'Tirar la cuerda',date:'05 Sep 2026',time:'12:00',place:'Patio',cap:24,reg:20,desc:'Competencia por alianzas.',icon:'🪢',mine:false},
  {id:'a5',type:'Alianza',name:'Quemados',date:'05 Sep 2026',time:'13:00',place:'Gimnasio',cap:32,reg:28,desc:'Torneo de quemados por alianza.',icon:'🔥',mine:false},
  {id:'a6',type:'Alianza',name:'Barra brava',date:'05 Sep 2026',time:'09:00',place:'Patio central',cap:120,reg:86,desc:'Animación y apoyo a la alianza.',icon:'📣',mine:false},
  {id:'a7',type:'Alianza',name:'Lienzos y pintura',date:'04 Sep 2026',time:'15:30',place:'Taller',cap:30,reg:13,desc:'Preparación de lienzos y decoración.',icon:'🎨',mine:false}
 ],
 polls:[
  {id:'p1',q:'¿Qué campeonato deportivo debería realizarse?',opts:[['Fútbol',42],['Básquet',31],['Vóleibol',27]],voted:false,open:true},
  {id:'p2',q:'¿Qué taller te gustaría que se agregara?',opts:[['Tenis de mesa',38],['Atletismo',32],['Ajedrez',30]],voted:false,open:true}
 ],
 news:[
  {id:'n1',title:'Se viene la semifinal del campeonato de fútbol',text:'Revisa la fecha, hora y cancha del próximo partido.',type:'Deportes',date:'25 Ago 2026',icon:'⚽'},
  {id:'n2',title:'Ecoelectro continúa sus entrenamientos',text:'El equipo prepara los carros de hidrógeno verde para su próxima competencia.',type:'Ecoelectro',date:'24 Ago 2026',icon:'⚡'},
  {id:'n3',title:'Inscripciones abiertas para cueca',text:'Participa en la presentación de Fiestas Patrias.',type:'Eventos',date:'23 Ago 2026',icon:'💃'}
 ],
 notifications:[
  {id:'no1',title:'Bienvenido a ElectroTecnia Sports',text:'Revisa las actividades disponibles y participa.',read:false,type:'info'},
  {id:'no2',title:'Nuevo partido programado',text:'Alianza Roja vs Alianza Azul · 28 Ago · 10:30.',read:false,type:'match'}
 ],
 alliances:[
  {id:'al1',name:'Roja',emoji:'🔴',points:840},
  {id:'al2',name:'Azul',emoji:'🔵',points:790},
  {id:'al3',name:'Verde',emoji:'🟢',points:620},
  {id:'al4',name:'Amarilla',emoji:'🟡',points:570}
 ],
 gallery:[
  {id:'g1',title:'Final de fútbol 2026',icon:'⚽'},
  {id:'g2',title:'Entrenamiento Ecoelectro',icon:'⚡'},
  {id:'g3',title:'Fiestas Patrias',icon:'💃'},
  {id:'g4',title:'Taller de calistenia',icon:'💪'},
  {id:'g5',title:'Alianzas',icon:'🏆'},
  {id:'g6',title:'Campeonato de básquet',icon:'🏀'}
 ],
 badges:[
  {id:'b1',name:'Primer paso',icon:'🚀',desc:'Entraste por primera vez a la plataforma.',ok:true},
  {id:'b2',name:'Votante activo',icon:'🗳️',desc:'Participa en las encuestas.',ok:true},
  {id:'b3',name:'Deportista',icon:'⚽',desc:'Participa en un campeonato.',ok:true},
  {id:'b4',name:'Hincha oficial',icon:'📣',desc:'Participa en una actividad de alianza.',ok:false},
  {id:'b5',name:'Ecoelectro',icon:'⚡',desc:'Participa en una actividad de Ecoelectro.',ok:false},
  {id:'b6',name:'Campeón',icon:'🏆',desc:'Forma parte de una alianza campeona.',ok:false}
 ],
 eco:{progress:85,competition:'Competencia Internacional de carros de hidrógeno verde',days:14,team:'ElectroTecnia Ecoelectro',trainings:['Martes 16:00','Jueves 16:00','Sábado 10:00']}
};
