export interface CarreraItem {
    id: string;
    title: string;
    code: string;
    description: string;
    duration: number;
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
