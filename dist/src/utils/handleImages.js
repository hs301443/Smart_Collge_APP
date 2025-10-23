"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveBase64Image = saveBase64Image;
exports.uploadFileToCloudinary = uploadFileToCloudinary;
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// ✅ إعداد Cloudinary من environment variables
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
/**
 * ✅ رفع صورة Base64 إلى Cloudinary
 * @param base64 - بيانات الصورة بصيغة Base64 (data:image/png;base64,...)
 * @param folder - اسم المجلد داخل Cloudinary
 * @param publicId - اسم فريد للصورة داخل المجلد
 * @returns رابط الصورة (secure_url)
 */
async function saveBase64Image(base64, folder, publicId) {
    try {
        if (!base64.startsWith("data:")) {
            throw new Error("الصيغة المرسلة ليست Base64 صحيحة");
        }
        const result = await cloudinary_1.v2.uploader.upload(base64, {
            folder,
            public_id: publicId,
            resource_type: "auto",
        });
        return result.secure_url;
    }
    catch (error) {
        console.error("❌ خطأ أثناء رفع الصورة إلى Cloudinary:", error.message);
        throw new Error("فشل رفع الصورة إلى Cloudinary");
    }
}
/**
 * ✅ رفع ملف من النظام المحلي إلى Cloudinary (PDF / فيديو / صورة)
 * @param filePath - مسار الملف في النظام
 * @param folder - اسم المجلد داخل Cloudinary
 * @param resourceType - نوع الملف (افتراضي auto)
 * @returns رابط الملف المرفوع (secure_url)
 */
async function uploadFileToCloudinary(filePath, folder, resourceType = "auto") {
    try {
        const result = await cloudinary_1.v2.uploader.upload(filePath, {
            folder,
            resource_type: resourceType,
        });
        return result.secure_url;
    }
    catch (error) {
        console.error("❌ خطأ أثناء رفع الملف إلى Cloudinary:", error.message);
        throw new Error("فشل رفع الملف إلى Cloudinary");
    }
}
