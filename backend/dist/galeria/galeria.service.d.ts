export interface Foto {
    id: string;
    titulo: string;
    ruta: string;
    fecha: string;
}
export declare class GaleriaService {
    private getFilePath;
    getAllFotos(): Promise<Foto[]>;
    addFoto(foto: Foto): Promise<Foto>;
    deleteFoto(id: string): Promise<void>;
}
