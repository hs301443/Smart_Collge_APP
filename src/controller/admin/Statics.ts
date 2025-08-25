import { UserModel } from '../../models/shema/auth/User';
import { GraduatedModel } from '../../models/shema/auth/User';
import { UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { Request, Response } from "express";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors";
import { completeProfile } from '../users/auth';



export const getGraduatedDashboardStats = async (req: Request, res: Response) => {
  if(!req.user) throw new UnauthorizedError('Unauthorized')

    // إحصائيات المستخدمين العامة
    const totalUsers = await UserModel.countDocuments();
    const graduatedUsers = await UserModel.countDocuments({ role: 'Graduated' });
    const studentUsers = await UserModel.countDocuments({ role: 'Student' });
    const verifiedUsers = await UserModel.countDocuments({ isVerified: true });

    // إحصائيات الخريجين التفصيلية
    const totalGraduates = await GraduatedModel.countDocuments();
    
    // إحصائيات حالة التوظيف
    const employmentStats = await GraduatedModel.aggregate([
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
      switch(stat._id) {
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
    const graduatesWithCV = await GraduatedModel.countDocuments({ 
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

    const newGraduatesThisMonth = await GraduatedModel.countDocuments({
      createdAt: { $gte: currentMonth }
    });

    const newUsersThisMonth = await UserModel.countDocuments({
      createdAt: { $gte: currentMonth },
      role: 'Graduated'
    });

    
    // المحافظات الأكثر نشاطاً (من company_location)
    const topLocations = await GraduatedModel.aggregate([
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
        studiesOnUs: studiesOnUs,        // دراسات علينا - نسبة الدراسات العليا
        employmentFactor: employmentFactor, // عامل جر - نسبة الموظفين
        employee: employee,              // موظف - نسبة الموظفين + الفريلانسرز  
        jobSearch: jobSearch            // باحث عن عمل - نسبة الباحثين عن عمل
      },
      profile: {
        withCV: graduatesWithCV,
        completeProfiles: completeProfile,
        cvUploadRate: totalGraduates > 0 ? Math.round((graduatesWithCV / totalGraduates) * 100) : 0
      },
      locations: topLocations
    };
      
SuccessResponse(res,response)
         
  };

export const getEmploymentAnalytics = async (req: Request, res: Response) => {
  if(!req.user) throw new UnauthorizedError('Unauthorized')

    // تحليل التوظيف حسب الوقت
    const employmentTrend = await GraduatedModel.aggregate([
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
    const topJobTitles = await GraduatedModel.aggregate([
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
    const employmentByMonth = await GraduatedModel.aggregate([
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