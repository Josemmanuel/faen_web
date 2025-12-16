import { Express } from 'express';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
export declare class NewsController {
    private readonly newsService;
    constructor(newsService: NewsService);
    findAll(): import("./news.service").NewsItem[];
    findOne(id: string): import("./news.service").NewsItem;
    create(dto: CreateNewsDto, file: Express.Multer.File): import("./news.service").NewsItem;
    update(id: string, dto: UpdateNewsDto, file: Express.Multer.File): import("./news.service").NewsItem | {
        error: string;
    };
    remove(id: string): {
        success: boolean;
    };
}
