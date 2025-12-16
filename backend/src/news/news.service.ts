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

// Calcular la ruta correcta del archivo news.json
// Cuando se ejecuta con ts-node dev, __dirname es 'backend/src/news'
// Cuando se ejecuta compilado, __dirname es 'backend/dist/news'
// En ambos casos, ir 3 niveles arriba nos lleva a faen_web/
const NEWS_FILE = path.resolve(__dirname, '../../../data/news.json');

@Injectable()
export class NewsService {
  private ensureFile() {
    if (!fs.existsSync(NEWS_FILE)) {
      fs.writeFileSync(NEWS_FILE, JSON.stringify([]));
    }
  }

  findAll(): NewsItem[] {
    try {
      this.ensureFile();
      const raw = fs.readFileSync(NEWS_FILE, 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error en findAll():', err.message);
      console.error('NEWS_FILE path:', NEWS_FILE);
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
    fs.writeFileSync(NEWS_FILE, JSON.stringify(news, null, 2));
    return item;
  }

  update(id: string, data: Partial<NewsItem>): NewsItem | null {
    const news = this.findAll();
    const idx = news.findIndex(n => n.id === id);
    if (idx === -1) return null;
    news[idx] = { ...news[idx], ...data };
    fs.writeFileSync(NEWS_FILE, JSON.stringify(news, null, 2));
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
      const uploadsDir = path.resolve(__dirname, '../../../public');
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
    fs.writeFileSync(NEWS_FILE, JSON.stringify(news, null, 2));
    return true;
  }
}
