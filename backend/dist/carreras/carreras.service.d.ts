export interface CarreraItem {
    id: string;
    title: string;
    code: string;
    description: string;
    fullDescription?: string;
    duration: number;
    foto?: string;
    documento?: string;
}
export declare class CarrerasService {
    private getFilePath;
    private ensureFile;
    findAll(): CarreraItem[];
    findOne(id: string): CarreraItem | undefined;
    create(data: Partial<CarreraItem>): CarreraItem;
    update(id: string, data: Partial<CarreraItem>): CarreraItem | null;
    remove(id: string): boolean;
}
