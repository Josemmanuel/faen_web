import { Express } from 'express';
import { GaleriaService, Foto } from './galeria.service';
export declare class GaleriaController {
    private galeriaService;
    constructor(galeriaService: GaleriaService);
    getAllFotos(): Promise<Foto[]>;
    uploadFoto(file: Express.Multer.File, titulo?: string): Promise<Foto>;
    deleteFoto(id: string): Promise<{
        message: string;
    }>;
}
