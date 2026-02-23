import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';
import { DATA_DIR, UPLOAD_DIR } from '../utils/paths';

export interface NewsItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  image?: string | null;
}

@Injectable()
export class NewsService {
  private getFilePath(): string {
    return join(DATA_DIR, 'news.json');
  }

  private ensureFile() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const filePath = this.getFilePath();
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
  }

  findAll(): NewsItem[] {
    this.ensureFile();
    try {
      const raw = fs.readFileSync(this.getFilePath(), 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      return [];
    }
  }

  findOne(id: string): NewsItem | undefined {
    return this.findAll().find(n => n.id === id);
  }

  create(data: Partial<NewsItem>): NewsItem {
    const news = this.findAll();
    const item: NewsItem = {
      id: Date.now().toString(),
      title: data.title || 'Sin título',
      description: data.description || '',
      date: data.date || new Date().toISOString(),
      image: data.image || null,
    };
    news.push(item);
    fs.writeFileSync(this.getFilePath(), JSON.stringify(news, null, 2));
    return item;
  }

  update(id: string, data: Partial<NewsItem>): NewsItem | null {
    const news = this.findAll();
    const idx = news.findIndex(n => n.id === id);
    if (idx === -1) return null;

    // Si viene una imagen nueva y ya había una, podrías borrar la vieja aquí
    // pero por ahora solo actualizamos los campos
    news[idx] = { ...news[idx], ...data };
    fs.writeFileSync(this.getFilePath(), JSON.stringify(news, null, 2));
    return news[idx];
  }

  remove(id: string): boolean {
    const news = this.findAll();
    const idx = news.findIndex(n => n.id === id);
    if (idx === -1) return false;

    const item = news[idx];
    
    // Borrado físico de la imagen
    if (item.image) {
      const fileName = item.image.split('/').pop(); // Obtenemos solo el nombre del archivo
      if (fileName) {
        const fullPath = join(UPLOAD_DIR, fileName);
        if (fs.existsSync(fullPath)) {
          try {
            fs.unlinkSync(fullPath);
          } catch (e) {
            console.error('No se pudo borrar físicamente:', fullPath);
          }
        }
      }
    }

    news.splice(idx, 1);
    fs.writeFileSync(this.getFilePath(), JSON.stringify(news, null, 2));
    return true;
  }
}