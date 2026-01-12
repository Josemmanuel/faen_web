import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface ConfigData {
  preinscripcion: {
    enabled: boolean;
    url: string;
  };
}

@Injectable()
export class ConfigService {
  private configFile: string;
  private defaultConfig: ConfigData = {
    preinscripcion: {
      enabled: false,
      url: 'https://guarani.unf.edu.ar/preinscripcion/unaf/?__o=',
    },
  };

  constructor() {
    const projectRoot = (globalThis as any)['projectRoot'] || process.cwd();
    this.configFile = path.join(projectRoot, 'data', 'config.json');
    this.ensureConfigFile();
  }

  private ensureConfigFile() {
    if (!fs.existsSync(this.configFile)) {
      fs.writeFileSync(this.configFile, JSON.stringify(this.defaultConfig, null, 2));
    }
  }

  getConfig(): ConfigData {
    try {
      const data = fs.readFileSync(this.configFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return this.defaultConfig;
    }
  }

  updateConfig(config: Partial<ConfigData>) {
    const currentConfig = this.getConfig();
    const updatedConfig = { ...currentConfig, ...config };
    fs.writeFileSync(this.configFile, JSON.stringify(updatedConfig, null, 2));
    return updatedConfig;
  }

  getPreinscripcionConfig() {
    const config = this.getConfig();
    return config.preinscripcion;
  }

  updatePreinscripcionConfig(data: { enabled: boolean; url: string }) {
    const config = this.getConfig();
    config.preinscripcion = {
      enabled: data.enabled,
      url: data.url || this.defaultConfig.preinscripcion.url,
    };
    fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
    return config.preinscripcion;
  }
}
