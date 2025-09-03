import {NotificationModels, UserNotificationModel} from '../../models/shema/notification';
import { UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { Request, Response } from "express";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors";


export const getUserNotifications = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("User not found");
const userId = req.user.id;
  if (!userId) throw new BadRequest("User not found")
  const notifications = await UserNotificationModel.find({ userId })
    .populate("notification") 
    .sort({ createdAt: -1 });

  return SuccessResponse(res, notifications);

};

export const getUnreadCount = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("User not found");
const userId = req.user.id;

  const count = await UserNotificationModel.countDocuments({
    user: userId,
    read: false,
  });
  return SuccessResponse(res, count);
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
