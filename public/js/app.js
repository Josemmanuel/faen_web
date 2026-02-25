/* ========================================
   FAEN ADMIN PANEL - MAIN JAVASCRIPT FILE
   Clean, Independent Implementation
   ======================================== */

// ===== GLOBAL CONFIGURATION =====
const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutos
let editingId = null;
let editingCarreraId = null;
let editingAutoridadId = null;
let editingDocId = null;
let currentMensajeId = null;
let currentSlide = 0;
let carouselPhotos = [];

// ===== UTILITY FUNCTIONS =====
function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function makeExcerpt(text, max) {
    if (!text) return '';
    if (text.length <= max) return text;
    return text.slice(0, max).trim() + '...';
}

function getAuthHeaders() {
    // CAMBIO: Ahora usamos el token de localStorage
    const token = localStorage.getItem('faen_auth_token');
    return {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
    };
}


function updateSessionActivity() {
    sessionStorage.setItem('admin_last_activity', Date.now().toString());
}

function startSessionTimer() {
    const lastActivityKey = 'admin_last_activity';
    sessionStorage.setItem(lastActivityKey, Date.now().toString());

    const checkSession = setInterval(() => {
        const lastActivity = sessionStorage.getItem(lastActivityKey);
        if (!lastActivity) {
            clearInterval(checkSession);
            return;
        }

        const elapsed = Date.now() - parseInt(lastActivity);
        if (elapsed > SESSION_TIMEOUT) {
            logoutSession();
            clearInterval(checkSession);
        } else {
            updateSessionTimer(elapsed);
        }
    }, 10000);
}

function updateSessionTimer(elapsed) {
    // Timer silencioso — sin mostrar nada en pantalla
}

function logoutSession() {
    sessionStorage.removeItem('admin_user');
    sessionStorage.removeItem('admin_pass');
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('admin_last_activity');
    localStorage.removeItem('faen_auth_token');
    localStorage.removeItem('faen_auth_user');
    window.location.replace('/login.html?expired=true');
}

function showLoginModal() {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'login-modal-overlay';
        modal.innerHTML = '<div class="login-modal-box"><h2>Acceso al Panel de Administración</h2><form id="login-form"><div class="form-group"><label for="login-user">Usuario:</label><input type="text" id="login-user" placeholder="admin" required></div><div class="form-group"><label for="login-pass">Contraseña:</label><input type="password" id="login-pass" placeholder="••••" required></div><button type="submit" class="login-btn">Entrar</button><button type="button" class="login-cancel-btn">Cancelar</button></form></div>';
        document.body.appendChild(modal);

        const form = modal.querySelector('#login-form');
        const cancelBtn = modal.querySelector('.login-cancel-btn');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = modal.querySelector('#login-user').value;
            const pass = modal.querySelector('#login-pass').value;
            modal.remove();
            resolve({ user: user, pass: pass });
        });

        cancelBtn.addEventListener('click', () => {
            modal.remove();
            resolve(null);
        });
    });
}

function createLogoutButton() {
    const header = document.querySelector('header');
    if (!header) return;

    let logoutContainer = document.getElementById('logout-container');
    if (!logoutContainer) {
        logoutContainer = document.createElement('div');
        logoutContainer.id = 'logout-container';
        logoutContainer.style.position = 'absolute';
        logoutContainer.style.top = '10px';
        logoutContainer.style.right = '20px';
        header.style.position = 'relative';
        header.appendChild(logoutContainer);
    }

    const button = document.createElement('button');
    button.id = 'logout-btn';
    button.textContent = 'Cerrar sesión';
    button.style.padding = '8px 15px';
    button.style.backgroundColor = '#d32f2f';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.style.fontSize = '14px';

    button.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('¿Deseas cerrar sesión?')) {
            logoutSession();
        }
    });

    logoutContainer.innerHTML = '';
    logoutContainer.appendChild(button);
}

/* ==========================================
   CAROUSEL FUNCTIONS (Lógica Pública)
   ========================================== */

// 1. Variables Globales (Vitales para que next/prev funcionen)
let carouselInterval;

async function loadCarousel() {
    const carouselContainer = document.getElementById('carousel-container');
    const carouselTrack = document.getElementById('carousel-track');
    const carouselDots = document.getElementById('carousel-dots');

    if (!carouselContainer || !carouselTrack) return;

    try {
        const res = await fetch('/api/galeria');
        const photos = await res.json();

        if (!photos || photos.length === 0) {
            carouselContainer.style.display = 'none';
            return;
        }

        carouselPhotos = photos; // Guardamos en la variable global
        carouselTrack.innerHTML = '';
        carouselDots.innerHTML = '';

        photos.forEach((photo, index) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';

            // Normalización de ruta para evitar el error 404 en el Index
            let src = photo.ruta || photo.url || '';
            if (src && !src.startsWith('/') && !src.startsWith('http')) {
                src = '/' + src;
            }

            slide.innerHTML =
                '<img src="' + src + '?v=' + Date.now() + '" alt="' + escapeHtml(photo.titulo) + '">' +
                '<div class="carousel-slide-overlay">' +
                '<div class="carousel-slide-title">' + escapeHtml(photo.titulo) + '</div>' +
                '<p class="carousel-slide-date">' + escapeHtml(photo.fecha) + '</p>' +
                '</div>';
            carouselTrack.appendChild(slide);

            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
            dot.onclick = () => goToSlide(index);
            carouselDots.appendChild(dot);
        });

        currentSlide = 0;
        updateCarouselPosition();
        startAutoPlay();

    } catch (error) {
        console.error('Error cargando carrusel:', error);
    }
}

// 2. Funciones de Movimiento (Las que llaman tus botones onclick)
function updateCarouselPosition() {
    const track = document.getElementById('carousel-track');
    if (track) {
        track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
    }

    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function nextSlide() {
    if (carouselPhotos.length > 0) {
        currentSlide = (currentSlide + 1) % carouselPhotos.length;
        updateCarouselPosition();
    }
}

function previousSlide() {
    if (carouselPhotos.length > 0) {
        currentSlide = (currentSlide - 1 + carouselPhotos.length) % carouselPhotos.length;
        updateCarouselPosition();
    }
}

function goToSlide(index) {
    currentSlide = index;
    updateCarouselPosition();
    startAutoPlay(); // Reinicia el tiempo si el usuario hace clic manual
}

function startAutoPlay() {
    if (carouselInterval) clearInterval(carouselInterval);
    carouselInterval = setInterval(nextSlide, 5000);
}

// 3. LA LLAMADA INICIAL (Esto es lo que faltaba para que "lo haga")
document.addEventListener('DOMContentLoaded', loadCarousel);

// ===== NEWS FUNCTIONS =====
async function loadNews() {
    const newsList = document.getElementById('news-list');
    if (!newsList) return;

    newsList.innerHTML = '<p>Cargando noticias...</p>';

    try {
        const res = await fetch('/api/news');
        if (!res.ok) throw new Error('HTTP error');
        const newsData = await res.json();

        if (!newsData || newsData.length === 0) {
            newsList.innerHTML = '<p>No hay noticias publicadas.</p>';
            return;
        }

        newsList.innerHTML = '';

        newsData.slice().reverse().forEach(news => {
            const card = document.createElement('article');
            card.className = 'news-card';

            const imageSrc = news.image || '';
            const newsId = encodeURIComponent(news.id);
            const newsTitle = escapeHtml(news.title);
            const newsDate = escapeHtml(news.date);
            const excerpt = makeExcerpt(news.description, 220);
            const newsExcerpt = escapeHtml(excerpt);

            let htmlContent = '';

            if (imageSrc) {
                htmlContent = '<a href="news.html?id=' + newsId + '"><img src="' + imageSrc + '" alt="' + newsTitle + '"></a>';
            }

            htmlContent += '<div class="news-content">';
            htmlContent += '<div><a class="badge" href="news.html?id=' + newsId + '">NOTICIA</a></div>';
            htmlContent += '<h3><a href="news.html?id=' + newsId + '">' + newsTitle + '</a></h3>';
            htmlContent += '<div class="news-meta">Publicado: ' + newsDate + '</div>';
            htmlContent += '<p class="excerpt">' + newsExcerpt + '</p>';
            htmlContent += '</div>';

            card.innerHTML = htmlContent;
            newsList.appendChild(card);
        });
    } catch (error) {
        console.error('Error al cargar noticias:', error);
        newsList.innerHTML = '<p>Error al cargar noticias: ' + error.message + '</p>';
    }
}

async function loadPreinscripcionConfig() {
    try {
        const res = await fetch('/api/config/preinscripcion');
        if (!res.ok) {
            console.log('No config found');
            return;
        }

        const config = await res.json();
        const preinscripcionItem = document.getElementById('preinscripcion-item');
        const preinscripcionLink = document.getElementById('preinscripcion-link');

        if (preinscripcionItem && preinscripcionLink) {
            if (config.enabled) {
                preinscripcionItem.style.display = 'block';
                preinscripcionLink.href = config.url || 'https://guarani.unf.edu.ar/preinscripcion/unaf/?__o=';
            } else {
                preinscripcionItem.style.display = 'none';
            }
        }
    } catch (error) {
        console.log('Error loading preinscripcion config:', error);
    }
}

async function loadClaustrosInDropdown() {
    try {
        const res = await fetch('/api/config/claustros');
        if (!res.ok) {
            console.log('No claustros found');
            return;
        }

        const claustros = await res.json();
        const claustroDropdown = document.getElementById('claustro-dropdown');

        if (!claustroDropdown) {
            console.log('claustro-dropdown element not found');
            return;
        }

        // Obtener configuración de preinscripción
        let preinscripcionConfig = {};
        try {
            const configRes = await fetch('/api/config/preinscripcion');
            if (configRes.ok) {
                preinscripcionConfig = await configRes.json();
            }
        } catch (e) {
            console.log('Error loading preinscripcion config');
        }

        // Limpiar el dropdown
        claustroDropdown.innerHTML = '';

        console.log('Claustros cargados:', claustros);

        // Agregar cada claustro como un submenú
        if (claustros && claustros.length > 0) {
            claustros.forEach((claustro, index) => {
                const li = document.createElement('li');
                li.className = 'dropdown-claustro';
                li.dataset.claustroId = claustro.id;

                // Filtrar enlaces según configuración
                let visibleLinks = claustro.links ? claustro.links.filter(link => {
                    if (link.conditional === 'preinscripcion') {
                        return preinscripcionConfig.enabled === true;
                    }
                    return true;
                }) : [];

                console.log(`Claustro ${claustro.name}: ${visibleLinks.length} enlaces visibles`);

                if (visibleLinks && visibleLinks.length > 0) {
                    // Si tiene enlaces, crear un submenú
                    const toggle = document.createElement('a');
                    toggle.href = '#';
                    toggle.className = 'dropdown-claustro-toggle';
                    toggle.innerHTML = `${escapeHtml(claustro.icon)} ${escapeHtml(claustro.name)} <span class="dropdown-arrow">▶</span>`;

                    toggle.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Click en claustro:', claustro.name);
                        li.classList.toggle('active');
                    });

                    li.appendChild(toggle);

                    const subMenu = document.createElement('ul');
                    subMenu.className = 'dropdown-submenu';

                    visibleLinks.forEach(link => {
                        const subLi = document.createElement('li');
                        const linkElement = document.createElement('a');
                        linkElement.href = escapeHtml(link.url);
                        linkElement.target = '_blank';
                        linkElement.rel = 'noopener';
                        linkElement.innerHTML = `<span class="nav-icon">${escapeHtml(link.icon)}</span> ${escapeHtml(link.title)}`;

                        linkElement.addEventListener('click', function () {
                            setTimeout(() => {
                                li.classList.remove('active');
                            }, 100);
                        });

                        subLi.appendChild(linkElement);
                        subMenu.appendChild(subLi);
                    });

                    li.appendChild(subMenu);
                } else {
                    // Si no tiene enlaces, solo mostrar el texto deshabilitado
                    const disabledLink = document.createElement('a');
                    disabledLink.href = '#';
                    disabledLink.className = 'disabled';
                    disabledLink.innerHTML = `${escapeHtml(claustro.icon)} ${escapeHtml(claustro.name)} (sin enlaces)`;
                    disabledLink.addEventListener('click', function (e) {
                        e.preventDefault();
                    });
                    li.appendChild(disabledLink);
                }

                claustroDropdown.appendChild(li);
            });
        }
    } catch (error) {
        console.log('Error loading claustros:', error);
    }
}

async function loadConfigPage() {
    const preinscripcionEnabled = document.getElementById('config-preinscripcion-enabled');
    const preinscripcionUrl = document.getElementById('config-preinscripcion-url');

    if (!preinscripcionEnabled || !preinscripcionUrl) return;

    // Cargar configuracion de preinscripcion
    try {
        const res = await fetch('/api/config/preinscripcion', {
            headers: getAuthHeaders()
        });
        if (res.ok) {
            const config = await res.json();
            preinscripcionEnabled.checked = config.enabled || false;
            preinscripcionUrl.value = config.url || 'https://guarani.unf.edu.ar/preinscripcion/unaf/?__o=';
        }
    } catch (error) {
        console.error('Error loading config:', error);
    }

    // Poblar el select de claustros desde la API
    const claustroSelect = document.getElementById('claustro-select');
    if (claustroSelect) {
        try {
            const resClaustros = await fetch('/api/config/claustros');
            if (resClaustros.ok) {
                const claustros = await resClaustros.json();
                claustroSelect.innerHTML = '<option value="">-- Selecciona un claustro --</option>';
                claustros.forEach(function(claustro) {
                    const option = document.createElement('option');
                    option.value = claustro.id;
                    option.textContent = claustro.icon + ' ' + claustro.name;
                    claustroSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error cargando claustros en select:', error);
        }

        // Registrar listener del select (remover el anterior para evitar duplicados)
        const newSelect = claustroSelect.cloneNode(true);
        claustroSelect.parentNode.replaceChild(newSelect, claustroSelect);

        // Re-poblar el nuevo nodo (cloneNode no hereda los options recién agregados)
        try {
            const resClaustros2 = await fetch('/api/config/claustros');
            if (resClaustros2.ok) {
                const claustros2 = await resClaustros2.json();
                newSelect.innerHTML = '<option value="">-- Selecciona un claustro --</option>';
                claustros2.forEach(function(claustro) {
                    const option = document.createElement('option');
                    option.value = claustro.id;
                    option.textContent = claustro.icon + ' ' + claustro.name;
                    newSelect.appendChild(option);
                });
            }
        } catch (e) {}

        newSelect.addEventListener('change', async function(e) {
            const claustroId = e.target.value;
            const formContainer = document.getElementById('claustro-form-container');
            const linksContainer = document.getElementById('claustro-links-container');

            if (!claustroId) {
                if (formContainer) formContainer.style.display = 'none';
                if (linksContainer) linksContainer.style.display = 'none';
                return;
            }

            const nombreEl = document.getElementById('claustro-nombre');
            const nombreDisplayEl = document.getElementById('claustro-nombre-display');
            const claustroNombre = newSelect.options[newSelect.selectedIndex].text;
            if (nombreEl) nombreEl.textContent = claustroNombre;
            if (nombreDisplayEl) nombreDisplayEl.textContent = claustroNombre;

            if (formContainer) formContainer.style.display = 'block';
            if (linksContainer) linksContainer.style.display = 'block';

            const titleInput = document.getElementById('claustro-link-title');
            const urlInput = document.getElementById('claustro-link-url');
            const iconInput = document.getElementById('claustro-link-icon');
            if (titleInput) titleInput.value = '';
            if (urlInput) urlInput.value = '';
            if (iconInput) iconInput.value = '';

            await window.loadClaustroLinks(claustroId);
        });
    }

    // Registrar listener del boton agregar (remover anterior para evitar duplicados)
    const btnAgregarOld = document.getElementById('btn-agregar-claustro-link');
    if (btnAgregarOld) {
        const btnAgregar = btnAgregarOld.cloneNode(true);
        btnAgregarOld.parentNode.replaceChild(btnAgregar, btnAgregarOld);

        btnAgregar.addEventListener('click', async function(e) {
            e.preventDefault();
            const select = document.getElementById('claustro-select');
            const claustroId = select ? select.value : '';
            if (!claustroId) {
                alert('Por favor selecciona un claustro');
                return;
            }

            const title = document.getElementById('claustro-link-title').value.trim();
            const url = document.getElementById('claustro-link-url').value.trim();
            const icon = document.getElementById('claustro-link-icon').value.trim() || '🔗';

            if (!title || !url) {
                alert('Por favor completa todos los campos requeridos');
                return;
            }

            try {
                const res = await fetch('/api/config/claustros/' + claustroId + '/links', {
                    method: 'POST',
                    headers: Object.assign({ 'Content-Type': 'application/json' }, getAuthHeaders()),
                    body: JSON.stringify({ title: title, url: url, icon: icon })
                });

                if (res.ok) {
                    alert('Enlace agregado correctamente');
                    document.getElementById('claustro-link-title').value = '';
                    document.getElementById('claustro-link-url').value = '';
                    document.getElementById('claustro-link-icon').value = '';
                    await window.loadClaustroLinks(claustroId);
                    await loadClaustrosInDropdown();
                } else {
                    alert('Error al agregar el enlace');
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });
    }
}

// Cargar enlaces de un claustro - global para poder llamarse desde onclick
window.loadClaustroLinks = async function(claustroId) {
    try {
        const res = await fetch('/api/config/claustros/' + claustroId, {
            headers: getAuthHeaders()
        });
        const claustro = await res.json();
        const linksList = document.getElementById('claustro-links-list');
        if (!linksList) return;

        linksList.innerHTML = '';

        if (!claustro || !claustro.links || claustro.links.length === 0) {
            linksList.innerHTML = '<p style="color: #999;">No hay enlaces configurados para este claustro</p>';
            return;
        }

        claustro.links.forEach(function(link) {
            const item = document.createElement('div');
            item.className = 'student-link-item';
            item.innerHTML =
                '<span class="student-link-icon">' + escapeHtml(link.icon) + '</span>' +
                '<div class="student-link-content">' +
                    '<h5>' + escapeHtml(link.title) + '</h5>' +
                    '<a href="' + escapeHtml(link.url) + '" target="_blank" rel="noopener">' + escapeHtml(link.url) + '</a>' +
                '</div>' +
                '<div class="student-link-actions">' +
                    '<button class="btn btn-edit" onclick="window.editClaustroLink(\'' + claustroId + '\', \'' + link.id + '\', \'' + escapeHtml(link.title).replace(/'/g, "\\'") + '\', \'' + escapeHtml(link.url).replace(/'/g, "\\'") + '\', \'' + escapeHtml(link.icon) + '\')">✏️ Editar</button>' +
                    '<button class="btn btn-danger" onclick="window.deleteClaustroLink(\'' + claustroId + '\', \'' + link.id + '\')">🗑️ Eliminar</button>' +
                '</div>';
            linksList.appendChild(item);
        });
    } catch (error) {
        console.error('Error cargando enlaces de claustro:', error);
    }
};

window.editClaustroLink = async function(claustroId, linkId, title, url, icon) {
    const newTitle = prompt('Nombre del enlace:', decodeURIComponent(title));
    if (!newTitle) return;
    const newUrl = prompt('URL:', decodeURIComponent(url));
    if (!newUrl) return;
    const newIcon = prompt('Emoji/Icono:', decodeURIComponent(icon)) || '🔗';

    try {
        const res = await fetch('/api/config/claustros/' + claustroId + '/links/' + linkId, {
            method: 'PUT',
            headers: Object.assign({ 'Content-Type': 'application/json' }, getAuthHeaders()),
            body: JSON.stringify({ title: newTitle, url: newUrl, icon: newIcon })
        });
        if (res.ok) {
            alert('Enlace actualizado correctamente');
            await window.loadClaustroLinks(claustroId);
            await loadClaustrosInDropdown();
        } else {
            alert('Error al actualizar el enlace');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
};

window.deleteClaustroLink = async function(claustroId, linkId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este enlace?')) return;
    try {
        const res = await fetch('/api/config/claustros/' + claustroId + '/links/' + linkId, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (res.ok) {
            alert('Enlace eliminado correctamente');
            await window.loadClaustroLinks(claustroId);
            await loadClaustrosInDropdown();
        } else {
            alert('Error al eliminar el enlace');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
};

async function loadAdminNews() {
    const adminList = document.getElementById('admin-news-list');
    if (!adminList) return;

    try {
        const res = await fetch('/api/news');
        const data = await res.json();

        adminList.innerHTML = '';

        if (!data || data.length === 0) {
            adminList.innerHTML = '<tr><td colspan="5" class="text-center">No hay noticias publicadas aún</td></tr>';
            return;
        }

        data.slice().reverse().forEach(news => {
            const row = document.createElement('tr');

            const imageSrc = news.image || '';
            let imageCell = '<td>';
            if (imageSrc) {
                imageCell += '<img src="' + imageSrc + '" alt="' + escapeHtml(news.title) + '" class="tabla-imagen">';
            } else {
                imageCell += '<div class="tabla-imagen no-image">📷</div>';
            }
            imageCell += '</td>';

            const title = escapeHtml(news.title);
            const description = escapeHtml(news.description || '');
            const date = escapeHtml(news.date);

            row.innerHTML = imageCell +
                '<td><div class="tabla-titulo">' + title + '</div></td>' +
                '<td>' + date + '</td>' +
                '<td><div class="tabla-descripcion">' + description + '</div></td>' +
                '<td><div class="tabla-acciones">' +
                '<button class="btn btn-edit edit-btn" data-id="' + news.id + '">✏️ Editar</button>' +
                '<button class="btn btn-danger delete-btn" data-id="' + news.id + '">🗑️ Eliminar</button>' +
                '</div></td>';

            adminList.appendChild(row);
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const id = e.target.dataset.id;
                await editNews(id);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const id = e.target.dataset.id;
                await deleteNews(id);
            });
        });

    } catch (err) {
        console.error('Error cargando noticias:', err);
        adminList.innerHTML = '<tr><td colspan="5" class="text-center">Error cargando noticias</td></tr>';
    }
}

async function editNews(id) {
    try {
        const res = await fetch('/api/news');
        const all = await res.json();
        const news = all.find(x => x.id === id);

        if (!news) {
            alert('Noticia no encontrada');
            return;
        }

        document.getElementById('news-title').value = news.title;
        document.getElementById('news-description').value = news.description || '';
        document.getElementById('news-date').value = news.date;
        document.getElementById('modal-titulo').textContent = 'Editar Noticia';

        if (news.image) {
            const imagePreview = document.getElementById('image-preview');
            imagePreview.innerHTML = '<img src="' + news.image + '" alt="Preview">';
            document.getElementById('file-name').textContent = 'Imagen actual';
        }

        editingId = id;
        const modal = document.getElementById('modal-noticia');
        modal.classList.add('active');
    } catch (err) {
        alert('Error cargando noticia: ' + err.message);
    }
}

async function deleteNews(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta noticia?')) {
        return;
    }

    try {
        const res = await fetch('/api/news/' + id, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (res.ok) {
            alert('Noticia eliminada correctamente');
            await loadAdminNews();
        } else {
            const err = await res.json().catch(() => null);
            alert('Error al eliminar: ' + (err && err.error ? err.error : res.statusText));
        }
    } catch (error) {
        alert('Error al eliminar la noticia: ' + error.message);
    }
}

// ===== GALLERY FUNCTIONS =====
async function loadGaleria() {
    const galeriaGrid = document.getElementById('galeria-grid');
    if (!galeriaGrid) return;

    galeriaGrid.innerHTML = '<p class="text-center" style="grid-column: 1 / -1;">Cargando fotos...</p>';

    try {
        const res = await fetch('/api/galeria');
        const fotos = await res.json();

        galeriaGrid.innerHTML = '';

        if (!fotos || fotos.length === 0) {
            galeriaGrid.innerHTML = '<p class="text-center" style="grid-column: 1 / -1;">No hay fotos aún. ¡Sube la primera!</p>';
            return;
        }

        fotos.forEach(foto => {
            const item = document.createElement('div');
            item.className = 'galeria-item';

            // --- LÓGICA DE RUTA ABSOLUTA ---
            // Usamos 'foto.ruta' o 'foto.url' según lo que envíe tu backend.
            // Si el backend envía "uploads/archivo.jpg", le ponemos la "/" inicial.
            let src = foto.ruta || foto.url || '';
            if (src && !src.startsWith('/') && !src.startsWith('http')) {
                src = '/' + src;
            }

            const titulo = escapeHtml(foto.titulo || 'Sin título');
            const fecha = escapeHtml(foto.fecha || '');

            item.innerHTML = '<div class="galeria-img-wrapper">' +
                '<img src="' + src + '?v=' + Date.now() + '" alt="' + titulo + '" class="galeria-img" onerror="this.src=\'/uploads/default-image.png\'">' +
                '<div class="galeria-overlay">' +
                // Usamos span pointer-events:none para que el clic siempre caiga en el botón, no en el emoji
                '<button class="btn-galeria-delete" data-id="' + foto.id + '"><span style="pointer-events:none">🗑️</span> Eliminar</button>' +
                '</div>' +
                '</div>' +
                '<div class="galeria-info">' +
                '<p class="galeria-titulo">' + titulo + '</p>' +
                '<p class="galeria-fecha">' + fecha + '</p>' +
                '</div>';
            galeriaGrid.appendChild(item);
        });

        // Eventos con currentTarget para mayor seguridad
        document.querySelectorAll('.btn-galeria-delete').forEach(btn => {
            btn.onclick = async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                await deleteFoto(id);
            };
        });

    } catch (err) {
        console.error('Error cargando galería:', err);
        galeriaGrid.innerHTML = '<p class="text-center" style="grid-column: 1 / -1;">Error cargando fotos</p>';
    }
}

async function deleteFoto(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta foto permanentemente?')) {
        return;
    }

    try {
        const res = await fetch('/api/galeria/' + id, {
            method: 'DELETE',
            headers: typeof getAuthHeaders === 'function' ? getAuthHeaders() : {}
        });

        if (res.ok) {
            alert('Foto eliminada correctamente');
            await loadGaleria();
        } else {
            const error = await res.json().catch(() => ({}));
            alert('Error al eliminar: ' + (error.message || 'No se pudo borrar el archivo'));
        }
    } catch (error) {
        alert('Error de conexión: ' + error.message);
    }
}

// ===== CARRERAS FUNCTIONS =====
async function loadAdminCarreras() {
    const adminCarrerasList = document.getElementById('admin-carreras-list');
    if (!adminCarrerasList) return;

    try {
        const res = await fetch('/api/carreras');
        const data = await res.json();

        adminCarrerasList.innerHTML = '';

        if (!data || data.length === 0) {
            adminCarrerasList.innerHTML = '<tr><td colspan="6" class="text-center">No hay carreras aún</td></tr>';
            return;
        }

        data.forEach(carrera => {
            const row = document.createElement('tr');

            const title = escapeHtml(carrera.title);
            const code = escapeHtml(carrera.code);
            const description = escapeHtml(carrera.description || '');
            const duration = carrera.duration || 1;
            const categoryMap = {
                'grado': 'Carrera de Grado',
                'posgrado': 'Carrera de Posgrado',
                'cursos': 'Cursos o Charlas'
            };
            const category = categoryMap[carrera.category] || carrera.category || 'Carrera de Grado';

            row.innerHTML = '<td><div class="tabla-titulo">' + title + '</div></td>' +
                '<td><code>' + code + '</code></td>' +
                '<td><span class="categoria-badge">' + escapeHtml(category) + '</span></td>' +
                '<td><div class="tabla-descripcion">' + description + '</div></td>' +
                '<td>' + duration + ' años</td>' +
                '<td><div class="tabla-acciones">' +
                '<button class="btn btn-edit edit-carrera-btn" data-id="' + carrera.id + '">✏️ Editar</button>' +
                '<button class="btn btn-danger delete-carrera-btn" data-id="' + carrera.id + '">🗑️ Eliminar</button>' +
                '</div></td>';

            adminCarrerasList.appendChild(row);
        });

        document.querySelectorAll('.edit-carrera-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const id = e.target.dataset.id;
                await editCarrera(id);
            });
        });

        document.querySelectorAll('.delete-carrera-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const id = e.target.dataset.id;
                await deleteCarrera(id);
            });
        });

    } catch (err) {
        console.error('Error cargando carreras:', err);
        adminCarrerasList.innerHTML = '<tr><td colspan="6" class="text-center">Error cargando carreras</td></tr>';
    }
}

async function editCarrera(id) {
    try {
        const res = await fetch('/api/carreras');
        const all = await res.json();
        const carrera = all.find(x => x.id === id);

        if (!carrera) {
            alert('Carrera no encontrada');
            return;
        }

        document.getElementById('carrera-title').value = carrera.title;
        document.getElementById('carrera-code').value = carrera.code;
        document.getElementById('carrera-description').value = carrera.description || '';
        document.getElementById('carrera-duration').value = carrera.duration;
        document.getElementById('carrera-category').value = carrera.category || 'grado';
        document.getElementById('modal-carrera-titulo').textContent = 'Editar Carrera';

        editingCarreraId = id;
        const modal = document.getElementById('modal-carrera');
        modal.classList.add('active');
    } catch (err) {
        alert('Error cargando carrera: ' + err.message);
    }
}

async function deleteCarrera(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta carrera?')) {
        return;
    }

    try {
        const res = await fetch('/api/carreras/' + id, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (res.ok) {
            alert('Carrera eliminada correctamente');
            await loadAdminCarreras();
        } else {
            const err = await res.json().catch(() => null);
            alert('Error al eliminar: ' + (err && err.error ? err.error : res.statusText));
        }
    } catch (error) {
        alert('Error al eliminar la carrera: ' + error.message);
    }
}

// ===== AUTORIDADES FUNCTIONS =====
// --- SECCIÓN AUTORIDADES ---


async function loadAdminAutoridades() {
    const adminAutoridadesList = document.getElementById('admin-autoridades-list');
    if (!adminAutoridadesList) return;

    try {
        const res = await fetch('/api/autoridades');
        const data = await res.json();
        adminAutoridadesList.innerHTML = '';

        data.forEach(autoridad => {
            const row = document.createElement('tr');

            // Validamos la foto: si es nula, vacía o el string del error, usamos el placeholder
            const tieneFoto = autoridad.foto &&
                autoridad.foto !== '' &&
                autoridad.foto !== '/uploads/default-avatar.png';

            const fotoHtml = tieneFoto
                ? `<img src="${autoridad.foto}" 
                        class="tabla-imagen" 
                        style="width:50px; height:50px; border-radius:50%; object-fit:cover;"
                        onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(autoridad.nombre)}&background=random'">`
                : `<div style="width:50px; height:50px; border-radius:50%; background:#eee; display:flex; align-items:center; justify-content:center;">👤</div>`;

            row.innerHTML = `
                <td>${fotoHtml}</td>
                <td><strong>${autoridad.nombre}</strong></td>
                <td>${autoridad.cargo}</td>
                <td>${autoridad.email || '-'}</td>
                <td>
                    <button class="btn-edit" onclick="editAutoridad('${autoridad.id}')">✏️</button>
                    <button class="btn-danger" onclick="removeAutoridad('${autoridad.id}')">🗑️</button>
                </td>
            `;
            adminAutoridadesList.appendChild(row);
        });
    } catch (err) {
        console.error("Error cargando tabla:", err);
    }
}

// Función auxiliar para que los botones funcionen después de recargar la tabla
function vincularEventosAutoridades() {
    document.querySelectorAll('.edit-autoridad-btn').forEach(btn => {
        btn.onclick = (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            editAutoridad(id);
        };
    });

    document.querySelectorAll('.delete-autoridad-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            // ✅ Usar currentTarget en lugar de target
            const id = e.currentTarget.dataset.id;
            await removeAutoridad(id);
        });
    });
}

// Función auxiliar para que los botones de eliminar y editar funcionen siempre
function rebindAutoridadEvents() {
    document.querySelectorAll('.edit-autoridad-btn').forEach(btn => {
        btn.onclick = (e) => editAutoridad(e.currentTarget.getAttribute('data-id'));
    });

    document.querySelectorAll('.delete-autoridad-btn').forEach(btn => {
        btn.onclick = (e) => removeAutoridad(e.currentTarget.getAttribute('data-id'));
    });
}
async function editAutoridad(id) {
    try {
        // Optimización: Pedimos la autoridad específica al servidor en lugar de buscar en todo el array
        const res = await fetch('/api/autoridades/' + id);
        const autoridad = await res.json();

        if (!autoridad) {
            alert('Autoridad no encontrada');
            return;
        }

        document.getElementById('autoridad-nombre').value = autoridad.nombre;
        document.getElementById('autoridad-cargo').value = autoridad.cargo;
        document.getElementById('autoridad-email').value = autoridad.email || '';
        document.getElementById('autoridad-telefono').value = autoridad.telefono || '';

        const fotoPreview = document.getElementById('autoridad-foto-preview');
        if (fotoPreview) {
            let fotoUrl = autoridad.foto;
            if (!fotoUrl || fotoUrl === 'undefined') fotoUrl = '/uploads/default-avatar.png';
            const finalPath = fotoUrl.startsWith('/') ? fotoUrl : '/' + fotoUrl;

            fotoPreview.innerHTML = '<img src="' + finalPath + '?v=' + Date.now() + '" alt="Foto actual" style="max-width: 150px; max-height: 150px; border-radius: 50%; object-fit: cover; border: 2px solid #ddd;">';
        }

        document.getElementById('modal-autoridad-titulo').textContent = 'Editar Autoridad';
        editingAutoridadId = id;
        document.getElementById('modal-autoridad').classList.add('active');
    } catch (err) {
        alert('Error cargando autoridad: ' + err.message);
    }
}
async function removeAutoridad(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta autoridad?')) {
        return;
    }

    try {
        const res = await fetch('/api/autoridades/' + id, {
            method: 'DELETE',
            headers: typeof getAuthHeaders === 'function' ? getAuthHeaders() : {}
        });

        if (res.ok) {
            alert('Autoridad eliminada con éxito');
            await loadAdminAutoridades(); // Recargar la tabla
        } else {
            const errorData = await res.json().catch(() => ({}));
            alert('Error al eliminar: ' + (errorData.message || 'No se pudo completar la acción'));
        }
    } catch (error) {
        console.error('Error de red al eliminar:', error);
        alert('Error de conexión con el servidor');
    }
}


// ===== MENSAJES FUNCTIONS =====
async function loadAdminMensajes() {
    const adminMensajesList = document.getElementById('admin-mensajes-list');
    if (!adminMensajesList) return;

    try {
        const res = await fetch('/api/mensajes', {
            headers: getAuthHeaders()
        });
        const data = await res.json();

        adminMensajesList.innerHTML = '';

        const noLeidos = data.filter(m => !m.leido).length;
        const indicator = document.getElementById('mensajes-no-leidos');
        if (indicator) {
            indicator.textContent = noLeidos;
        }

        if (!data || data.length === 0) {
            adminMensajesList.innerHTML = '<tr><td colspan="5" class="text-center">No hay mensajes</td></tr>';
            return;
        }

        data.reverse().forEach(mensaje => {
            const row = document.createElement('tr');

            const nombre = escapeHtml(mensaje.nombre);
            const asunto = escapeHtml(mensaje.asunto);
            const fecha = escapeHtml(mensaje.fecha);
            const estado = mensaje.leido ? '✓ Leído' : '⚪ Sin leer';
            const estadoClass = mensaje.leido ? 'leido' : 'no-leido';

            row.innerHTML = '<td><div class="tabla-titulo">' + nombre + '</div></td>' +
                '<td>' + asunto + '</td>' +
                '<td>' + fecha + '</td>' +
                '<td><span class="badge ' + estadoClass + '">' + estado + '</span></td>' +
                '<td><div class="tabla-acciones">' +
                '<button class="btn btn-edit ver-mensaje-btn" data-id="' + mensaje.id + '">👁️ Ver</button>' +
                '<button class="btn btn-danger delete-mensaje-btn" data-id="' + mensaje.id + '">🗑️ Eliminar</button>' +
                '</div></td>';

            adminMensajesList.appendChild(row);
        });

        document.querySelectorAll('.ver-mensaje-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const id = e.target.dataset.id;
                await viewMensaje(id);
            });
        });

        document.querySelectorAll('.delete-mensaje-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const id = e.target.dataset.id;
                await deleteMensaje(id);
            });
        });

    } catch (err) {
        console.error('Error cargando mensajes:', err);
        adminMensajesList.innerHTML = '<tr><td colspan="5" class="text-center">Error cargando mensajes</td></tr>';
    }
}

// Export mensajes (CSV / XLSX) — ahora con filtros (fecha y estado)
async function exportMensajes(format = 'csv', filters = {}) {
    try {
        const params = new URLSearchParams();
        params.set('format', format);
        if (filters.desde) params.set('desde', filters.desde);
        if (filters.hasta) params.set('hasta', filters.hasta);
        if (filters.estado) params.set('estado', filters.estado);

        const res = await fetch('/api/mensajes/export?' + params.toString(), {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Error en servidor: ' + res.statusText);

        const blob = await res.blob();
        const cd = res.headers.get('Content-Disposition') || '';
        let filename = (format === 'xlsx') ? 'mensajes.xlsx' : 'mensajes.csv';
        const m = cd.match(/filename\s*=\s*"?([^";]+)"?/i);
        if (m && m[1]) filename = m[1];

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.replace(/"/g, '');
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    } catch (err) {
        alert('Error exportando mensajes: ' + err.message);
    }
}

async function viewMensaje(id) {
    try {
        const res = await fetch('/api/mensajes/' + id, {
            headers: getAuthHeaders()
        });
        const mensaje = await res.json();

        console.log('Mensaje recibido:', mensaje);

        const body = document.getElementById('modal-mensaje-body');
        const textoMensaje = mensaje.mensaje || 'Sin contenido';

        body.innerHTML = '<div style="padding: 20px;">' +
            '<p><strong>De:</strong> ' + escapeHtml(mensaje.nombre) + '</p>' +
            '<p><strong>Email:</strong> <a href="mailto:' + escapeHtml(mensaje.email) + '">' + escapeHtml(mensaje.email) + '</a></p>' +
            (mensaje.telefono ? '<p><strong>Teléfono:</strong> ' + escapeHtml(mensaje.telefono) + '</p>' : '') +
            '<p><strong>Asunto:</strong> ' + escapeHtml(mensaje.asunto) + '</p>' +
            '<p><strong>Fecha:</strong> ' + escapeHtml(mensaje.fecha) + '</p>' +
            '<hr>' +
            '<p><strong>Mensaje:</strong></p>' +
            '<p style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 4px; min-height: 100px;">' + escapeHtml(textoMensaje) + '</p>' +
            '</div>';

        if (!mensaje.leido) {
            await fetch('/api/mensajes/' + id + '/leido', {
                method: 'PUT',
                headers: getAuthHeaders()
            });
            await loadAdminMensajes();
        }

        currentMensajeId = id;
        document.getElementById('modal-mensaje').classList.add('active');
    } catch (err) {
        console.error('Error en viewMensaje:', err);
        alert('Error cargando mensaje: ' + err.message);
    }
}

async function deleteMensaje(id) {
    if (!confirm('¿Eliminar este mensaje?')) {
        return;
    }

    try {
        const res = await fetch('/api/mensajes/' + id, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (res.ok) {
            alert('Mensaje eliminado');
            document.getElementById('modal-mensaje').classList.remove('active');
            await loadAdminMensajes();
        } else {
            alert('Error al eliminar el mensaje');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// ===== DOCUMENTOS FUNCTIONS =====
async function loadAdminDocumentos() {
    const adminDocsList = document.getElementById('admin-docs-list');
    if (!adminDocsList) return;

    try {
        const res = await fetch('/api/documents');

        if (!res.ok) {
            throw new Error(`Error del servidor: ${res.status}`);
        }

        const data = await res.json();
        adminDocsList.innerHTML = '';

        if (!data || data.length === 0) {
            adminDocsList.innerHTML = '<tr><td colspan="5" class="text-center">No hay documentos subidos aún</td></tr>';
            return;
        }

        // --- AQUÍ LA LÓGICA DE RENDERIZADO COMPLETA ---
        data.forEach(doc => {
            const tr = document.createElement('tr');

            // Ajustamos las propiedades según lo que vimos en el JSON (title, category, etc.)
            tr.innerHTML = `
                <td><strong>${doc.title || 'Sin título'}</strong></td>
                <td><span class="badge">${doc.category || 'General'}</span></td>
                <td>${doc.description || 'Sin descripción'}</td>
                <td>${doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}</td>
                <td class="actions">
                    <div class="btn-group">
                        <a href="${doc.filePath}" target="_blank" class="btn-small btn-view" title="Ver archivo">👁️</a>
                        
                        <button onclick="editarDocumento('${doc.id}')" class="btn-small btn-edit" title="Editar">✏️</button>
                        
                        <button onclick="eliminarDocumento('${doc.id}')" class="btn-small btn-delete" title="Eliminar">🗑️</button>
                    </div>
                </td>
            `;
            adminDocsList.appendChild(tr);
        });

    } catch (err) {
        console.error('Error cargando documentos:', err);
        adminDocsList.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error: ${err.message}</td></tr>`;
    }
}

async function editDocumento(id) {
    try {
        // OPTIMIZACIÓN: Pedimos solo el documento que necesitamos
        const res = await fetch('/api/documents/' + id);
        if (!res.ok) throw new Error('No se pudo obtener el documento');

        const doc = await res.json();

        document.getElementById('doc-title').value = doc.title;
        document.getElementById('doc-category').value = doc.category || '';
        document.getElementById('doc-description').value = doc.description || '';
        document.getElementById('modal-doc-titulo').textContent = 'Editar Documento';

        editingDocId = id;
        const modal = document.getElementById('modal-documento');
        modal.classList.add('active');
    } catch (err) {
        alert('Error cargando documento: ' + err.message);
    }
}
// ===== PUBLIC PAGE DOMEVENTLISTENER =====
document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu for all pages
    const menuToggle = document.getElementById('menu-toggle');
    const navbarMenu = document.getElementById('navbar-menu');

    if (menuToggle && navbarMenu) {
        menuToggle.addEventListener('click', () => {
            navbarMenu.classList.toggle('active');
        });

        const navLinks = navbarMenu.querySelectorAll('a:not(.dropdown-toggle)');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navbarMenu.classList.remove('active');
            });
        });
    }

    // Dropdown menus
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const dropdown = toggle.closest('.dropdown');

            document.querySelectorAll('.dropdown.active').forEach(openDropdown => {
                if (openDropdown !== dropdown) {
                    openDropdown.classList.remove('active');
                }
            });

            dropdown.classList.toggle('active');
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown.active').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });

    const dropdownLinks = document.querySelectorAll('.dropdown-menu a');
    dropdownLinks.forEach(link => {
        link.addEventListener('click', () => {
            document.querySelectorAll('.dropdown.active').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
            if (navbarMenu) {
                navbarMenu.classList.remove('active');
            }
        });
    });

    // Load news on index page
    const newsList = document.getElementById('news-list');
    if (newsList) {
        loadNews();
    }

    // Load carousel on index page
    if (document.getElementById('carousel-container')) {
        loadCarousel();
    }

    // Load preinscripcion config and student links on all pages
    loadPreinscripcionConfig();
    loadClaustrosInDropdown();

    // Load news detail on news.html
    const newsDetail = document.getElementById('news-detail');
    if (newsDetail) {
        const urlParams = new URLSearchParams(window.location.search);
        const newsId = urlParams.get('id');

        if (!newsId) {
            newsDetail.innerHTML = '<p>Noticia no encontrada. <a href="index.html">Volver a noticias</a></p>';
        } else {
            fetch('/api/news/' + decodeURIComponent(newsId))
                .then(res => {
                    if (!res.ok) throw new Error('Noticia no encontrada');
                    return res.json();
                })
                .then(news => {
                    document.getElementById('news-title').textContent = news.title || 'Sin título';
                    document.getElementById('news-date').textContent = 'Publicado: ' + (news.date || 'Sin fecha');
                    document.getElementById('news-body').innerHTML = '<p>' + escapeHtml(news.description || 'Sin descripción') + '</p>';

                    const imageContainer = document.getElementById('news-image-container');
                    if (news.image) {
                        imageContainer.innerHTML = '<img src="' + news.image + '" alt="' + escapeHtml(news.title) + '" class="news-detail-img">';
                    } else {
                        imageContainer.innerHTML = '<div class="news-detail-no-image">📷 Sin imagen</div>';
                    }

                    document.title = news.title + ' - Noticias';
                })
                .catch(error => {
                    console.error('Error cargando noticia:', error);
                    newsDetail.innerHTML = '<p>Error al cargar la noticia. <a href="index.html">Volver a noticias</a></p>';
                });
        }
    }
});

// ===== ADMIN PAGE DOMEVENTLISTENER =====
document.addEventListener('DOMContentLoaded', async () => {
    const isAdminPage = window.location.pathname.includes('admin.html') ||
        document.querySelector('.dashboard-container') !== null;

    if (!isAdminPage) return;

    // Admin authentication (compatible with JWT-based auth)
    let isAdminAuthenticated = sessionStorage.getItem('admin_authenticated');

    // Si hay token JWT en localStorage, marcar como autenticado sin mostrar modal legacy
    const jwtToken = localStorage.getItem('faen_auth_token');
    if (!isAdminAuthenticated && jwtToken) {
        sessionStorage.setItem('admin_authenticated', 'true');
        isAdminAuthenticated = 'true';
    }

    // If a JWT token exists (from `auth.js`), consider the user authenticated so we don't show the modal twice
    if (!isAdminAuthenticated && typeof isAuthenticated === 'function' && isAuthenticated()) {
        sessionStorage.setItem('admin_authenticated', 'true');
        isAdminAuthenticated = 'true';
    }

    if (!isAdminAuthenticated) {
        const credentials = await showLoginModal();
        if (!credentials) {
            window.location.href = 'index.html';
            return;
        }

        // Prefer JWT login when `login()` is available (avoids double login across pages)
        if (typeof login === 'function') {
            try {
                await login(credentials.user, credentials.pass);
                // `login()` from auth.js already stores token + user in localStorage
                sessionStorage.setItem('admin_authenticated', 'true');
            } catch (err) {
                // Fallback to legacy session-based auth for backward compatibility
                console.warn('JWT login via modal failed — using legacy session auth', err);
                sessionStorage.setItem('admin_user', credentials.user);
                sessionStorage.setItem('admin_pass', credentials.pass);
                sessionStorage.setItem('admin_authenticated', 'true');
            }
        } else {
            // No JWT available on the page — keep legacy behaviour
            sessionStorage.setItem('admin_user', credentials.user);
            sessionStorage.setItem('admin_pass', credentials.pass);
            sessionStorage.setItem('admin_authenticated', 'true');
        }

        sessionStorage.setItem('admin_last_activity', Date.now().toString());
    }

    startSessionTimer();


    document.addEventListener('click', updateSessionActivity);
    document.addEventListener('keypress', updateSessionActivity);

    // Mobile menu for admin
    const menuToggleAdmin = document.getElementById('menu-toggle-admin');
    const dashboardSidebar = document.querySelector('.dashboard-sidebar');

    if (menuToggleAdmin && dashboardSidebar) {
        menuToggleAdmin.addEventListener('click', () => {
            dashboardSidebar.classList.toggle('active');
        });

        const navItems = dashboardSidebar.querySelectorAll('.nav-item');
        navItems.forEach(link => {
            link.addEventListener('click', () => {
                dashboardSidebar.classList.remove('active');
            });
        });
    }

    // Dashboard sections navigation
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.dashboard-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const href = item.getAttribute('href');
            if (href === 'index.html') return;

            e.preventDefault();
            const sectionId = item.dataset.section;
            if (!sectionId) return;

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            sections.forEach(sec => sec.classList.remove('active'));
            const section = document.getElementById('section-' + sectionId);
            if (section) {
                section.classList.add('active');
            }

            if (sectionId === 'galeria') {
                loadGaleria();
            } else if (sectionId === 'documentos') {
                loadAdminDocumentos();
            } else if (sectionId === 'carreras') {
                loadAdminCarreras();
            } else if (sectionId === 'autoridades') {
                loadAdminAutoridades();
            } else if (sectionId === 'mensajes') {
                loadAdminMensajes();
            } else if (sectionId === 'configuracion') {
                loadConfigPage();
            }
        });
    });

    // Export buttons for mensajes
    const btnExportCSV = document.getElementById('export-mensajes-csv');
    if (btnExportCSV) btnExportCSV.addEventListener('click', () => {
        const desde = document.getElementById('export-desde')?.value || '';
        const hasta = document.getElementById('export-hasta')?.value || '';
        const estado = document.getElementById('export-estado')?.value || 'all';
        exportMensajes('csv', { desde: desde, hasta: hasta, estado: estado });
    });
    const btnExportXLSX = document.getElementById('export-mensajes-xlsx');
    if (btnExportXLSX) btnExportXLSX.addEventListener('click', () => {
        const desde = document.getElementById('export-desde')?.value || '';
        const hasta = document.getElementById('export-hasta')?.value || '';
        const estado = document.getElementById('export-estado')?.value || 'all';
        exportMensajes('xlsx', { desde: desde, hasta: hasta, estado: estado });
    });


    // NEWS MODAL SETUP
    const modal = document.getElementById('modal-noticia');
    const btnNuevaNoticia = document.getElementById('btn-nueva-noticia');
    const modalClose = document.getElementById('modal-close');
    const formCancel = document.getElementById('form-cancel');
    const newsForm = document.getElementById('news-form');
    const fileInput = document.getElementById('news-image');
    const fileName = document.getElementById('file-name');
    const imagePreview = document.getElementById('image-preview');

    if (btnNuevaNoticia) {
        btnNuevaNoticia.addEventListener('click', (e) => {
            e.preventDefault();
            editingId = null;
            newsForm.reset();
            imagePreview.innerHTML = '';
            fileName.textContent = 'Ningún archivo seleccionado';
            document.getElementById('modal-titulo').textContent = 'Nueva Noticia';
            modal.classList.add('active');
        });
    }

    const closeModal = () => {
        modal.classList.remove('active');
        editingId = null;
        newsForm.reset();
        imagePreview.innerHTML = '';
        fileName.textContent = 'Ningún archivo seleccionado';
    };

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (formCancel) formCancel.addEventListener('click', closeModal);

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                fileName.textContent = file.name;
                const reader = new FileReader();
                reader.onload = (event) => {
                    imagePreview.innerHTML = '<img src="' + event.target.result + '" alt="Preview">';
                };
                reader.readAsDataURL(file);
            } else {
                fileName.textContent = 'Ningún archivo seleccionado';
                imagePreview.innerHTML = '';
            }
        });
    }

    if (newsForm) {
        newsForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('news-title').value;
            const description = document.getElementById('news-description').value;
            const date = document.getElementById('news-date').value;
            const imageInput = document.getElementById('news-image');

            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('date', date);

            if (imageInput.files && imageInput.files[0]) {
                formData.append('image', imageInput.files[0]);
            }

            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? '/api/news/' + editingId : '/api/news';

            try {
                console.log('Enviando noticia con método:', method, 'URL:', url);

                // 1. Obtenemos los headers (que traen el JSON por defecto)
                const headers = getAuthHeaders();

                // 2. IMPORTANTE: Eliminamos el Content-Type para que el navegador 
                // gestione el FormData correctamente con su propio "boundary"
                delete headers['Content-Type'];

                console.log('Headers enviados (limpios):', headers);

                const res = await fetch(url, {
                    method: method,
                    body: formData, // Al ser FormData, el navegador pondrá el Content-Type correcto
                    headers: headers
                });

                if (res.ok) {
                    alert(editingId ? 'Noticia actualizada correctamente' : 'Noticia creada correctamente');
                    closeModal();
                    await loadAdminNews();
                } else {
                    const text = await res.text();
                    console.error('Error response:', res.status, text);
                    alert('Error: ' + text);
                }
            } catch (error) {
                console.error('Error fetch:', error);
                alert('Error al guardar la noticia: ' + error.message);
            }
        });
    }

    // GALERIA MODAL SETUP
    const modalFoto = document.getElementById('modal-foto');
    const btnSubirFoto = document.getElementById('btn-subir-foto');
    const modalFotoClose = document.getElementById('modal-foto-close');
    const fotoFormCancel = document.getElementById('foto-form-cancel');
    const fotoForm = document.getElementById('foto-form');
    const fotoFileInput = document.getElementById('foto-file');
    const fotoFileName = document.getElementById('foto-file-name');
    const fotoPreview = document.getElementById('foto-preview');

    // Función para cerrar y limpiar el modal
    const closeFotoModal = () => {
        if (modalFoto) modalFoto.classList.remove('active');
        if (fotoForm) fotoForm.reset();
        if (fotoPreview) fotoPreview.innerHTML = '';
        if (fotoFileName) fotoFileName.textContent = 'Ningún archivo seleccionado';
    };

    if (btnSubirFoto) {
        btnSubirFoto.addEventListener('click', (e) => {
            e.preventDefault();
            closeFotoModal(); // Limpiamos antes de abrir por seguridad
            modalFoto.classList.add('active');
        });
    }

    if (modalFotoClose) modalFotoClose.addEventListener('click', closeFotoModal);
    if (fotoFormCancel) fotoFormCancel.addEventListener('click', closeFotoModal);

    if (modalFoto) {
        modalFoto.addEventListener('click', (e) => {
            if (e.target === modalFoto) closeFotoModal();
        });
    }

    // Previsualización de la imagen seleccionada
    if (fotoFileInput) {
        fotoFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                fotoFileName.textContent = file.name;
                const reader = new FileReader();
                reader.onload = (event) => {
                    // Mantenemos las rutas relativas en la previsualización (base64)
                    fotoPreview.innerHTML = '<img src="' + event.target.result + '" alt="Preview" style="max-width: 100%; border-radius: 8px;">';
                };
                reader.readAsDataURL(file);
            } else {
                fotoFileName.textContent = 'Ningún archivo seleccionado';
                fotoPreview.innerHTML = '';
            }
        });
    }

    if (fotoForm) {
        fotoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const tituloInput = document.getElementById('foto-titulo');
            const titulo = tituloInput ? tituloInput.value.trim() : 'Sin título';
            const fileInput = document.getElementById('foto-file');

            if (!fileInput.files || !fileInput.files[0]) {
                alert('Por favor selecciona una foto');
                return;
            }

            const formData = new FormData();
            // SINCRONIZACIÓN: Usamos 'imagen' para que coincida con el FileInterceptor del Controller
            formData.append('image', fileInput.files[0]);
            formData.append('titulo', titulo || 'Sin título');

            // Obtenemos cabeceras (Token)
            const headers = typeof getAuthHeaders === 'function' ? getAuthHeaders() : {};

            // ELIMINAR Content-Type: El navegador debe generar el boundary de multipart/form-data solo
            if (headers['Content-Type']) {
                delete headers['Content-Type'];
            }

            try {
                // Ajusta la URL si tu endpoint es '/api/galeria' o '/api/galeria/upload'
                const res = await fetch('/api/galeria/upload', {
                    method: 'POST',
                    headers: headers,
                    body: formData
                });

                if (res.ok) {
                    alert('Foto subida con éxito');
                    closeFotoModal();
                    // Recargamos la grilla de la galería para ver el nuevo elemento
                    if (typeof loadGaleria === 'function') {
                        await loadGaleria();
                    }
                } else {
                    const errorData = await res.json().catch(() => ({}));
                    alert('Error al subir: ' + (errorData.message || 'Error en el servidor'));
                }
            } catch (error) {
                console.error('Error de red al subir foto:', error);
                alert('No se pudo conectar con el servidor');
            }
        });
    }

    // CARRERAS MODAL SETUP
    const modalCarrera = document.getElementById('modal-carrera');
    const btnNuevaCarrera = document.getElementById('btn-nueva-carrera');
    const modalCarreraClose = document.getElementById('modal-carrera-close');
    const carreraFormCancel = document.getElementById('carrera-form-cancel');
    const carreraForm = document.getElementById('carrera-form');

    if (btnNuevaCarrera) {
        btnNuevaCarrera.addEventListener('click', (e) => {
            e.preventDefault();
            if (carreraForm) carreraForm.reset();
            document.getElementById('modal-carrera-titulo').textContent = 'Nueva Carrera';
            editingCarreraId = null;
            modalCarrera.classList.add('active');
        });
    }

    const closeCarreraModal = () => {
        modalCarrera.classList.remove('active');
        if (carreraForm) carreraForm.reset();
        editingCarreraId = null;
    };

    if (modalCarreraClose) modalCarreraClose.addEventListener('click', closeCarreraModal);
    if (carreraFormCancel) carreraFormCancel.addEventListener('click', closeCarreraModal);

    if (modalCarrera) {
        modalCarrera.addEventListener('click', (e) => {
            if (e.target === modalCarrera) {
                closeCarreraModal();
            }
        });
    }

    if (carreraForm) {
        carreraForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('carrera-title').value.trim();
            const code = document.getElementById('carrera-code').value.trim();
            const description = document.getElementById('carrera-description').value.trim();
            const fullDescription = document.getElementById('carrera-full-description').value.trim();
            const duration = document.getElementById('carrera-duration').value;
            const category = document.getElementById('carrera-category').value.trim();
            const fotoInput = document.getElementById('carrera-foto');
            const documentoInput = document.getElementById('carrera-documento');

            // Validación básica en cliente
            if (!title || !code || !description || !category) {
                alert('Por favor completa todos los campos requeridos');
                return;
            }

            if (!documentoInput.files || documentoInput.files.length === 0) {
                alert('Por favor selecciona un plan de carrera (PDF)');
                return;
            }

            const method = editingCarreraId ? 'PUT' : 'POST';
            const url = editingCarreraId ? '/api/carreras/' + editingCarreraId : '/api/carreras';

            try {
                // Leer documento
                const documentoFile = documentoInput.files[0];
                const documentoBase64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(documentoFile);
                });

                // Leer foto si existe
                let fotoBase64 = null;
                if (fotoInput.files && fotoInput.files.length > 0) {
                    const fotoFile = fotoInput.files[0];
                    fotoBase64 = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(fotoFile);
                    });
                }

                const payload = {
                    title: title,
                    code: code,
                    description: description,
                    fullDescription: fullDescription || description,
                    duration: parseInt(duration),
                    category: category,
                    documento: documentoBase64,
                    foto: fotoBase64
                };

                console.log('Enviando carrera con documento y foto');

                const res = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeaders()
                    },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    alert(editingCarreraId ? 'Carrera actualizada correctamente' : 'Carrera creada correctamente');
                    closeCarreraModal();
                    await loadAdminCarreras();
                } else {
                    const text = await res.text();
                    console.error('Error response:', text);
                    alert('Error: ' + text);
                }
            } catch (error) {
                console.error('Error al guardar:', error);
                alert('Error al guardar la carrera: ' + error.message);
            }
        });
    }

    // Manejar cambios en el input de foto de carrera
    const carreraFotoInput = document.getElementById('carrera-foto');
    if (carreraFotoInput) {
        carreraFotoInput.addEventListener('change', (e) => {
            const fileName = e.target.files && e.target.files.length > 0 ? e.target.files[0].name : 'Ningún archivo seleccionado';
            document.getElementById('carrera-foto-name').textContent = fileName;

            if (e.target.files && e.target.files.length > 0) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    document.getElementById('carrera-foto-preview').innerHTML = '<img src="' + evt.target.result + '" style="max-width: 200px; max-height: 200px; border-radius: 8px;">';
                };
                reader.readAsDataURL(e.target.files[0]);
            } else {
                document.getElementById('carrera-foto-preview').innerHTML = '';
            }
        });
    }

    // Manejar cambios en el input de documento de carrera
    const carreraDocumentoInput = document.getElementById('carrera-documento');
    if (carreraDocumentoInput) {
        carreraDocumentoInput.addEventListener('change', (e) => {
            const fileName = e.target.files && e.target.files.length > 0 ? e.target.files[0].name : 'Ningún archivo seleccionado';
            document.getElementById('carrera-documento-name').textContent = fileName;
        });
    }

    // AUTORIDADES MODAL SETUP
    const modalAutoridad = document.getElementById('modal-autoridad');
    const btnNuevaAutoridad = document.getElementById('btn-nueva-autoridad');
    const modalAutoridadClose = document.getElementById('modal-autoridad-close');
    const autoridadFormCancel = document.getElementById('autoridad-form-cancel');
    const autoridadForm = document.getElementById('autoridad-form');

    if (btnNuevaAutoridad) {
        btnNuevaAutoridad.addEventListener('click', (e) => {
            e.preventDefault();
            if (autoridadForm) autoridadForm.reset();
            document.getElementById('modal-autoridad-titulo').textContent = 'Nueva Autoridad';
            editingAutoridadId = null;
            modalAutoridad.classList.add('active');
        });
    }

    const closeAutoridadModal = () => {
        modalAutoridad.classList.remove('active');
        if (autoridadForm) autoridadForm.reset();
        const fotoPreview = document.getElementById('autoridad-foto-preview');
        if (fotoPreview) fotoPreview.innerHTML = '';
        editingAutoridadId = null;
    };

    if (modalAutoridadClose) modalAutoridadClose.addEventListener('click', closeAutoridadModal);
    if (autoridadFormCancel) autoridadFormCancel.addEventListener('click', closeAutoridadModal);

    // Manejador para vista previa de foto de autoridad
    const autoridadFotoInput = document.getElementById('autoridad-foto');
    if (autoridadFotoInput) {
        autoridadFotoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const fotoPreview = document.getElementById('autoridad-foto-preview');
            const fotoName = document.getElementById('autoridad-foto-name');

            if (file) {
                fotoName.textContent = file.name;

                const reader = new FileReader();
                reader.onload = (event) => {
                    fotoPreview.innerHTML = '<img src="' + event.target.result + '" alt="Preview" style="max-width: 150px; max-height: 150px; border-radius: 50%; object-fit: cover;">';
                };
                reader.readAsDataURL(file);
            } else {
                fotoName.textContent = 'Ningún archivo seleccionado';
                fotoPreview.innerHTML = '';
            }
        });
    }

    if (modalAutoridad) {
        modalAutoridad.addEventListener('click', (e) => {
            if (e.target === modalAutoridad) {
                closeAutoridadModal();
            }
        });
    }

    if (autoridadForm) {
        autoridadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nombre = document.getElementById('autoridad-nombre').value.trim();
            const cargo = document.getElementById('autoridad-cargo').value.trim();
            const email = document.getElementById('autoridad-email').value.trim();
            const telefono = document.getElementById('autoridad-telefono').value.trim();
            const fotoInput = document.getElementById('autoridad-foto');

            // Validación
            if (!nombre) {
                alert('Por favor ingresa el nombre');
                return;
            }
            if (!cargo) {
                alert('Por favor ingresa el cargo');
                return;
            }

            // Procesar foto si existe
            let foto = null;
            if (fotoInput && fotoInput.files && fotoInput.files[0]) {
                const file = fotoInput.files[0];

                // Limitar tamaño de imagen
                if (file.size > 500000) {
                    alert('La imagen es muy grande. Por favor usa una imagen menor a 500KB');
                    return;
                }

                // Usar Promise para esperar a que se lea la foto
                foto = await new Promise((resolve, reject) => {
                    const reader = new FileReader();

                    reader.onload = (event) => {
                        resolve(event.target.result);
                    };

                    reader.onerror = () => {
                        reject(new Error('Error al leer la foto'));
                    };

                    reader.readAsDataURL(file);
                }).catch(err => {
                    alert(err.message);
                    return null;
                });
            }

            if (foto !== null || !fotoInput || !fotoInput.files || !fotoInput.files[0]) {
                await guardarAutoridad(nombre, cargo, email, telefono, foto);
            }
        });
    }

    async function guardarAutoridad(nombre, cargo, email, telefono, foto) {
        const method = editingAutoridadId ? 'PUT' : 'POST';
        const url = editingAutoridadId ? '/api/autoridades/' + editingAutoridadId : '/api/autoridades';

        const payload = {
            nombre: nombre.trim(),
            cargo: cargo.trim()
        };

        // Solo agregar campos opcionales si tienen valor
        if (email && email.trim()) payload.email = email.trim();
        if (telefono && telefono.trim()) payload.telefono = telefono.trim();
        if (foto) {
            console.log('Foto tamaño:', foto.length, 'bytes');
            payload.foto = foto;
        }

        console.log('Enviando payload completo:', {
            ...payload,
            foto: payload.foto ? `foto base64 (${payload.foto.length} bytes)` : null
        });

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert(editingAutoridadId ? 'Autoridad actualizada correctamente' : 'Autoridad creada correctamente');
                closeAutoridadModal();
                await loadAdminAutoridades();
            } else {
                const text = await res.text();
                console.error('Error response:', text);
                alert('Error: ' + text);
            }
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar la autoridad: ' + error.message);
        }
    }

    // MENSAJES MODAL SETUP
    const modalMensaje = document.getElementById('modal-mensaje');
    const modalMensajeClose = document.getElementById('modal-mensaje-close');
    const btnEliminarMensaje = document.getElementById('btn-eliminar-mensaje');

    if (modalMensajeClose) {
        modalMensajeClose.addEventListener('click', (e) => {
            e.preventDefault();
            modalMensaje.classList.remove('active');
        });
    }

    if (btnEliminarMensaje) {
        btnEliminarMensaje.addEventListener('click', async (e) => {
            e.preventDefault();
            const id = currentMensajeId;
            if (id) {
                await deleteMensaje(id);
            }
        });
    }

    if (modalMensaje) {
        modalMensaje.addEventListener('click', (e) => {
            if (e.target === modalMensaje) {
                modalMensaje.classList.remove('active');
            }
        });
    }

    // DOCUMENTOS MODAL SETUP
    const modalDoc = document.getElementById('modal-documento');
    const btnNuevoDoc = document.getElementById('btn-nuevo-documento');
    const modalDocClose = document.getElementById('modal-doc-close');
    const docFormCancel = document.getElementById('doc-form-cancel');
    const docForm = document.getElementById('documento-form');
    const docFileInput = document.getElementById('doc-file');
    const docFileName = document.getElementById('doc-file-name');

    if (btnNuevoDoc) {
        btnNuevoDoc.addEventListener('click', (e) => {
            e.preventDefault();
            if (docForm) docForm.reset();
            docFileName.textContent = 'Ningún archivo seleccionado';
            document.getElementById('modal-doc-titulo').textContent = 'Nuevo Documento';
            editingDocId = null;
            modalDoc.classList.add('active');
        });
    }

    const closeDocModal = () => {
        modalDoc.classList.remove('active');
        if (docForm) docForm.reset();
        docFileName.textContent = 'Ningún archivo seleccionado';
        editingDocId = null;
    };

    if (modalDocClose) modalDocClose.addEventListener('click', closeDocModal);
    if (docFormCancel) docFormCancel.addEventListener('click', closeDocModal);

    if (modalDoc) {
        modalDoc.addEventListener('click', (e) => {
            if (e.target === modalDoc) {
                closeDocModal();
            }
        });
    }

    if (docFileInput) {
        docFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                docFileName.textContent = file.name;
            } else {
                docFileName.textContent = 'Ningún archivo seleccionado';
            }
        });
    }

    if (docForm) {
        docForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('doc-title').value;
            const category = document.getElementById('doc-category').value;
            const description = document.getElementById('doc-description').value;
            const fileInput = document.getElementById('doc-file');

            if (!fileInput.files || !fileInput.files[0]) {
                alert('Por favor selecciona un archivo PDF');
                return;
            }

            const formData = new FormData();
            formData.append('title', title);
            formData.append('category', category);
            formData.append('description', description);
            // El campo se llama 'file' para coincidir con el interceptor del backend
            formData.append('file', fileInput.files[0]);

            const method = editingDocId ? 'PUT' : 'POST';
            const url = editingDocId ? `/api/documents/${editingDocId}` : '/api/documents';

            // Preparamos los headers de autenticación
            const headers = getAuthHeaders();
            // Eliminamos el Content-Type para que el navegador use 'multipart/form-data' correctamente
            delete headers['Content-Type'];

            try {
                const res = await fetch(url, {
                    method: method,
                    body: formData,
                    headers: headers
                });

                if (res.ok) {
                    alert(editingDocId ? 'Documento actualizado correctamente' : 'Documento creado correctamente');
                    closeDocModal();
                    // Refrescamos la tabla para ver el nuevo archivo
                    await loadAdminDocumentos();
                } else {
                    // Intentamos obtener el error detallado del backend
                    const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
                    alert('Error: ' + (errorData.message || 'Error en el servidor'));
                }
            } catch (error) {
                console.error('Error al guardar:', error);
                alert('Error al guardar el documento: ' + error.message);
            }
        });
    }

    // Configuration section event listeners
    const configBtn = document.getElementById('btn-guardar-config');
    const configMessage = document.getElementById('config-message');
    const preinscripcionEnabled = document.getElementById('config-preinscripcion-enabled');
    const preinscripcionUrl = document.getElementById('config-preinscripcion-url');

    // Load configuration on page load
    await loadConfigPage();

    if (configBtn) {
        configBtn.addEventListener('click', async () => {
            const enabled = preinscripcionEnabled.checked;
            const url = preinscripcionUrl.value;

            try {
                const res = await fetch('/api/config/preinscripcion', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeaders()
                    },
                    body: JSON.stringify({ enabled, url })
                });

                if (res.ok) {
                    configMessage.style.display = 'block';
                    configMessage.className = 'message success-message';
                    configMessage.textContent = '✅ Configuración guardada correctamente';
                    setTimeout(() => {
                        configMessage.style.display = 'none';
                    }, 3000);
                    // Recargar dropdown en el navbar cuando cambia preinscripción
                    await loadClaustrosInDropdown();
                } else {
                    configMessage.style.display = 'block';
                    configMessage.className = 'message error-message';
                    configMessage.textContent = '❌ Error al guardar la configuración';
                }
            } catch (error) {
                configMessage.style.display = 'block';
                configMessage.className = 'message error-message';
                configMessage.textContent = '❌ Error: ' + error.message;
            }
        });
    }

    // CLAUSTRO LINKS MANAGEMENT
    async function loadClaustroLinks(claustroId) {
        try {
            const res = await fetch(`/api/config/claustros/${claustroId}`, {
                headers: getAuthHeaders()
            });
            const claustro = await res.json();
            const linksList = document.getElementById('claustro-links-list');

            linksList.innerHTML = '';

            if (!claustro || !claustro.links || claustro.links.length === 0) {
                linksList.innerHTML = '<p style="color: #999;">No hay enlaces configurados para este claustro</p>';
                return;
            }

            claustro.links.forEach(link => {
                const item = document.createElement('div');
                item.className = 'student-link-item';
                item.innerHTML = `
                    <span class="student-link-icon">${escapeHtml(link.icon)}</span>
                    <div class="student-link-content">
                        <h5>${escapeHtml(link.title)}</h5>
                        <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener">${escapeHtml(link.url)}</a>
                    </div>
                    <div class="student-link-actions">
                        <button class="btn btn-edit" onclick="editClaustroLink('${claustroId}', '${link.id}', '${escapeHtml(link.title).replace(/'/g, "\\'")}', '${escapeHtml(link.url).replace(/'/g, "\\'")}', '${escapeHtml(link.icon)}')">✏️ Editar</button>
                        <button class="btn btn-danger" onclick="deleteClaustroLink('${claustroId}', '${link.id}')">🗑️ Eliminar</button>
                    </div>
                `;
                linksList.appendChild(item);
            });
        } catch (error) {
            console.error('Error cargando enlaces de claustro:', error);
        }
    }

    window.editClaustroLink = async function (claustroId, linkId, title, url, icon) {
        const newTitle = prompt('Nombre del enlace:', decodeURIComponent(title));
        if (!newTitle) return;

        const newUrl = prompt('URL:', decodeURIComponent(url));
        if (!newUrl) return;

        const newIcon = prompt('Emoji/Icono:', decodeURIComponent(icon)) || '🔗';

        try {
            const res = await fetch(`/api/config/claustros/${claustroId}/links/${linkId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({ title: newTitle, url: newUrl, icon: newIcon })
            });

            if (res.ok) {
                alert('Enlace actualizado correctamente');
                await loadClaustroLinks(claustroId);
                await loadClaustrosInDropdown();
            } else {
                alert('Error al actualizar el enlace');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    window.deleteClaustroLink = async function (claustroId, linkId) {
        if (!confirm('¿Estás seguro de que deseas eliminar este enlace?')) return;

        try {
            const res = await fetch(`/api/config/claustros/${claustroId}/links/${linkId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (res.ok) {
                alert('Enlace eliminado correctamente');
                await loadClaustroLinks(claustroId);
                await loadClaustrosInDropdown();
            } else {
                alert('Error al eliminar el enlace');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    // Event listeners para la sección de claustros
    const claustroSelect = document.getElementById('claustro-select');
    const claustroFormContainer = document.getElementById('claustro-form-container');
    const claustroLinksContainer = document.getElementById('claustro-links-container');
    const btnAgregarClaustroLink = document.getElementById('btn-agregar-claustro-link');

    if (claustroSelect) {
        claustroSelect.addEventListener('change', async (e) => {
            const claustroId = e.target.value;

            if (!claustroId) {
                claustroFormContainer.style.display = 'none';
                claustroLinksContainer.style.display = 'none';
                return;
            }

            // Actualizar nombre del claustro
            const claustroNombre = claustroSelect.options[claustroSelect.selectedIndex].text;
            document.getElementById('claustro-nombre').textContent = claustroNombre;
            document.getElementById('claustro-nombre-display').textContent = claustroNombre;

            claustroFormContainer.style.display = 'block';
            claustroLinksContainer.style.display = 'block';

            // Limpiar formulario
            document.getElementById('claustro-link-title').value = '';
            document.getElementById('claustro-link-url').value = '';
            document.getElementById('claustro-link-icon').value = '';

            // Cargar enlaces existentes
            await loadClaustroLinks(claustroId);
        });
    }

    if (btnAgregarClaustroLink) {
        btnAgregarClaustroLink.addEventListener('click', async (e) => {
            e.preventDefault();

            const claustroId = document.getElementById('claustro-select').value;
            if (!claustroId) {
                alert('Por favor selecciona un claustro');
                return;
            }

            const title = document.getElementById('claustro-link-title').value.trim();
            const url = document.getElementById('claustro-link-url').value.trim();
            const icon = document.getElementById('claustro-link-icon').value.trim() || '🔗';

            if (!title || !url) {
                alert('Por favor completa todos los campos requeridos');
                return;
            }

            try {
                const res = await fetch(`/api/config/claustros/${claustroId}/links`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeaders()
                    },
                    body: JSON.stringify({ title, url, icon })
                });

                if (res.ok) {
                    alert('Enlace agregado correctamente');
                    document.getElementById('claustro-link-title').value = '';
                    document.getElementById('claustro-link-url').value = '';
                    document.getElementById('claustro-link-icon').value = '';

                    await loadClaustroLinks(claustroId);
                    await loadClaustrosInDropdown();
                } else {
                    alert('Error al agregar el enlace');
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });
    }

    // Load initial admin data
    await loadAdminNews();
});
// Estas funciones se declaran en window para que el HTML (onclick) pueda verlas
window.editarDocumento = async function (id) {
    try {
        const res = await fetch(`/api/documents/${id}`);
        const doc = await res.json();

        editingDocId = id; // Usamos la variable global de tu app.js

        // Llenar el formulario del modal
        document.getElementById('doc-title').value = doc.title;
        document.getElementById('doc-category').value = doc.category;
        document.getElementById('doc-description').value = doc.description;
        document.getElementById('doc-file-name').textContent = 'Archivo: ' + doc.fileName;

        // El PDF no es obligatorio al editar
        document.getElementById('doc-file').required = false;

        document.getElementById('modal-doc-titulo').textContent = 'Editar Documento';
        document.getElementById('modal-documento').classList.add('active');
    } catch (error) {
        alert('Error al obtener datos del documento');
    }
};

window.eliminarDocumento = async function (id) {
    if (!confirm('¿Estás seguro de eliminar este documento permanentemente?')) return;

    try {
        const res = await fetch(`/api/documents/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (res.ok) {
            alert('Documento eliminado correctamente');
            if (typeof loadAdminDocumentos === 'function') {
                await loadAdminDocumentos(); // Recarga la tabla
            }
        } else {
            alert('Error al eliminar el documento');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};