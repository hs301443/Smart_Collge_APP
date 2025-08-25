"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmploymentAnalytics = exports.getGraduatedDashboardStats = void 0;
const User_1 = require("../../models/shema/auth/User");
const User_2 = require("../../models/shema/auth/User");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const auth_1 = require("../users/auth");
const getGraduatedDashboardStats = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError('Unauthorized');
    // إحصائيات المستخدمين العامة
    const totalUsers = await User_1.UserModel.countDocuments();
    const graduatedUsers = await User_1.UserModel.countDocuments({ role: 'Graduated' });
    const studentUsers = await User_1.UserModel.countDocuments({ role: 'Student' });
    const verifiedUsers = await User_1.UserModel.countDocuments({ isVerified: true });
    // إحصائيات الخريجين التفصيلية
    const totalGraduates = await User_2.GraduatedModel.countDocuments();
    // إحصائيات حالة التوظيف
    const employmentStats = await User_2.GraduatedModel.aggregate([
        {
            $group: {
                _id: '$employment_status',
                count: { $sum: 1 }
            }
        }
    ]);
    // تحويل نتائج الـ aggregation لشكل أسهل
    const employmentCounts = {
        employed: 0,
        jobSeeker: 0,
        freelancer: 0,
        postgraduate: 0
    };
    employmentStats.forEach(stat => {
        switch (stat._id) {
            case 'Employed':
                employmentCounts.employed = stat.count;
                break;
            case 'Job Seeker':
                employmentCounts.jobSeeker = stat.count;
                break;
            case 'Freelancer':
                employmentCounts.freelancer = stat.count;
                break;
            case 'Postgraduate Studies':
                employmentCounts.postgraduate = stat.count;
                break;
        }
    });
    // حساب النسب المئوية للداشبورد
    const graduatesWithCV = await User_2.GraduatedModel.countDocuments({
        cv: { $exists: true, $nin: [null, ''] }
    });
    // النسب المئوية حسب التصميم
    const studiesOnUs = totalGraduates > 0 ? Math.round((employmentCounts.postgraduate / totalGraduates) * 100) : 0; // دراسات علينا - 30%
    const employmentFactor = totalGraduates > 0 ? Math.round((employmentCounts.employed / totalGraduates) * 100) : 0; // عامل جر - 66%
    const employee = totalGraduates > 0 ? Math.round(((employmentCounts.employed + employmentCounts.freelancer) / totalGraduates) * 100) : 0; // موظف - 85%
    const jobSearch = totalGraduates > 0 ? Math.round((employmentCounts.jobSeeker / totalGraduates) * 100) : 0; // باحث عن عمل - 90%
    // إحصائيات الشهر الحالي
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    const newGraduatesThisMonth = await User_2.GraduatedModel.countDocuments({
        createdAt: { $gte: currentMonth }
    });
    const newUsersThisMonth = await User_1.UserModel.countDocuments({
        createdAt: { $gte: currentMonth },
        role: 'Graduated'
    });
    // المحافظات الأكثر نشاطاً (من company_location)
    const topLocations = await User_2.GraduatedModel.aggregate([
        {
            $match: {
                company_location: { $exists: true, $nin: [null, ''] }
            }
        },
        {
            $group: {
                _id: '$company_location',
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        },
        {
            $limit: 5
        }
    ]);
    const response = {
        overview: {
            totalUsers,
            graduatedUsers,
            studentUsers,
            verifiedUsers,
            totalGraduates,
            newGraduatesThisMonth,
            newUsersThisMonth
        },
        employment: {
            employed: employmentCounts.employed,
            jobSeeker: employmentCounts.jobSeeker,
            freelancer: employmentCounts.freelancer,
            postgraduate: employmentCounts.postgraduate,
            total: totalGraduates
        },
        dashboard: {
            studiesOnUs: studiesOnUs, // دراسات علينا - نسبة الدراسات العليا
            employmentFactor: employmentFactor, // عامل جر - نسبة الموظفين
            employee: employee, // موظف - نسبة الموظفين + الفريلانسرز  
            jobSearch: jobSearch // باحث عن عمل - نسبة الباحثين عن عمل
        },
        profile: {
            withCV: graduatesWithCV,
            completeProfiles: auth_1.completeProfile,
            cvUploadRate: totalGraduates > 0 ? Math.round((graduatesWithCV / totalGraduates) * 100) : 0
        },
        locations: topLocations
    };
    (0, response_1.SuccessResponse)(res, response);
};
exports.getGraduatedDashboardStats = getGraduatedDashboardStats;
const getEmploymentAnalytics = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError('Unauthorized');
    // تحليل التوظيف حسب الوقت
    const employmentTrend = await User_2.GraduatedModel.aggregate([
        {
            $match: {
                employment_status: { $in: ['Employed', 'Freelancer'] }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    status: '$employment_status'
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1 }
        }
    ]);
    // أشهر المسميات الوظيفية
    const topJobTitles = await User_2.GraduatedModel.aggregate([
        {
            $match: {
                job_title: { $exists: true, $nin: [null, ''] },
                employment_status: 'Employed'
            }
        },
        {
            $group: {
                _id: '$job_title',
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        },
        {
            $limit: 10
        }
    ]);
    // معدل التوظيف حسب الشهر
    const employmentByMonth = await User_2.GraduatedModel.aggregate([
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                total: { $sum: 1 },
                employed: {
                    $sum: {
                        $cond: [
                            { $in: ['$employment_status', ['Employed', 'Freelancer']] },
                            1,
                            0
                        ]
                    }
                }
            }
        },
        {
            $addFields: {
                employmentRate: {
                    $multiply: [
                        { $divide: ['$employed', '$total'] },
                        100
                    ]
                }
            }
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1 }
        },
        {
            $limit: 12
        }
    ]);
    res.status(200).json({
        success: true,
        data: {
            employmentTrend,
            topJobTitles,
            employmentByMonth
        }
    });
};
exports.getEmploymentAnalytics = getEmploymentAnalytics;
