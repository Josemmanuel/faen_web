import { CarrerasService } from './carreras.service';
import { CreateCarreraDto } from './dto/create-carrera.dto';
import { UpdateCarreraDto } from './dto/update-carrera.dto';
export declare class CarrerasController {
    private readonly carrerasService;
    constructor(carrerasService: CarrerasService);
    findAll(): import("./carreras.service").CarreraItem[];
    findOne(id: string): import("./carreras.service").CarreraItem;
    create(dto: CreateCarreraDto): import("./carreras.service").CarreraItem;
    update(id: string, dto: UpdateCarreraDto): import("./carreras.service").CarreraItem | {
        error: string;
    };
    remove(id: string): {
        success: boolean;
    };
}
