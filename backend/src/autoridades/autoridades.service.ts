import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface AutoridadItem {
  id: string;
  nombre: string;
  cargo: string;
  email?: string;
  telefono?: string;
  foto?: string;
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
    try {
      console.log('=== CREATE AUTORIDAD ===');
      console.log('Datos recibidos:', data);
      console.log('data.nombre:', data.nombre, 'tipo:', typeof data.nombre, 'length:', data.nombre?.length);
      console.log('data.cargo:', data.cargo, 'tipo:', typeof data.cargo, 'length:', data.cargo?.length);
      
      if (!data.nombre || data.nombre.trim() === '') {
        throw new Error('Nombre es requerido y no puede estar vacío');
      }
      if (!data.cargo || data.cargo.trim() === '') {
        throw new Error('Cargo es requerido y no puede estar vacío');
      }
      
      const autoridades = this.findAll();
      const item: AutoridadItem = {
        id: Date.now().toString(),
        nombre: data.nombre.trim(),
        cargo: data.cargo.trim(),
      };
      
      // Solo agregar campos opcionales si existen
      if (data.email && data.email.trim()) item.email = data.email.trim();
      if (data.telefono && data.telefono.trim()) item.telefono = data.telefono.trim();
      if (data.foto && data.foto.trim()) item.foto = data.foto;
      
      console.log('Item a guardar:', item);
      const filePath = this.getFilePath();
      console.log('Guardando en:', filePath);
      
      autoridades.push(item);
      fs.writeFileSync(filePath, JSON.stringify(autoridades, null, 2));
      console.log('Autoridad guardada exitosamente');
      console.log('Total autoridades:', autoridades.length);
      return item;
    } catch (err) {
      console.error('Error en create():', err);
      throw err;
    }
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
