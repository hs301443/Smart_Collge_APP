import {NotificationModels, UserNotificationModel} from '../../models/shema/notification';
import { UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { Request, Response } from "express";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors";


export const getUserNotifications = async (req: Request, res: Response) => {
  if (!req.user?._id) throw new UnauthorizedError("User not found");

  const userId = req.user._id;
  console.log("User ID:", userId);
  const notifications = await UserNotificationModel.find({ user: userId }) // هنا بدل userId استخدم user
    .populate("notification")
    .sort({ createdAt: -1 });

  console.log("User Notifications:", notifications);

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
