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
exports.MensajesController = void 0;
const common_1 = require("@nestjs/common");
const mensajes_service_1 = require("./mensajes.service");
const create_mensaje_dto_1 = require("./dto/create-mensaje.dto");
const basic_auth_guard_1 = require("../auth/basic-auth.guard");
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