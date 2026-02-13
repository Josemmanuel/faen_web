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
exports.MensajesService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let MensajesService = class MensajesService {
    getFilePath() {
        const projectRoot = globalThis['projectRoot'] || path.resolve(__dirname, '../..');
        return path.resolve(projectRoot, 'data/mensajes.json');
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
            throw err;
        }
    }
    findOne(id) {
        return this.findAll().find(m => m.id === id);
    }
    create(data) {
        const mensajes = this.findAll();
        const now = Date.now();
        const item = {
            id: now.toString(),
            nombre: data.nombre || '',
            email: data.email || '',
            telefono: data.telefono || '',
            asunto: data.asunto || '',
            mensaje: data.mensaje || '',
            fecha: new Date().toLocaleString('es-AR'),
            fechaISO: now,
            leido: false,
        };
        mensajes.push(item);
        fs.writeFileSync(this.getFilePath(), JSON.stringify(mensajes, null, 2));
        return item;
    }
    markAsRead(id) {
        const mensajes = this.findAll();
        const idx = mensajes.findIndex(m => m.id === id);
        if (idx === -1)
            return null;
        mensajes[idx].leido = true;
        fs.writeFileSync(this.getFilePath(), JSON.stringify(mensajes, null, 2));
        return mensajes[idx];
    }
    remove(id) {
        const mensajes = this.findAll();
        const idx = mensajes.findIndex(m => m.id === id);
        if (idx === -1)
            return false;
        mensajes.splice(idx, 1);
        fs.writeFileSync(this.getFilePath(), JSON.stringify(mensajes, null, 2));
        return true;
    }
};
exports.MensajesService = MensajesService;
exports.MensajesService = MensajesService = __decorate([
    (0, common_1.Injectable)()
], MensajesService);
//# sourceMappingURL=mensajes.service.js.map