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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GaleriaController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const express_1 = require("express");
const path = __importStar(require("path"));
const galeria_service_1 = require("./galeria.service");
const basic_auth_guard_1 = require("../auth/basic-auth.guard");
let GaleriaController = class GaleriaController {
    constructor(galeriaService) {
        this.galeriaService = galeriaService;
    }
    async getAllFotos() {
        return this.galeriaService.getAllFotos();
    }
    async uploadFoto(file, titulo) {
        if (!file) {
            throw new common_1.BadRequestException('No se subió ninguna imagen');
        }
        const foto = {
            id: Date.now().toString(),
            titulo: titulo && titulo.trim() ? titulo.trim() : 'Sin título',
            ruta: `uploads/${file.filename}`,
            fecha: new Date().toLocaleString('es-ES'),
        };
        return this.galeriaService.addFoto(foto);
    }
    async deleteFoto(id) {
        await this.galeriaService.deleteFoto(id);
        return { message: 'Foto eliminada correctamente' };
    }
};
exports.GaleriaController = GaleriaController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GaleriaController.prototype, "getAllFotos", null);
__decorate([
    (0, common_1.Post)('subir'),
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('foto', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                cb(null, '/home/josemanuel/Documentos/faen_web/public/uploads');
            },
            filename: (req, file, cb) => {
                const timestamp = Date.now();
                const ext = path.extname(file.originalname);
                const name = path.basename(file.originalname, ext);
                cb(null, `${timestamp}-${name}${ext}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            if (!allowedMimes.includes(file.mimetype)) {
                return cb(new common_1.BadRequestException('Solo se permiten imágenes (JPEG, PNG, WebP, GIF)'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('titulo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof express_1.Express !== "undefined" && (_a = express_1.Express.Multer) !== void 0 && _a.File) === "function" ? _b : Object, String]),
    __metadata("design:returntype", Promise)
], GaleriaController.prototype, "uploadFoto", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GaleriaController.prototype, "deleteFoto", null);
exports.GaleriaController = GaleriaController = __decorate([
    (0, common_1.Controller)('api/galeria'),
    __metadata("design:paramtypes", [galeria_service_1.GaleriaService])
], GaleriaController);
//# sourceMappingURL=galeria.controller.js.map