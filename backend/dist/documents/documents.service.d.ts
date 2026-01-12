export interface DocumentItem {
    id: string;
    title: string;
    description?: string;
    category: string;
    fileName: string;
    filePath: string;
    uploadedAt: string;
}
export declare class DocumentsService {
    private getFilePath;
    private ensureFile;
    findAll(): DocumentItem[];
    findByCategory(category: string): DocumentItem[];
    findOne(id: string): DocumentItem | undefined;
    create(data: Partial<DocumentItem>): DocumentItem;
    update(id: string, data: Partial<DocumentItem>): DocumentItem | null;
    remove(id: string): boolean;
}
