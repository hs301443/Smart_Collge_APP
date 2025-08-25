"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGraduatedProfile = exports.getGraduatedProfile = void 0;
const User_1 = require("../../models/shema/auth/User");
const User_2 = require("../../models/shema/auth/User");
const Errors_1 = require("../../Errors");
const getGraduatedProfile = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError('Unauthorized');
    const userId = req.user?.id;
    // التأكد من أن المستخدم خريج
    const user = await User_1.UserModel.findById(userId);
    if (!user || user.role !== 'Graduated') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Graduated users only.'
        });
    }
    // جلب معلومات الخريج
    const graduatedProfile = await User_2.GraduatedModel.findOne({ user: userId }).populate('user', '-password');
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
exports.getGraduatedProfile = getGraduatedProfile;
const updateGraduatedProfile = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError('Unauthorized');
    const userId = req.user?.id;
    const updateData = req.body;
    // التأكد من أن المستخدم خريج
    const user = await User_1.UserModel.findById(userId);
    if (!user || user.role !== 'Graduated') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Graduated users only.'
        });
    }
    // تحديث أو إنشاء ملف الخريج
    const graduatedProfile = await User_2.GraduatedModel.findOneAndUpdate({ user: userId }, { ...updateData, user: userId }, { new: true, upsert: true }).populate('user', '-password');
    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: graduatedProfile
    });
};
exports.updateGraduatedProfile = updateGraduatedProfile;
// Helper function لحساب اكتمال الملف الشخصي
function calculateProfileCompleteness(profile) {
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
