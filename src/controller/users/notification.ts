import {NotificationModels, UserNotificationModel} from '../../models/shema/notification';
import { UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { Request, Response } from "express";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors";
import mongoose from 'mongoose';


export const getUserNotifications = async (req: Request, res: Response) => {
  // التحقق من وجود المستخدم في الـ request
  if (!req.user) throw new UnauthorizedError("User not found");

  // التأكد من وجود id للمستخدم
  if (!req.user.id) throw new BadRequest("User ID not found");

  // تحويل الـ id لـ ObjectId لو لازم
  const userId = new mongoose.Types.ObjectId(req.user.id);

  // البحث عن إشعارات المستخدم
  const notifications = await UserNotificationModel.find({ userId })
    .populate("notification") // لو الحقل مرتبط بـ Notification model
    .sort({ createdAt: -1 });

  console.log("User Notifications:", notifications); // للتأكد من النتيجة

  return SuccessResponse(res, notifications);
};

export const getUnreadCount = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("User not found");

  const userId = req.user.id;

  const count = await UserNotificationModel.countDocuments({
    user: userId,   // 👈 استخدم user مش userId
    read: false,    // 👈 مطابق للموديل
  });

  return SuccessResponse(res, { unreadCount: count });
};

export const getSingleNotification = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("User not found");
const userId = req.user.id;
  const { id } = req.params; // ⬅️ ID بتاع الـ UserNotification

  const userNotification = await UserNotificationModel.findOne({
    _id: id,
    user: userId,
  }).populate("notification");

  if (!userNotification) {
    throw new NotFound("Notification not found for this user");
  }

  // لو مش مقروءة → نخليها مقروءة
  if (!userNotification.read) {
    userNotification.read = true;
    await userNotification.save();
  }

  return SuccessResponse(res, userNotification);
};
