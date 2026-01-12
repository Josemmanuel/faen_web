import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface AutoridadItem {
  id: string;
  nombre: string;
  cargo: string;
  email?: string;
  telefono?: string;
}


@Injectable()
export class AutoridadesService {
  private getFilePath(): string {
    const projectRoot = (globalThis as any)['projectRoot'] || path.resolve(__dirname, '../..');
    return path.resolve(projectRoot, 'data/autoridades.json');
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

  findAll(): AutoridadItem[] {
    try {
      this.ensureFile();
      const raw = fs.readFileSync(this.getFilePath(), 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error en findAll():', err.message);
      throw err;
    }
  }

  findOne(id: string): AutoridadItem | undefined {
    return this.findAll().find(a => a.id === id);
  }

  create(data: Partial<AutoridadItem>): AutoridadItem {
    const autoridades = this.findAll();
    const item: AutoridadItem = {
      id: Date.now().toString(),
      nombre: data.nombre || '',
      cargo: data.cargo || '',
      email: data.email || '',
      telefono: data.telefono || '',
    };
    autoridades.push(item);
    fs.writeFileSync(this.getFilePath(), JSON.stringify(autoridades, null, 2));
    return item;
  }

  update(id: string, data: Partial<AutoridadItem>): AutoridadItem | null {
    const autoridades = this.findAll();
    const idx = autoridades.findIndex(a => a.id === id);
    if (idx === -1) return null;
    autoridades[idx] = { ...autoridades[idx], ...data };
    fs.writeFileSync(this.getFilePath(), JSON.stringify(autoridades, null, 2));
    return autoridades[idx];
  }

  remove(id: string): boolean {
    const autoridades = this.findAll();
    const idx = autoridades.findIndex(a => a.id === id);
    if (idx === -1) return false;
    autoridades.splice(idx, 1);
    fs.writeFileSync(this.getFilePath(), JSON.stringify(autoridades, null, 2));
    return true;
  }
}
