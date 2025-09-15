import multer from "multer";
import path from "path";
import fs from "fs";

// مكان تخزين الصور والأسئلة
const questionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/questions";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// مكان تخزين ملفات الطلاب
const answerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/answers";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// فلترة الصور
const imageFileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only images are allowed"));
};

// فلترة ملفات Word/PDF
const documentFileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (
    file.mimetype === "application/pdf" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF or Word files are allowed"));
  }
};

export const uploadQuestionImage = multer({ storage: questionStorage, fileFilter: imageFileFilter });
export const uploadAnswerFile = multer({ storage: answerStorage, fileFilter: documentFileFilter });
