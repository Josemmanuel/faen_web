import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
// Importamos las rutas centralizadas que ya tienes
import { UPLOAD_DIR, DATA_DIR } from '../utils/paths';

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
    // Usamos DATA_DIR que ya está configurado en paths.ts
    return path.join(DATA_DIR, 'autoridades.json');
  }

  private ensureFile() {
    const filePath = this.getFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
  }

  findAll(): AutoridadItem[] {
    this.ensureFile();
    try {
      const raw = fs.readFileSync(this.getFilePath(), 'utf8');
      return JSON.parse(raw || '[]');
    } catch (err) {
      return [];
    }
  }

  findOne(id: string): AutoridadItem | undefined {
    return this.findAll().find(a => a.id === id);
  }

  create(data: Partial<AutoridadItem>): AutoridadItem {
    const autoridades = this.findAll();
    
    const item: AutoridadItem = {
      id: Date.now().toString(),
      nombre: (data.nombre || 'Sin nombre').trim(),
      cargo: (data.cargo || 'Sin cargo').trim(),
      email: data.email?.trim() || '',
      telefono: data.telefono?.trim() || '',
      // Si data.foto viene vacío, ponemos el default
      foto: data.foto || '/uploads/default-avatar.png',
      fechaCreacion: new Date().toLocaleString()
    } as any;
    
    autoridades.push(item);
    this.saveToFile(autoridades);
    return item;
  }

  update(id: string, data: Partial<AutoridadItem>): AutoridadItem | null {
    const autoridades = this.findAll();
    const idx = autoridades.findIndex(a => a.id === id);
    if (idx === -1) return null;

    // Si se actualiza la foto, el controlador debe pasar la ruta completa (/uploads/...)
    autoridades[idx] = { ...autoridades[idx], ...data };
    this.saveToFile(autoridades);
    return autoridades[idx];
  }

  async remove(id: string): Promise<boolean> {
    const autoridades = this.findAll();
    const idx = autoridades.findIndex(a => a.id === id);
    if (idx === -1) return false;

    const autoridad = autoridades[idx];

    // Borrado físico de la foto
    if (autoridad.foto && !autoridad.foto.includes('default-avatar.png')) {
      try {
        // Obtenemos el nombre del archivo quitando el "/uploads/"
        // Si la foto es "/uploads/foto.jpg", nos queda "foto.jpg"
        const fileName = autoridad.foto.replace('/uploads/', '');
        const fotoPath = path.join(UPLOAD_DIR, fileName);
        
        if (fs.existsSync(fotoPath)) {
          fs.unlinkSync(fotoPath);
          console.log('Foto de autoridad eliminada:', fotoPath);
        }
      } catch (err) {
        console.warn('No se pudo borrar la foto física:', err.message);
      }
    }

    autoridades.splice(idx, 1);
    this.saveToFile(autoridades);
    return true;
  }

  private saveToFile(data: AutoridadItem[]) {
    fs.writeFileSync(this.getFilePath(), JSON.stringify(data, null, 2));
  }
}