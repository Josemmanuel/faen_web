"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerOptions = void 0;
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const uploadsDir = (0, path_1.join)(__dirname, '..', '..', '..', 'public', 'uploads');
if (!(0, fs_1.existsSync)(uploadsDir)) {
    (0, fs_1.mkdirSync)(uploadsDir, { recursive: true });
}
exports.multerOptions = {
    storage: (0, multer_1.diskStorage)({
        destination: (req, file, cb) => {
            cb(null, uploadsDir);
        },
        filename: (req, file, cb) => {
            const uniqueName = Date.now() + '-' + file.originalname;
            console.log('Saving file as:', uniqueName);
            cb(null, uniqueName);
        },
    }),
};
//# sourceMappingURL=multer.config.js.map