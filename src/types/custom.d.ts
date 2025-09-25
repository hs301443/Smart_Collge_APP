import { Request } from "express";
import mongoose from "mongoose";

/**
 * نوع المستخدم الموحد (سواء كان Admin أو User أو Graduated)
 */
export interface AppUser {
  _id?: mongoose.Types.ObjectId;
  id?: string;
  name?: string;
  email?: string;
  imagePath?: string; // للـ Admin
  BaseImage64?: string; // للـ User

  // --- أدوار ---
  role: "SuperAdmin" | "Admin" | "Student" | "Graduated";

  // لو Admin
  roleId?: string;

  // لو Student
  level?: number;
  department?: "IT" | "CS" | "IS" | "AI";

  // لو Graduated
  cv?: string;
  employment_status?: "Employed" | "Job Seeker" | "Freelancer" | "Postgraduate Studies";
  job_title?: string;
  company_location?: string;
  company_email?: string;
  company_link?: string;
  company_phone?: string;
  about_company?: string;

  // حالة الاتصال
  isOnline?: boolean;
  lastSeen?: Date;
}

/**
 * علشان Express يعرف إن كل Request ممكن يكون فيه user
 */
export interface AuthenticatedRequest extends Request {
  user?: AppUser;
}

declare global {
  namespace Express {
    interface Request {
      user?: AppUser;
    }
  }
}
