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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarrerasService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let CarrerasService = class CarrerasService {
    getFilePath() {
        const projectRoot = globalThis['projectRoot'] || path.resolve(__dirname, '../..');
        return path.resolve(projectRoot, 'data/carreras.json');
    }
    ensureFile() {
        const filePath = this.getFilePath();
        if (!fs.existsSync(filePath)) {
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(filePath, JSON.stringify([]));
        }
    }
    findAll() {
        try {
            this.ensureFile();
            const filePath = this.getFilePath();
            const raw = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(raw);
        }
        catch (err) {
            console.error('Error en findAll():', err.message);
            console.error('CARRERAS_FILE path:', this.getFilePath());
            throw err;
        }
    }
    findOne(id) {
        return this.findAll().find(c => c.id === id);
    }
    create(data) {
        var _a;
        console.log('=== CREATE CARRERA ===');
        console.log('Datos recibidos:', data);
        const carreras = this.findAll();
        const title = (data.title || '').toString().trim();
        const code = (data.code || '').toString().trim();
        const description = (data.description || '').toString().trim();
        const fullDescription = (data.fullDescription || '').toString().trim();
        if (!title) {
            throw new Error('El nombre de la carrera no puede estar vacío');
        }
        if (!code) {
            throw new Error('El código no puede estar vacío');
        }
        if (!description) {
            throw new Error('La descripción no puede estar vacía');
        }
        const item = {
            id: Date.now().toString(),
            title: title,
            code: code,
            description: description,
            fullDescription: fullDescription || description,
            duration: parseInt(((_a = data.duration) === null || _a === void 0 ? void 0 : _a.toString()) || '1', 10),
            category: data.category || 'grado',
            foto: data.foto || undefined,
            documento: data.documento || undefined,
        };
        console.log('Item a guardar:', item);
        carreras.push(item);
        fs.writeFileSync(this.getFilePath(), JSON.stringify(carreras, null, 2));
        console.log('Carrera guardada exitosamente');
        console.log('Total carreras:', carreras.length);
        return item;
    }
    update(id, data) {
        const carreras = this.findAll();
        const idx = carreras.findIndex(c => c.id === id);
        if (idx === -1)
            return null;
        carreras[idx] = { ...carreras[idx], ...data };
        fs.writeFileSync(this.getFilePath(), JSON.stringify(carreras, null, 2));
        return carreras[idx];
    }
    remove(id) {
        const carreras = this.findAll();
        const idx = carreras.findIndex(c => c.id === id);
        if (idx === -1)
            return false;
        carreras.splice(idx, 1);
        fs.writeFileSync(this.getFilePath(), JSON.stringify(carreras, null, 2));
        return true;
    }
};
exports.CarrerasService = CarrerasService;
exports.CarrerasService = CarrerasService = __decorate([
    (0, common_1.Injectable)()
], CarrerasService);
//# sourceMappingURL=carreras.service.js.map