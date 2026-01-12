export interface MensajeItem {
    id: string;
    nombre: string;
    email: string;
    telefono?: string;
    asunto: string;
    mensaje: string;
    fecha: string;
    leido?: boolean;
}
export declare class MensajesService {
    private getFilePath;
    private ensureFile;
    findAll(): MensajeItem[];
    findOne(id: string): MensajeItem | undefined;
    create(data: Partial<MensajeItem>): MensajeItem;
    markAsRead(id: string): MensajeItem | null;
    remove(id: string): boolean;
}
