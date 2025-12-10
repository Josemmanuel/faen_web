/* scripts.js - Sistema de Noticias */

// Configuración de sesión
const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutos en milisegundos

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
            // Actualizar indicador de tiempo restante
            updateSessionTimer(elapsed);
        }
    }, 10000); // Verificar cada 10 segundos
}

function updateSessionTimer(elapsed) {
    const remaining = Math.max(0, Math.floor((SESSION_TIMEOUT - elapsed) / 1000));
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    
    let timerDisplay = document.getElementById('session-timer');
    if (!timerDisplay) {
        timerDisplay = document.createElement('div');
        timerDisplay.id = 'session-timer';
        timerDisplay.style.position = 'absolute';
        timerDisplay.style.bottom = '10px';
        timerDisplay.style.right = '20px';
        timerDisplay.style.fontSize = '12px';
        timerDisplay.style.color = '#666';
        timerDisplay.style.backgroundColor = '#fffbcc';
        timerDisplay.style.padding = '5px 10px';
        timerDisplay.style.borderRadius = '4px';
        timerDisplay.style.border = '1px solid #f0ad4e';
        
        const header = document.querySelector('header');
        if (header) {
            header.style.position = 'relative';
            header.appendChild(timerDisplay);
        }
    }
    
    timerDisplay.textContent = 'Sesión expira en: ' + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    
    if (remaining < 60) {
        timerDisplay.style.color = '#d32f2f';
        timerDisplay.style.backgroundColor = '#ffebee';
        timerDisplay.style.borderColor = '#d32f2f';
    }
}

function logoutSession() {
    sessionStorage.removeItem('admin_user');
    sessionStorage.removeItem('admin_pass');
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('admin_last_activity');
    alert('Tu sesión ha expirado. Por favor, vuelve a ingresar.');
    window.location.href = 'index.html';
}

function updateSessionActivity() {
    sessionStorage.setItem('admin_last_activity', Date.now().toString());
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

document.addEventListener('DOMContentLoaded', async () => {
    const isAdminPage = window.location.pathname.includes('admin.html') || 
                       document.getElementById('admin-section') !== null ||
                       document.getElementById('news-form') !== null;
    
    if (isAdminPage) {
        const isAuthenticated = sessionStorage.getItem('admin_authenticated');
        if (!isAuthenticated) {
            const credentials = await showLoginModal();
            if (!credentials) {
                window.location.href = 'index.html';
                return;
            }
            sessionStorage.setItem('admin_user', credentials.user);
            sessionStorage.setItem('admin_pass', credentials.pass);
            sessionStorage.setItem('admin_authenticated', 'true');
            sessionStorage.setItem('admin_last_activity', Date.now().toString());
        }
        
        // Iniciar timer de sesión y crear botón de logout
        startSessionTimer();
        createLogoutButton();
        
        // Actualizar actividad con cada interacción
        document.addEventListener('click', updateSessionActivity);
        document.addEventListener('keypress', updateSessionActivity);
    }

    const newsList = document.getElementById('news-list');
    if (newsList) {
        loadNews();
    }

    const newsForm = document.getElementById('news-form');
    if (newsForm) {
        setupAdminPanel(newsForm);
    }
});

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

// --- FUNCIÓN PARA LEER Y MOSTRAR NOTICIAS ---
function loadNews() {
    const newsList = document.getElementById('news-list');
    if (!newsList) return;
    
    newsList.innerHTML = '<p>Cargando noticias...</p>';
    
    fetch('/api/news')
        .then(res => {
            if (!res.ok) {
                throw new Error('HTTP error, status = ' + res.status);
            }
            return res.json();
        })
        .then(newsData => {
            if (!newsData || newsData.length === 0) {
                newsList.innerHTML = '<p>No hay noticias publicadas.</p>';
                return;
            }

            newsList.innerHTML = ''; // Limpiar el mensaje de carga

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
        })
        .catch((error) => {
            console.error('Error al cargar noticias:', error);
            newsList.innerHTML = '<p>Error al cargar noticias: ' + error.message + '</p>';
        });
}

// Utilidades
function makeExcerpt(text, max) {
    if (!text) return '';
    if (text.length <= max) return text;
    return text.slice(0, max).trim() + '...';
}

function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// --- FUNCIÓN PARA PANEL DE ADMINISTRACIÓN ---
function setupAdminPanel(newsForm) {
    const adminList = document.getElementById('admin-news-list');
    if (!adminList) return;

    const cancelBtn = document.getElementById('cancel-edit');
    let editingId = null;

    function getAuthHeaders() {
        const user = sessionStorage.getItem('admin_user') || 'admin';
        const pass = sessionStorage.getItem('admin_pass') || '1234';
        const credentials = btoa(user + ':' + pass);
        return {
            'Authorization': 'Basic ' + credentials
        };
    }

    async function loadAdminNews() {
        try {
            const res = await fetch('/api/news');
            const data = await res.json();
            adminList.innerHTML = '';
            if (!data || data.length === 0) {
                adminList.innerHTML = '<p>No hay noticias.</p>';
                return;
            }
            data.slice().reverse().forEach(n => {
                const item = document.createElement('div');
                item.className = 'news-item';
                const itemHTML = '<h4>' + escapeHtml(n.title) + '</h4>' +
                    '<small>' + escapeHtml(n.date) + '</small>' +
                    '<p>' + escapeHtml(n.description) + '</p>' +
                    '<div style="margin-top:8px;">' +
                    '<button class="edit-btn" data-id="' + n.id + '">Editar</button>' +
                    '<button class="delete-btn" data-id="' + n.id + '">Eliminar</button>' +
                    '</div>';
                item.innerHTML = itemHTML;
                adminList.appendChild(item);
            });

            // Añadir listeners a los botones de editar
            adminList.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.dataset.id;
                    const res = await fetch('/api/news');
                    const all = await res.json();
                    const news = all.find(x => x.id === id);
                    if (!news) return alert('Noticia no encontrada');
                    document.getElementById('news-title').value = news.title;
                    document.getElementById('news-description').value = news.description;
                    document.getElementById('news-date').value = news.date;
                    editingId = id;
                    if (cancelBtn) cancelBtn.style.display = 'inline-block';
                });
            });

            // Añadir listeners a los botones de eliminar
            adminList.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.dataset.id;
                    if (!confirm('¿Eliminar esta noticia?')) return;
                    const res = await fetch('/api/news/' + id, {
                        method: 'DELETE',
                        headers: getAuthHeaders()
                    });
                    if (res.ok) {
                        await loadAdminNews();
                        alert('Noticia eliminada');
                    } else {
                        const err = await res.json().catch(() => null);
                        alert('Error al eliminar: ' + (err && err.error ? err.error : res.statusText));
                    }
                });
            });

        } catch (err) {
            adminList.innerHTML = '<p>Error cargando noticias.</p>';
        }
    }

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

        const user = sessionStorage.getItem('admin_user') || 'admin';
        const pass = sessionStorage.getItem('admin_pass') || '1234';
        const credentials = btoa(user + ':' + pass);
        
        const res = await fetch(url, {
            method: method,
            body: formData,
            headers: {
                'Authorization': 'Basic ' + credentials
            }
        });
        if (res.ok) {
            alert(editingId ? 'Noticia actualizada' : 'Noticia creada');
            newsForm.reset();
            editingId = null;
            if (cancelBtn) cancelBtn.style.display = 'none';
            await loadAdminNews();
        } else {
            const text = await res.text();
            alert('Error: ' + text);
        }
    });

    if (cancelBtn) {
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            newsForm.reset();
            editingId = null;
            cancelBtn.style.display = 'none';
        });
    }

    loadAdminNews();
}

// --- CARRUSEL DE FOTOS ---
let currentSlide = 0;
let carouselPhotos = [];

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

        carouselPhotos = photos;
        carouselTrack.innerHTML = '';
        carouselDots.innerHTML = '';

        photos.forEach((photo, index) => {
            // Crear slide
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.innerHTML = '<img src="' + escapeHtml(photo.ruta) + '" alt="' + escapeHtml(photo.titulo) + '">' +
                '<div class="carousel-slide-overlay">' +
                '<div class="carousel-slide-title">' + escapeHtml(photo.titulo) + '</div>' +
                '<p class="carousel-slide-date">' + escapeHtml(photo.fecha) + '</p>' +
                '</div>';
            carouselTrack.appendChild(slide);

            // Crear punto de navegación
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
            dot.onclick = () => goToSlide(index);
            carouselDots.appendChild(dot);
        });

        currentSlide = 0;
        updateCarouselPosition();
        
        // Auto-avance del carrusel cada 5 segundos
        setInterval(() => {
            currentSlide = (currentSlide + 1) % carouselPhotos.length;
            updateCarouselPosition();
        }, 5000);

    } catch (error) {
        console.error('Error cargando carrusel:', error);
        carouselContainer.style.display = 'none';
    }
}

function updateCarouselPosition() {
    const track = document.getElementById('carousel-track');
    if (track) {
        track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
    }

    // Actualizar puntos
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
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
    if (index >= 0 && index < carouselPhotos.length) {
        currentSlide = index;
        updateCarouselPosition();
    }
}

// Llamar a loadCarousel en el DOMContentLoaded si estamos en index.html
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('carousel-container')) {
            loadCarousel();
        }
    });
} else {
    if (document.getElementById('carousel-container')) {
        loadCarousel();
    }
}/* Admin Dashboard Scripts */

let editingId = null;
let galeriaFotos = []; // Array para almacenar referencias a fotos

document.addEventListener('DOMContentLoaded', () => {
    // ===== SECCIONES =====
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.dashboard-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const href = item.getAttribute('href');
            if (href === 'index.html') return; // Permitir link a index
            
            e.preventDefault();
            const sectionId = item.dataset.section;
            if (!sectionId) return;

            // Actualizar nav activo
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Actualizar sección visible
            sections.forEach(sec => sec.classList.remove('active'));
            document.getElementById('section-' + sectionId).classList.add('active');

            if (sectionId === 'galeria') {
                loadGaleria();
            }
        });
    });

    // ===== NOTICIAS =====
    const modal = document.getElementById('modal-noticia');
    const btnNuevaNoticia = document.getElementById('btn-nueva-noticia');
    const modalClose = document.getElementById('modal-close');
    const formCancel = document.getElementById('form-cancel');
    const newsForm = document.getElementById('news-form');
    const fileInput = document.getElementById('news-image');
    const fileName = document.getElementById('file-name');
    const imagePreview = document.getElementById('image-preview');

    // Abrir modal de noticia
    btnNuevaNoticia.addEventListener('click', (e) => {
        e.preventDefault();
        editingId = null;
        newsForm.reset();
        imagePreview.innerHTML = '';
        fileName.textContent = 'Ningún archivo seleccionado';
        document.getElementById('modal-titulo').textContent = 'Nueva Noticia';
        modal.classList.add('active');
    });

    // Cerrar modal de noticia
    const closeModal = () => {
        modal.classList.remove('active');
        editingId = null;
        newsForm.reset();
        imagePreview.innerHTML = '';
        fileName.textContent = 'Ningún archivo seleccionado';
    };

    modalClose.addEventListener('click', closeModal);
    formCancel.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Mostrar nombre del archivo de noticia
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

    // Enviar formulario de noticia
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

        const user = sessionStorage.getItem('admin_user') || 'admin';
        const pass = sessionStorage.getItem('admin_pass') || '1234';
        const credentials = btoa(user + ':' + pass);
        
        try {
            const res = await fetch(url, {
                method: method,
                body: formData,
                headers: {
                    'Authorization': 'Basic ' + credentials
                }
            });
            
            if (res.ok) {
                alert(editingId ? 'Noticia actualizada correctamente' : 'Noticia creada correctamente');
                closeModal();
                await loadAdminNews();
            } else {
                const text = await res.text();
                alert('Error: ' + text);
            }
        } catch (error) {
            alert('Error al guardar la noticia: ' + error.message);
        }
    });

    // ===== GALERÍA =====
    const modalFoto = document.getElementById('modal-foto');
    const btnSubirFoto = document.getElementById('btn-subir-foto');
    const modalFotoClose = document.getElementById('modal-foto-close');
    const fotoFormCancel = document.getElementById('foto-form-cancel');
    const fotoForm = document.getElementById('foto-form');
    const fotoFileInput = document.getElementById('foto-file');
    const fotoFileName = document.getElementById('foto-file-name');
    const fotoPreview = document.getElementById('foto-preview');

    // Abrir modal de foto
    btnSubirFoto.addEventListener('click', (e) => {
        e.preventDefault();
        fotoForm.reset();
        fotoPreview.innerHTML = '';
        fotoFileName.textContent = 'Ningún archivo seleccionado';
        modalFoto.classList.add('active');
    });

    // Cerrar modal de foto
    const closeFotoModal = () => {
        modalFoto.classList.remove('active');
        fotoForm.reset();
        fotoPreview.innerHTML = '';
        fotoFileName.textContent = 'Ningún archivo seleccionado';
    };

    modalFotoClose.addEventListener('click', closeFotoModal);
    fotoFormCancel.addEventListener('click', closeFotoModal);

    modalFoto.addEventListener('click', (e) => {
        if (e.target === modalFoto) {
            closeFotoModal();
        }
    });

    // Mostrar nombre del archivo de foto
    fotoFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            fotoFileName.textContent = file.name;
            const reader = new FileReader();
            reader.onload = (event) => {
                fotoPreview.innerHTML = '<img src="' + event.target.result + '" alt="Preview">';
            };
            reader.readAsDataURL(file);
        } else {
            fotoFileName.textContent = 'Ningún archivo seleccionado';
            fotoPreview.innerHTML = '';
        }
    });

    // Enviar formulario de foto
    fotoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const titulo = document.getElementById('foto-titulo').value || 'Sin título';
        const fileInput = document.getElementById('foto-file');

        if (!fileInput.files || !fileInput.files[0]) {
            alert('Por favor selecciona una foto');
            return;
        }

        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('foto', fileInput.files[0]);

        const user = sessionStorage.getItem('admin_user') || 'admin';
        const pass = sessionStorage.getItem('admin_pass') || '1234';
        const credentials = btoa(user + ':' + pass);
        
        try {
            const res = await fetch('/api/galeria/subir', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': 'Basic ' + credentials
                }
            });
            
            if (res.ok) {
                alert('Foto subida correctamente');
                closeFotoModal();
                await loadGaleria();
            } else {
                const text = await res.text();
                alert('Error: ' + text);
            }
        } catch (error) {
            alert('Error al subir la foto: ' + error.message);
        }
    });

    // Cargar noticias al iniciar
    loadAdminNews();
});

function getAuthHeaders() {
    const user = sessionStorage.getItem('admin_user') || 'admin';
    const pass = sessionStorage.getItem('admin_pass') || '1234';
    const credentials = btoa(user + ':' + pass);
    return {
        'Authorization': 'Basic ' + credentials
    };
}

async function loadAdminNews() {
    const adminList = document.getElementById('admin-news-list');
    
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

        const editingId = id;
        document.getElementById('news-title').value = news.title;
        document.getElementById('news-description').value = news.description || '';
        document.getElementById('news-date').value = news.date;
        document.getElementById('modal-titulo').textContent = 'Editar Noticia';

        if (news.image) {
            const imagePreview = document.getElementById('image-preview');
            imagePreview.innerHTML = '<img src="' + news.image + '" alt="Preview">';
            document.getElementById('file-name').textContent = 'Imagen actual';
        }

        window.editingId = editingId;
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

async function loadGaleria() {
    const galeriaGrid = document.getElementById('galeria-grid');
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
            item.innerHTML = '<div class="galeria-img-wrapper">' +
                '<img src="' + foto.ruta + '" alt="' + escapeHtml(foto.titulo) + '" class="galeria-img">' +
                '<div class="galeria-overlay">' +
                '<button class="btn-galeria-delete" data-id="' + foto.id + '">🗑️ Eliminar</button>' +
                '</div>' +
                '</div>' +
                '<div class="galeria-info">' +
                '<p class="galeria-titulo">' + escapeHtml(foto.titulo) + '</p>' +
                '<p class="galeria-fecha">' + escapeHtml(foto.fecha) + '</p>' +
                '</div>';
            galeriaGrid.appendChild(item);
        });

        document.querySelectorAll('.btn-galeria-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const id = e.target.dataset.id;
                await deleteFoto(id);
            });
        });

    } catch (err) {
        console.error('Error cargando galería:', err);
        galeriaGrid.innerHTML = '<p class="text-center" style="grid-column: 1 / -1;">Error cargando fotos</p>';
    }
}

async function deleteFoto(id) {
    if (!confirm('¿Eliminar esta foto?')) {
        return;
    }

    try {
        const res = await fetch('/api/galeria/' + id, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (res.ok) {
            alert('Foto eliminada');
            await loadGaleria();
        } else {
            alert('Error al eliminar la foto');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
/* news-detail.js - Cargar y mostrar noticia individual */

document.addEventListener('DOMContentLoaded', async () => {
    // Obtener el ID de la noticia desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get('id');

    if (!newsId) {
        document.getElementById('news-detail').innerHTML = '<p>Noticia no encontrada. <a href="index.html">Volver a noticias</a></p>';
        return;
    }

    try {
        const res = await fetch('/api/news/' + decodeURIComponent(newsId));
        if (!res.ok) {
            throw new Error('Noticia no encontrada');
        }
        const news = await res.json();

        // Llenar los datos de la noticia
        document.getElementById('news-title').textContent = news.title || 'Sin título';
        document.getElementById('news-date').textContent = 'Publicado: ' + (news.date || 'Sin fecha');
        document.getElementById('news-body').innerHTML = '<p>' + escapeHtml(news.description || 'Sin descripción') + '</p>';
        
        // Mostrar imagen si existe
        const imageContainer = document.getElementById('news-image-container');
        if (news.image) {
            imageContainer.innerHTML = '<img src="' + news.image + '" alt="' + escapeHtml(news.title) + '" class="news-detail-img">';
        } else {
            imageContainer.innerHTML = '<div class="news-detail-no-image">📷 Sin imagen</div>';
        }

        // Actualizar título de la página
        document.title = news.title + ' - Noticias';

    } catch (error) {
        console.error('Error cargando noticia:', error);
        document.getElementById('news-detail').innerHTML = '<p>Error al cargar la noticia. <a href="index.html">Volver a noticias</a></p>';
    }
});

function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
