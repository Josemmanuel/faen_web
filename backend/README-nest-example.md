Resumen
======

Este directorio contiene ejemplos de archivos para crear un módulo `news` en un proyecto NestJS.

Instrucciones rápidas
---------------------

1. Crea un proyecto NestJS (si aún no lo tienes):

```bash
npm create nest@latest backend
cd backend
npm install
```

2. Copia los archivos de `nest-backend-example/src/` a `backend/src/` (manteniendo la estructura `news/`, `auth/`, etc.).

3. Añade las dependencias necesarias:

```bash
npm install @nestjs/platform-express multer class-transformer class-validator
```

4. Crea una carpeta `public/uploads` en la raíz del proyecto o asegúrate de que Multer la cree.

5. Define variables de entorno en `.env` (ejemplo en `.env.example`):

```
ADMIN_USER=admin
ADMIN_PASS=1234
```

6. Ejecuta en desarrollo:

```bash
npm run start:dev
```

Descripción de los archivos
---------------------------
- `news.controller.ts`: rutas CRUD (`GET`, `POST`, `PUT`, `DELETE`) y subida de imagen con `FileInterceptor`.
- `news.service.ts`: lógica para leer/escribir `news.json` y manejar imágenes en `public/uploads`.
- `dto/*.ts`: DTOs con validaciones (class-validator).
- `auth/basic-auth.guard.ts`: Guard que protege rutas usando Basic Auth basada en variables de entorno.

Notas
-----
- Estos archivos están diseñados como ejemplo funcional para proyectos pequeños y con fines de aprendizaje. En producción recomiendo usar una base de datos (Prisma/TypeORM) en vez de `news.json`.
