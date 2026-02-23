import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface Foto {
  id: string;
  titulo: string;
  url: string; 
  fecha: string;
}

@Injectable()
export class GaleriaService {
  /**
   * Obtiene la ruta al archivo JSON.
   * Ajustado para que apunte a la carpeta 'data' dentro de 'backend'.
   */
  private getFilePath(): string {
   
    return path.join(process.cwd(), '..','data', 'galeria.json');
  }

  /**
   * Retorna todas las fotos del archivo JSON.
   */
  async findAll(): Promise<Foto[]> {
    try {
      const filePath = this.getFilePath();
      const data = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      // Si el archivo no existe o está vacío, retornamos array vacío
      return [];
    }
  }

  /**
   * Crea una nueva entrada en la galería.
   */
  async create(imagePath: string, titulo: string = 'Sin título'): Promise<Foto> {
    const fotos = await this.findAll();
    
    const nuevaFoto: Foto = {
      id: Date.now().toString(),
      titulo: titulo.trim(),
      url: imagePath, // Se guarda con la barra / que agregamos en el controller
      fecha: new Date().toLocaleString(),
    };

    fotos.push(nuevaFoto);
    
    await fs.writeFile(
      this.getFilePath(),
      JSON.stringify(fotos, null, 2),
      'utf-8'
    );

    return nuevaFoto;
  }

  /**
   * Elimina el registro del JSON y el archivo físico de la carpeta public.
   */
  async remove(id: string): Promise<boolean> {
    const fotos = await this.findAll();
    const foto = fotos.find((f) => f.id === id);

    if (!foto) return false;

    // 1. Borrado físico del archivo
    try {
      // Limpiamos la URL: quitamos la barra '/' inicial para que path.join funcione en Linux
      const relativePath = foto.url.startsWith('/') ? foto.url.substring(1) : foto.url;
      
      // Construimos la ruta: backend/public/uploads/...
      const fullPath = path.join(process.cwd(), '..', 'public', relativePath);
      
      await fs.unlink(fullPath);
      console.log('Archivo eliminado físicamente:', fullPath);
    } catch (error) {
      // Si el archivo no existe físicamente, informamos pero seguimos para limpiar el JSON
      console.warn('No se pudo eliminar el archivo físico:', error.message);
    }

    // 2. Actualización del JSON
    const fotosFiltradas = fotos.filter((f) => f.id !== id);
    await fs.writeFile(
      this.getFilePath(),
      JSON.stringify(fotosFiltradas, null, 2),
      'utf-8'
    );

    return true;
  }
}