import multer from "multer";
import path from "path";
import fs from "fs";

// دالة عامة لإنشاء storage
const createStorage = (folder: string) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join("uploads", folder);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
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

// فلترة الفيديوهات
const videoFileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (file.mimetype.startsWith("video/")) cb(null, true);
  else cb(new Error("Only video files are allowed"));
};

// فلترة PDF فقط
const pdfFileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files are allowed"));
};

// ✅ Exports جاهزة للاستخدام
export const uploadQuestionImage = multer({
  storage: createStorage("questions"),
  fileFilter: imageFileFilter,
});

export const uploadAnswerFile = multer({
  storage: createStorage("answers"),
  fileFilter: documentFileFilter,
});

export const uploadVideo = multer({
  storage: createStorage("videos"),
  fileFilter: videoFileFilter,
});

export const uploadPDF = multer({
  storage: createStorage("pdfs"),
  fileFilter: pdfFileFilter,
});
