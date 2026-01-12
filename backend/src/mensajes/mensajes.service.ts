import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface MensajeItem {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
  fecha: string;
  leido?: boolean;
}

@Injectable()
export class MensajesService {
  private getFilePath(): string {
    const projectRoot = (globalThis as any)['projectRoot'] || path.resolve(__dirname, '../..');
    return path.resolve(projectRoot, 'data/mensajes.json');
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

  findAll(): MensajeItem[] {
    try {
      this.ensureFile();
      const filePath = this.getFilePath();
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error en findAll():', err.message);
      throw err;
    }
  }

  findOne(id: string): MensajeItem | undefined {
    return this.findAll().find(m => m.id === id);
  }

  create(data: Partial<MensajeItem>): MensajeItem {
    const mensajes = this.findAll();
    const item: MensajeItem = {
      id: Date.now().toString(),
      nombre: data.nombre || '',
      email: data.email || '',
      telefono: data.telefono || '',
      asunto: data.asunto || '',
      mensaje: data.mensaje || '',
      fecha: new Date().toLocaleString('es-AR'),
      leido: false,
    };
    mensajes.push(item);
    fs.writeFileSync(this.getFilePath(), JSON.stringify(mensajes, null, 2));
    return item;
  }

  markAsRead(id: string): MensajeItem | null {
    const mensajes = this.findAll();
    const idx = mensajes.findIndex(m => m.id === id);
    if (idx === -1) return null;
    mensajes[idx].leido = true;
    fs.writeFileSync(this.getFilePath(), JSON.stringify(mensajes, null, 2));
    return mensajes[idx];
  }

  remove(id: string): boolean {
    const mensajes = this.findAll();
    const idx = mensajes.findIndex(m => m.id === id);
    if (idx === -1) return false;
    mensajes.splice(idx, 1);
    fs.writeFileSync(this.getFilePath(), JSON.stringify(mensajes, null, 2));
    return true;
  }
}
