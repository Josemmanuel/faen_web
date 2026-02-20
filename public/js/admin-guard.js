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

  // Si no hay token o no hay user, redirigir a login
  if (!token || !userStr) {
    window.location.replace('/login.html?redirect=admin');
    return;
  }

  try {
    const user = JSON.parse(userStr);

    // Validar que sea admin o superadmin
    if (!user || !user.role) {
      // Usuario malformado
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.replace('/login.html?redirect=admin');
      return;
    }

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      // Usuario no tiene permisos de admin
      window.location.replace('/index.html?error=access_denied');
      return;
    }

    // Si llegamos aquí, el usuario tiene acceso - continuar cargando la página
  } catch (e) {
    // Error al parsear JSON del usuario
    console.error('Error parsing user data:', e);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.replace('/login.html');
    return;
  }
})();
