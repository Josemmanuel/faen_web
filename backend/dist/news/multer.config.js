"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerOptions = void 0;
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
function getUploadsDir() {
    const uploadsPath = (0, path_1.resolve)(__dirname, '../../../..', 'public', 'uploads');
    console.log('📁 multer getUploadsDir() resolved to:', uploadsPath);
    if (!(0, fs_1.existsSync)(uploadsPath)) {
        console.log('📁 Creating uploads directory:', uploadsPath);
        (0, fs_1.mkdirSync)(uploadsPath, { recursive: true });
    }
    return uploadsPath;
}
exports.multerOptions = {
    storage: (0, multer_1.diskStorage)({
        destination: (req, file, cb) => {
            cb(null, getUploadsDir());
        },
        filename: (req, file, cb) => {
            const uniqueName = Date.now() + '-' + file.originalname;
            console.log('Saving file as:', uniqueName);
            cb(null, uniqueName);
        },
    }),
};
//# sourceMappingURL=multer.config.js.map