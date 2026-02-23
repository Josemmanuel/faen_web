import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { UPLOAD_DIR, DATA_DIR } from '../utils/paths';

export interface CarreraItem {
  id: string;
  title: string;
  code: string;
  description: string;
  fullDescription?: string;
  duration: number;
  category?: string;
  foto?: string;
  documento?: string | null;
}

@Injectable()
export class CarrerasService {
  private getFilePath(): string {
    return path.join(DATA_DIR, 'carreras.json');
  }

  // MÉTODO 1: Para findAll()
  findAll(): CarreraItem[] {
    const filePath = this.getFilePath();
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  }

  // MÉTODO 2: Para findOne() <-- Asegúrate que se llame exactamente así
  findOne(id: string): CarreraItem | undefined {
    return this.findAll().find(c => c.id === id);
  }

  // MÉTODO 3: Para create()
  create(data: Partial<CarreraItem>): CarreraItem {
    const carreras = this.findAll();
    const item: CarreraItem = {
      id: Date.now().toString(),
      title: (data.title || '').toString().trim(),
      code: (data.code || '').toString().trim(),
      description: (data.description || '').toString().trim(),
      fullDescription: data.fullDescription?.trim() || data.description?.trim(),
      duration: parseInt(data.duration?.toString() || '1', 10),
      category: data.category || 'grado',
      foto: data.foto,
      documento: data.documento || null,
    };
    
    carreras.push(item);
    fs.writeFileSync(this.getFilePath(), JSON.stringify(carreras, null, 2));
    return item;
  }

  // MÉTODO 4: Para update() <-- Asegúrate que reciba (id, data)
  update(id: string, data: Partial<CarreraItem>): CarreraItem | null {
    const carreras = this.findAll();
    const idx = carreras.findIndex(c => c.id === id);
    if (idx === -1) return null;

    carreras[idx] = { ...carreras[idx], ...data };
    fs.writeFileSync(this.getFilePath(), JSON.stringify(carreras, null, 2));
    return carreras[idx];
  }

  // MÉTODO 5: Para remove()
  remove(id: string): boolean {
    const carreras = this.findAll();
    const idx = carreras.findIndex(c => c.id === id);
    if (idx === -1) return false;

    const carrera = carreras[idx];
    
    [carrera.foto, carrera.documento].forEach(file => {
      if (file && file !== 'uploads/default-carrera.png') {
        const fullPath = path.join(UPLOAD_DIR, '..', file);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      }
    });

    carreras.splice(idx, 1);
    fs.writeFileSync(this.getFilePath(), JSON.stringify(carreras, null, 2));
    return true;
  }
}