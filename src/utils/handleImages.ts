import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// ✅ إعداد Cloudinary من environment variables
cloudinary.config({
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
export async function saveBase64Image(
  base64: string,
  folder: string,
  publicId?: string
): Promise<string> {
  try {
    if (!base64.startsWith("data:")) {
      throw new Error("الصيغة المرسلة ليست Base64 صحيحة");
    }

    const result = await cloudinary.uploader.upload(base64, {
      folder,
      public_id: publicId,
      resource_type: "auto",
    });

    return result.secure_url;
  } catch (error: any) {
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
export async function uploadFileToCloudinary(
  filePath: string,
  folder: string,
  resourceType: "image" | "video" | "auto" = "auto"
): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: resourceType,
    });

    return result.secure_url;
  } catch (error: any) {
    console.error("❌ خطأ أثناء رفع الملف إلى Cloudinary:", error.message);
    throw new Error("فشل رفع الملف إلى Cloudinary");
  }
}
