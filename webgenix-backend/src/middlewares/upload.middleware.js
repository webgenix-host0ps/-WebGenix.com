import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ApiError } from '../utils/ApiError.js';

// Ensure upload directory exists
const uploadDir = 'uploads/tickets';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Magic bytes for file content validation
const MAGIC_BYTES = {
    'jpeg': [0xFF, 0xD8, 0xFF],
    'jpg': [0xFF, 0xD8, 0xFF],
    'png': [0x89, 0x50, 0x4E, 0x47],
    'gif': [0x47, 0x49, 0x46],
    'pdf': [0x25, 0x50, 0x44, 0x46],
    'zip': [0x50, 0x4B, 0x03, 0x04],
    'rar': [0x52, 0x61, 0x72, 0x21],
    'txt': null,
    'doc': [0xD0, 0xCF, 0x11, 0xE0],
    'docx': [0x50, 0x4B, 0x03, 0x04],
};

const validateMagicBytes = (filePath, ext) => {
    const expectedBytes = MAGIC_BYTES[ext];
    if (!expectedBytes) return true;
    const buffer = Buffer.alloc(expectedBytes.length);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, expectedBytes.length, 0);
    fs.closeSync(fd);
    return expectedBytes.every((byte, i) => buffer[i] === byte);
};

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|zip|rar|txt|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new ApiError(400, 'Error: File type not supported!'));
    }
};

export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

// Middleware to validate magic bytes after multer saves the file
export const validateFileContent = (req, res, next) => {
    if (!req.files || req.files.length === 0) return next();
    for (const file of req.files) {
        const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
        if (!validateMagicBytes(file.path, ext)) {
            fs.unlinkSync(file.path);
            throw new ApiError(400, `File ${file.originalname} appears to be corrupted or has incorrect content`);
        }
    }
    next();
};
