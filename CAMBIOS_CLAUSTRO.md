# Cambios Implementados: Sección Claustro

## Resumen
Se ha reemplazado la sección "Estudiantes" del navbar por un nuevo sistema de "Claustro" que incluye 4 subcategorías: Estudiantes, Graduados, Docentes y No Docentes. Todos los enlaces son administrables desde la sección de Configuración del panel de administración.

---

## Cambios Realizados

### 1. **Backend - TypeScript/NestJS**

#### `backend/src/config/config.service.ts`
- ✅ Agregadas interfaces:
  - `ClaustroLink`: Estructura para enlaces de claustro
  - `Claustro`: Estructura principal de claustro
  - Actualización de `ConfigData` para incluir `claustros?`

- ✅ Agregados métodos:
  - `getClaustros()`: Obtiene todos los claustros
  - `getClaustroById(id: string)`: Obtiene un claustro específico
  - `addLinkToClaustro(claustroId, link)`: Agrega enlace a un claustro
  - `updateClaustroLink(claustroId, linkId, link)`: Actualiza enlace
  - `removeLinkFromClaustro(claustroId, linkId)`: Elimina enlace

- ✅ Configuración por defecto con 4 claustros:
  - 👨‍🎓 Estudiantes
  - 🎓 Graduados
  - 👨‍🏫 Docentes
  - 👨‍💼 No Docentes

#### `backend/src/config/config.controller.ts`
- ✅ Agregadas rutas:
  - `GET /api/config/claustros` - Obtiene todos los claustros
  - `GET /api/config/claustros/:id` - Obtiene un claustro específico
  - `POST /api/config/claustros/:id/links` - Agrega enlace (protegido)
  - `PUT /api/config/claustros/:id/links/:linkId` - Actualiza enlace (protegido)
  - `DELETE /api/config/claustros/:id/links/:linkId` - Elimina enlace (protegido)

---

### 2. **Base de Datos**

#### `data/config.json`
- ✅ Añadida nueva sección `claustros` con estructura:
```json
"claustros": [
  {
    "id": "estudiantes",
    "name": "Estudiantes",
    "icon": "👨‍🎓",
    "links": []
  },
  // ... más claustros
]
```

---

### 3. **Frontend - HTML**

#### `public/index.html`
- ✅ Cambio en navbar:
  - Nombre: "Estudiantes" → "Claustro"
  - Icono: 👨‍🎓 → 📚
  - ID del dropdown: `claustro-dropdown`
  - Los enlaces se cargan dinámicamente mediante JavaScript

#### `public/admin.html`
- ✅ Nueva sección en Configuración: **"Enlaces para Claustros"**
- ✅ Formulario incluye:
  - Selector de claustro (dropdown)
  - Formulario para agregar enlaces (nombre, URL, icono)
  - Listado de enlaces existentes con opciones Editar/Eliminar
  - Mensaje de estado (éxito/error)

---

### 4. **Frontend - CSS**

#### `public/css/styles.css`
- ✅ Nuevos estilos agregados:
  - `.dropdown-claustro`: Contenedor de cada claustro
  - `.dropdown-claustro-toggle`: Botón del claustro con flecha
  - `.dropdown-submenu`: Menú desplegable de enlaces
  - Estilos hover para interactividad
  - Posicionamiento y z-index para superposición correcta

---

### 5. **Frontend - JavaScript**

#### `public/js/app.js`

**Nuevas funciones públicas:**

1. **`loadClaustrosInDropdown()`**
   - Carga todos los claustros desde la API
   - Crea estructura HTML dinámica con submenús
   - Maneja claustros sin enlaces (deshabilitados)

2. **`loadClaustroLinks(claustroId)`** (en panel admin)
   - Carga enlaces de un claustro específico
   - Renderiza tarjetas con acciones Editar/Eliminar

3. **`editClaustroLink(claustroId, linkId, title, url, icon)`** (ventana global)
   - Permite editar enlaces mediante prompts
   - Actualiza en servidor y recarga UI

4. **`deleteClaustroLink(claustroId, linkId)`** (ventana global)
   - Elimina enlace con confirmación
   - Actualiza dropdown del navbar

**Listeners agregados:**
- `claustro-select`: Cambio de claustro → muestra formulario y enlaces
- `btn-agregar-claustro-link`: Agregar nuevo enlace a claustro
- Carga automática de claustros al iniciar página

---

## Flujo de Uso

### Para administradores:

1. Acceder a **Panel de Administración → Configuración**
2. Ir a sección **"Enlaces para Claustros"**
3. Seleccionar claustro del dropdown (Estudiantes, Graduados, Docentes, No Docentes)
4. Agregar nuevo enlace:
   - Nombre del enlace
   - URL
   - Emoji/Icono (opcional)
5. Editar o eliminar enlaces existentes
6. Los cambios se reflejan automáticamente en el navbar

### Para usuarios finales:

1. En el navbar, clickear en **"Claustro"** 📚
2. Se muestra un menú con los 4 claustros
3. Cada claustro expandible muestra sus enlaces configurados
4. Clickear en enlace abre en nueva ventana

---

## Arquitectura API

```
GET  /api/config/claustros                           → Obtiene todos
GET  /api/config/claustros/:id                       → Obtiene uno
POST /api/config/claustros/:id/links                 → Crea enlace
PUT  /api/config/claustros/:id/links/:linkId         → Actualiza enlace
DELETE /api/config/claustros/:id/links/:linkId       → Elimina enlace
```

Todas las operaciones de escritura (POST, PUT, DELETE) están protegidas con `BasicAuthGuard`.

---

## Notas Técnicas

- **IDs de claustro**: `estudiantes`, `graduados`, `docentes`, `no-docentes` (fijos)
- **Icono de claustro**: No editable, definido en configuración
- **Submenús**: Posicionados a la derecha del claustro (responsive a derecha/izquierda)
- **Base64**: No utilizado en esta sección (a diferencia de otras)
- **Persistencia**: Todos los datos se guardan en `data/config.json`

---

## Testing

✅ Compilación TypeScript: Sin errores
✅ Estructura HTML: Válida
✅ IDs únicos en HTML: Verificados
✅ Rutas API: Documentadas y protegidas
