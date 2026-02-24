/**
 * Admin Guard - Validación inmediata de acceso a admin.html
 * Se ejecuta antes de que se cargue cualquier contenido.
 * 
 * Lógica de acceso:
 * - Admin/superadmin → acceso total
 * - Otros roles → acceso si tienen al menos un permiso distinto de 'none'
 * - Sin token o sin permisos → redirige a login
 */
(function () {
  const TOKEN_KEY = 'faen_auth_token';
  const USER_KEY  = 'faen_auth_user';

  const token   = localStorage.getItem(TOKEN_KEY);
  const userStr = localStorage.getItem(USER_KEY);

  console.log('[Admin Guard] Verificando acceso...');

  // 1. Sin token o sin usuario → login
  if (!token || !userStr) {
    console.log('[Admin Guard] ❌ Sin sesión - redirigiendo a login');
    window.location.replace('/login.html?redirect=admin');
    return;
  }

  try {
    const user = JSON.parse(userStr);

    // 2. Usuario malformado → login
    if (!user || !user.role) {
      console.log('[Admin Guard] ❌ Usuario malformado');
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.replace('/login.html?redirect=admin');
      return;
    }

    // 3. Validar formato JWT (3 partes separadas por punto)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.log('[Admin Guard] ❌ Token inválido');
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.replace('/login.html?redirect=admin');
      return;
    }

    // 4. Validar expiración del token
    try {
      const payload        = JSON.parse(atob(tokenParts[1]));
      const expirationTime = payload.exp * 1000;
      if (expirationTime < Date.now()) {
        console.log('[Admin Guard] ❌ Token expirado');
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        window.location.replace('/login.html?expired=true');
        return;
      }
      const segundosRestantes = Math.floor((expirationTime - Date.now()) / 1000);
      console.log('[Admin Guard] ✅ Token válido por', segundosRestantes, 'segundos');
    } catch (e) {
      console.warn('[Admin Guard] ⚠️ No se pudo leer expiración del token');
    }

    // 5. Admin/superadmin → acceso total sin más validación
    if (user.role === 'admin' || user.role === 'superadmin') {
      console.log('[Admin Guard] ✅ Admin confirmado:', user.username);
      return;
    }

    // 6. Otros roles → necesitan al menos un permiso distinto de 'none'
    const permisos = user.permissions || {};
    const tieneAlgunPermiso = Object.values(permisos).some(p => p !== 'none');

    if (!tieneAlgunPermiso) {
      console.log('[Admin Guard] ❌ Usuario sin permisos:', user.username, '- redirigiendo');
      window.location.replace('/index.html?error=access_denied');
      return;
    }

    console.log('[Admin Guard] ✅ Acceso permitido:', user.username, '(rol:', user.role + ')');

  } catch (e) {
    console.error('[Admin Guard] ❌ Error de validación:', e);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.replace('/login.html');
  }
})();
