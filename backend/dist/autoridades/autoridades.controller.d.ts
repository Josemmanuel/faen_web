import { AutoridadesService } from './autoridades.service';
import { CreateAutoridadDto } from './dto/create-autoridad.dto';
import { UpdateAutoridadDto } from './dto/update-autoridad.dto';
export declare class AutoridadesController {
    private readonly autoridadesService;
    constructor(autoridadesService: AutoridadesService);
    findAll(): import("./autoridades.service").AutoridadItem[];
    findOne(id: string): import("./autoridades.service").AutoridadItem;
    create(dto: CreateAutoridadDto): import("./autoridades.service").AutoridadItem;
    update(id: string, dto: UpdateAutoridadDto): import("./autoridades.service").AutoridadItem | {
        error: string;
    };
    remove(id: string): {
        success: boolean;
    };
}
