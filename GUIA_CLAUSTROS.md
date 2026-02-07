# Sistema de Claustros - Guía de Uso

## ¿Qué es un Claustro?

Un claustro es una agrupación de enlaces relacionados con un tipo de usuario específico en la universidad. Hay 4 claustros principales:

- **👨‍🎓 Estudiantes** - Enlaces y recursos para estudiantes activos
- **🎓 Graduados** - Enlaces y recursos para egresados y alumni
- **👨‍🏫 Docentes** - Enlaces y recursos para profesores
- **👨‍💼 No Docentes** - Enlaces y recursos para personal administrativo

---

## Acceso para Administradores

### 1. Ingresar al Panel de Administración

```
URL: http://localhost:3000/admin.html
Usuario: admin
Contraseña: 1234
```

### 2. Navegar a Configuración

1. Desde el menú lateral, clickear en **Configuración** (⚙️)
2. Desplazarse hasta la sección **"📚 Enlaces para Claustros"**

---

## Agregar un Enlace a un Claustro

### Paso 1: Seleccionar Claustro
1. En el dropdown "Claustro", seleccionar uno de los 4 opciones:
   - Estudiantes
   - Graduados
   - Docentes
   - No Docentes

### Paso 2: Rellenar Formulario
Se mostrarán tres campos:

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Nombre del enlace** | Texto descriptivo del enlace | "Aula Virtual", "Portal de Estudiantes" |
| **URL** | Dirección web completa | `https://faen.ead2.unf.edu.ar/` |
| **Emoji/Icono** | Un solo emoji para representar | 💻, 📚, 🎓, etc. |

### Paso 3: Guardar
Clickear el botón **"➕ Agregar enlace"**

### Resultado
- El enlace aparecerá en la lista de "Enlaces de [Claustro]"
- Se reflejará automáticamente en el navbar del sitio público

---

## Ver y Gestionar Enlaces Existentes

Después de seleccionar un claustro, aparece la sección **"Enlaces de [Claustro]"** que muestra:

### Para cada enlace:
- 📌 Icono del enlace
- 📄 Nombre del enlace
- 🔗 URL (clickeable)
- **Botones de acción:**
  - ✏️ **Editar** - Modifica nombre, URL e icono
  - 🗑️ **Eliminar** - Borra el enlace (con confirmación)

---

## Ejemplo de Uso Completo

### Escenario: Agregar enlace de Aula Virtual para Estudiantes

1. **Ingresar a Admin** → Configuración
2. **Seleccionar claustro**: "Estudiantes"
3. **Completar formulario**:
   - Nombre: `Aula Virtual`
   - URL: `https://faen.ead2.unf.edu.ar/`
   - Emoji: `💻`
4. **Clickear "Agregar enlace"**
5. ✅ El enlace aparece en la lista
6. 👀 **En el sitio público**, al visitar navbar → Claustro → Estudiantes, aparecerá:
   ```
   💻 Aula Virtual
   ```

---

## Cómo Aparece en el Sitio Público

### Navbar del Sitio
```
🏠 Inicio  |  ❓ Guía  |  🎓 Carreras  |  👔 Autoridades  |  📞 Contacto  |  📚 Claustro ▼
```

### Al hacer hover/click en "Claustro"
```
📚 Claustro
├─ 👨‍🎓 Estudiantes ▶
│  ├─ 💻 Aula Virtual
│  ├─ 📚 Biblioteca Digital
│  └─ 📝 Formularios
├─ 🎓 Graduados ▶
│  └─ 🤝 Red de Egresados
├─ 👨‍🏫 Docentes ▶
│  ├─ 📊 Gestión de Calificaciones
│  └─ 📚 Recursos Docentes
└─ 👨‍💼 No Docentes ▶
   └─ ⚙️ Portal Administrativo
```

---

## Características Técnicas

### Almacenamiento
- Los datos se guardan en `data/config.json`
- Estructura JSON jerárquica por claustro

### Seguridad
- Solo administradores autenticados pueden modificar
- Las operaciones de escritura están protegidas con Basic Auth
- Las lecturas son públicas (para mostrar en navbar)

### Actualizaciones en Tiempo Real
- Los cambios se reflejan inmediatamente en el navbar
- No se requiere recargar la página

### Icono Fijo
- El emoji de cada claustro es **fijo** (no editable)
- Solo los enlaces tiene emojis editables

---

## Restricciones y Validaciones

| Validación | Descripción |
|-----------|------------|
| **Nombre requerido** | No puede estar vacío |
| **URL requerida** | Debe ser una URL válida |
| **Claustro requerido** | Debe seleccionar uno |
| **Emoji opcional** | Si no ingresa, se usa por defecto 🔗 |
| **URL abierta en nueva ventana** | `target="_blank"` y `rel="noopener"` |

---

## Casos de Uso Comunes

### 1. Agregar Portal de Autogestión para Estudiantes
```
Claustro: Estudiantes
Nombre: Autogestión Guaraní
URL: https://guarani.unf.edu.ar/autogestion/
Icono: 🔐
```

### 2. Agregar Red de Egresados para Graduados
```
Claustro: Graduados
Nombre: Red de Egresados
URL: https://egresados.unf.edu.ar/
Icono: 🤝
```

### 3. Agregar Portal de Docentes
```
Claustro: Docentes
Nombre: Portal Docente
URL: https://docentes.unf.edu.ar/
Icono: 📚
```

---

## Preguntas Frecuentes

### ¿Puedo agregar más de 4 claustros?
No, los claustros están predefinidos. Solo puedes agregar enlaces a los 4 existentes.

### ¿Qué pasa si no agrego enlaces a un claustro?
El claustro aparecerá deshabilitado en el navbar con el texto "(sin enlaces)".

### ¿Los cambios se guardan automáticamente?
Sí, al clickear "Agregar enlace" se guardan inmediatamente en la base de datos.

### ¿Puedo editar el nombre del claustro?
No, los nombres (Estudiantes, Graduados, etc.) son fijos.

### ¿Puedo cambiar el icono de un claustro?
No, los iconos de claustro son fijos. Solo los enlaces tienen emojis editables.

---

## Troubleshooting

### Los enlaces no aparecen en el navbar
- Verificar que el navegador no esté en caché
- Presionar F5 para recargar la página
- Verificar que el claustro tiene enlaces configurados

### El botón "Agregar enlace" no funciona
- Verificar que completó todos los campos requeridos (Nombre y URL)
- Verificar que seleccionó un claustro en el dropdown
- Revisar la consola del navegador para mensajes de error

### Las URLs no se abren
- Asegurarse que la URL incluya `https://` o `http://`
- Verificar que la URL es correcta y el sitio está disponible

---

## Ver Más

- Ver documento: [CAMBIOS_CLAUSTRO.md](./CAMBIOS_CLAUSTRO.md) - Detalles técnicos de implementación
- Ver ejemplo: [EJEMPLO_CONFIG.json](./EJEMPLO_CONFIG.json) - Estructura JSON con datos de ejemplo
