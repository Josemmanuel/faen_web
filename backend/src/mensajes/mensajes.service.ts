import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';
import { DATA_DIR } from '../utils/paths';

export interface MensajeItem {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
  fecha: string;          // human readable
  fechaISO?: number;      // timestamp
  leido?: boolean;
}

@Injectable()
export class MensajesService {
  
  private getFilePath(): string {
    return join(DATA_DIR, 'mensajes.json');
  }

  private ensureFile() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const filePath = this.getFilePath();
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]));
    }
  }

  findAll(): MensajeItem[] {
    try {
      this.ensureFile();
      const raw = fs.readFileSync(this.getFilePath(), 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error en findAll() de Mensajes:', err.message);
      return [];
    }
  }

  findOne(id: string): MensajeItem | undefined {
    return this.findAll().find(m => m.id === id);
  }

  create(data: Partial<MensajeItem>): MensajeItem {
    const mensajes = this.findAll();
    const now = Date.now();
    const item: MensajeItem = {
      id: now.toString(),
      nombre: data.nombre || '',
      email: data.email || '',
      telefono: data.telefono || '',
      asunto: data.asunto || '',
      mensaje: data.mensaje || '',
      fecha: new Date().toLocaleString('es-AR'),
      fechaISO: now,
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