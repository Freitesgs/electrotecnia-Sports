/* ============================================================
   CAPA DE DATOS - ElectroTecnia Sports
   ------------------------------------------------------------
   Flujo (diapositiva 7):
     Usuario -> Aplicación (JavaScript) -> esta capa -> Supabase -> PostgreSQL

   La aplicación SIEMPRE funciona:
   - Sin Supabase configurado: usa localStorage (modo demo local).
   - Con Supabase configurado: al abrir la app descarga las tablas
     (SELECT) y cada cambio se sincroniza automáticamente (UPSERT),
     así todos los usuarios ven la misma información.

   Tablas PostgreSQL (definidas en supabase/schema.sql):
     usuarios, campeonatos, partidos, actividades, encuestas,
     noticias, notificaciones, alianzas, galeria, logros
   ============================================================ */

const KEY = CONFIG.STORAGE_KEY;
let db = load();

let _sb = null;          // cliente de Supabase
let _pullDone = false;   // ¿ya se descargaron los datos del servidor?
let _pushTimer = null;   // temporizador para no saturar la base

/* Cada par: [tabla en PostgreSQL, colección en la app] */
const TABLES = [
  ['usuarios',        'users'],
  ['campeonatos',     'championships'],
  ['partidos',        'matches'],
  ['actividades',     'activities'],
  ['encuestas',       'polls'],
  ['noticias',        'news'],
  ['notificaciones',  'notifications'],
  ['alianzas',        'alliances'],
  ['galeria',         'gallery'],
  ['logros',          'badges']
];

function load() {
  try {
    return { ...structuredClone(SEED), ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch (e) { return structuredClone(SEED); }
}

/* Guarda localmente y sincroniza con la base de datos */
function save() {
  localStorage.setItem(KEY, JSON.stringify(db));
  syncSupabase();
}

function connected() { return !!_sb; }

/* Crea el cliente de Supabase con los datos de js/config.js */
function initSupabase() {
  if (!window.supabase || !CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
    console.info('ElectroTecnia Sports: modo demo local (configura Supabase en js/config.js)');
    return false;
  }
  // Limpia errores comunes al pegar la URL: espacios, barra final o "/rest/v1" sobrante
  const url = CONFIG.SUPABASE_URL.trim().replace(/\/+$/, '').replace(/\/rest\/v1$/i, '');
  _sb = window.supabase.createClient(url, CONFIG.SUPABASE_ANON_KEY.trim());
  console.info('ElectroTecnia Sports: conectado a Supabase');
  return true;
}

/* Descarga todas las tablas al abrir la app.
   Si la base está vacía, carga los datos de ejemplo (SEED). */
async function pullSupabase() {
  if (!_sb) return false;
  let changed = false;
  for (const [tabla, coleccion] of TABLES) {
    const { data, error } = await _sb.from(tabla).select('*');
    if (error) { console.warn('Supabase ' + tabla + ': ' + error.message); continue; }
    if (!data || data.length === 0) {          // tabla vacía: cargar datos de ejemplo
      await _sb.from(tabla).upsert(db[coleccion] || [], { onConflict: 'id' });
      continue;
    }
    if (JSON.stringify(data) !== JSON.stringify(db[coleccion])) {
      db[coleccion] = data;
      changed = true;
    }
  }
  _pullDone = true;
  if (changed) localStorage.setItem(KEY, JSON.stringify(db));
  return changed;
}

/* Envía los cambios: espera 1,5 s para agrupar y hace UPSERT por id */
function syncSupabase() {
  if (!_sb || !_pullDone) return;
  clearTimeout(_pushTimer);
  _pushTimer = setTimeout(() => pushSupabase(), 1500);
}

async function pushSupabase(inicial) {
  if (!_sb) return;
  for (const [tabla, coleccion] of TABLES) {
    if (!Array.isArray(db[coleccion])) continue;
    const { error } = await _sb.from(tabla).upsert(db[coleccion], { onConflict: 'id' });
    if (error) console.warn('Supabase ' + tabla + ': ' + error.message);
  }
  if (inicial) console.info('Datos de ejemplo cargados en Supabase.');
}

/* ============================================================
   Notas para la versión real (diapositivas 6 y 9):
   - Contraseñas: usar Supabase Auth en vez de la columna password.
   - "mine" de actividades y "voted" de encuestas son por usuario:
     en producción van en tablas aparte (inscripciones y votos).
   ============================================================ */
