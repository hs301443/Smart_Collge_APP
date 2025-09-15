"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAnswerFile = exports.uploadQuestionImage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// مكان تخزين الصور والأسئلة
const questionStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/questions");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
// مكان تخزين ملفات الطلاب
const answerStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/answers");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
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
exports.uploadQuestionImage = (0, multer_1.default)({ storage: questionStorage, fileFilter: imageFileFilter });
exports.uploadAnswerFile = (0, multer_1.default)({ storage: answerStorage, fileFilter: documentFileFilter });
