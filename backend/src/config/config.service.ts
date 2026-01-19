import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface StudentLink {
  id: string;
  title: string;
  url: string;
  icon: string;
}

export interface ConfigData {
  preinscripcion: {
    enabled: boolean;
    url: string;
  };
  studentLinks: StudentLink[];
}

@Injectable()
export class ConfigService {
  private configFile: string;
  private defaultConfig: ConfigData = {
    preinscripcion: {
      enabled: false,
      url: 'https://guarani.unf.edu.ar/preinscripcion/unaf/?__o=',
    },
    studentLinks: [
      {
        id: '1',
        title: 'Autogestión',
        url: 'https://guarani.unf.edu.ar/autogestion/',
        icon: '🔐'
      }
    ],
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

  getStudentLinks(): StudentLink[] {
    const config = this.getConfig();
    return config.studentLinks || [];
  }

  addStudentLink(link: Omit<StudentLink, 'id'>): StudentLink {
    const config = this.getConfig();
    const newLink: StudentLink = {
      ...link,
      id: Date.now().toString(),
    };
    if (!config.studentLinks) {
      config.studentLinks = [];
    }
    config.studentLinks.push(newLink);
    fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
    return newLink;
  }

  updateStudentLink(id: string, link: Partial<StudentLink>): StudentLink | null {
    const config = this.getConfig();
    const index = config.studentLinks?.findIndex(l => l.id === id) || -1;
    if (index === -1) return null;
    config.studentLinks![index] = { ...config.studentLinks![index], ...link };
    fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
    return config.studentLinks![index];
  }

  removeStudentLink(id: string): boolean {
    const config = this.getConfig();
    const index = config.studentLinks?.findIndex(l => l.id === id) || -1;
    if (index === -1) return false;
    config.studentLinks!.splice(index, 1);
    fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
    return true;
  }
}
