# Ejemplos Visuales - Sistema de Claustros

## 1. Estructura del Dropdown en el Navbar

### Estado: Preinscripción HABILITADA ✅

```
┌─────────────────────────────────────┐
│  📚 Claustro ▼                      │ ← Click aquí
└─────────────────────────────────────┘
         ↓ Se expande
    ┌────────────────────────┐
    │ 👨‍🎓 Estudiantes ▶      │
    │ 🎓 Graduados           │
    │ 👨‍🏫 Docentes            │
    │ 👨‍💼 No Docentes        │
    └────────────────────────┘
         ↓ Al expandir Estudiantes
    ┌────────────────────────┐
    │ 👨‍🎓 Estudiantes ▼      │
    │  ├─ 📝 Preinscripción  │  ← VISIBLE
    │  ├─ 🔐 Autogestión     │  ← VISIBLE
    │  └─ 🔗 Aula Virtual    │  ← VISIBLE
    │                        │
    │ 🎓 Graduados (sin...)  │
    │ 👨‍🏫 Docentes (sin...)   │
    │ 👨‍💼 No Docentes (sin...) │
    └────────────────────────┘
```

### Estado: Preinscripción DESHABILITADA ❌

```
    ┌────────────────────────┐
    │ 👨‍🎓 Estudiantes ▼      │
    │  ├─ 🔐 Autogestión     │  ← VISIBLE
    │  └─ 🔗 Aula Virtual    │  ← VISIBLE
    │ (Preinscripción oculta)│
    │                        │
    │ 🎓 Graduados (sin...)  │
    │ 👨‍🏫 Docentes (sin...)   │
    │ 👨‍💼 No Docentes (sin...) │
    └────────────────────────┘
```

---

## 2. Flujo de Cambio de Configuración

### Escenario: Desactivar Preinscripción

```
PASO 1: Admin entra a Configuración
┌──────────────────────────────────────────┐
│ Configuración del Sitio                  │
├──────────────────────────────────────────┤
│ ☑ Habilitar Preinscripción              │
│ URL: https://guarani.unf.edu.ar/... │
│                                          │
│ [💾 Guardar Configuración]              │
└──────────────────────────────────────────┘

PASO 2: Desmarca la opción
┌──────────────────────────────────────────┐
│ Configuración del Sitio                  │
├──────────────────────────────────────────┤
│ ☐ Habilitar Preinscripción   ← CAMBIO   │
│ URL: https://guarani.unf.edu.ar/... │
│                                          │
│ [💾 Guardar Configuración]              │
└──────────────────────────────────────────┘

PASO 3: Clickea Guardar
┌──────────────────────────────────────────┐
│ ✅ Configuración guardada correctamente  │ ← MENSAJE
└──────────────────────────────────────────┘
         ↓
    Backend guarda
    loadClaustrosInDropdown() se ejecuta
         ↓

RESULTADO INMEDIATO EN EL NAVBAR:
Sitio Público → Click en 📚 Claustro
┌────────────────────────┐
│ 👨‍🎓 Estudiantes ▼      │
│  ├─ 🔐 Autogestión     │  ← SIGUE VISIBLE
│  └─ 🔗 Aula Virtual    │  ← SIGUE VISIBLE
│                        │
│ 🎓 Graduados (sin...)  │
│ 👨‍🏫 Docentes (sin...)   │
│ 👨‍💼 No Docentes (sin...) │
└────────────────────────┘
  (Preinscripción YA NO APARECE)
```

---

## 3. Estructura del config.json

```json
{
  "preinscripcion": {
    "enabled": true,
    "url": "https://guarani.unf.edu.ar/preinscripcion/unaf/?__o="
  },
  "claustros": [
    {
      "id": "estudiantes",
      "name": "Estudiantes",
      "icon": "👨‍🎓",
      "links": [
        {
          "title": "Preinscripción",
          "url": "...",
          "icon": "📝",
          "id": "preinscripcion",
          "conditional": "preinscripcion"  ← CLAVE: "preinscripcion"
        },
        {
          "title": "Autogestión",
          "url": "...",
          "icon": "🔐",
          "id": "autogestion",
          "conditional": null  ← CLAVE: null (siempre visible)
        },
        {
          "title": "Aula Virtual",
          "url": "...",
          "icon": "🔗",
          "id": "1768951051946"
          "conditional": null  ← Sin campo = siempre visible
        }
      ]
    }
  ]
}
```

---

## 4. Lógica de Filtrado (JavaScript)

```javascript
// 1. Obtener configuración de preinscripción
const configRes = await fetch('/api/config/preinscripcion');
const preinscripcionConfig = await configRes.json();
// { enabled: true/false, url: "..." }

// 2. Filtrar enlaces según "conditional"
let visibleLinks = claustro.links.filter(link => {
    if (link.conditional === 'preinscripcion') {
        // Solo mostrar si preinscripcion.enabled === true
        return preinscripcionConfig.enabled === true;
    }
    // Si no tiene "conditional" o es null, siempre mostrar
    return true;
});

// Resultado:
// - Si enabled=true  → [Preinscripción, Autogestión, Aula Virtual]
// - Si enabled=false → [Autogestión, Aula Virtual]
```

---

## 5. Casos de Uso Adicionales

### Caso: Agregar Nuevo Enlace Condicional

Si en futuro quisieras otro enlace condicional (ej: basado en temporada):

```json
{
  "title": "Inscripción a Materias",
  "url": "https://...",
  "icon": "📚",
  "id": "inscripcion-materias",
  "conditional": "periodo-inscripcion"  ← Nueva condición
}
```

Luego en la API:
```json
{
  "periodo-inscripcion": {
    "enabled": true
  }
}
```

Y en JavaScript:
```javascript
if (link.conditional === 'periodo-inscripcion') {
    return periodoInscripcionConfig.enabled === true;
}
```

---

## 6. Interactividad del Submenu

### Desktop (Hover)
```
📚 Claustro
└─ Pasas mouse sobre → Se abre automáticamente
```

### Mobile (Click)
```
📚 Claustro
└─ Tocas para expandir → Se abre
   └─ Tocas un enlace → Se cierra automáticamente
```

### Animación de Flecha
```
Cerrado:  👨‍🎓 Estudiantes ▶
           ↓ click
Abierto:  👨‍🎓 Estudiantes ▼  ← Flecha rotada 90°
```

---

## 7. Ventajas de Esta Implementación

| Aspecto | Ventaja |
|---------|---------|
| **Escalabilidad** | Nuevas condiciones sin cambiar código |
| **Flexibilidad** | Cada enlace tiene su propia lógica |
| **Performance** | Filtrado en cliente (sin llamadas API extra) |
| **UX** | Cambios inmediatos sin recargar |
| **Mobile** | Event listeners funcionan en todos los dispositivos |
| **Mantenibilidad** | Lógica clara en config.json |

---

## 8. Testing Rápido

Abre la consola del navegador (F12) y prueba:

```javascript
// Ver los claustros cargados
const res = await fetch('/api/config/claustros');
const claustros = await res.json();
console.log(claustros);

// Ver configuración de preinscripción
const config = await fetch('/api/config/preinscripcion');
const prein = await config.json();
console.log(prein);
// { enabled: true/false, url: "..." }
```

