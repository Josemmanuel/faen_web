import { diskStorage } from 'multer';
import { join, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

function getUploadsDir() {
  // Use resolve to properly navigate from __dirname to the project root
  // __dirname is /backend/src/news when running with ts-node-dev
  // Going up 3 levels: src/news -> src -> backend -> /home/josemanuel/Documentos/faen_web
  const uploadsPath = resolve(__dirname, '../../../..', 'public', 'uploads');
  console.log('📁 multer getUploadsDir() resolved to:', uploadsPath);
  if (!existsSync(uploadsPath)) {
    console.log('📁 Creating uploads directory:', uploadsPath);
    mkdirSync(uploadsPath, { recursive: true });
  }
  return uploadsPath;
}

export const multerOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, getUploadsDir());
    },
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + '-' + file.originalname;
      console.log('Saving file as:', uniqueName);
      cb(null, uniqueName);
    },
  }),
};
