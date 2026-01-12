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
}
