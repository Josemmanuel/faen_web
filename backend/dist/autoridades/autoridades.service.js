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
exports.AutoridadesService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let AutoridadesService = class AutoridadesService {
    getFilePath() {
        const projectRoot = globalThis['projectRoot'] || path.resolve(__dirname, '../..');
        return path.resolve(projectRoot, 'data/autoridades.json');
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
            const raw = fs.readFileSync(this.getFilePath(), 'utf8');
            return JSON.parse(raw);
        }
        catch (err) {
            console.error('Error en findAll():', err.message);
            throw err;
        }
    }
    findOne(id) {
        return this.findAll().find(a => a.id === id);
    }
    create(data) {
        var _a, _b;
        try {
            console.log('=== CREATE AUTORIDAD ===');
            console.log('Datos recibidos:', data);
            console.log('data.nombre:', data.nombre, 'tipo:', typeof data.nombre, 'length:', (_a = data.nombre) === null || _a === void 0 ? void 0 : _a.length);
            console.log('data.cargo:', data.cargo, 'tipo:', typeof data.cargo, 'length:', (_b = data.cargo) === null || _b === void 0 ? void 0 : _b.length);
            if (!data.nombre || data.nombre.trim() === '') {
                throw new Error('Nombre es requerido y no puede estar vacío');
            }
            if (!data.cargo || data.cargo.trim() === '') {
                throw new Error('Cargo es requerido y no puede estar vacío');
            }
            const autoridades = this.findAll();
            const item = {
                id: Date.now().toString(),
                nombre: data.nombre.trim(),
                cargo: data.cargo.trim(),
            };
            if (data.email && data.email.trim())
                item.email = data.email.trim();
            if (data.telefono && data.telefono.trim())
                item.telefono = data.telefono.trim();
            if (data.foto && data.foto.trim())
                item.foto = data.foto;
            console.log('Item a guardar:', item);
            const filePath = this.getFilePath();
            console.log('Guardando en:', filePath);
            autoridades.push(item);
            fs.writeFileSync(filePath, JSON.stringify(autoridades, null, 2));
            console.log('Autoridad guardada exitosamente');
            console.log('Total autoridades:', autoridades.length);
            return item;
        }
        catch (err) {
            console.error('Error en create():', err);
            throw err;
        }
    }
    update(id, data) {
        const autoridades = this.findAll();
        const idx = autoridades.findIndex(a => a.id === id);
        if (idx === -1)
            return null;
        autoridades[idx] = { ...autoridades[idx], ...data };
        fs.writeFileSync(this.getFilePath(), JSON.stringify(autoridades, null, 2));
        return autoridades[idx];
    }
    remove(id) {
        const autoridades = this.findAll();
        const idx = autoridades.findIndex(a => a.id === id);
        if (idx === -1)
            return false;
        autoridades.splice(idx, 1);
        fs.writeFileSync(this.getFilePath(), JSON.stringify(autoridades, null, 2));
        return true;
    }
};
exports.AutoridadesService = AutoridadesService;
exports.AutoridadesService = AutoridadesService = __decorate([
    (0, common_1.Injectable)()
], AutoridadesService);
//# sourceMappingURL=autoridades.service.js.map