/**
 * Admin Guard - Validación inmediata de acceso a admin.html
 * Se ejecuta antes de que se cargue cualquier contenido
 */
(function() {
  // Ejecutar inmediatamente - no esperar DOMContentLoaded
  const TOKEN_KEY = 'faen_auth_token';
  const USER_KEY = 'faen_auth_user';

  const token = localStorage.getItem(TOKEN_KEY);
  const userStr = localStorage.getItem(USER_KEY);

  console.log('[Admin Guard] Verificando acceso a admin.html');
  console.log('[Admin Guard] Token existe:', !!token);
  console.log('[Admin Guard] User existe:', !!userStr);

  // Si no hay token o no hay user, redirigir a login
  if (!token || !userStr) {
    console.log('[Admin Guard] ❌ Sin token o usuario - redirigiendo a login');
    window.location.replace('/login.html?redirect=admin');
    return;
  }

  try {
    const user = JSON.parse(userStr);

    // Validar que sea admin o superadmin
    if (!user || !user.role) {
      // Usuario malformado
      console.log('[Admin Guard] ❌ Usuario malformado - limpiando y redirigiendo');
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.replace('/login.html?redirect=admin');
      return;
    }

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      // Usuario no tiene permisos de admin
      console.log('[Admin Guard] ❌ Usuario no es admin (rol:', user.role + ') - redirigiendo a home');
      window.location.replace('/index.html?error=access_denied');
      return;
    }

    // Validar que el token sea un JWT válido (formato básico)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.log('[Admin Guard] ❌ Token JWT inválido - limpiando y redirigiendo');
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.replace('/login.html?redirect=admin');
      return;
    }

    // Validar expiración del token JWT
    try {
      // El payload es la segunda parte del JWT, codificada en base64
      const payload = JSON.parse(atob(tokenParts[1]));
      const expirationTime = payload.exp * 1000; // Convertir a milisegundos
      const currentTime = Date.now();

      if (expirationTime < currentTime) {
        console.log('[Admin Guard] ❌ Token expirado - limpiando y redirigiendo');
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        window.location.replace('/login.html?expired=true');
        return;
      }

      const timeUntilExpiration = Math.floor((expirationTime - currentTime) / 1000);
      console.log('[Admin Guard] ✅ Token válido por', timeUntilExpiration, 'segundos');
    } catch (e) {
      console.log('[Admin Guard] ⚠️ No se pudo validar expiración del token:', e.message);
      // Continuar de todas formas - el backend validará en la próxima llamada
    }

    console.log('[Admin Guard] ✅ Usuario admin válido:', user.username, '- acceso permitido');
    // Si llegamos aquí, el usuario tiene acceso - continuar cargando la página
  } catch (e) {
    // Error al parsear JSON del usuario
    console.error('[Admin Guard] ❌ Error de validación:', e);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.replace('/login.html');
    return;
  }
})();


