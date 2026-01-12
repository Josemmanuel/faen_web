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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const express_1 = require("express");
const path_1 = require("path");
const fs_1 = require("fs");
const documents_service_1 = require("./documents.service");
const create_document_dto_1 = require("./dto/create-document.dto");
const update_document_dto_1 = require("./dto/update-document.dto");
const basic_auth_guard_1 = require("../auth/basic-auth.guard");
function getUploadsDir() {
    const uploadsPath = (0, path_1.resolve)(__dirname, '../../../..', 'public', 'uploads');
    console.log('📁 getUploadsDir() resolved to:', uploadsPath);
    if (!(0, fs_1.existsSync)(uploadsPath)) {
        console.log('📁 Creating uploads directory:', uploadsPath);
        (0, fs_1.mkdirSync)(uploadsPath, { recursive: true });
    }
    return uploadsPath;
}
const multerConfig = {
    storage: (0, multer_1.diskStorage)({
        destination: (req, file, cb) => {
            cb(null, getUploadsDir());
        },
        filename: (req, file, cb) => {
            const uniqueName = Date.now() + '-' + file.originalname;
            console.log('Multer saving file as:', uniqueName);
            cb(null, uniqueName);
        },
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('Solo se permiten archivos PDF'), false);
        }
    },
};
let DocumentsController = class DocumentsController {
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    findAll() {
        return this.documentsService.findAll();
    }
    findByCategory(category) {
        return this.documentsService.findByCategory(category);
    }
    findOne(id) {
        return this.documentsService.findOne(id);
    }
    create(dto, file) {
        console.log('File received:', file);
        const filePath = file ? '/uploads/' + file.filename : null;
        console.log('File path:', filePath);
        if (!filePath) {
            return { error: 'No file provided' };
        }
        return this.documentsService.create({
            ...dto,
            fileName: file.originalname,
            filePath,
        });
    }
    update(id, dto, file) {
        const filePath = file ? '/uploads/' + file.filename : undefined;
        const data = filePath !== undefined ? { ...dto, fileName: file.originalname, filePath } : dto;
        const updated = this.documentsService.update(id, data);
        if (!updated)
            return { error: 'Not found' };
        return updated;
    }
    remove(id) {
        const ok = this.documentsService.remove(id);
        return { success: ok };
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('category/:category'),
    __param(0, (0, common_1.Param)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "findByCategory", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', multerConfig)),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_document_dto_1.CreateDocumentDto, typeof (_b = typeof express_1.Express !== "undefined" && (_a = express_1.Express.Multer) !== void 0 && _a.File) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, common_1.Put)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', multerConfig)),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_document_dto_1.UpdateDocumentDto, typeof (_d = typeof express_1.Express !== "undefined" && (_c = express_1.Express.Multer) !== void 0 && _c.File) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "remove", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, common_1.Controller)('api/documents'),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map