import {NotificationModels, UserNotificationModel} from '../../models/shema/notification';
import { UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { Request, Response } from "express";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors";
import { UserModel } from '../../models/shema/auth/User';
import { messaging } from '../../utils/firebase';


export const sendNotificationToAll = async (req: Request, res: Response) => {
   
  const { title, body } = req.body;

  if (!title || !body) {
    throw new BadRequest("Title and body are required");
  }

  // هات كل اليوزر ومعاهم fcmtoken
  const allUsers = await UserModel.find({}, { _id: 1, fcmtoken: 1 }).lean();

  if (!allUsers.length) {
    throw new NotFound("No users found");
  }

  // فلترة اليوزر اللي عندهم fcmtoken صالح
  const validUsers = allUsers.filter(
    user =>
      user.fcmtoken &&
      typeof user.fcmtoken === "string" &&
      user.fcmtoken.trim() &&
      user.fcmtoken !== "null" &&
      user.fcmtoken !== "undefined"
  );

  if (!validUsers.length) {
    return res.json({
      success: false,
      message: "No valid FCM tokens found for users",
      stats: {
        totalUsers: allUsers.length,
        validTokens: 0,
      },
    });
  }

  // هنا بس لو فيه validUsers نعمل Notification
  const newNotification = await NotificationModels.create({ title, body });

  // نربطها باليوزر اللي معاهم fcmtoken
  const userNotificationsData = validUsers.map(user => ({
    user: user._id,
    notification: newNotification._id,
  }));

  await UserNotificationModel.insertMany(userNotificationsData);

  // جمع التوكنات
  const tokens = validUsers.map(user => user.fcmtoken) as string[];

  // إرسال الرسالة
  const message = {
    notification: { title, body },
    tokens,
  };

  const response = await messaging.sendEachForMulticast(message);

  // اطبع الأخطاء بالتفصيل
  response.responses.forEach((resp, idx) => {
    if (!resp.success) {
      console.error(
        `❌ Error for token[${tokens[idx]}]:`,
        resp.error?.code,
        resp.error?.message
      );
    }
  });

  return res.json({
    success: true,
    message: "Notification sent successfully",
    notificationId: newNotification._id,
    results: {
      successCount: response.successCount,
      failureCount: response.failureCount,
      totalTokens: tokens.length,
    },
    stats: {
      totalUsers: allUsers.length,
      validTokens: tokens.length,
    },
  });
};


export const getallNotification =async (req: Request, res: Response) => {

    const notifications = await NotificationModels.find({});
    if(!notifications.length)
      throw new NotFound("No notification found")
    return SuccessResponse(res, { 
    message: "Login successful", 
     notifications,
  }, 200);
}

export const getNotificationById= async(req:Request, res:Response)=>{
  
  const {id}=req.params
  if(!id)
    throw new BadRequest("id is required")
  
  const notification = await NotificationModels.findById(id)
  if(!notification){
    throw new NotFound("Notification not found")
  }
  return SuccessResponse(res, { 
    message: "Login successful", 
     notification,
  }, 200);
}

export const deletenotification = async(req:Request, res:Response)=>{

  const {id}=req.params
  if(!id)
    throw new BadRequest("id is required")
  
  const notification = await NotificationModels.findByIdAndDelete(id)
  if(!notification){
    throw new NotFound("Notification not found")
  }
  return SuccessResponse(res, { 
    message: "Login successful", 
     notification,
  }, 200);
}

export const updateNotification = async(req:Request, res:Response)=>{
 
  const {id}=req.params
  if(!id)
    throw new BadRequest("id is required")
  
  const {title, body}=req.body
  if(!title || !body)
    throw new BadRequest("title and body are required")
  
  const notification = await NotificationModels.findByIdAndUpdate(id, {title, body}, {new:true})
  if(!notification){
    throw new NotFound("Notification not found")
  }
  return SuccessResponse(res, { 
    message: "Login successful", 
     notification,
  }, 200);
}