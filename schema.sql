-- ============================================================
-- ElectroTecnia Sports · Base de datos (Supabase / PostgreSQL)
-- 3°G – Programación
--
-- Cómo usarlo:
--   1. Entra a tu proyecto en https://supabase.com
--   2. Abre "SQL Editor" -> "New query"
--   3. Pega TODO este archivo y ejecútalo (Run)
--
-- El flujo de la app es (diapositiva 7):
--   Usuario -> Aplicación (JavaScript) -> Supabase -> PostgreSQL
-- ============================================================

-- ---------- USUARIOS Y ROLES (diapositiva 8) ----------
create table if not exists usuarios (
  id        text primary key,
  name      text not null,
  email     text not null unique,
  password  text not null,          -- demo: en producción usar Supabase Auth
  rut       text not null,
  course    text,
  alliance  text,
  points    int default 0,
  role      text default 'student' check (role in ('student','profesor','admin'))
);

-- ---------- CAMPEONATOS Y EQUIPOS ----------
create table if not exists campeonatos (
  id    text primary key,
  name  text not null,
  icon  text,
  teams jsonb default '[]'          -- lista de equipos del campeonato
);

-- ---------- PARTIDOS Y RESULTADOS ----------
create table if not exists partidos (
  id     text primary key,
  champ  text references campeonatos(id) on delete cascade,  -- campeonato
  a      text not null,            -- equipo / alianza A
  b      text not null,            -- equipo / alianza B
  "date" text,
  "time" text,
  place  text,                     -- cancha / gimnasio
  status text default 'Próximo',
  sa     int default 0,             -- marcador equipo A
  sb     int default 0,             -- marcador equipo B
  goals   jsonb default '[]',      -- goles: [{player, minute}]
  assists jsonb default '[]'       -- asistencias: [{player}]
);

-- ---------- ACTIVIDADES E INSCRIPCIONES ----------
create table if not exists actividades (
  id    text primary key,
  type  text,                      -- Taller / Alianza / Baile / Ecoelectro...
  name  text not null,
  "date" text,
  "time" text,
  place  text,
  cap   int default 0,             -- cupos disponibles
  reg   int default 0,             -- inscritos
  "desc" text,
  icon  text,
  mine  boolean default false      -- demo: en producción va en la tabla inscripciones
);

create table if not exists inscripciones (   -- versión real de los cupos por usuario
  id            serial primary key,
  usuario_id    text references usuarios(id) on delete cascade,
  actividad_id  text references actividades(id) on delete cascade
);

-- ---------- ENCUESTAS ----------
create table if not exists encuestas (
  id    text primary key,
  q     text,
  opts  jsonb default '[]',        -- opciones: [[texto, votos], ...]
  voted boolean default false,     -- demo: en producción, tabla de votos por usuario
  open  boolean default true
);

create table if not exists votos (           -- versión real de la votación
  id          serial primary key,
  usuario_id  text references usuarios(id) on delete cascade,
  encuesta_id text references encuestas(id) on delete cascade,
  opcion      text
);

-- ---------- NOTICIAS Y EVENTOS ----------
create table if not exists noticias (
  id    text primary key,
  title text,
  "text" text,
  type  text,                     -- Deportes / Eventos / Ecoelectro...
  "date" text,
  icon  text
);

create table if not exists eventos (
  id    text primary key,
  title text,
  "date" text,
  "time" text,
  place  text,
  icon  text
);

-- ---------- NOTIFICACIONES ----------
create table if not exists notificaciones (
  id    text primary key,
  title text,
  "text" text,
  read  boolean default false,
  type  text
);

-- ---------- ALIANZAS (puntos) ----------
create table if not exists alianzas (
  id     text primary key,
  name   text not null,
  emoji  text,
  points int default 0
);

-- ---------- GALERÍA Y LOGROS ----------
create table if not exists galeria (
  id    text primary key,
  title text,
  icon  text
);

create table if not exists logros (
  id    text primary key,
  name  text,
  icon  text,
  "desc" text,
  ok    boolean default false
);

-- ============================================================
-- SEGURIDAD (RLS)
-- Esta configuración es para el prototipo del liceo: permite
-- que la app se conecte con la clave "anon" (Supabase -> API).
-- Antes de publicar la app real, ajusta las políticas para
-- que solo usuarios autenticados puedan escribir.
-- ============================================================
alter table usuarios        enable row level security;
alter table campeonatos     enable row level security;
alter table partidos        enable row level security;
alter table actividades     enable row level security;
alter table inscripciones   enable row level security;
alter table encuestas       enable row level security;
alter table votos           enable row level security;
alter table noticias        enable row level security;
alter table eventos         enable row level security;
alter table notificaciones  enable row level security;
alter table alianzas        enable row level security;
alter table galeria         enable row level security;
alter table logros          enable row level security;

-- Políticas abiertas SOLO para la demo (prototipo escolar)
do $$
declare t text;
begin
  foreach t in array array['usuarios','campeonatos','partidos','actividades',
                           'encuestas','noticias','eventos','notificaciones',
                           'alianzas','galeria','logros']
  loop
    execute format('create policy %I_select on %I for select using (true);', t, t);
    execute format('create policy %I_insert on %I for insert with check (true);', t, t);
    execute format('create policy %I_update on %I for update using (true);', t, t);
    execute format('create policy %I_delete on %I for delete using (true);', t, t);
  end loop;
end $$;

-- ============================================================
-- Los datos de ejemplo (js/seed.js) NO se insertan desde aquí:
-- la aplicación los carga sola en Supabase la primera vez que
-- detecta las tablas vacías.
-- ============================================================
