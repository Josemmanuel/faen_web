import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

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
    const projectRoot = (globalThis as any)['projectRoot'] || path.resolve(__dirname, '../..');
    return path.resolve(projectRoot, 'data/news.json');
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

  findAll(): NewsItem[] {
    try {
      this.ensureFile();
      const filePath = this.getFilePath();
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error en findAll():', err.message);
      console.error('NEWS_FILE path:', this.getFilePath());
      throw err;
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
    news[idx] = { ...news[idx], ...data };
    fs.writeFileSync(this.getFilePath(), JSON.stringify(news, null, 2));
    return news[idx];
  }

  remove(id: string): boolean {
    const news = this.findAll();
    const idx = news.findIndex(n => n.id === id);
    if (idx === -1) return false;
    const item = news[idx];
    
    // Eliminar imagen local si existe
    if (item.image && item.image.startsWith('/uploads/')) {
      // Calcular ruta correcta: ../../../public/uploads/...
      const uploadsDir = path.resolve((globalThis as any)['projectRoot'] || __dirname, 'public');
      const fileOnDisk = path.join(uploadsDir, item.image);
      
      try {
        if (fs.existsSync(fileOnDisk)) {
          fs.unlinkSync(fileOnDisk);
          console.log(`Imagen eliminada: ${fileOnDisk}`);
        }
      } catch (err) {
        console.error(`Error al eliminar imagen ${fileOnDisk}:`, err.message);
      }
    }
    
    news.splice(idx, 1);
    fs.writeFileSync(this.getFilePath(), JSON.stringify(news, null, 2));
    return true;
  }
}
