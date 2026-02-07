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
exports.ConfigController = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("./config.service");
const basic_auth_guard_1 = require("../auth/basic-auth.guard");
let ConfigController = class ConfigController {
    constructor(configService) {
        this.configService = configService;
    }
    getConfig() {
        return this.configService.getConfig();
    }
    updateConfig(config) {
        return this.configService.updateConfig(config);
    }
    getPreinscripcionConfig() {
        return this.configService.getPreinscripcionConfig();
    }
    updatePreinscripcionConfig(data) {
        return this.configService.updatePreinscripcionConfig(data);
    }
    getStudentLinks() {
        return this.configService.getStudentLinks();
    }
    addStudentLink(data) {
        return this.configService.addStudentLink(data);
    }
    updateStudentLink(id, data) {
        return this.configService.updateStudentLink(id, data);
    }
    removeStudentLink(id) {
        return this.configService.removeStudentLink(id);
    }
    getClaustros() {
        return this.configService.getClaustros();
    }
    getClaustroById(id) {
        return this.configService.getClaustroById(id);
    }
    addLinkToClaustro(claustroId, data) {
        return this.configService.addLinkToClaustro(claustroId, data);
    }
    updateClaustroLink(claustroId, linkId, data) {
        return this.configService.updateClaustroLink(claustroId, linkId, data);
    }
    removeLinkFromClaustro(claustroId, linkId) {
        return this.configService.removeLinkFromClaustro(claustroId, linkId);
    }
};
exports.ConfigController = ConfigController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.Get)('preinscripcion'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "getPreinscripcionConfig", null);
__decorate([
    (0, common_1.Put)('preinscripcion'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "updatePreinscripcionConfig", null);
__decorate([
    (0, common_1.Get)('student-links'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "getStudentLinks", null);
__decorate([
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, common_1.Post)('student-links'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "addStudentLink", null);
__decorate([
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, common_1.Put)('student-links/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "updateStudentLink", null);
__decorate([
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, common_1.Delete)('student-links/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "removeStudentLink", null);
__decorate([
    (0, common_1.Get)('claustros'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "getClaustros", null);
__decorate([
    (0, common_1.Get)('claustros/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "getClaustroById", null);
__decorate([
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, common_1.Post)('claustros/:id/links'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "addLinkToClaustro", null);
__decorate([
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, common_1.Put)('claustros/:id/links/:linkId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('linkId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "updateClaustroLink", null);
__decorate([
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, common_1.Delete)('claustros/:id/links/:linkId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('linkId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "removeLinkFromClaustro", null);
exports.ConfigController = ConfigController = __decorate([
    (0, common_1.Controller)('api/config'),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], ConfigController);
//# sourceMappingURL=config.controller.js.map