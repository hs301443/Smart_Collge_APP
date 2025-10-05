"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveBase64Image = saveBase64Image;
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
async function saveBase64Image(base64, uniqueId, req, folder) {
    // ✅ نتأكد إن الصيغة صحيحة
    const matches = base64.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        throw new Error("Invalid base64 format");
    }
    const mimeType = matches[1]; // مثل image/png أو application/pdf
    const ext = mimeType.split("/")[1]; // ناخد الامتداد (png أو pdf أو docx...)
    const buffer = Buffer.from(matches[2], "base64");
    const fileName = `${uniqueId}.${ext}`;
    const uploadsDir = path_1.default.join(__dirname, "../..", "uploads", folder);
    try {
        await promises_1.default.mkdir(uploadsDir, { recursive: true });
    }
    catch (err) {
        console.error("Failed to create directory:", err);
        throw err;
    }
    const filePath = path_1.default.join(uploadsDir, fileName);
    try {
        await promises_1.default.writeFile(filePath, buffer);
    }
    catch (err) {
        console.error("Failed to write file:", err);
        throw err;
    }
    // ✅ نرجّع رابط الوصول الكامل للملف
    return `${req.protocol}://${req.get("host")}/uploads/${folder}/${fileName}`;
}
