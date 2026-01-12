import { Express } from 'express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    findAll(): import("./documents.service").DocumentItem[];
    findByCategory(category: string): import("./documents.service").DocumentItem[];
    findOne(id: string): import("./documents.service").DocumentItem;
    create(dto: CreateDocumentDto, file: Express.Multer.File): import("./documents.service").DocumentItem | {
        error: string;
    };
    update(id: string, dto: UpdateDocumentDto, file: Express.Multer.File): import("./documents.service").DocumentItem | {
        error: string;
    };
    remove(id: string): {
        success: boolean;
    };
}
