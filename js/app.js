/* ElectroTecnia Sports - aplicacion (JavaScript)
   Flujo (diapositiva 7): Usuario -> accion en la interfaz -> JS procesa
   -> capa db.js -> Supabase -> PostgreSQL -> los datos quedan compartidos. */

let page='home', currentId=null, champSel='c1';
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function currentUser(){return db.users.find(u=>u.id===db.session?.id)||db.users[0]}
function isAdmin(){return db.session?.role==='admin'}
function isProf(){return db.session?.role==='profesor'}
function canManage(){return isAdmin()||isProf()}
function roleName(){return isAdmin()?'Administrador':isProf()?'Profesor-Admin':'Estudiante'}
function initials(n){return (n||'U').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase()}
function toast(t){let x=document.getElementById('toast');if(!x){x=document.createElement('div');x.id='toast';x.style='position:fixed;right:18px;bottom:18px;background:#102033;color:white;padding:12px 15px;border-radius:11px;font-size:10px;font-weight:900;z-index:9999;box-shadow:0 15px 40px #001b3b44';document.body.appendChild(x)}x.textContent=t;x.style.opacity=1;clearTimeout(x._t);x._t=setTimeout(()=>x.style.opacity=0,2600)}
function go(p){if(!db.session){return showLogin()}if(p==='users'||p==='content'||p==='settings'){if(!canManage()){toast('Solo el administrador general puede acceder aquí.');return}}
 if(p==='admin'){if(!canManage()){toast('Solo profesores y administración.');return}}page=p;document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.page===p));render()}
function render(){document.getElementById('content').innerHTML=views[page]?.()||views.home();updateTop()}
function updateTop(){
 document.getElementById('role').textContent=isAdmin()?'🛡️ Administrador':isProf()?'🧑‍🏫 Profesor-Admin':'👤 Estudiante';
 document.getElementById('email').textContent=db.session?.email||'';
 document.getElementById('avatar').textContent=initials(db.session?.name||'Usuario');
 document.getElementById('adminNav').style.display=canManage()?'block':'none';
 document.getElementById('admOnlyNav').style.display=isAdmin()?'block':'none';
}
function showLogin(){document.getElementById('login').classList.remove('hidden');document.getElementById('app').classList.add('hidden');loginMode('login')}
function hideLogin(){document.getElementById('login').classList.add('hidden');document.getElementById('app').classList.remove('hidden');render()}
function loginMode(mode){
 document.getElementById('tLogin').classList.toggle('on',mode==='login');document.getElementById('tReg').classList.toggle('on',mode==='register');
 document.getElementById('loginError').classList.add('hidden');
 const eye=id=>`<div class="pw"><input id="${id}" type="password" placeholder="••••••"><button type="button" class="pweye" onclick="togglePw('${id}',this)">👁️</button></div>`;
 if(mode==='login')document.getElementById('authForm').innerHTML=`<div class="field"><label>Correo</label><input id="le" type="email" placeholder="correo@liceorbl.cl"></div><div class="field" style="margin-top:10px"><label>Contraseña</label>${eye('lp')}</div><div class="field" style="margin-top:10px"><label>RUT</label><input id="lr" placeholder="12.345.678-9" onkeydown="if(event.key==='Enter')doLogin()"></div><div class="link" style="margin-top:10px" onclick="forgotPw()">¿Olvidaste tu contraseña? 📧</div><div class="notice" style="margin-top:12px"><b>Demo estudiante:</b> gabriel@liceorbl.cl · 123456 · 22.222.222-2<br><b>Demo profesor:</b> profesor@liceosofofa.cl · 123456 · 22.222.222-5<br><b>Demo admin:</b> admin@electrotecnia.cl · Admin123! · 11.111.111-1</div><div class="modalfoot"><button class="btn primary" onclick="doLogin()">Ingresar</button></div>`;
 else document.getElementById('authForm').innerHTML=`<div class="formgrid"><div class="field full"><label>Nombre completo</label><input id="rn"></div><div class="field full"><label>Correo institucional</label><input id="re" type="email" placeholder="nombre@liceorbl.cl"></div><div class="field"><label>RUT</label><input id="rr" placeholder="12.345.678-9"></div><div class="field"><label>Curso</label><select id="rc"><option value="">Selecciona tu curso</option>${COURSES.map(c=>`<option>${c}</option>`).join('')}</select></div><div class="field"><label>Contraseña</label>${eye('rp')}</div><div class="field"><label>Confirmar contraseña</label>${eye('rp2')}</div></div><div class="notice" style="margin-top:12px"><b>Roles automáticos según el correo:</b><br>· Termina en <b>@liceorbl.cl</b> → entras como <b>estudiante</b><br>· Termina en <b>@liceosofofa.cl</b> → entras como <b>profesor</b><br>No se aceptan otros correos.</div><div class="modalfoot"><button class="btn primary" onclick="register()">Crear cuenta</button></div>`;
}
function err(t){let e=document.getElementById('loginError');e.textContent=t;e.classList.remove('hidden')}
async function doLogin(){
 let e=document.getElementById('le').value.trim().toLowerCase(),p=document.getElementById('lp').value,r=document.getElementById('lr').value.trim();
 if(!e||!p||!r)return err('Completa correo, contraseña y RUT.');
 if(e===db.admin.email.toLowerCase()&&p===db.admin.password&&r===db.admin.rut){db.session={role:'admin',id:'root',name:db.admin.name,email:e};save();hideLogin();toast('Sesión de administrador iniciada.');return}
 let u=db.users.find(x=>x.email.toLowerCase()===e);
 const r1=await AUTH.signIn(e,p);
 const localOk=u&&u.password===p;
 if(!r1.ok&&!localOk)return err(r1.demo?'Correo, contraseña o RUT incorrectos.':(r1.msg||'Correo o contraseña incorrectos.'));
 if(!r1.ok&&localOk&&!r1.demo)AUTH.signUp(e,p).catch(()=>{});   /* cuenta antigua: se migra a Supabase Auth en silencio */
 if(!u){
  const role=domainRole(e)||'student';
  u={id:'u'+Date.now(),name:e.split('@')[0],email:e,password:'',rut:r,course:'',alliance:'Roja',points:0,role};
  db.users.push(u);
 }
 if(u.rut&&r!==u.rut)return err('El RUT no coincide con esta cuenta.');
 db.session={role:u.role==='admin'?'admin':u.role==='profesor'?'profesor':'student',id:u.id,name:u.name,email:u.email};save();hideLogin();toast('Bienvenido, '+u.name)
}
async function register(){
 let n=document.getElementById('rn').value.trim(),e=document.getElementById('re').value.trim().toLowerCase(),r=document.getElementById('rr').value.trim(),p=document.getElementById('rp').value,p2=document.getElementById('rp2')?document.getElementById('rp2').value:p,c=document.getElementById('rc').value;
 if(!n||!e||!r||!c)return err('Completa todos los campos (incluido el curso).');
 if(p.length<6)return err('La contraseña debe tener 6 caracteres o más.');
 if(p!==p2)return err('Las contraseñas no coinciden.');
 const role=domainRole(e);
 if(!role)return err('Solo se aceptan correos del liceo: @liceorbl.cl (estudiantes) o @liceosofofa.cl (profesores).');
 if(db.users.some(x=>x.email.toLowerCase()===e)||e===db.admin.email.toLowerCase())return err('Ese correo ya está registrado.');
 const r1=await AUTH.signUp(e,p);if(!r1.ok&&!r1.demo)return err(r1.msg);
 let u={id:'u'+Date.now(),name:n,email:e,password:p,rut:r,course:c,alliance:'Roja',points:0,role:role};
 db.users.push(u);db.session={role:role==='profesor'?'profesor':'student',id:u.id,name:n,email:e};save();hideLogin();toast('Cuenta creada. ¡Bienvenido, '+n+'!')
}
function logout(){db.session=null;save();showLogin()}
function modal(html){document.getElementById('modal').innerHTML=html;document.getElementById('modalbg').classList.add('show')}
function closeModal(){document.getElementById('modalbg').classList.remove('show')}
function registerActivity(id){
 let a=db.activities.find(x=>x.id===id);if(!a)return;
 if((a.status||'activo')==='suspendido')return toast('Esta actividad está suspendida en este momento.');
 let u=currentUser();a.registered=a.registered||[];
 if(a.registered.some(x=>x.uid===u.id)||(a.mine&&!a.registered.length&&u.id==='u1'))return toast('Ya estás inscrito en esta actividad.');
 if((a.reg||0)>=a.cap)return toast('🚫 Cupos llenos: ya no hay lugares disponibles.');
 askPassword('Confirmar inscripción',`Vas a inscribirte en <b>${esc(a.name)}</b>.`,()=>{
  a.registered.push({uid:u.id,name:u.name,rut:u.rut||'',course:u.course||'',date:'Hoy'});
  a.reg=(a.reg||0)+1;a.mine=true;u.points=(u.points||0)+10;
  db.notifications.unshift({id:'n'+Date.now(),title:'Inscripción confirmada',text:`Te inscribiste en ${a.name}.`,read:false,type:'info'});
  save();toast('✅ Inscripción confirmada.');render();
 });
}
function cancelActivity(id){
 let a=db.activities.find(x=>x.id===id);if(!a)return;let u=currentUser();
 a.registered=a.registered||[];
 const i=a.registered.findIndex(x=>x.uid===u.id);if(i>-1)a.registered.splice(i,1);
 a.mine=false;a.reg=Math.max(0,(a.reg||1)-1);save();toast('Inscripción cancelada.');render();
}
function votePoll(id,opt){let p=db.polls.find(x=>x.id===id);if(!p||p.voted)return toast('Ya votaste en esta encuesta.');p.opts.find(x=>x[0]===opt)[1]++;p.voted=true;currentUser().points+=10;save();toast('Voto registrado.');render()}
function markRead(id){let n=db.notifications.find(x=>x.id===id);if(n)n.read=true;save();render()}
function openMatch(id=null){
 if(!canManage())return toast('Solo administración.');
 let m=id?db.matches.find(x=>x.id===id):{id:'m'+Date.now(),champ:champSel,a:'',b:'',date:'',time:'',place:'',status:'Próximo',sa:0,sb:0};
 currentId=id;
 modal(`<h2>${id?'Editar':'Crear'} partido</h2><div class="formgrid"><div class="field full"><label>Campeonato</label><select id="mc">${db.championships.map(c=>`<option value="${c.id}" ${m.champ===c.id?'selected':''}>${c.icon} ${esc(c.name)}</option>`).join('')}</select></div><div class="field"><label>Equipo / alianza A</label><input id="ma" value="${esc(m.a)}"></div><div class="field"><label>Equipo / alianza B</label><input id="mb" value="${esc(m.b)}"></div><div class="field"><label>Fecha</label><input id="md" value="${esc(m.date)}"></div><div class="field"><label>Hora</label><input id="mt" value="${esc(m.time)}"></div><div class="field"><label>Cancha</label><input id="mp" value="${esc(m.place)}"></div><div class="field"><label>Estado</label><select id="ms"><option ${m.status==='Próximo'?'selected':''}>Próximo</option><option ${m.status==='En vivo'?'selected':''}>En vivo</option><option ${m.status==='Finalizado'?'selected':''}>Finalizado</option><option ${m.status==='Suspendido'?'selected':''}>Suspendido</option></select></div><div class="field"><label>Marcador A</label><input id="msa" type="number" min="0" value="${m.sa||0}"></div><div class="field"><label>Marcador B</label><input id="msb" type="number" min="0" value="${m.sb||0}"></div></div>${id?`<div class="notice blue" style="margin-top:12px"><b>⚽ Gol en vivo:</b> presiona y se suma 1 gol al marcador pidiendo el goleador (para partidos <b>En vivo</b>). Si el partido ya <b>Finalizó</b>, escribe el marcador completo arriba y guarda.</div><div class="row" style="margin-top:8px"><button class="btn soft" onclick="liveGoal('${m.id}','a')">⚽ +1 Gol · ${esc(m.a)}</button><button class="btn soft" onclick="liveGoal('${m.id}','b')">⚽ +1 Gol · ${esc(m.b)}</button></div>`:''}<div class="modalfoot"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn primary" onclick="saveMatch()">Guardar y publicar</button></div>`);
}
function saveMatch(){
 let m=currentId?db.matches.find(x=>x.id===currentId):{id:'m'+Date.now(),goals:[],assists:[]};
 m.champ=document.getElementById('mc')?.value||m.champ;m.a=document.getElementById('ma').value.trim();m.b=document.getElementById('mb').value.trim();m.date=document.getElementById('md').value.trim()||'Por definir';m.time=document.getElementById('mt').value.trim()||'Por definir';m.place=document.getElementById('mp').value.trim()||'Por definir';m.status=document.getElementById('ms').value;m.sa=+document.getElementById('msa').value||0;m.sb=+document.getElementById('msb').value||0;
 if(!m.a||!m.b)return toast('Completa ambos equipos.');
 if(!currentId)db.matches.unshift(m);
 db.notifications.unshift({id:'n'+Date.now(),title:'Partido actualizado',text:`${m.a} vs ${m.b} · ${m.date} · ${m.time} · ${m.place}.`,read:false,type:'match'});save();closeModal();toast('Partido guardado y publicado.');go('matches')
}
function setChamp(id){champSel=id;render()}
function addChampionship(){
 if(!isAdmin())return toast('Solo el administrador puede crear campeonatos.');
 modal(`<h2>🏆 Nuevo campeonato</h2><div class="formgrid"><div class="field full"><label>Nombre</label><input id="chn" placeholder="Campeonato de vóleibol"></div><div class="field"><label>Icono</label><input id="chi" value="🏐"></div><div class="field full"><label>Equipos separados por coma</label><input id="cht" placeholder="2°A, 2°B, 3°C"></div></div><div class="modalfoot"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn primary" onclick="saveChampionship()">Crear campeonato</button></div>`)
}
function saveChampionship(){let n=document.getElementById('chn').value.trim(),i=document.getElementById('chi').value.trim()||'🏆',t=document.getElementById('cht').value.split(',').map(x=>x.trim()).filter(Boolean);if(!n||t.length<2)return toast('Nombre y al menos dos equipos.');let id='c'+Date.now();db.championships.push({id,name:n,icon:i,teams:t});champSel=id;save();closeModal();toast('Campeonato creado.');go('matches')}
function matchCenter(id){
 let m=db.matches.find(x=>x.id===id);if(!m)return;
 let goals=m.goals?.length?m.goals.map(g=>`<div class="event"><span class="badge red">⚽ ${g.minute}'</span><div class="eventmain"><h4>${esc(g.player)}</h4><p>Gol</p></div></div>`).join(''):'<div class="small">Sin goles registrados.</div>';
 modal(`<h2>⚽ Centro de partido</h2><div class="notice blue"><b>${esc(m.date)}</b> · ${esc(m.time)} · ${esc(m.place)} · ${esc(m.status)}</div><div style="margin:18px 0" class="match"><div class="team"><div class="crest">🔴</div><div>${esc(m.a)}</div></div><div class="score"><div class="versus">${esc(m.status)}</div><strong>${m.sa} - ${m.sb}</strong></div><div class="team"><div class="crest">🔵</div><div>${esc(m.b)}</div></div></div><div class="head"><h3>⚽ Goles</h3></div>${goals}<div class="head" style="margin-top:15px"><h3>🎯 Asistencias</h3></div>${(m.assists||[]).map(a=>`<div class="event"><span class="badge blue">🎯</span><div class="eventmain"><h4>${esc(a.player)}</h4></div></div>`).join('')||'<div class="small">Sin asistencias registradas.</div>'}<div class="modalfoot">${canManage()?`<button class="btn soft" onclick="closeModal();openMatch('${m.id}')">✏️ Editar</button>`:''}<button class="btn ghost" onclick="closeModal()">Cerrar</button></div>`)
}
function addActivity(type='Taller',id=null){
 if(!canManage())return toast('Solo administración.');
 let a=id?db.activities.find(x=>x.id===id):{id:'a'+Date.now(),type,name:'',date:'',time:'',place:'',cap:20,reg:0,desc:'',icon:'🏃',days:[],hours:'',status:'activo',registered:[]};
 currentId=id;
 const hs=(a.hours||a.time||' - ').split(' - ');
 modal(`<h2>${id?'Editar':'Crear'} actividad</h2><div class="formgrid"><div class="field"><label>Tipo</label><select id="aaType"><option>Taller</option><option>Alianza</option><option>Baile</option><option>Deportivo</option><option>Ecoelectro</option><option>Cultural</option><option>Otro</option></select></div><div class="field"><label>Icono</label><input id="aaIcon" value="${esc(a.icon)}"></div><div class="field full"><label>Nombre</label><input id="aaName" value="${esc(a.name)}"></div><div class="field"><label>Fecha (si es de un solo día)</label><input id="aaDate" value="${esc(a.date)}" placeholder="05 Sep 2026"></div><div class="field"><label>Lugar</label><input id="aaPlace" value="${esc(a.place)}"></div><div class="field"><label>Cupos</label><input id="aaCap" type="number" value="${a.cap}"></div><div class="field"><label>Estado</label><select id="aaStatus"><option value="activo" ${a.status!=='suspendido'?'selected':''}>✅ Se realiza con normalidad</option><option value="suspendido" ${a.status==='suspendido'?'selected':''}>⚠️ Suspendido</option></select></div><div class="field full"><label>Días de la semana (puede ser más de uno)</label><div class="dayschk">${DIAS.map(d=>`<label><input type="checkbox" class="aaDay" value="${d}" ${(a.days||[]).includes(d)?'checked':''}>${d}</label>`).join('')}</div></div><div class="field"><label>Hora de inicio</label><input id="aaH1" type="time" value="${esc(hs[0]||'')}"></div><div class="field"><label>Hora de término</label><input id="aaH2" type="time" value="${esc(hs[1]||'')}"></div><div class="field full"><label>Descripción</label><textarea id="aaDesc" rows="3">${esc(a.desc)}</textarea></div></div><div class="modalfoot"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn primary" onclick="saveActivity()">Guardar y publicar</button></div>`);
 document.getElementById('aaType').value=a.type||type;
}
function saveActivity(){
 let a=currentId?db.activities.find(x=>x.id===currentId):{id:'a'+Date.now(),reg:0,registered:[]};
 a.type=document.getElementById('aaType').value;a.icon=document.getElementById('aaIcon').value||'🏃';a.name=document.getElementById('aaName').value.trim();a.date=document.getElementById('aaDate').value.trim()||'Por definir';a.place=document.getElementById('aaPlace').value.trim()||'Por definir';a.cap=Math.max(a.reg||0,+document.getElementById('aaCap').value||20);a.desc=document.getElementById('aaDesc').value.trim();a.status=document.getElementById('aaStatus').value;
 a.days=[...document.querySelectorAll('.aaDay:checked')].map(x=>x.value);
 const h1=document.getElementById('aaH1').value,h2=document.getElementById('aaH2').value;
 a.hours=h1&&h2?h1+' - '+h2:(h1||a.hours||'');a.time=a.hours||a.time||'Por definir';
 if(!a.name)return toast('Escribe un nombre.');
 if(!currentId)db.activities.unshift(a);
 db.notifications.unshift({id:'n'+Date.now(),title:'Actividad publicada',text:`${a.name} · ${(a.days||[]).join(' y ')||a.date} · ${a.time}.`,read:false,type:'info'});save();closeModal();toast('Actividad guardada y publicada.');render();
}
function deleteActivity(id){if(!canManage())return;db.activities=db.activities.filter(x=>x.id!==id);save();toast('Actividad eliminada.');render()}
function adminAccount(){
 modal(`<h2>🔐 Cuenta administrador</h2><div class="notice red">Credenciales de administración. En una versión real deben almacenarse en un servidor seguro.</div><div class="formgrid"><div class="field"><label>Correo</label><input id="ae" value="${esc(db.admin.email)}"></div><div class="field"><label>RUT</label><input id="ar" value="${esc(db.admin.rut)}"></div><div class="field full"><label>Contraseña</label><input id="ap" value="${esc(db.admin.password)}" type="password"></div><div class="field full"><label>Nombre</label><input id="an" value="${esc(db.admin.name)}"></div></div><div class="modalfoot"><button class="btn primary" onclick="saveAdmin()">Guardar</button></div>`)
}
function saveAdmin(){db.admin.email=document.getElementById('ae').value.trim();db.admin.rut=document.getElementById('ar').value.trim();db.admin.password=document.getElementById('ap').value;db.admin.name=document.getElementById('an').value.trim();save();closeModal();toast('Credenciales actualizadas.')}
function addNews(){
 if(!canManage())return toast('Solo administración.');
 modal(`<h2>📰 Nueva noticia</h2><div class="formgrid"><div class="field full"><label>Título</label><input id="nt"></div><div class="field"><label>Tipo</label><input id="nc" value="General"></div><div class="field"><label>Icono</label><input id="ni" value="📢"></div><div class="field full"><label>Contenido</label><textarea id="nx" rows="4"></textarea></div></div><div class="modalfoot"><button class="btn primary" onclick="saveNews()">Publicar</button></div>`)
}
function saveNews(){let n={id:'n'+Date.now(),title:document.getElementById('nt').value,text:document.getElementById('nx').value,type:document.getElementById('nc').value,date:'Hoy',icon:document.getElementById('ni').value};if(!n.title)return toast('Falta título.');db.news.unshift(n);save();closeModal();toast('Noticia publicada.');go('news')}
function addPoll(){
 if(!canManage())return toast('Solo administración.');
 modal(`<h2>🗳️ Nueva encuesta</h2><div class="field"><label>Pregunta</label><input id="pq"></div><div class="field" style="margin-top:10px"><label>Opciones separadas por coma</label><input id="po" placeholder="Fútbol, Básquet, Vóleibol"></div><div class="modalfoot"><button class="btn primary" onclick="savePoll()">Publicar</button></div>`)
}
function savePoll(){let q=document.getElementById('pq').value.trim(),o=document.getElementById('po').value.split(',').map(x=>x.trim()).filter(Boolean);if(!q||o.length<2)return toast('Pregunta y al menos dos opciones.');db.polls.unshift({id:'p'+Date.now(),q,opts:o.map(x=>[x,0]),voted:false,open:true});save();closeModal();toast('Encuesta publicada.');go('polls')}
const views={
home:()=>{let u=currentUser();return `<div class="hero"><span class="badge" style="background:#ffffff20;color:#fff">🔴🔵 PLATAFORMA DEL LICEO</span><h1>Todo el deporte. Todo el liceo.</h1><p>Campeonatos, alianzas, talleres, bailes, Ecoelectro, encuestas y noticias en una sola experiencia.</p><div class="actions"><button class="btn" style="background:#fff;color:#0758ad" onclick="go('matches')">⚽ Ver partidos</button><button class="btn" style="background:#ffffff18;color:#fff;border:1px solid #ffffff35" onclick="go('calendar')">📅 Calendario</button></div></div>
 <div class="grid g4" style="margin-top:15px">${[['⚽','Campeonatos',db.championships.length,'matches'],['🏃','Talleres',db.activities.filter(a=>a.type==='Taller').length,'workshops'],['🏆','Alianzas',db.alliances.length,'alliances'],['⚡','Ecoelectro','85%','ecoelectro']].map(x=>`<div class="card" onclick="go('${x[3]}')" style="cursor:pointer"><div class="small">${x[0]} ${x[1]}</div><div class="metric">${x[2]}</div><div class="small">Ver sección →</div></div>`).join('')}</div>
 <div class="grid g2" style="margin-top:15px"><div class="card"><div class="head"><h3>🔥 Próximo partido</h3><button class="link" onclick="go('matches')">Todos</button></div>${matchMini(db.matches[0])}</div><div class="card"><div class="head"><h3>📢 Últimas noticias</h3><button class="link" onclick="go('news')">Ver todas</button></div>${db.news.slice(0,3).map(n=>`<div class="event"><div class="ico">${n.icon}</div><div class="eventmain"><h4>${esc(n.title)}</h4><p>${esc(n.text)}</p></div><span class="badge blue">${esc(n.type)}</span></div>`).join('')}</div></div>
 <div class="grid g3" style="margin-top:15px"><div class="card"><div class="head"><h3>🏆 Ranking de alianzas</h3><button class="link" onclick="go('alliances')">Ver</button></div>${ranking()}</div><div class="card"><div class="head"><h3>🗳️ Encuesta activa</h3></div>${pollCard(db.polls[0])}</div><div class="card"><div class="head"><h3>⚡ Ecoelectro</h3></div><div class="metric">${db.eco.progress}%</div><div class="bar"><i style="width:${db.eco.progress}%"></i></div><p class="small">${db.eco.competition}</p><button class="btn soft" onclick="go('ecoelectro')">Ver proyecto</button></div></div>`},
matches:()=>{let ch=db.championships.find(x=>x.id===champSel)||db.championships[0];let list=db.matches.filter(m=>(m.champ||'c1')===ch.id);return `<div class="head"><div><h1>⚽ Deportes</h1><div class="sub">Campeonatos del liceo: partidos, resultados, tablas de posiciones, goleadores y asistencias.</div></div><div class="actions">${canManage()?`<button class="btn primary" onclick="openMatch()">＋ Crear partido</button>`:''}${isAdmin()?`<button class="btn ghost" onclick="addChampionship()">＋ Campeonato</button>`:''}</div></div><div class="card" style="margin-bottom:15px"><div class="head"><h3>🏆 Campeonatos</h3></div><div class="actions">${db.championships.map(c=>`<button class="btn ${c.id===ch.id?'primary':'ghost'}" onclick="setChamp('${c.id}')">${c.icon} ${esc(c.name)}</button>`).join('')}</div></div><div class="grid g2"><div class="card"><div class="head"><h3>Próximos partidos</h3><span class="badge blue">${list.filter(m=>m.status!=='Finalizado').length}</span></div>${list.filter(m=>m.status!=='Finalizado').map(matchRow).join('')||'<div class="small">No hay partidos próximos.</div>'}</div><div class="card"><div class="head"><h3>Últimos resultados</h3></div>${list.filter(m=>m.status==='Finalizado').map(matchRow).join('')||'<div class="small">No hay resultados.</div>'}</div></div><div class="grid g2" style="margin-top:15px"><div class="card"><div class="head"><h3>🔥 Goleadores · ${esc(ch.name)}</h3></div>${scorers(list)}</div><div class="card"><div class="head"><h3>🎯 Asistencias · ${esc(ch.name)}</h3></div>${assists(list)}</div></div><div class="card" style="margin-top:15px"><div class="head"><h3>📊 Tabla de posiciones · ${esc(ch.name)}</h3><span class="badge">${list.length} partidos</span></div>${standings(ch.id)}</div>`},
alliances:()=>`<div class="head"><div><h1>🏆 Alianzas</h1><div class="sub">La liga interna del liceo: puntos por deportes, juegos, barra, lienzos y organización.</div></div>${canManage()?`<button class="btn primary" onclick="addActivity('Alianza')">＋ Crear actividad</button>`:''}</div><div class="grid g2"><div class="card"><div class="head"><h3>Ranking general</h3></div>${ranking(true)}</div><div class="card"><div class="head"><h3>Actividades de alianzas</h3></div>${db.activities.filter(a=>a.type==='Alianza').map(activityCard).join('')}</div></div><div class="card" style="margin-top:15px"><div class="head"><h3>¿En qué quieres participar?</h3></div><div class="grid g3">${db.activities.filter(a=>a.type==='Alianza').map(activityCard).join('')}</div></div>`,
workshops:()=>sectionActivities('🏃 Talleres','Talleres deportivos disponibles para inscripción.','Taller'),
events:()=>sectionActivities('🎪 Eventos y actividades','Cueca, celebraciones, encuentros y actividades culturales del liceo.','Baile'),
ecoelectro:()=>`<div class="hero"><span class="badge" style="background:#ffffff20;color:#fff">⚡ PROYECTO TECNOLÓGICO</span><h1>${esc(db.eco.team)}</h1><p>${esc(db.eco.competition)}. Entrenamientos fuera del horario de clases y preparación del vehículo de hidrógeno verde.</p></div><div class="grid g3" style="margin-top:15px"><div class="card"><div class="small">PROGRESO DEL PROYECTO</div><div class="metric">${db.eco.progress}%</div><div class="bar"><i style="width:${db.eco.progress}%"></i></div></div><div class="card"><div class="small">PRÓXIMA COMPETENCIA</div><div class="metric">${db.eco.days}</div><div class="small">días restantes</div></div><div class="card"><div class="small">ENTRENAMIENTOS</div><div class="metric">${db.eco.trainings.length}</div><div class="small">sesiones programadas</div></div></div><div class="grid g2" style="margin-top:15px"><div class="card"><div class="head"><h3>🛠️ Horarios de entrenamiento</h3></div>${db.eco.trainings.map(x=>`<div class="event"><div class="ico">⚡</div><div class="eventmain"><h4>${esc(x)}</h4><p>Preparación del vehículo y pruebas.</p></div></div>`).join('')}</div><div class="card"><div class="head"><h3>📸 Historia visual</h3></div><div class="gallery">${db.gallery.filter(x=>x.icon==='⚡'||x.icon==='🏆').map(photo).join('')}</div></div></div>`,
calendar:()=>{let items=[...db.matches.map(m=>({date:m.date,title:`⚽ ${m.a} vs ${m.b}`,sub:`${m.time} · ${m.place}`,icon:'⚽'})),...db.activities.map(a=>({date:a.date,title:`${a.icon} ${a.name}`,sub:`${a.time} · ${a.place}`,icon:a.icon}))];return `<div class="head"><div><h1>📅 Calendario</h1><div class="sub">Todo lo que ocurre en el liceo, ordenado por fecha.</div></div></div><div class="card">${items.map(x=>`<div class="event"><div class="datebox"><b>${esc(x.date).split(' ')[0]}</b><span>${esc(x.date).split(' ')[1]||''}</span></div><div class="eventmain"><h4>${esc(x.title)}</h4><p>${esc(x.sub)}</p></div><span class="badge">${x.icon}</span></div>`).join('')}</div>`},
polls:()=>`<div class="head"><div><h1>🗳️ Encuestas</h1><div class="sub">Los estudiantes deciden qué actividades quieren.</div></div>${canManage()?`<button class="btn primary" onclick="addPoll()">＋ Crear encuesta</button>`:''}</div><div class="grid g2">${db.polls.map(pollCard).join('')}</div>`,
gallery:()=>`<div class="head"><div><h1>📸 Galería</h1><div class="sub">Momentos deportivos, culturales y tecnológicos del liceo.</div></div>${canManage()?`<button class="btn primary" onclick="toast('En esta demo las imágenes se representan con tarjetas; la versión real aceptará subida de archivos.')">＋ Subir fotos</button>`:''}</div><div class="card"><div class="gallery" style="grid-template-columns:repeat(3,1fr)">${db.gallery.map(photo).join('')}</div></div>`,
news:()=>`<div class="head"><div><h1>📰 Noticias</h1><div class="sub">Información oficial de actividades y competencias.</div></div>${canManage()?`<button class="btn primary" onclick="addNews()">＋ Publicar noticia</button>`:''}</div><div class="grid g2">${db.news.map(n=>`<div class="card"><div class="row"><span style="font-size:25px">${n.icon}</span><span class="badge blue">${esc(n.type)}</span></div><h3 style="margin-top:10px">${esc(n.title)}</h3><p class="small">${esc(n.text)}</p><span class="small">${esc(n.date)}</span></div>`).join('')}</div>`,
notifications:()=>`<div class="head"><div><h1>🔔 Notificaciones</h1><div class="sub">Avisos de partidos, actividades, cambios y novedades.</div></div></div><div class="card">${db.notifications.map(n=>`<div class="event" style="${n.read?'opacity:.55':''}"><div class="ico">${n.type==='match'?'⚽':'🔔'}</div><div class="eventmain"><h4>${esc(n.title)}</h4><p>${esc(n.text)}</p></div>${!n.read?`<button class="btn soft" onclick="markRead('${n.id}')">Marcar leída</button>`:''}</div>`).join('')}</div>`,
profile:()=>{let u=currentUser();return `<div class="head"><div><h1>👤 Mi perfil</h1><div class="sub">Tu identidad dentro de ElectroTecnia Sports.</div></div></div><div class="grid g2"><div class="card"><div style="display:flex;align-items:center;gap:15px"><div class="avatar" style="width:70px;height:70px;font-size:20px">${initials(u.name)}</div><div><h2>${esc(u.name)}</h2><div class="small">${esc(u.email)} · ${esc(u.course)}</div><span class="badge red">${roleName()}</span></div></div><hr style="border:0;border-top:1px solid var(--line);margin:17px 0"><div class="grid g2"><div><div class="small">Alianza</div><b>${esc(u.alliance||'—')}</b></div><div><div class="small">Puntos</div><b>${u.points||0} ⭐</b></div></div></div><div class="card"><h3>🎮 Progreso</h3><div class="metric">${Math.min(100,Math.round((u.points||0)/10))}%</div><div class="bar"><i style="width:${Math.min(100,Math.round((u.points||0)/10))}%"></i></div><p class="small">Participa en actividades para subir de nivel y desbloquear insignias.</p></div></div>`},
myactivities:()=>{let a=db.activities.filter(x=>x.mine);return `<div class="head"><div><h1>🎫 Mis inscripciones</h1><div class="sub">Controla tus actividades y cupos.</div></div></div><div class="grid g2">${a.map(x=>`<div class="card">${activityCard(x)}<button class="btn ghost" onclick="cancelActivity('${x.id}')">Cancelar inscripción</button></div>`).join('')||'<div class="card"><div class="small">Todavía no estás inscrito en actividades.</div></div>'}</div>`},
badges:()=>`<div class="head"><div><h1>🎮 Mis logros</h1><div class="sub">Participa, suma puntos y desbloquea insignias.</div></div></div><div class="grid g3">${db.badges.map(b=>`<div class="card" style="${b.ok?'':'opacity:.45'}"><div style="font-size:35px">${b.icon}</div><h3>${esc(b.name)}</h3><p class="small">${esc(b.desc)}</p><span class="badge ${b.ok?'green':''}">${b.ok?'Desbloqueada':'Bloqueada'}</span></div>`).join('')}</div>`,
admin:()=>`<div class="head"><div><h1>🛡️ Dashboard administrativo</h1><div class="sub">Control total de la plataforma.</div></div><div class="actions"><button class="btn soft" onclick="openMatch()">⚽ Partido</button><button class="btn soft" onclick="addActivity()">＋ Actividad</button><button class="btn soft" onclick="addNews()">📰 Noticia</button><button class="btn soft" onclick="adminAccount()">🔐 Cuenta</button></div></div><div class="grid g4">${[['👥','Estudiantes',db.users.length],['⚽','Partidos',db.matches.length],['🏃','Actividades',db.activities.length],['🗳️','Encuestas',db.polls.length]].map(x=>`<div class="card"><div class="small">${x[0]} ${x[1]}</div><div class="metric">${x[2]}</div></div>`).join('')}</div><div class="grid g2" style="margin-top:15px"><div class="card"><div class="head"><h3>⚽ Partidos publicados</h3><button class="link" onclick="openMatch()">＋ Nuevo</button></div>${db.matches.map(m=>`<div class="event"><div class="datebox"><b>${esc(m.date).split(' ')[0]}</b><span>${esc(m.status)}</span></div><div class="eventmain"><h4>${esc(m.a)} vs ${esc(m.b)}</h4><p>${esc(m.time)} · ${esc(m.place)} ${m.status==='Finalizado'?`· ${m.sa}-${m.sb}`:''}</p></div><button class="btn ghost" onclick="openMatch('${m.id}')">✏️</button></div>`).join('')}</div><div class="card"><div class="head"><h3>📋 Actividades creadas</h3><button class="link" onclick="addActivity()">＋ Nueva</button></div>${db.activities.map(a=>`<div class="activity"><div class="ico">${a.icon}</div><div class="main"><h4>${esc(a.name)}</h4><p>${esc(a.date)} · ${esc(a.time)} · ${esc(a.place)}</p><div class="progress"><div class="progressline"><i style="width:${Math.min(100,a.reg/a.cap*100)}%"></i></div><span class="small">${a.reg}/${a.cap} cupos</span></div></div><div class="actions"><button class="btn ghost" onclick="addActivity('${a.type}','${a.id}')">✏️</button><button class="btn danger" onclick="deleteActivity('${a.id}')">×</button></div></div>`).join('')}</div></div>`,
users:()=>`<div class="head"><div><h1>👥 Usuarios y roles</h1><div class="sub">Gestión de estudiantes y permisos. Para editar cursos, RUT y roles usa <b>admin.html</b>.</div></div></div><div class="card"><div class="tablewrap"><table class="table"><thead><tr><th>Usuario</th><th>Correo</th><th>RUT</th><th>Curso</th><th>Rol</th><th>Puntos</th></tr></thead><tbody>${db.users.map(u=>`<tr><td><b>${esc(u.name)}</b></td><td>${esc(u.email)}</td><td>${esc(u.rut)}</td><td>${esc(u.course)}</td><td><span class="badge ${u.role==='admin'?'red':u.role==='profesor'?'blue':''}">${u.role==='admin'?'Administrador':u.role==='profesor'?'Profesor':'Estudiante'}</span></td><td>${u.points}</td></tr>`).join('')}</tbody></table></div><div class="notice" style="margin-top:14px"><b>Jerarquía:</b> ROOT → Administradores → Profesores → Estudiantes. El panel completo de edición está en <a href="admin.html" style="color:var(--blue);font-weight:900">admin.html</a>.</div></div>`,
content:()=>`<div class="head"><div><h1>⚙️ Constructor</h1><div class="sub">Crea lo que quieras sin depender de actividades predeterminadas.</div></div></div><div class="grid g3">${[['⚽','Partido','Crea un nuevo encuentro.','openMatch()'],['🏃','Actividad','Taller, alianza, baile, cultural, otro.','addActivity()'],['🗳️','Encuesta','Pregunta y opciones personalizadas.','addPoll()'],['📰','Noticia','Publica información oficial.','addNews()']].map(x=>`<div class="card"><div style="font-size:32px">${x[0]}</div><h3>${x[1]}</h3><p class="small">${x[2]}</p><button class="btn primary" onclick="${x[3]}">Crear</button></div>`).join('')}</div>`,
settings:()=>`<div class="head"><div><h1>🔐 Configuración</h1><div class="sub">Cuenta maestra y seguridad del prototipo.</div></div></div><div class="card"><h3>Cuenta ROOT / Administrador</h3><p class="small">Correo: <b>${esc(db.admin.email)}</b><br>RUT: <b>${esc(db.admin.rut)}</b><br>Contraseña: configurada</p><button class="btn primary" onclick="adminAccount()">Editar credenciales</button><div class="notice red" style="margin-top:13px"><b>Importante:</b> este HTML guarda datos en localStorage. Para producción, las contraseñas deben ir a un backend con hash, sesiones y control de permisos.</div></div><div class="card" style="margin-top:15px"><h3>🚀 Stack y flujo del proyecto</h3><p class="small">HTML5 · CSS3 · JavaScript · Supabase · PostgreSQL · Git · GitHub · Capacitor · Android Studio (APK)</p><div class="notice" style="margin-top:12px"><b>Flujo de datos:</b> Usuario → Aplicación (JavaScript) → Supabase → PostgreSQL. Este prototipo usa localStorage; al conectar Supabase, las tablas (usuarios, campeonatos, partidos, actividades, inscripciones, encuestas, noticias y eventos) se sincronizan entre todos los usuarios.</div><div class="notice green" style="margin-top:10px"><b>Futuro:</b> notificaciones push, estadísticas avanzadas, más deportes, sistema de puntos de alianzas y publicación oficial del APK para Android.</div></div>`
};
function matchMini(m){return `<div class="match"><div class="team"><div class="crest">🔴</div>${esc(m.a)}</div><div class="score"><div class="versus">${esc(m.date)}</div><strong>${m.status==='Finalizado'?m.sa+' - '+m.sb:'VS'}</strong><div class="small">${esc(m.time)}</div></div><div class="team"><div class="crest">🔵</div>${esc(m.b)}</div></div><div class="actions" style="justify-content:center;margin-top:12px"><button class="btn soft" onclick="matchCenter('${m.id}')">Ver centro de partido</button></div>`}
function matchRow(m){return `<div class="event"><div class="datebox"><b>${esc(m.date).split(' ')[0]}</b><span>${esc(m.status)}</span></div><div class="eventmain"><h4>${esc(m.a)} ${m.status==='Finalizado'?m.sa+' - '+m.sb:'vs'} ${esc(m.b)}</h4><p>${esc(m.time)} · ${esc(m.place)}</p></div><div class="actions"><button class="btn soft" onclick="matchCenter('${m.id}')">Ver</button>${canManage()?`<button class="btn ghost" onclick="openMatch('${m.id}')">✏️</button>`:''}</div></div>`}
function scorers(list){let c={};(list||[]).forEach(m=>(m.goals||[]).forEach(g=>c[g.player]=(c[g.player]||0)+1));let a=Object.entries(c).sort((x,y)=>y[1]-x[1]);return a.length?a.map((x,i)=>`<div class="event"><div class="rank">${i+1}</div><div class="eventmain"><h4>${esc(x[0])}</h4><p>${x[1]} goles</p></div><span class="badge red">⚽ ${x[1]}</span></div>`).join(''):'<div class="small">Sin datos todavía.</div>'}
function assists(list){let c={};(list||[]).forEach(m=>(m.assists||[]).forEach(g=>c[g.player]=(c[g.player]||0)+1));let a=Object.entries(c).sort((x,y)=>y[1]-x[1]);return a.length?a.map((x,i)=>`<div class="event"><div class="rank">${i+1}</div><div class="eventmain"><h4>${esc(x[0])}</h4><p>${x[1]} asistencias</p></div><span class="badge blue">🎯 ${x[1]}</span></div>`).join(''):'<div class="small">Sin datos todavía.</div>'}
function standings(cid){let ch=db.championships.find(x=>x.id===cid)||db.championships[0];let t={};(ch.teams||[]).forEach(n=>t[n]={pj:0,pg:0,pe:0,pp:0,pts:0});db.matches.filter(m=>(m.champ||'c1')===cid&&m.status==='Finalizado').forEach(m=>{let A=t[m.a],B=t[m.b];if(!A||!B)return;A.pj++;B.pj++;if(m.sa>m.sb){A.pg++;A.pts+=3;B.pp++}else if(m.sb>m.sa){B.pg++;B.pts+=3;A.pp++}else{A.pe++;B.pe++;A.pts++;B.pts++}});return `<table class="table"><thead><tr><th>#</th><th>Equipo</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>Pts</th></tr></thead><tbody>${Object.entries(t).sort((a,b)=>b[1].pts-a[1].pts||b[1].pg-a[1].pg).map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x[0])}</td><td>${x[1].pj}</td><td>${x[1].pg}</td><td>${x[1].pe}</td><td>${x[1].pp}</td><td><b>${x[1].pts}</b></td></tr>`).join('')}</tbody></table>`}
function ranking(big=false){let arr=[...db.alliances].sort((a,b)=>b.points-a.points);return arr.map((a,i)=>`<div class="event"><div class="rank">${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</div><div class="eventmain"><h4>${a.emoji} Alianza ${a.name}</h4><div class="bar"><i style="width:${a.points/900*100}%"></i></div></div><span class="badge ${i===0?'red':'blue'}">${a.points} pts</span></div>`).join('')}
function pollCard(p){if(!p)return '<div class="small">No hay encuestas.</div>';let total=p.opts.reduce((s,x)=>s+x[1],0)||1;return `<div class="card" style="box-shadow:none;border:0;padding:0"><h3>${esc(p.q)}</h3>${p.opts.map(o=>{let pct=Math.round(o[1]/total*100);return `<div style="margin-top:12px"><div class="row" style="justify-content:space-between"><span class="small">${esc(o[0])}</span><span class="small">${pct}%</span></div><div class="bar"><i style="width:${pct}%"></i></div><button class="btn soft" style="margin-top:5px" onclick="votePoll('${p.id}','${esc(o[0]).replace(/'/g,"&#39;")}')" ${p.voted?'disabled':''}>${p.voted?'Votado':'Votar'}</button></div>`}).join('')}</div>`}
function activityCard(a){
 a.registered=a.registered||[];const uid=db.session?.id;
 const mine=a.registered.some(x=>x.uid===uid)||(a.mine&&!a.registered.length&&uid==='u1');
 const full=(a.reg||0)>=a.cap,pct=Math.min(100,Math.round(a.reg/a.cap*100));
 const susp=(a.status||'activo')==='suspendido';
 const days=(a.days||[]).join(' · ');
 return `<div class="activity"><div class="ico">${a.icon}</div><div class="main"><h4>${esc(a.name)} ${susp?'<span class="badge red">⚠️ Suspendido</span>':'<span class="badge green">✅ Activo</span>'}</h4><p>${esc(a.date)} · ${esc(a.time)} · ${esc(a.place)}</p>${days?`<p><b>📅 Días:</b> ${esc(days)} · <b>🕐 Horario:</b> ${esc(a.hours||a.time)}</p>`:''}<p>${esc(a.desc)}</p><div class="progress"><div class="progressline"><i style="width:${pct}%"></i></div><span class="small">${a.reg}/${a.cap} cupos · ${pct}%</span></div><div class="actions" style="margin-top:7px">${mine?`<span class="badge green">✓ Inscrito</span><button class="btn ghost" onclick="cancelActivity('${a.id}')">Cancelar</button>`:full?`<span class="badge red">🚫 Cupos llenos</span>`:susp?`<span class="badge orange">No disponible</span>`:`<button class="btn primary" onclick="registerActivity('${a.id}')">Inscribirme</button>`}${canManage()?`<button class="btn soft" onclick="viewRegistered('${a.id}')">👥 Inscritos (${a.registered.length})</button>`:''}</div></div></div>`;
}
function sectionActivities(title,sub,type){let arr=db.activities.filter(a=>a.type===type);return `<div class="head"><div><h1>${title}</h1><div class="sub">${sub}</div></div>${canManage()?`<button class="btn primary" onclick="addActivity('${type}')">＋ Crear</button>`:''}</div><div class="grid g2">${arr.map(a=>`<div class="card">${activityCard(a)}</div>`).join('')||'<div class="card"><div class="small">No hay actividades creadas todavía.</div></div>'}</div>`}
function photo(x){return `<div><div class="photo">${x.icon}</div><div class="small" style="margin-top:5px">${esc(x.title)}</div></div>`}

/* ============================================================
   NUEVAS FUNCIONES (v2): seguridad y gestión ampliada
   ============================================================ */
const COURSES=['1°G','2°G','3°G','4°G'];
const DIAS=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
/* Muestra/oculta contraseñas (botón del ojo 👁️) */
function togglePw(id,el){const i=document.getElementById(id);if(!i)return;const show=i.type==='password';i.type=show?'text':'password';el.textContent=show?'🙈':'👁️'}
/* Rol automático según el dominio del correo institucional */
function domainRole(email){email=(email||'').toLowerCase();if(email.endsWith('@liceorbl.cl'))return 'student';if(email.endsWith('@liceosofofa.cl'))return 'profesor';return null}
/* Verifica la contraseña del usuario actual (Supabase Auth o modo demo) */
async function verifyPw(u,p){
 if(db.session?.id==='root')return p===db.admin.password;
 const r=await AUTH.signIn(u.email,p);
 if(r.ok)return true;
 if(r.demo)return u.password===p;   /* modo demo: comparación local */
 return false;
}
/* Modal genérico "confirma con tu contraseña" */
let _pwCb=null;
function askPassword(title,desc,onOk){
 _pwCb=onOk;
 modal(`<h2>🔐 ${title}</h2><div class="notice">${desc}</div><div class="field" style="margin-top:12px"><label>Contraseña de tu cuenta</label><div class="pw"><input id="pwc" type="password" placeholder="••••••" onkeydown="if(event.key==='Enter')confirmPw()"><button type="button" class="pweye" onclick="togglePw('pwc',this)">👁️</button></div></div><div class="notice" style="margin-top:10px">Pedimos tu contraseña para confirmar que eres tú y evitar que otra persona te inscriba.</div><div class="modalfoot"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn primary" onclick="confirmPw()">Confirmar</button></div>`);
 setTimeout(()=>document.getElementById('pwc')?.focus(),60);
}
async function confirmPw(){
 let p=document.getElementById('pwc').value;
 if(!p)return toast('Escribe tu contraseña.');
 const ok=await verifyPw(currentUser(),p);
 if(!ok)return toast('Contraseña incorrecta.');
 closeModal();const cb=_pwCb;_pwCb=null;if(cb)cb();
}
/* ¿Olvidaste tu contraseña? -> correo de Supabase -> reset.html */
function forgotPw(){
 document.getElementById('loginError').classList.add('hidden');
 document.getElementById('authForm').innerHTML=`<h2 style="font-size:15px;margin-bottom:6px">📧 Recuperar contraseña</h2><div class="notice">Escribe el correo de tu cuenta y te enviaremos un enlace para crear una contraseña nueva.</div><div class="field" style="margin-top:12px"><label>Correo</label><input id="fe" type="email" placeholder="correo@liceorbl.cl" onkeydown="if(event.key==='Enter')sendForgot()"></div><div class="modalfoot" style="justify-content:space-between"><button class="btn ghost" onclick="loginMode('login')">← Volver</button><button class="btn primary" onclick="sendForgot()">Enviar correo</button></div>`;
}
async function sendForgot(){
 let e=document.getElementById('fe').value.trim().toLowerCase();
 if(!e)return err('Escribe tu correo.');
 const redirectTo=new URL('reset.html',location.href).href;
 const r=await AUTH.resetPassword(e,redirectTo);
 if(r.ok)document.getElementById('authForm').innerHTML=`<div class="notice green"><b>✅ Correo enviado a ${esc(e)}.</b><br>Abre el mensaje de Supabase y presiona el botón <b>Restablecer contraseña</b>. Si no llega, revisa spam.</div><div class="modalfoot"><button class="btn ghost" onclick="loginMode('login')">← Volver</button></div>`;
 else err(r.msg||'No se pudo enviar el correo.');
}
/* Profesor/admin: ver inscritos (nombre + RUT) y quitarlos */
function viewRegistered(id){
 if(!canManage())return toast('Solo profesores y administración.');
 let a=db.activities.find(x=>x.id===id);if(!a)return;
 a.registered=a.registered||[];
 let rows=a.registered.map((x,i)=>`<div class="event"><div class="rank">${i+1}</div><div class="eventmain"><h4>${esc(x.name)}</h4><p>RUT: ${esc(x.rut||'—')} · Curso: ${esc(x.course||'—')} · ${esc(x.date||'')}</p></div><button class="btn danger" onclick="removeFromActivity('${a.id}','${x.uid}')">Quitar</button></div>`).join('');
 modal(`<h2>👥 Inscritos · ${esc(a.name)}</h2><div class="notice blue">${a.registered.length} de ${a.cap} cupos ocupados. Aquí puedes eliminar a cualquier persona de la actividad.</div>${rows||'<div class="small">Todavía no hay inscritos en esta actividad.</div>'}<div class="modalfoot"><button class="btn ghost" onclick="closeModal()">Cerrar</button></div>`);
}
function removeFromActivity(aid,uid){
 if(!canManage())return toast('Solo profesores y administración.');
 let a=db.activities.find(x=>x.id===aid);if(!a)return;
 a.registered=a.registered||[];
 const i=a.registered.findIndex(x=>x.uid===uid);if(i>-1)a.registered.splice(i,1);
 a.reg=Math.max(0,(a.reg||1)-1);save();toast('Inscripción eliminada.');viewRegistered(aid);render();
}
/* Gol en vivo: suma 1 al marcador y pide el nombre del goleador */
function liveGoal(id,team){
 let m=db.matches.find(x=>x.id===id);if(!m)return;
 let name=prompt('⚽ ¡Gol de '+(team==='a'?m.a:m.b)+'! Nombre del goleador:');
 if(!name||!name.trim())return;
 m[team==='a'?'sa':'sb']=(m[team==='a'?'sa':'sb']||0)+1;
 m.goals=m.goals||[];m.goals.unshift({player:name.trim(),minute:'En vivo'});
 m.status='En vivo';save();toast('Gol de '+name.trim()+' registrado.');openMatch(id);
}

initSupabase();
if(db.session)hideLogin();else showLogin();
if(connected())pullSupabase().then(changed=>{if(changed&&db.session)render()}).catch(()=>toast('No se pudo sincronizar con Supabase.'));
