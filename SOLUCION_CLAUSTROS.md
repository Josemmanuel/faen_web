# Solución: Integración de Preinscripción y Autogestión en Claustros

## Cambios Implementados ✅

### 1. **Estructura de Datos - config.json**

Se actualizó la sección de estudiantes con 3 enlaces pregargados:

```json
{
  "id": "estudiantes",
  "name": "Estudiantes",
  "icon": "👨‍🎓",
  "links": [
    {
      "title": "Preinscripción",
      "url": "https://guarani.unf.edu.ar/preinscripcion/unaf/?__o=",
      "icon": "📝",
      "id": "preinscripcion",
      "conditional": "preinscripcion"  ← Muestra solo si está habilitada
    },
    {
      "title": "Autogestión",
      "url": "https://guarani.unf.edu.ar/autogestion/",
      "icon": "🔐",
      "id": "autogestion",
      "conditional": null  ← Siempre visible
    },
    {
      "title": "Aula Virtual",
      "url": "https://faen.ead2.unf.edu.ar/",
      "icon": "🔗",
      "id": "1768951051946"  ← Siempre visible
    }
  ]
}
```

#### Campo `conditional`:
- `"preinscripcion"` - El enlace solo se muestra si la preinscripción está habilitada
- `null` - El enlace siempre es visible

### 2. **JavaScript - app.js**

#### Función: `loadClaustrosInDropdown()`

**Cambios principales:**

1. **Obtiene configuración de preinscripción**
   ```javascript
   const configRes = await fetch('/api/config/preinscripcion');
   const preinscripcionConfig = await configRes.json();
   ```

2. **Filtra enlaces según configuración**
   ```javascript
   let visibleLinks = claustro.links.filter(link => {
       if (link.conditional === 'preinscripcion') {
           return preinscripcionConfig.enabled === true;
       }
       return true;
   });
   ```

3. **Agregó event listeners para mejor UX**
   - Click en claustro para desplegar/cerrar en mobile
   - Rotación de flecha al desplegar
   - Cierre automático al seleccionar un enlace

#### Evento: Guardado de Configuración

Se actualizó el evento de guardar preinscripción para recargar el dropdown:
```javascript
if (res.ok) {
    // ... mostrar mensaje...
    await loadClaustrosInDropdown();  // ← NUEVO
}
```

### 3. **CSS - styles.css**

**Nuevos estilos agregados:**

1. **`.dropdown-claustro.active .dropdown-submenu`**
   - Muestra el submenu cuando se añade clase `active`

2. **Rotación de flecha**
   ```css
   .dropdown-claustro.active .dropdown-claustro-toggle .dropdown-arrow {
       transform: rotate(90deg);
   }
   ```

3. **Transición suave**
   - Agregadas transiciones a la flecha y fondo

---

## Cómo Funciona Ahora

### Flujo de Usuario Final

1. **Navbar muestra:**
   ```
   📚 Claustro ▼
   ```

2. **Al hacer click (mobile) o hover (desktop):**
   ```
   👨‍🎓 Estudiantes ▶
   ```

3. **Al expandir Estudiantes:**
   ```
   👨‍🎓 Estudiantes ▼
   ├─ 📝 Preinscripción     ← Solo si está habilitada
   ├─ 🔐 Autogestión       ← Siempre visible
   └─ 🔗 Aula Virtual      ← Siempre visible
   ```

### Control desde Admin

1. **Ir a:** Configuración → Preinscripción
2. **Marcar/desmarcar:** "Habilitar Preinscripción"
3. **Guardar**
4. ✅ **El enlace Preinscripción aparece/desaparece automáticamente en el navbar**

### Agregar Más Enlaces

1. **Ir a:** Configuración → Enlaces para Claustros
2. **Seleccionar claustro:** Estudiantes
3. **Agregar enlace:** Nombre, URL, emoji
4. ✅ **Aparece inmediatamente en el navbar**

---

## Problemas Resueltos

### ❌ Problema 1: No se expandía el submenu de Estudiantes
**Causa:** El CSS solo usaba `:hover`, no funcionaba en mobile ni con enlaces

**Solución:** 
- Agregados event listeners en JavaScript
- Se puede expandir con click en mobile
- Se mantiene el hover para desktop

### ❌ Problema 2: Preinscripción no se respetaba
**Causa:** No había lógica para filtrar según habilitación

**Solución:**
- Campo `conditional` en config.json
- Filtrado en JavaScript antes de renderizar
- Recarga automática al cambiar configuración

### ❌ Problema 3: Los enlaces de preinscripción y autogestión no estaban pregargados
**Causa:** Solo había Aula Virtual

**Solución:**
- Agregados en el config.json con URLs correctas
- Preinscripción con lógica condicional
- Autogestión siempre visible

---

## Estructura Técnica

### IDs de Identificación

```
Claustros (fijos):
├─ estudiantes
├─ graduados
├─ docentes
└─ no-docentes

Enlaces de Estudiantes:
├─ preinscripcion    (condicional)
├─ autogestion       (siempre visible)
└─ 1768951051946     (Aula Virtual - siempre visible)
```

### Condiciones Soportadas

| Valor | Comportamiento |
|-------|----------------|
| `"preinscripcion"` | Se muestra solo si `/api/config/preinscripcion.enabled == true` |
| `null` (o ausente) | Siempre visible |

---

## Verificación

Para verificar que todo funciona:

1. **Abrir navegador:** http://localhost:3000
2. **En navbar:** Click en "📚 Claustro"
3. **Debe mostrar:** Preinscripción, Autogestión, Aula Virtual
4. **En admin:** Configuración → Preinscripción
5. **Desmarcar** "Habilitar Preinscripción"
6. **En navbar:** Preinscripción desaparece automáticamente ✅

---

## Notas Técnicas

- **Sin recargar página:** Los cambios se reflejan en tiempo real
- **Responsive:** Funciona en mobile con event listeners
- **Sincronizado:** Admin y público se actualizar automáticamente
- **Escalable:** Permite agregar más campos `conditional` en futuro

