export interface Foto {
    id: string;
    titulo: string;
    ruta: string;
    fecha: string;
}
export declare class GaleriaService {
    private galeriaFilePath;
    getAllFotos(): Promise<Foto[]>;
    addFoto(foto: Foto): Promise<Foto>;
    deleteFoto(id: string): Promise<void>;
}
