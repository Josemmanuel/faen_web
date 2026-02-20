// Gestión de Usuarios en el Admin Panel

let allUsers = [];
let allRoles = [];
let editingUserId = null;
let editingRoleId = null;
const modules = ['noticias', 'autoridades', 'carreras', 'documentos', 'galeria', 'mensajes', 'config', 'usuarios'];
const permissionLevels = ['create', 'read', 'update', 'delete', 'none'];

// Switch tabs
function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.style.borderBottom = 'none';
    btn.style.color = '#666';
  });

  // Show selected tab
  document.getElementById(tabName).style.display = 'block';
  event.target.style.borderBottom = '3px solid #007bff';
  event.target.style.color = '#007bff';
}

// Cargar usuarios y roles al inicializar
async function loadUsersAndRoles() {
  try {
    // Cargar usuarios
    const usersResponse = await authenticatedFetch(`${API_BASE}/users`);
    if (usersResponse.ok) {
      allUsers = await usersResponse.json();
      renderUsersTable();
    }

    // Cargar roles
    const rolesResponse = await fetch(`${API_BASE}/users/roles`);
    if (rolesResponse.ok) {
      allRoles = await rolesResponse.json();
      populateRoleSelect();
      renderRolesTable();
    }
  } catch (error) {
    console.error('Error cargando usuarios/roles:', error);
  }
}

function renderUsersTable() {
  const tbody = document.getElementById('usuarios-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  allUsers.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>
        <span class="badge ${user.enabled ? 'badge-success' : 'badge-danger'}">
          ${user.enabled ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editUser('${user.id}')">Editar</button>
        <button class="btn btn-sm btn-secondary" onclick="managePermissions('${user.id}')">Permisos</button>
        <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">Eliminar</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function populateRoleSelect() {
  const select = document.getElementById('user-role');
  if (!select) return;

  select.innerHTML = '';
  allRoles.forEach(role => {
    const option = document.createElement('option');
    option.value = role.name;
    option.textContent = role.description;
    select.appendChild(option);
  });
}

async function createUser(e) {
  if (e) e.preventDefault();

  const username = document.getElementById('user-username').value.trim();
  const email = document.getElementById('user-email').value.trim();
  const password = document.getElementById('user-password').value.trim();
  const role = document.getElementById('user-role').value;

  if (!username || !email || !password || !role) {
    alert('Por favor completa todos los campos');
    return;
  }

  try {
    const response = await authenticatedFetch(`${API_BASE}/users`, {
      method: 'POST',
      body: JSON.stringify({ username, email, password, role }),
    });

    if (response.ok) {
      alert('Usuario creado exitosamente');
      closeUserModal();
      loadUsersAndRoles();
    } else {
      const error = await response.json();
      alert('Error: ' + (error.message || 'No se pudo crear el usuario'));
    }
  } catch (error) {
    console.error('Error creando usuario:', error);
    alert('Error al crear el usuario');
  }
}

async function editUser(userId) {
  editingUserId = userId;
  const user = allUsers.find(u => u.id === userId);

  if (!user) return;

  document.getElementById('user-username').value = user.username;
  document.getElementById('user-username').disabled = true;
  document.getElementById('user-email').value = user.email;
  document.getElementById('user-password').value = '';
  document.getElementById('user-password').placeholder = 'Dejar vacío para no cambiar contraseña';
  document.getElementById('user-role').value = user.role;

  const modal = document.getElementById('modal-usuario');
  const title = document.getElementById('modal-titulo-usuario');
  title.textContent = `Editar Usuario: ${user.username}`;

  const form = document.getElementById('user-form');
  form.onsubmit = async (e) => {
    e.preventDefault();

    const email = document.getElementById('user-email').value.trim();
    const password = document.getElementById('user-password').value.trim();
    const role = document.getElementById('user-role').value;
    const enabled = document.getElementById('user-enabled').checked;

    try {
      const body = { email, role, enabled };
      if (password) body.password = password;

      const response = await authenticatedFetch(`${API_BASE}/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });

      if (response.ok) {
        alert('Usuario actualizado exitosamente');
        closeUserModal();
        loadUsersAndRoles();
      } else {
        const error = await response.json();
        alert('Error: ' + (error.message || 'No se pudo actualizar el usuario'));
      }
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      alert('Error al actualizar el usuario');
    }
  };

  modal.style.display = 'block';
}

async function deleteUser(userId) {
  if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
    return;
  }

  try {
    const response = await authenticatedFetch(`${API_BASE}/users/${userId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      alert('Usuario eliminado exitosamente');
      loadUsersAndRoles();
    } else {
      const error = await response.json();
      alert('Error: ' + (error.message || 'No se pudo eliminar el usuario'));
    }
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    alert('Error al eliminar el usuario');
  }
}

async function managePermissions(userId) {
  const user = allUsers.find(u => u.id === userId);
  if (!user) return;

  const modules = ['noticias', 'autoridades', 'carreras', 'documentos', 'galeria', 'mensajes', 'config', 'usuarios'];
  const levels = ['create', 'read', 'update', 'delete', 'none'];

  let html = `<div style="max-height: 400px; overflow-y: auto;">
    <h4>Permisos de ${user.username}</h4>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #f5f5f5;">
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Módulo</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Permiso</th>
        </tr>
      </thead>
      <tbody>`;

  modules.forEach(module => {
    const currentLevel = user.permissions[module] || 'none';
    html += `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${module}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">
          <select id="perm-${module}" value="${currentLevel}">
            ${levels.map(level => `<option value="${level}" ${currentLevel === level ? 'selected' : ''}>${level}</option>`).join('')}
          </select>
        </td>
      </tr>`;
  });

  html += `
      </tbody>
    </table>
    <div style="margin-top: 20px; text-align: right;">
      <button onclick="savePermissions('${userId}', ${JSON.stringify(modules)})" class="btn btn-primary">Guardar Permisos</button>
    </div>
  </div>`;

  const modal = document.getElementById('modal-permisos');
  if (!modal) {
    const newModal = document.createElement('div');
    newModal.id = 'modal-permisos';
    newModal.className = 'modal';
    newModal.innerHTML = `
      <div class="modal-content" style="width: 600px;">
        <div class="modal-header">
          <h3>Gestionar Permisos</h3>
          <button class="modal-close" onclick="document.getElementById('modal-permisos').style.display='none'">&times;</button>
        </div>
        <div id="permisos-content"></div>
      </div>
    `;
    document.body.appendChild(newModal);
  }

  document.getElementById('permisos-content').innerHTML = html;
  document.getElementById('modal-permisos').style.display = 'block';
}

async function savePermissions(userId, modules) {
  try {
    for (const module of modules) {
      const permission = document.getElementById(`perm-${module}`).value;

      const response = await authenticatedFetch(`${API_BASE}/users/${userId}/permissions`, {
        method: 'POST',
        body: JSON.stringify({ module, permission }),
      });

      if (!response.ok) {
        throw new Error(`Error actualizando permisos para ${module}`);
      }
    }

    alert('Permisos actualizados exitosamente');
    document.getElementById('modal-permisos').style.display = 'none';
    loadUsersAndRoles();
  } catch (error) {
    console.error('Error guardando permisos:', error);
    alert('Error al guardar permisos');
  }
}

function openUserModal() {
  editingUserId = null;
  document.getElementById('user-username').disabled = false;
  document.getElementById('user-username').value = '';
  document.getElementById('user-email').value = '';
  document.getElementById('user-password').value = '';
  document.getElementById('user-password').placeholder = 'Contraseña (requerida)';
  document.getElementById('user-role').value = 'viewer';
  document.getElementById('user-enabled').checked = true;

  const modal = document.getElementById('modal-usuario');
  const title = document.getElementById('modal-titulo-usuario');
  title.textContent = 'Nuevo Usuario';

  const form = document.getElementById('user-form');
  form.onsubmit = createUser;

  modal.style.display = 'block';
}

function closeUserModal() {
  document.getElementById('modal-usuario').style.display = 'none';
  editingUserId = null;
}

// FUNCIONES DE ROLES

function renderRolesTable() {
  const tbody = document.getElementById('roles-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  allRoles.forEach(role => {
    const row = document.createElement('tr');
    const isSystemRole = ['admin', 'editor', 'moderador', 'viewer'].includes(role.name);
    row.innerHTML = `
      <td>${role.name}</td>
      <td>${role.description}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editRole('${role.id}')">Editar</button>
        ${!isSystemRole ? `<button class="btn btn-sm btn-danger" onclick="deleteRole('${role.id}')">Eliminar</button>` : '<span style="color: #999; font-size: 0.9em;">Sistema</span>'}
      </td>
    `;
    tbody.appendChild(row);
  });
}

function renderRolePermissions(role) {
  const container = document.getElementById('role-permissions-container');
  if (!container) return;

  container.innerHTML = '';
  modules.forEach(module => {
    const currentLevel = role ? (role.default_permissions[module] || 'none') : 'none';
    const div = document.createElement('div');
    div.style.padding = '10px';
    div.style.border = '1px solid #ddd';
    div.style.borderRadius = '4px';
    div.innerHTML = `
      <label style="display: block; margin-bottom: 8px; font-weight: bold; font-size: 0.9em;">${module}</label>
      <select id="role-perm-${module}" style="width: 100%; padding: 6px;">
        ${permissionLevels.map(level => `<option value="${level}" ${currentLevel === level ? 'selected' : ''}>${level}</option>`).join('')}
      </select>
    `;
    container.appendChild(div);
  });
}

async function createRole(e) {
  if (e) e.preventDefault();

  const name = document.getElementById('role-name').value.trim();
  const description = document.getElementById('role-description').value.trim();

  if (!name || !description) {
    alert('Por favor completa todos los campos');
    return;
  }

  // Recolectar permisos
  const default_permissions = {};
  modules.forEach(module => {
    default_permissions[module] = document.getElementById(`role-perm-${module}`).value;
  });

  try {
    const response = await authenticatedFetch(`${API_BASE}/users/roles`, {
      method: 'POST',
      body: JSON.stringify({ name, description, default_permissions }),
    });

    if (response.ok) {
      alert('Rol creado exitosamente');
      closeRoleModal();
      loadUsersAndRoles();
    } else {
      const error = await response.json();
      alert('Error: ' + (error.error || error.message || 'No se pudo crear el rol'));
    }
  } catch (error) {
    console.error('Error creando rol:', error);
    alert('Error al crear el rol');
  }
}

async function editRole(roleId) {
  editingRoleId = roleId;
  const role = allRoles.find(r => r.id === roleId);

  if (!role) return;

  document.getElementById('role-name').value = role.name;
  document.getElementById('role-name').disabled = ['admin', 'editor', 'moderador', 'viewer'].includes(role.name);
  document.getElementById('role-description').value = role.description;
  document.getElementById('role-description').disabled = ['admin', 'editor', 'moderador', 'viewer'].includes(role.name);

  renderRolePermissions(role);

  const modal = document.getElementById('modal-rol');
  const title = document.getElementById('modal-titulo-rol');
  title.textContent = `Editar Rol: ${role.name}`;

  const form = document.getElementById('role-form');
  form.onsubmit = async (e) => {
    e.preventDefault();

    const description = document.getElementById('role-description').value.trim();
    const default_permissions = {};
    modules.forEach(module => {
      default_permissions[module] = document.getElementById(`role-perm-${module}`).value;
    });

    try {
      const response = await authenticatedFetch(`${API_BASE}/users/roles/${roleId}`, {
        method: 'PUT',
        body: JSON.stringify({ description, default_permissions }),
      });

      if (response.ok) {
        alert('Rol actualizado exitosamente');
        closeRoleModal();
        loadUsersAndRoles();
      } else {
        const error = await response.json();
        alert('Error: ' + (error.error || error.message || 'No se pudo actualizar el rol'));
      }
    } catch (error) {
      console.error('Error actualizando rol:', error);
      alert('Error al actualizar el rol');
    }
  };

  modal.style.display = 'block';
}

async function deleteRole(roleId) {
  if (!confirm('¿Estás seguro de que deseas eliminar este rol?')) {
    return;
  }

  try {
    const response = await authenticatedFetch(`${API_BASE}/users/roles/${roleId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      alert('Rol eliminado exitosamente');
      loadUsersAndRoles();
    } else {
      const error = await response.json();
      alert('Error: ' + (error.error || error.message || 'No se pudo eliminar el rol'));
    }
  } catch (error) {
    console.error('Error eliminando rol:', error);
    alert('Error al eliminar el rol');
  }
}

function openRoleModal() {
  editingRoleId = null;
  document.getElementById('role-name').disabled = false;
  document.getElementById('role-name').value = '';
  document.getElementById('role-description').disabled = false;
  document.getElementById('role-description').value = '';

  renderRolePermissions(null);

  const modal = document.getElementById('modal-rol');
  const title = document.getElementById('modal-titulo-rol');
  title.textContent = 'Nuevo Rol';

  const form = document.getElementById('role-form');
  form.onsubmit = createRole;

  modal.style.display = 'block';
}

function closeRoleModal() {
  document.getElementById('modal-rol').style.display = 'none';
  editingRoleId = null;
}
window.onclick = function(event) {
  const modal = document.getElementById('modal-usuario');
  if (event.target === modal) {
    modal.style.display = 'none';
  }

  const permModal = document.getElementById('modal-permisos');
  if (permModal && event.target === permModal) {
    permModal.style.display = 'none';
  }

  const roleModal = document.getElementById('modal-rol');
  if (roleModal && event.target === roleModal) {
    roleModal.style.display = 'none';
  }
};

// Inicializar cuando se carga la página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadUsersAndRoles);
} else {
  loadUsersAndRoles();
}
