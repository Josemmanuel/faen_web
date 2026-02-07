"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoridadesController = void 0;
const common_1 = require("@nestjs/common");
const autoridades_service_1 = require("./autoridades.service");
const create_autoridad_dto_1 = require("./dto/create-autoridad.dto");
const update_autoridad_dto_1 = require("./dto/update-autoridad.dto");
const basic_auth_guard_1 = require("../auth/basic-auth.guard");
let AutoridadesController = class AutoridadesController {
    constructor(autoridadesService) {
        this.autoridadesService = autoridadesService;
    }
    findAll() {
        return this.autoridadesService.findAll();
    }
    findOne(id) {
        return this.autoridadesService.findOne(id);
    }
    create(dto) {
        console.log('Recibiendo POST /api/autoridades con datos:', dto);
        try {
            const result = this.autoridadesService.create(dto);
            console.log('Resultado del create:', result);
            return result;
        }
        catch (err) {
            console.error('Error en controller create:', err);
            throw err;
        }
    }
    update(id, dto) {
        const updated = this.autoridadesService.update(id, dto);
        if (!updated)
            return { error: 'Not found' };
        return updated;
    }
    remove(id) {
        const ok = this.autoridadesService.remove(id);
        return { success: ok };
    }
};
exports.AutoridadesController = AutoridadesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AutoridadesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AutoridadesController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_autoridad_dto_1.CreateAutoridadDto]),
    __metadata("design:returntype", void 0)
], AutoridadesController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_autoridad_dto_1.UpdateAutoridadDto]),
    __metadata("design:returntype", void 0)
], AutoridadesController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AutoridadesController.prototype, "remove", null);
exports.AutoridadesController = AutoridadesController = __decorate([
    (0, common_1.Controller)('api/autoridades'),
    __metadata("design:paramtypes", [autoridades_service_1.AutoridadesService])
], AutoridadesController);
//# sourceMappingURL=autoridades.controller.js.map