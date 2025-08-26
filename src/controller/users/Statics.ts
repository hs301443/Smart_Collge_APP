import { UserModel } from '../../models/shema/auth/User';
import { GraduatedModel } from '../../models/shema/auth/User';
import { UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { Request, Response } from "express";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors";
import { completeProfile } from './auth';



export const graduationStats = async (req: Request, res: Response) => {
   if(!req.user) throw new UnauthorizedError('Unauthorized');
  
    const totalCount = await GraduatedModel.countDocuments();

    // تجميع حسب employment_status وعدد كل فئة
    const aggregation = await GraduatedModel.aggregate([
      {
        $group: {
          _id: "$employment_status",
          count: { $sum: 1 },
        },
      },
    ]);

    // حساب النسب المئوية
    const stats: Record<string, number> = {};
    aggregation.forEach((item) => {
      stats[item._id] = Number(((item.count / totalCount) * 100).toFixed(2)); // نسبة مئوية بدقة 2
    });
    SuccessResponse(res, { message: "Graduation stats successfully", totalCount, stats })
    
  } 


