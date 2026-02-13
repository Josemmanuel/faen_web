import { MensajesService } from './mensajes.service';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
export declare class MensajesController {
    private readonly mensajesService;
    constructor(mensajesService: MensajesService);
    create(dto: CreateMensajeDto): import("./mensajes.service").MensajeItem;
    findAll(): import("./mensajes.service").MensajeItem[];
    exportAll(res: any, format?: string, desde?: string, hasta?: string, estado?: string): Promise<any>;
    findOne(id: string): import("./mensajes.service").MensajeItem;
    markAsRead(id: string): import("./mensajes.service").MensajeItem | {
        error: string;
    };
    remove(id: string): {
        success: boolean;
    };
}
