"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const password_util_1 = require("./password.util");
let BasicAuthGuard = class BasicAuthGuard {
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith('Basic ')) {
            console.error('Missing or invalid auth header:', auth);
            throw new common_1.UnauthorizedException('Missing or invalid authorization header');
        }
        const b = Buffer.from(auth.split(' ')[1], 'base64').toString('utf8');
        const [user, pass] = b.split(':');
        const expectedUser = process.env.ADMIN_USER || 'admin';
        const expectedPassHash = process.env.ADMIN_PASS_HASH || '$2b$10$9r38a9aNgRnQnMpmcTngge6T1KGfrKSix0anfZAp11MPZ5/4DEiE.';
        console.log('BasicAuthGuard - user:', user, 'pass:', pass, 'expectedUser:', expectedUser);
        if (user !== expectedUser) {
            console.error('Invalid user:', user);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isValid = await (0, password_util_1.comparePassword)(pass, expectedPassHash);
        console.log('Password comparison result:', isValid);
        if (!isValid) {
            console.error('Invalid password');
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return true;
    }
};
exports.BasicAuthGuard = BasicAuthGuard;
exports.BasicAuthGuard = BasicAuthGuard = __decorate([
    (0, common_1.Injectable)()
], BasicAuthGuard);
//# sourceMappingURL=basic-auth.guard.js.map