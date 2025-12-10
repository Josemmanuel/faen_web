import { diskStorage } from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const uploadsDir = join(__dirname, '..', '..', '..', 'public', 'uploads');

// Asegurar que la carpeta uploads existe
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

export const multerOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + '-' + file.originalname;
      console.log('Saving file as:', uniqueName);
      cb(null, uniqueName);
    },
  }),
};
