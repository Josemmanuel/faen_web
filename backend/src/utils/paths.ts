import { join, extname, basename } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';

// 1. Definimos la raíz del proyecto (subiendo 3 niveles desde src/utils)
export const PROJECT_ROOT = join(__dirname, '..', '..', '..');

// 2. Ruta para archivos subidos (faen_web/public/uploads)
export const UPLOAD_DIR = join(PROJECT_ROOT, 'public', 'uploads');

// 3. Ruta para los archivos JSON (faen_web/data) <-- AGREGADO
export const DATA_DIR = join(PROJECT_ROOT, 'data');

// Función para limpiar nombres de archivos
export const getSafeFilename = (originalname: string) => {
  const timestamp = Date.now();
  const ext = extname(originalname);
  const safeName = basename(originalname, ext)
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\-_]/g, '');
  return `${timestamp}-${safeName}${ext}`;
};

// Configuración centralizada de Multer
export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      if (!existsSync(UPLOAD_DIR)) {
        mkdirSync(UPLOAD_DIR, { recursive: true });
      }
      cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
      cb(null, getSafeFilename(file.originalname));
    },
  }),
};