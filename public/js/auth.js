// API Base URL
const API_BASE = 'http://localhost:3000/api';
const TOKEN_KEY = 'faen_auth_token';
const USER_KEY  = 'faen_auth_user';

async function login(username, password) {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Credenciales inválidas');
    }

    const data = await response.json();
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
}

async function logout() {
  console.log('[Logout] Iniciando logout...');
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });
  } catch (e) {
    console.warn('[Logout] No se pudo contactar al servidor');
  }
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.clear();
  window.location.replace('/login.html');
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getCurrentUser() {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

function isAuthenticated() {
  return !!getToken();
}

// ── Jerarquía de permisos: completo > solo ver > nada ──────────────────────
function hasPermission(module, level) {
  const user = getCurrentUser();
  if (!user) return false;

  // Admin y superadmin siempre tienen acceso total
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  const userLevel = user.permissions?.[module] || 'nada';

  const hierarchy = { 'nada': 0, 'solo ver': 1, 'completo': 2 };

  // Compatibilidad con valores viejos que puedan quedar en el JSON
  const legacyMap = {
    'none': 'nada', 'read': 'solo ver', 'update': 'completo',
    'create': 'completo', 'delete': 'completo'
  };

  const normalizedUser     = legacyMap[userLevel]  || userLevel;
  const normalizedRequired = legacyMap[level]       || level;

  return (hierarchy[normalizedUser] ?? 0) >= (hierarchy[normalizedRequired] ?? 0);
}

async function authenticatedFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, { ...options, headers, credentials: 'include' });

  if (response.status === 401) {
    console.warn('[Auth] Token expirado — redirigiendo a login');
    await logout();
    return response;
  }

  return response;
}

function ensureAuthenticated() {
  if (!isAuthenticated()) {
    window.location.replace('/login.html');
    return false;
  }
  return true;
}

function ensureAdminAccess() {
  const token = getToken();
  const user  = getCurrentUser();

  if (!token) { window.location.replace('/login.html?redirect=admin'); return false; }
  if (!user)  {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.replace('/login.html?redirect=admin');
    return false;
  }
  if (!user.role || (user.role !== 'admin' && user.role !== 'superadmin')) {
    window.location.replace('/index.html?error=access_denied');
    return false;
  }
  return true;
}

function setUserInfo() {
  const user = getCurrentUser();
  if (!user) return;

  const userInfoEl = document.getElementById('user-info');
  if (userInfoEl) {
    userInfoEl.innerHTML = `<span>${user.username}</span><small>${user.role}</small>`;
  }
  const usernameEl = document.getElementById('current-username');
  if (usernameEl) usernameEl.textContent = user.username;
}

function updatePermissionVisibility() {
  const user = getCurrentUser();
  if (!user) return;

  document.querySelectorAll('[data-permission-module]').forEach(el => {
    const module = el.getAttribute('data-permission-module');
    const level  = el.getAttribute('data-permission-level') || 'solo ver';
    el.style.display = hasPermission(module, level) ? '' : 'none';
  });

  document.querySelectorAll('[data-permission-button]').forEach(el => {
    const module = el.getAttribute('data-permission-module');
    const level  = el.getAttribute('data-permission-level') || 'solo ver';
    if (!hasPermission(module, level)) {
      el.disabled = true;
      el.classList.add('disabled');
    }
  });
}
