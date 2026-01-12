export interface ConfigData {
    preinscripcion: {
        enabled: boolean;
        url: string;
    };
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
