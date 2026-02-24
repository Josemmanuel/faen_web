// API Base URL
const API_BASE = 'http://localhost:3000/api';
const TOKEN_KEY = 'faen_auth_token';
const USER_KEY = 'faen_auth_user';

// ─── LOGIN ────────────────────────────────────────────────────────────────────
async function login(username, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    credentials: 'include',          // permite que el server setee la cookie httpOnly
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Credenciales inválidas');
  }

  const data = await response.json();   // ← UNA sola lectura del body
  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data;
}

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
async function logout() {
  console.log('[Logout] Iniciando logout...');

  // 1. Avisar al backend para que borre la cookie httpOnly
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',         // necesario para enviar/recibir la cookie
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });
    console.log('[Logout] Cookie borrada en el servidor');
  } catch (e) {
    console.warn('[Logout] No se pudo contactar al servidor, limpiando localmente');
  }

  // 2. Limpiar todo el almacenamiento local
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.clear();

  console.log('[Logout] Storage limpiado, redirigiendo...');
  window.location.replace('/login.html');
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
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

function hasPermission(module, level) {
  const user = getCurrentUser();
  if (!user) return false;
  const userLevel = user.permissions?.[module];
  const hierarchy = { none: 0, read: 1, update: 2, create: 3, delete: 3 };
  return (hierarchy[userLevel] || 0) >= (hierarchy[level] || 0);
}

// Fetch autenticado — redirige al login si recibe 401
async function authenticatedFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, { ...options, headers, credentials: 'include' });

  if (response.status === 401) {
    console.warn('[Auth] Token expirado o inválido — redirigiendo a login');
    await logout();
    return response;
  }

  return response;
}

// ─── GUARDS ───────────────────────────────────────────────────────────────────
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

// ─── UI HELPERS ───────────────────────────────────────────────────────────────
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
    const level  = el.getAttribute('data-permission-level') || 'read';
    el.style.display = hasPermission(module, level) ? '' : 'none';
  });

  document.querySelectorAll('[data-permission-button]').forEach(el => {
    const module = el.getAttribute('data-permission-module');
    const level  = el.getAttribute('data-permission-level') || 'read';
    if (!hasPermission(module, level)) {
      el.disabled = true;
      el.classList.add('disabled');
    }
  });
}