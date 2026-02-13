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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MensajesController = void 0;
const common_1 = require("@nestjs/common");
const mensajes_service_1 = require("./mensajes.service");
const create_mensaje_dto_1 = require("./dto/create-mensaje.dto");
const basic_auth_guard_1 = require("../auth/basic-auth.guard");
const ExcelJS = __importStar(require("exceljs"));
let MensajesController = class MensajesController {
    constructor(mensajesService) {
        this.mensajesService = mensajesService;
    }
    create(dto) {
        console.log('Controller recibió DTO:', dto);
        return this.mensajesService.create(dto);
    }
    findAll() {
        return this.mensajesService.findAll();
    }
    async exportAll(res, format = 'csv', desde, hasta, estado = 'all') {
        let mensajes = this.mensajesService.findAll();
        const parseMensajeTs = (m) => {
            if (m.fechaISO && typeof m.fechaISO === 'number')
                return m.fechaISO;
            const parsed = Date.parse(m.fecha);
            return isNaN(parsed) ? null : parsed;
        };
        if (desde) {
            const desdeTs = Date.parse(desde + 'T00:00:00');
            if (!isNaN(desdeTs)) {
                mensajes = mensajes.filter(m => {
                    const ts = parseMensajeTs(m);
                    return ts === null ? false : ts >= desdeTs;
                });
            }
        }
        if (hasta) {
            const hastaTs = Date.parse(hasta + 'T23:59:59.999');
            if (!isNaN(hastaTs)) {
                mensajes = mensajes.filter(m => {
                    const ts = parseMensajeTs(m);
                    return ts === null ? false : ts <= hastaTs;
                });
            }
        }
        if (estado && estado !== 'all') {
            if (estado === 'leido')
                mensajes = mensajes.filter(m => !!m.leido);
            else if (estado === 'no-leido')
                mensajes = mensajes.filter(m => !m.leido);
        }
        const headers = ['id', 'nombre', 'email', 'telefono', 'asunto', 'mensaje', 'fecha', 'leido'];
        if (format === 'xlsx') {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Mensajes');
            sheet.addRow(headers);
            mensajes.forEach((m) => {
                sheet.addRow(headers.map(h => (m[h] !== undefined && m[h] !== null) ? m[h] : ''));
            });
            const buffer = await workbook.xlsx.writeBuffer();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="mensajes.xlsx"');
            return res.send(Buffer.from(buffer));
        }
        const escapeCsv = (v) => {
            if (v === null || v === undefined)
                return '';
            const s = String(v).replace(/"/g, '""');
            return '"' + s + '"';
        };
        const csvLines = [headers.join(',')];
        mensajes.forEach(m => {
            const row = headers.map(h => escapeCsv(m[h]));
            csvLines.push(row.join(','));
        });
        const csv = csvLines.join('\n');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="mensajes.csv"');
        return res.send(csv);
    }
    findOne(id) {
        return this.mensajesService.findOne(id);
    }
    markAsRead(id) {
        const updated = this.mensajesService.markAsRead(id);
        if (!updated)
            return { error: 'Not found' };
        return updated;
    }
    remove(id) {
        const ok = this.mensajesService.remove(id);
        return { success: ok };
    }
};
exports.MensajesController = MensajesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_mensaje_dto_1.CreateMensajeDto]),
    __metadata("design:returntype", void 0)
], MensajesController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MensajesController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, common_1.Get)('export'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('format')),
    __param(2, (0, common_1.Query)('desde')),
    __param(3, (0, common_1.Query)('hasta')),
    __param(4, (0, common_1.Query)('estado')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MensajesController.prototype, "exportAll", null);
__decorate([
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MensajesController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, common_1.Put)(':id/leido'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MensajesController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MensajesController.prototype, "remove", null);
exports.MensajesController = MensajesController = __decorate([
    (0, common_1.Controller)('api/mensajes'),
    __metadata("design:paramtypes", [mensajes_service_1.MensajesService])
], MensajesController);
//# sourceMappingURL=mensajes.controller.js.map