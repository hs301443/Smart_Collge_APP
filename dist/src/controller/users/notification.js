"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSingleNotification = exports.getUnreadCount = exports.getUserNotifications = void 0;
const notification_1 = require("../../models/shema/notification");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
const Errors_2 = require("../../Errors");
const mongoose_1 = __importDefault(require("mongoose"));
const getUserNotifications = async (req, res) => {
    // التحقق من وجود المستخدم في الـ request
    if (!req.user)
        throw new Errors_1.UnauthorizedError("User not found");
    // التأكد من وجود id للمستخدم
    if (!req.user.id)
        throw new BadRequest_1.BadRequest("User ID not found");
    // تحويل الـ id لـ ObjectId لو لازم
    const userId = new mongoose_1.default.Types.ObjectId(req.user.id);
    // البحث عن إشعارات المستخدم
    const notifications = await notification_1.UserNotificationModel.find({ userId })
        .populate("notification") // لو الحقل مرتبط بـ Notification model
        .sort({ createdAt: -1 });
    console.log("User Notifications:", notifications); // للتأكد من النتيجة
    return (0, response_1.SuccessResponse)(res, notifications);
};
exports.getUserNotifications = getUserNotifications;
const getUnreadCount = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("User not found");
    const userId = req.user.id;
    const count = await notification_1.UserNotificationModel.countDocuments({
        user: userId, // 👈 استخدم user مش userId
        read: false, // 👈 مطابق للموديل
    });
    return (0, response_1.SuccessResponse)(res, { unreadCount: count });
};
exports.getUnreadCount = getUnreadCount;
const getSingleNotification = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("User not found");
    const userId = req.user.id;
    const { id } = req.params; // ⬅️ ID بتاع الـ UserNotification
    const userNotification = await notification_1.UserNotificationModel.findOne({
        _id: id,
        user: userId,
    }).populate("notification");
    if (!userNotification) {
        throw new Errors_2.NotFound("Notification not found for this user");
    }
    // لو مش مقروءة → نخليها مقروءة
    if (!userNotification.read) {
        userNotification.read = true;
        await userNotification.save();
    }
    return (0, response_1.SuccessResponse)(res, userNotification);
};
exports.getSingleNotification = getSingleNotification;
