import { UserModel } from '../../models/shema/auth/User';
import { GraduatedModel } from '../../models/shema/auth/User';
import { UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { Request, Response } from "express";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors";
import { completeProfile } from '../users/auth';




export const getGraduatedProfile = async (req: Request, res: Response) => {
  if(!req.user) throw new UnauthorizedError('Unauthorized');
    const userId = req.user?.id;

    // التأكد من أن المستخدم خريج
    const user = await UserModel.findById(userId);
    if (!user || user.role !== 'Graduated') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Graduated users only.'
      });
    }

    // جلب معلومات الخريج
    const graduatedProfile = await GraduatedModel.findOne({ user: userId }).populate('user', '-password');
    
    if (!graduatedProfile) {
      return res.status(404).json({
        success: false,
        message: 'Graduated profile not found. Please complete your profile.'
      });
    }

    // إحصائيات شخصية بسيطة
    const personalStats = {
      profileCompleteness: calculateProfileCompleteness(graduatedProfile),
      hasCV: !!graduatedProfile.cv,
      employmentStatus: graduatedProfile.employment_status,
      profileCreatedAt: graduatedProfile.createdAt,
      lastUpdatedAt: graduatedProfile.updatedAt
    };

    res.status(200).json({
      success: true,
      data: {
        profile: graduatedProfile,
        stats: personalStats
      }
    });

  
};

export const updateGraduatedProfile = async (req: Request, res: Response) => {
  if(!req.user) throw new UnauthorizedError('Unauthorized');
    const userId = req.user?.id;
    const updateData = req.body;

    // التأكد من أن المستخدم خريج
    const user = await UserModel.findById(userId);
    if (!user || user.role !== 'Graduated') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Graduated users only.'
      });
    }

    // تحديث أو إنشاء ملف الخريج
    const graduatedProfile = await GraduatedModel.findOneAndUpdate(
      { user: userId },
      { ...updateData, user: userId },
      { new: true, upsert: true }
    ).populate('user', '-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: graduatedProfile
    });

  
};

// Helper function لحساب اكتمال الملف الشخصي
function calculateProfileCompleteness(profile: any): number {
  const requiredFields = [
    'cv', 'employment_status', 'job_title', 
    'company_location', 'about_company'
  ];
  
  let completedFields = 0;
  requiredFields.forEach(field => {
    if (profile[field] && profile[field].trim() !== '') {
      completedFields++;
    }
  });
  
  return Math.round((completedFields / requiredFields.length) * 100);
}
