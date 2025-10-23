import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// ✅ إعداد Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ,
  api_secret: process.env.CLOUDINARY_API_SECRET ,
});

// ✅ رفع صورة Base64 إلى Cloudinary
export async function saveBase64Image(base64: string, folder: string, publicId: string): Promise<string> {
  const result = await cloudinary.uploader.upload(base64, {
    folder,
    public_id: publicId,
    resource_type: "auto",
  });
  return result.secure_url;
}

// ✅ رفع ملف من النظام (PDF أو فيديو)
export async function uploadFileToCloudinary(filePath: string, folder: string, resourceType: "image" | "video" | "auto" = "auto") {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: resourceType,
  });
  return result;
}
