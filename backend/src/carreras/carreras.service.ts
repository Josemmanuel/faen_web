import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface CarreraItem {
  id: string;
  title: string;
  code: string;
  description: string;
  fullDescription?: string;
  duration: number;
  foto?: string;
  documento?: string;
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
    console.log('=== CREATE CARRERA ===');
    console.log('Datos recibidos:', data);
    
    const carreras = this.findAll();
    
    // Validación y sanitización
    const title = (data.title || '').toString().trim();
    const code = (data.code || '').toString().trim();
    const description = (data.description || '').toString().trim();
    const fullDescription = (data.fullDescription || '').toString().trim();
    
    if (!title) {
      throw new Error('El nombre de la carrera no puede estar vacío');
    }
    if (!code) {
      throw new Error('El código no puede estar vacío');
    }
    if (!description) {
      throw new Error('La descripción no puede estar vacía');
    }
    
    const item: CarreraItem = {
      id: Date.now().toString(),
      title: title,
      code: code,
      description: description,
      fullDescription: fullDescription || description,
      duration: parseInt(data.duration?.toString() || '1', 10),
      foto: data.foto || undefined,
      documento: data.documento || undefined,
    };
    
    console.log('Item a guardar:', item);
    carreras.push(item);
    fs.writeFileSync(this.getFilePath(), JSON.stringify(carreras, null, 2));
    console.log('Carrera guardada exitosamente');
    console.log('Total carreras:', carreras.length);
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
