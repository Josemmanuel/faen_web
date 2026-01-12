import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface CarreraItem {
  id: string;
  title: string;
  code: string;
  description: string;
  duration: number;
}

// Calcular la ruta correcta del archivo carreras.json
@Injectable()
export class CarrerasService {
  private getFilePath(): string {
    const projectRoot = (globalThis as any)['projectRoot'] || path.resolve(__dirname, '../..');
    return path.resolve(projectRoot, 'data/carreras.json');
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

  findAll(): CarreraItem[] {
    try {
      this.ensureFile();
      const filePath = this.getFilePath();
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error en findAll():', err.message);
      console.error('CARRERAS_FILE path:', this.getFilePath());
      throw err;
    }
  }

  findOne(id: string): CarreraItem | undefined {
    return this.findAll().find(c => c.id === id);
  }

  create(data: Partial<CarreraItem>): CarreraItem {
    const carreras = this.findAll();
    const item: CarreraItem = {
      id: Date.now().toString(),
      title: data.title || 'Sin título',
      code: data.code || '',
      description: data.description || '',
      duration: data.duration || 1,
    };
    carreras.push(item);
    fs.writeFileSync(this.getFilePath(), JSON.stringify(carreras, null, 2));
    return item;
  }

  update(id: string, data: Partial<CarreraItem>): CarreraItem | null {
    const carreras = this.findAll();
    const idx = carreras.findIndex(c => c.id === id);
    if (idx === -1) return null;
    carreras[idx] = { ...carreras[idx], ...data };
    fs.writeFileSync(this.getFilePath(), JSON.stringify(carreras, null, 2));
    return carreras[idx];
  }

  remove(id: string): boolean {
    const carreras = this.findAll();
    const idx = carreras.findIndex(c => c.id === id);
    if (idx === -1) return false;
    carreras.splice(idx, 1);
    fs.writeFileSync(this.getFilePath(), JSON.stringify(carreras, null, 2));
    return true;
  }
}
