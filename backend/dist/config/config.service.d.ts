export interface StudentLink {
    id: string;
    title: string;
    url: string;
    icon: string;
}
export interface ClaustroLink {
    id: string;
    title: string;
    url: string;
    icon: string;
}
export interface Claustro {
    id: string;
    name: string;
    icon: string;
    links: ClaustroLink[];
}
export interface ConfigData {
    preinscripcion: {
        enabled: boolean;
        url: string;
    };
    studentLinks: StudentLink[];
    claustros?: Claustro[];
}
export declare class ConfigService {
    private configFile;
    private defaultConfig;
    constructor();
    private ensureConfigFile;
    getConfig(): ConfigData;
    updateConfig(config: Partial<ConfigData>): {
        preinscripcion: {
            enabled: boolean;
            url: string;
        };
        studentLinks: StudentLink[];
        claustros?: Claustro[];
    };
    getPreinscripcionConfig(): {
        enabled: boolean;
        url: string;
    };
    updatePreinscripcionConfig(data: {
        enabled: boolean;
        url: string;
    }): {
        enabled: boolean;
        url: string;
    };
    getStudentLinks(): StudentLink[];
    addStudentLink(link: Omit<StudentLink, 'id'>): StudentLink;
    updateStudentLink(id: string, link: Partial<StudentLink>): StudentLink | null;
    removeStudentLink(id: string): boolean;
    getClaustros(): Claustro[];
    getClaustroById(id: string): Claustro | null;
    addLinkToClaustro(claustroId: string, link: Omit<ClaustroLink, 'id'>): ClaustroLink | null;
    updateClaustroLink(claustroId: string, linkId: string, link: Partial<ClaustroLink>): ClaustroLink | null;
    removeLinkFromClaustro(claustroId: string, linkId: string): boolean;
}
