import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';
import { DATA_DIR, UPLOAD_DIR } from '../utils/paths';

export interface DocumentItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  fileName: string;
  filePath: string;
  uploadedAt: string;
}

@Injectable()
export class DocumentsService {
  
  private getFilePath(): string {
    return join(DATA_DIR, 'documents.json');
  }

  private ensureFile() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const filePath = this.getFilePath();
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
  }

  findAll(): DocumentItem[] {
  this.ensureFile();
  try {
    const raw = fs.readFileSync(this.getFilePath(), 'utf8');
    if (!raw.trim()) return []; // Si está vacío devuelve array
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error en DocumentsService:', err);
    return []; // 👈 Importante: devuelve [] ante cualquier error para no romper el controlador
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
    this.saveToFile(documents);
    return item;
  }

  update(id: string, data: Partial<DocumentItem>): DocumentItem | null {
    const documents = this.findAll();
    const idx = documents.findIndex(d => d.id === id);
    if (idx === -1) return null;
    documents[idx] = { ...documents[idx], ...data };
    this.saveToFile(documents);
    return documents[idx];
  }

  private saveToFile(data: DocumentItem[]) {
    fs.writeFileSync(this.getFilePath(), JSON.stringify(data, null, 2));
  }

  remove(id: string): boolean {
    const documents = this.findAll();
    const idx = documents.findIndex(d => d.id === id);
    if (idx === -1) return false;
    const item = documents[idx];

    if (item.filePath) {
      const fileName = item.filePath.replace('uploads/', '').replace(/^\//, '');
      const fileOnDisk = join(UPLOAD_DIR, fileName);
      try {
        if (fs.existsSync(fileOnDisk)) {
          fs.unlinkSync(fileOnDisk);
        }
      } catch (err) {
        console.error(`Error al eliminar PDF físico:`, err.message);
      }
    }

    documents.splice(idx, 1);
    this.saveToFile(documents);
    return true;
  }
}