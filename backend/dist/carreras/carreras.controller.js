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
exports.CarrerasController = void 0;
const common_1 = require("@nestjs/common");
const carreras_service_1 = require("./carreras.service");
const create_carrera_dto_1 = require("./dto/create-carrera.dto");
const update_carrera_dto_1 = require("./dto/update-carrera.dto");
const basic_auth_guard_1 = require("../auth/basic-auth.guard");
let CarrerasController = class CarrerasController {
    constructor(carrerasService) {
        this.carrerasService = carrerasService;
    }
    findAll() {
        return this.carrerasService.findAll();
    }
    findOne(id) {
        return this.carrerasService.findOne(id);
    }
    create(dto) {
        console.log('=== POST /api/carreras ===');
        console.log('DTO recibido:', dto);
        console.log('DTO.title:', dto.title, 'tipo:', typeof dto.title);
        console.log('DTO.code:', dto.code, 'tipo:', typeof dto.code);
        console.log('DTO.description:', dto.description, 'tipo:', typeof dto.description);
        console.log('DTO.duration:', dto.duration, 'tipo:', typeof dto.duration);
        return this.carrerasService.create(dto);
    }
    update(id, dto) {
        const updated = this.carrerasService.update(id, dto);
        if (!updated)
            return { error: 'Not found' };
        return updated;
    }
    remove(id) {
        const ok = this.carrerasService.remove(id);
        return { success: ok };
    }
};
exports.CarrerasController = CarrerasController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CarrerasController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CarrerasController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_carrera_dto_1.CreateCarreraDto]),
    __metadata("design:returntype", void 0)
], CarrerasController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_carrera_dto_1.UpdateCarreraDto]),
    __metadata("design:returntype", void 0)
], CarrerasController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CarrerasController.prototype, "remove", null);
exports.CarrerasController = CarrerasController = __decorate([
    (0, common_1.Controller)('api/carreras'),
    __metadata("design:paramtypes", [carreras_service_1.CarrerasService])
], CarrerasController);
//# sourceMappingURL=carreras.controller.js.map