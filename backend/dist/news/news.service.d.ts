export interface NewsItem {
    id: string;
    title: string;
    description?: string;
    date: string;
    image?: string | null;
}
export declare class NewsService {
    private ensureFile;
    findAll(): NewsItem[];
    findOne(id: string): NewsItem | undefined;
    create(data: Partial<NewsItem>): NewsItem;
    update(id: string, data: Partial<NewsItem>): NewsItem | null;
    remove(id: string): boolean;
}
