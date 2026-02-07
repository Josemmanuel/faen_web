import { ConfigService } from './config.service';
export declare class ConfigController {
    private readonly configService;
    constructor(configService: ConfigService);
    getConfig(): import("./config.service").ConfigData;
    updateConfig(config: any): {
        preinscripcion: {
            enabled: boolean;
            url: string;
        };
        studentLinks: import("./config.service").StudentLink[];
        claustros?: import("./config.service").Claustro[];
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
    getStudentLinks(): import("./config.service").StudentLink[];
    addStudentLink(data: {
        title: string;
        url: string;
        icon: string;
    }): import("./config.service").StudentLink;
    updateStudentLink(id: string, data: Partial<{
        title: string;
        url: string;
        icon: string;
    }>): import("./config.service").StudentLink;
    removeStudentLink(id: string): boolean;
    getClaustros(): import("./config.service").Claustro[];
    getClaustroById(id: string): import("./config.service").Claustro;
    addLinkToClaustro(claustroId: string, data: {
        title: string;
        url: string;
        icon: string;
    }): import("./config.service").ClaustroLink;
    updateClaustroLink(claustroId: string, linkId: string, data: Partial<{
        title: string;
        url: string;
        icon: string;
    }>): import("./config.service").ClaustroLink;
    removeLinkFromClaustro(claustroId: string, linkId: string): boolean;
}
