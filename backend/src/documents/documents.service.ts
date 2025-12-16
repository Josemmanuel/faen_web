import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface DocumentItem {
  id: string;
  title: string;
  description?: string;
  category: string; // "constancias", "notas", "guias", etc
  fileName: string;
  filePath: string;
  uploadedAt: string;
}

// Calcular la ruta correcta del archivo documents.json
const DOCUMENTS_FILE = path.resolve(__dirname, '../../../data/documents.json');

@Injectable()
export class DocumentsService {
  private ensureFile() {
    if (!fs.existsSync(DOCUMENTS_FILE)) {
      fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify([]));
    }
  }

  findAll(): DocumentItem[] {
    try {
      this.ensureFile();
      const raw = fs.readFileSync(DOCUMENTS_FILE, 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error en findAll():', err.message);
      console.error('DOCUMENTS_FILE path:', DOCUMENTS_FILE);
      throw err;
    }
  }

  findByCategory(category: string): DocumentItem[] {
    return this.findAll().filter(d => d.category === category);
  }

  findOne(id: string): DocumentItem | undefined {
    return this.findAll().find(d => d.id === id);
  }

  create(data: Partial<DocumentItem>): DocumentItem {
    const documents = this.findAll();
    const item: DocumentItem = {
      id: Date.now().toString(),
      title: data.title || 'Sin título',
      description: data.description || '',
      category: data.category || 'otros',
      fileName: data.fileName || '',
      filePath: data.filePath || '',
      uploadedAt: new Date().toISOString(),
    };
    documents.push(item);
    fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(documents, null, 2));
    return item;
  }

  update(id: string, data: Partial<DocumentItem>): DocumentItem | null {
    const documents = this.findAll();
    const idx = documents.findIndex(d => d.id === id);
    if (idx === -1) return null;
    documents[idx] = { ...documents[idx], ...data };
    fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(documents, null, 2));
    return documents[idx];
  }

  remove(id: string): boolean {
    const documents = this.findAll();
    const idx = documents.findIndex(d => d.id === id);
    if (idx === -1) return false;
    const item = documents[idx];

    // Eliminar archivo PDF local si existe
    if (item.filePath) {
      const uploadsDir = path.resolve(__dirname, '../../../public');
      const fileOnDisk = path.join(uploadsDir, item.filePath);

      try {
        if (fs.existsSync(fileOnDisk)) {
          fs.unlinkSync(fileOnDisk);
          console.log(`Documento eliminado: ${fileOnDisk}`);
        }
      } catch (err) {
        console.error(`Error al eliminar documento ${fileOnDisk}:`, err.message);
      }
    }

    documents.splice(idx, 1);
    fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(documents, null, 2));
    return true;
  }
}
