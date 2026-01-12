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
@Injectable()
export class DocumentsService {
  private getFilePath(): string {
    const projectRoot = (globalThis as any)['projectRoot'] || path.resolve(__dirname, '../..');
    return path.resolve(projectRoot, 'data/documents.json');
  }

  private ensureFile() {
    const filePath = this.getFilePath();
    if (!fs.existsSync(filePath)) {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify([]));
    }
  }

  findAll(): DocumentItem[] {
    try {
      this.ensureFile();
      const filePath = this.getFilePath();
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error en findAll():', err.message);
      console.error('DOCUMENTS_FILE path:', this.getFilePath());
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
    fs.writeFileSync(this.getFilePath(), JSON.stringify(documents, null, 2));
    return item;
  }

  update(id: string, data: Partial<DocumentItem>): DocumentItem | null {
    const documents = this.findAll();
    const idx = documents.findIndex(d => d.id === id);
    if (idx === -1) return null;
    documents[idx] = { ...documents[idx], ...data };
    fs.writeFileSync(this.getFilePath(), JSON.stringify(documents, null, 2));
    return documents[idx];
  }

  remove(id: string): boolean {
    const documents = this.findAll();
    const idx = documents.findIndex(d => d.id === id);
    if (idx === -1) return false;
    const item = documents[idx];

    // Eliminar archivo PDF local si existe
    if (item.filePath) {
      const uploadsDir = path.resolve((globalThis as any)['projectRoot'] || __dirname, 'public');
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
    fs.writeFileSync(this.getFilePath(), JSON.stringify(documents, null, 2));
    return true;
  }
}
