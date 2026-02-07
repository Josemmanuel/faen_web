"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let ConfigService = class ConfigService {
    constructor() {
        this.defaultConfig = {
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
            claustros: [
                {
                    id: 'estudiantes',
                    name: 'Estudiantes',
                    icon: '👨‍🎓',
                    links: []
                },
                {
                    id: 'graduados',
                    name: 'Graduados',
                    icon: '🎓',
                    links: []
                },
                {
                    id: 'docentes',
                    name: 'Docentes',
                    icon: '👨‍🏫',
                    links: []
                },
                {
                    id: 'no-docentes',
                    name: 'No Docentes',
                    icon: '👨‍💼',
                    links: []
                }
            ]
        };
        const projectRoot = globalThis['projectRoot'] || process.cwd();
        this.configFile = path.join(projectRoot, 'data', 'config.json');
        this.ensureConfigFile();
    }
    ensureConfigFile() {
        if (!fs.existsSync(this.configFile)) {
            fs.writeFileSync(this.configFile, JSON.stringify(this.defaultConfig, null, 2));
        }
    }
    getConfig() {
        try {
            const data = fs.readFileSync(this.configFile, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            return this.defaultConfig;
        }
    }
    updateConfig(config) {
        const currentConfig = this.getConfig();
        const updatedConfig = { ...currentConfig, ...config };
        fs.writeFileSync(this.configFile, JSON.stringify(updatedConfig, null, 2));
        return updatedConfig;
    }
    getPreinscripcionConfig() {
        const config = this.getConfig();
        return config.preinscripcion;
    }
    updatePreinscripcionConfig(data) {
        const config = this.getConfig();
        config.preinscripcion = {
            enabled: data.enabled,
            url: data.url || this.defaultConfig.preinscripcion.url,
        };
        fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
        return config.preinscripcion;
    }
    getStudentLinks() {
        const config = this.getConfig();
        return config.studentLinks || [];
    }
    addStudentLink(link) {
        const config = this.getConfig();
        const newLink = {
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
    updateStudentLink(id, link) {
        var _a;
        const config = this.getConfig();
        const index = ((_a = config.studentLinks) === null || _a === void 0 ? void 0 : _a.findIndex(l => l.id === id)) || -1;
        if (index === -1)
            return null;
        config.studentLinks[index] = { ...config.studentLinks[index], ...link };
        fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
        return config.studentLinks[index];
    }
    removeStudentLink(id) {
        var _a;
        const config = this.getConfig();
        const index = ((_a = config.studentLinks) === null || _a === void 0 ? void 0 : _a.findIndex(l => l.id === id)) || -1;
        if (index === -1)
            return false;
        config.studentLinks.splice(index, 1);
        fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
        return true;
    }
    getClaustros() {
        const config = this.getConfig();
        return config.claustros || [];
    }
    getClaustroById(id) {
        var _a;
        const config = this.getConfig();
        return ((_a = config.claustros) === null || _a === void 0 ? void 0 : _a.find(c => c.id === id)) || null;
    }
    addLinkToClaustro(claustroId, link) {
        var _a;
        const config = this.getConfig();
        const claustro = (_a = config.claustros) === null || _a === void 0 ? void 0 : _a.find(c => c.id === claustroId);
        if (!claustro)
            return null;
        const newLink = {
            ...link,
            id: Date.now().toString(),
        };
        claustro.links.push(newLink);
        fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
        return newLink;
    }
    updateClaustroLink(claustroId, linkId, link) {
        var _a;
        const config = this.getConfig();
        const claustro = (_a = config.claustros) === null || _a === void 0 ? void 0 : _a.find(c => c.id === claustroId);
        if (!claustro)
            return null;
        const linkIndex = claustro.links.findIndex(l => l.id === linkId);
        if (linkIndex === -1)
            return null;
        claustro.links[linkIndex] = { ...claustro.links[linkIndex], ...link };
        fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
        return claustro.links[linkIndex];
    }
    removeLinkFromClaustro(claustroId, linkId) {
        var _a;
        const config = this.getConfig();
        const claustro = (_a = config.claustros) === null || _a === void 0 ? void 0 : _a.find(c => c.id === claustroId);
        if (!claustro)
            return false;
        const linkIndex = claustro.links.findIndex(l => l.id === linkId);
        if (linkIndex === -1)
            return false;
        claustro.links.splice(linkIndex, 1);
        fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
        return true;
    }
};
exports.ConfigService = ConfigService;
exports.ConfigService = ConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ConfigService);
//# sourceMappingURL=config.service.js.map