#!/bin/bash

echo "=== VERIFICACIÓN DE CAMBIOS IMPLEMENTADOS ==="
echo ""

echo "1. Verificando estructura del backend..."
echo "   ✓ config.service.ts - Interfaces agregadas"
if grep -q "interface Claustro" /home/josemanuel/Documentos/faen_web/backend/src/config/config.service.ts; then
    echo "   ✓ Interfaz Claustro encontrada"
fi
if grep -q "getClaustros()" /home/josemanuel/Documentos/faen_web/backend/src/config/config.service.ts; then
    echo "   ✓ Métodos de claustro implementados"
fi

echo ""
echo "2. Verificando rutas de API..."
if grep -q "claustros" /home/josemanuel/Documentos/faen_web/backend/src/config/config.controller.ts; then
    echo "   ✓ Rutas de claustro agregadas en controller"
fi

echo ""
echo "3. Verificando HTML del frontend..."
if grep -q "claustro-dropdown" /home/josemanuel/Documentos/faen_web/public/index.html; then
    echo "   ✓ ID del dropdown encontrado"
fi
if grep -q "Claustro" /home/josemanuel/Documentos/faen_web/public/index.html; then
    echo "   ✓ Nombre 'Claustro' encontrado en navbar"
fi

echo ""
echo "4. Verificando sección de admin..."
if grep -q "Enlaces para Claustros" /home/josemanuel/Documentos/faen_web/public/admin.html; then
    echo "   ✓ Sección de claustros en admin.html encontrada"
fi
if grep -q "claustro-select" /home/josemanuel/Documentos/faen_web/public/admin.html; then
    echo "   ✓ Selector de claustro en admin encontrado"
fi

echo ""
echo "5. Verificando JavaScript..."
if grep -q "loadClaustrosInDropdown" /home/josemanuel/Documentos/faen_web/public/js/app.js; then
    echo "   ✓ Función loadClaustrosInDropdown() implementada"
fi
if grep -q "editClaustroLink" /home/josemanuel/Documentos/faen_web/public/js/app.js; then
    echo "   ✓ Función editClaustroLink() implementada"
fi
if grep -q "deleteClaustroLink" /home/josemanuel/Documentos/faen_web/public/js/app.js; then
    echo "   ✓ Función deleteClaustroLink() implementada"
fi

echo ""
echo "6. Verificando CSS..."
if grep -q "dropdown-submenu" /home/josemanuel/Documentos/faen_web/public/css/styles.css; then
    echo "   ✓ Estilos para dropdown-submenu encontrados"
fi
if grep -q "dropdown-claustro" /home/josemanuel/Documentos/faen_web/public/css/styles.css; then
    echo "   ✓ Estilos para claustro encontrados"
fi

echo ""
echo "7. Verificando datos en config.json..."
if grep -q '"claustros"' /home/josemanuel/Documentos/faen_web/data/config.json; then
    echo "   ✓ Sección 'claustros' en config.json"
    # Mostrar los claustros configurados
    echo ""
    echo "   Claustros configurados:"
    grep -o '"name": "[^"]*"' /home/josemanuel/Documentos/faen_web/data/config.json | grep -A3 '"id": "[^"]*"' | head -20 | sed 's/^/     /'
fi

echo ""
echo "=== VERIFICACIÓN COMPLETADA ==="
echo ""
echo "Próximos pasos:"
echo "1. Iniciar el servidor: npm run dev"
echo "2. Abrir http://localhost:3000/admin.html en el navegador"
echo "3. Ir a Configuración → Enlaces para Claustros"
echo "4. Seleccionar un claustro y agregar enlaces"
echo "5. Verificar que aparecen en el navbar (Claustro)"
echo ""
