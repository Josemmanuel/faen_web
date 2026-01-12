export interface AutoridadItem {
    id: string;
    nombre: string;
    cargo: string;
    email?: string;
    telefono?: string;
}
export declare class AutoridadesService {
    private getFilePath;
    private ensureFile;
    findAll(): AutoridadItem[];
    findOne(id: string): AutoridadItem | undefined;
    create(data: Partial<AutoridadItem>): AutoridadItem;
    update(id: string, data: Partial<AutoridadItem>): AutoridadItem | null;
    remove(id: string): boolean;
}
