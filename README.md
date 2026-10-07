# ⚡ ElectroTecnia Sports

Aplicación de gestión deportiva y actividades escolares — **3°G · Programación**

Centraliza campeonatos, deportes, talleres, alianzas, eventos y Ecoelectro del liceo.

## 📁 Estructura del proyecto (HTML5 + CSS3 + JavaScript)

```
electro-sports/
├── index.html              Estructura de la página (HTML5)
├── css/

├── js/
│   ├── config.js           ← CONEXIÓN A LA BASE DE DATOS (edita aquí)
│   ├── seed.js             Datos de ejemplo (se cargan en Supabase si está vacía)
│   ├── db.js               Capa de datos: guarda y sincroniza con Supabase
│   └── app.js              Funcionalidad: login, roles, vistas, inscripciones
├── img/
│   ├── logo-liceo.png      Logo oficial del liceo
│   └── favicon.png         Icono de la pestaña
└── supabase/
    └── schema.sql          Tablas de la base de datos (PostgreSQL)
```

## 🖥️ Abrir en Visual Studio Code

1. Descomprime el proyecto y abre la carpeta `electro-sports` en VS Code.
2. Instala la extensión **Live Server** (de Ritwick Dey).
3. Clic derecho en `index.html` → **"Open with Live Server"**.
4. Sin configurar nada más, la app funciona en **modo demo local**
   (los datos se guardan en el navegador).

## 🗄️ Conectar con la base de datos (Supabase + PostgreSQL)

1. Crea un proyecto gratis en [supabase.com](https://supabase.com).
2. En Supabase abre **SQL Editor → New query**, pega todo el contenido de
   `supabase/schema.sql` y ejecútalo (Run). Esto crea las tablas:
   `usuarios, campeonatos, partidos, actividades, inscripciones, encuestas,
   votos, noticias, eventos, notificaciones, alianzas, galeria, logros`.
3. En Supabase ve a **Project Settings → API** y copia:
   - **Project URL**
   - **anon public** (la clave pública, NUNCA la `service_role`)
4. Abre `js/config.js` y pégalos:
   ```js
   SUPABASE_URL: 'https://xxxxx.supabase.co',
   SUPABASE_ANON_KEY: 'eyJhbGci...'
   ```
5. Recarga la app con Live Server. En la consola verás
   `ElectroTecnia Sports: conectado a Supabase`.

A partir de ahí **todos los usuarios comparten la misma información**:
al abrir, la app descarga las tablas (SELECT) y cada cambio se sube
automáticamente (UPSERT).

```
Usuario → Aplicación (JavaScript) → Supabase → PostgreSQL
```

## 👥 Cuentas de demostración

| Rol | Correo | Contraseña | RUT |
|---|---|---|---|
| Estudiante | estudiante@electrotecnia.cl | 123456 | 22.222.222-2 |
| Profesor-Admin | profesor@electrotecnia.cl | 123456 | 22.222.222-5 |
| Administrador | admin@electrotecnia.cl | Admin123! | 11.111.111-1 |

**Estudiante:** consulta partidos, resultados, tablas y goleadores, se inscribe
respetando los cupos, participa en encuestas y ve noticias y fotos.

**Profesor/Administrador:** crea actividades, modifica partidos, actualiza
resultados y gestiona cupos.

**Administrador:** además, control general: usuarios y roles, constructor,
creación de campeonatos y configuración.

## 🚀 Siguientes pasos (futuro)

- Git/GitHub: `git init`, commit inicial y subir el repo.
- Notificaciones push y estadísticas avanzadas.
- Supabase Auth para contraseñas reales (hoy es login demo).
- Convertir en app móvil con **Capacitor** y generar el **APK** en **Android Studio**.

## ⚠️ Notas de seguridad

- Las contraseñas y las políticas abiertas de la base de datos son solo para
  el prototipo; antes de publicar, usa Supabase Auth y ajusta las políticas RLS
  (marcado en `schema.sql`).
- `mine` (inscripciones) y `voted` (encuestas) son simplificaciones de la demo;
  la versión por usuario real usa las tablas `inscripciones` y `votos`.
