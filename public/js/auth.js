// API Base URL
const API_BASE = 'http://localhost:3000/api';
const TOKEN_KEY = 'faen_auth_token';
const USER_KEY = 'faen_auth_user';

// Funciones de autenticación
async function login(username, password) {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Credenciales inválidas');
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

function logout() {
  // Limpiar tokens del frontend
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem('admin_authenticated'); // Limpiar flag legacy si existe
  sessionStorage.removeItem('admin_user');
  sessionStorage.removeItem('admin_pass');

  // Redirigir a login (no a index)
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

function hasPermission(module, level) {
  const user = getCurrentUser();
  if (!user) return false;

  const userLevel = user.permissions[module];
  const levelHierarchy = { 'none': 0, 'read': 1, 'update': 2, 'create': 3, 'delete': 3 };

  return (levelHierarchy[userLevel] || 0) >= (levelHierarchy[level] || 0);
}

// Hacer fetch con autenticación
async function authenticatedFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Manejar token expirado o inválido
  if (response.status === 401) {
    // Token expirado o inválido
    console.warn('Token expirado - redirigiendo a login');
    logout();
    window.location.href = '/login.html?expired=true';
    return response;
  }

  return response;
}

// Redirigir a login si no está autenticado
function ensureAuthenticated() {
  if (!isAuthenticated()) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

// Validación robusta para acceso a admin
function ensureAdminAccess() {
  const token = getToken();
  const user = getCurrentUser();

  // Validar token existe
  if (!token) {
    window.location.replace('/login.html?redirect=admin');
    return false;
  }

  // Validar usuario existe
  if (!user) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.replace('/login.html?redirect=admin');
    return false;
  }

  // Validar user tiene rol admin (o rol que permita acceso)
  if (!user.role || (user.role !== 'admin' && user.role !== 'superadmin')) {
    window.location.replace('/index.html?error=access_denied');
    return false;
  }

  return true;
}

// Establecer la información del usuario en el UI
function setUserInfo() {
  const user = getCurrentUser();
  if (!user) return;

  const userInfoEl = document.getElementById('user-info');
  if (userInfoEl) {
    userInfoEl.innerHTML = `
      <span>${user.username}</span>
      <small>${user.role}</small>
    `;
  }

  const usernameEl = document.getElementById('current-username');
  if (usernameEl) {
    usernameEl.textContent = user.username;
  }
}

// Actualizar seisibilidad de elementos basado en permisos
function updatePermissionVisibility() {
  const user = getCurrentUser();
  if (!user) return;

  // Ocultar/mostrar secciones basadas en permisos
  document.querySelectorAll('[data-permission-module]').forEach(el => {
    const module = el.getAttribute('data-permission-module');
    const level = el.getAttribute('data-permission-level') || 'read';

    if (hasPermission(module, level)) {
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  });

  // Deshabilitar botones basados en permisos
  document.querySelectorAll('[data-permission-button]').forEach(el => {
    const module = el.getAttribute('data-permission-module');
    const level = el.getAttribute('data-permission-level') || 'read';

    if (!hasPermission(module, level)) {
      el.disabled = true;
      el.classList.add('disabled');
    }
  });
}
