/* ============================================================
   AUTENTICACIÓN CON SUPABASE AUTH
   ------------------------------------------------------------
   Se usa para tres cosas:
   1. Registrar cuentas (auth.signUp) con correo y contraseña reales
   2. Verificar la contraseña al inscribirse en una actividad
   3. Enviar el correo de "¿Olvidaste tu contraseña?" y
      cambiarla desde reset.html

   Si Supabase no está configurado (modo demo), todas las
   funciones responden con { ok:false, demo:true } y la app
   usa la comparación local de la tabla usuarios.
   ============================================================ */

const AUTH = {
  ready() { return !!(window.supabase && typeof _sb !== 'undefined' && _sb); },

  /* Registra un correo+contraseña en Supabase Auth */
  async signUp(email, password) {
    if (!this.ready()) return { ok: false, demo: true };
    const { error } = await _sb.auth.signUp({ email, password });
    if (error) return { ok: false, msg: this.translate(error.message) };
    return { ok: true };
  },

  /* Verifica correo+contraseña (usado al inscribirse en actividades) */
  async signIn(email, password) {
    if (!this.ready()) return { ok: false, demo: true };
    const { error } = await _sb.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, msg: this.translate(error.message) };
    return { ok: true };
  },

  async signOut() {
    if (!this.ready()) return;
    try { await _sb.auth.signOut(); } catch (e) {}
  },

  /* Envía el correo de recuperación a la página reset.html */
  async resetPassword(email, redirectTo) {
    if (!this.ready()) return { ok: false, msg: 'La recuperación por correo necesita Supabase configurado (js/config.js) y las tablas creadas.' };
    const { error } = await _sb.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) return { ok: false, msg: this.translate(error.message) };
    return { ok: true };
  },

  /* Cambia la contraseña del usuario conectado (usado en reset.html) */
  async changePassword(password) {
    if (!this.ready()) return { ok: false, msg: 'Supabase no está configurado.' };
    const { error } = await _sb.auth.updateUser({ password });
    if (error) return { ok: false, msg: this.translate(error.message) };
    return { ok: true };
  },

  translate(msg) {
    const m = String(msg || '');
    if (/invalid login credentials/i.test(m)) return 'Correo o contraseña incorrectos.';
    if (/already registered/i.test(m)) return 'Ese correo ya tiene una cuenta. Prueba ingresar directamente.';
    if (/redirect_to/i.test(m)) return 'Falta agregar la URL de restablecimiento en Supabase (Authentication → URL Configuration → Redirect URLs).';
    if (/not allowed/i.test(m) && /sign|email/i.test(m)) return 'El registro de correos está restringido en Supabase (Authentication → Providers → Email → "Allow new users to sign up" debe estar activado).';
    if (/password/i.test(m) && /at least/i.test(m)) return 'La contraseña es muy corta (mínimo 6 caracteres).';
    if (/rate limit/i.test(m)) return 'Demasiados intentos seguidos. Espera un minuto e inténtalo de nuevo.';
    if (/email not confirmed/i.test(m)) return 'Tu correo aún no está confirmado. Revisa tu bandeja de entrada.';
    return m;
  }
};
