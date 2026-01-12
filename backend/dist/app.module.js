"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const serve_static_1 = require("@nestjs/serve-static");
const news_module_1 = require("./news/news.module");
const galeria_module_1 = require("./galeria/galeria.module");
const documents_module_1 = require("./documents/documents.module");
const carreras_module_1 = require("./carreras/carreras.module");
const autoridades_module_1 = require("./autoridades/autoridades.module");
const mensajes_module_1 = require("./mensajes/mensajes.module");
const config_module_1 = require("./config/config.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.resolve)(globalThis['projectRoot'] || (0, path_1.resolve)(__dirname, '../..'), 'public'),
                exclude: ['/api*'],
                serveRoot: '/',
            }),
            config_module_1.ConfigModule,
            news_module_1.NewsModule,
            galeria_module_1.GaleriaModule,
            documents_module_1.DocumentsModule,
            carreras_module_1.CarrerasModule,
            autoridades_module_1.AutoridadesModule,
            mensajes_module_1.MensajesModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map