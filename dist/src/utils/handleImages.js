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
// ✅ إعداد Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "diubywm4o",
    api_key: process.env.CLOUDINARY_API_KEY || "335626385153357",
    api_secret: process.env.CLOUDINARY_API_SECRET || "mHdq6I40G1Ivsqy_QfPCnfG6gIY",
});
// ✅ رفع صورة Base64 إلى Cloudinary
async function saveBase64Image(base64, folder, publicId) {
    const result = await cloudinary_1.v2.uploader.upload(base64, {
        folder,
        public_id: publicId,
        resource_type: "auto",
    });
    return result.secure_url;
}
// ✅ رفع ملف من النظام (PDF أو فيديو)
async function uploadFileToCloudinary(filePath, folder, resourceType = "auto") {
    const result = await cloudinary_1.v2.uploader.upload(filePath, {
        folder,
        resource_type: resourceType,
    });
    return result;
}
