import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface Foto {
  id: string;
  titulo: string;
  ruta: string;
  fecha: string;
}

@Injectable()
export class GaleriaService {
  private getFilePath(): string {
    const projectRoot = (globalThis as any)['projectRoot'] || path.resolve(__dirname, '../..');
    return path.resolve(projectRoot, 'data/galeria.json');
  }

  async getAllFotos(): Promise<Foto[]> {
    try {
      const data = await fs.readFile(this.getFilePath(), 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async addFoto(foto: Foto): Promise<Foto> {
    const fotos = await this.getAllFotos();
    fotos.push(foto);
    await fs.writeFile(
      this.getFilePath(),
      JSON.stringify(fotos, null, 2),
      'utf-8'
    );
    return foto;
  }

  async deleteFoto(id: string): Promise<void> {
    let fotos = await this.getAllFotos();
    const foto = fotos.find((f) => f.id === id);

    if (foto) {
      const projectRoot = (globalThis as any)['projectRoot'] || path.resolve(__dirname, '../..');
      const filePath = path.join(projectRoot, 'public', foto.ruta);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    fotos = fotos.filter((f) => f.id !== id);
    await fs.writeFile(
      this.getFilePath(),
      JSON.stringify(fotos, null, 2),
      'utf-8'
    );
  }
}
