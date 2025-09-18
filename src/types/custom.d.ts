import { Request } from "express";
import mongoose,{Types} from "mongoose";

export interface AppUser {
  _id?: mongoose.Types.ObjectId; // خليها اختيارية
  id?: string;
  email?: string;
  name?: string;
  role?: string;   
  level?: number;
  department?: string;           // admin / superAdmin / ...
  isSuperAdmin?: boolean;        // لو true يبقى معاه كل حاجة
  customPermissions?: string[];
  rolePermissions?: string[];
  isOnline?: boolean;            // ✅ ضيف الحقل هنا
  lastSeen?: Date;
}

// Extend Express Request with your custom user type
export interface AuthenticatedRequest extends Request {
  user?: AppUser; // Make user required
}

declare global {
  namespace Express {
    interface Request {
      user?: AppUser;
    } // extend default `User`
  }
}

export interface AppAdmin {
  _id?: mongoose.Types.ObjectId;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  isSuperAdmin?: boolean;
  customPermissions?: string[];
}

declare global {
  namespace Express {
    interface Request {
      admin?: AppAdmin;
    }
  }
}
