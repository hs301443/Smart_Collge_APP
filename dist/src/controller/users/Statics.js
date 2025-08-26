"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graduationStats = void 0;
const User_1 = require("../../models/shema/auth/User");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const graduationStats = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError('Unauthorized');
    const totalCount = await User_1.GraduatedModel.countDocuments();
    // تجميع حسب employment_status وعدد كل فئة
    const aggregation = await User_1.GraduatedModel.aggregate([
        {
            $group: {
                _id: "$employment_status",
                count: { $sum: 1 },
            },
        },
    ]);
    // حساب النسب المئوية
    const stats = {};
    aggregation.forEach((item) => {
        stats[item._id] = Number(((item.count / totalCount) * 100).toFixed(2)); // نسبة مئوية بدقة 2
    });
    (0, response_1.SuccessResponse)(res, { message: "Graduation stats successfully", totalCount, stats });
};
exports.graduationStats = graduationStats;
