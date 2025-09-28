"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPDF = exports.uploadVideo = exports.uploadAnswerFile = exports.uploadQuestionImage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// دالة عامة لإنشاء storage
const createStorage = (folder) => multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const dir = path_1.default.join("uploads", folder);
        if (!fs_1.default.existsSync(dir))
            fs_1.default.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
// فلترة الصور
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/"))
        cb(null, true);
    else
        cb(new Error("Only images are allowed"));
};
// فلترة ملفات Word/PDF
const documentFileFilter = (req, file, cb) => {
    if (file.mimetype === "application/pdf" ||
        file.mimetype ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        cb(null, true);
    }
    else {
        cb(new Error("Only PDF or Word files are allowed"));
    }
};
// فلترة الفيديوهات
const videoFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("video/"))
        cb(null, true);
    else
        cb(new Error("Only video files are allowed"));
};
// فلترة PDF فقط
const pdfFileFilter = (req, file, cb) => {
    if (file.mimetype === "application/pdf")
        cb(null, true);
    else
        cb(new Error("Only PDF files are allowed"));
};
// ✅ Exports جاهزة للاستخدام
exports.uploadQuestionImage = (0, multer_1.default)({
    storage: createStorage("questions"),
    fileFilter: imageFileFilter,
});
exports.uploadAnswerFile = (0, multer_1.default)({
    storage: createStorage("answers"),
    fileFilter: documentFileFilter,
});
exports.uploadVideo = (0, multer_1.default)({
    storage: createStorage("videos"),
    fileFilter: videoFileFilter,
});
exports.uploadPDF = (0, multer_1.default)({
    storage: createStorage("pdfs"),
    fileFilter: pdfFileFilter,
});
