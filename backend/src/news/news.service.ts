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

const NEWS_FILE = path.join(process.cwd(), 'data', 'news.json');

@Injectable()
export class NewsService {
  private ensureFile() {
    if (!fs.existsSync(NEWS_FILE)) {
      fs.writeFileSync(NEWS_FILE, JSON.stringify([]));
    }
  }

  findAll(): NewsItem[] {
    this.ensureFile();
    const raw = fs.readFileSync(NEWS_FILE, 'utf8');
    return JSON.parse(raw);
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
    // intentar borrar imagen en public/uploads si existe
    if (item.image && item.image.startsWith('/uploads/')) {
      const fileOnDisk = path.join(process.cwd(), 'public', item.image);
      try { if (fs.existsSync(fileOnDisk)) fs.unlinkSync(fileOnDisk); } catch (err) { /* ignore */ }
    }
    news.splice(idx, 1);
    fs.writeFileSync(NEWS_FILE, JSON.stringify(news, null, 2));
    return true;
  }
}
