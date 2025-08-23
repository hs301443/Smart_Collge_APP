import {NotificationModels, UserNotificationModel} from '../../models/shema/notification';
import { UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { Request, Response } from "express";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors";
import { UserModel } from '../../models/shema/auth/User';
import { messaging } from '../../utils/firebase';


export const sendNotificationToAll = async (req: Request, res: Response) => {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      throw new BadRequest("Title and body are required");
    }


    const newNotification = await NotificationModels.create({
      title,
      body,
    });


    const allUsersWithTokens = await UserModel.find({}, { _id: 1, fcmtoken: 1 }).lean();

    if (!allUsersWithTokens.length) {
      throw new NotFound("No users found");
    }

    console.log(`📊 Total users found: ${allUsersWithTokens.length}`);

    const userNotificationsData = allUsersWithTokens.map(user => ({
      userId: user._id,
      notificationId: newNotification._id,
      status: "unseen" as const,
    }));

    await UserNotificationModel.insertMany(userNotificationsData);
    
    console.log(`✅ Created ${userNotificationsData.length} user-notification relationships`);

    const tokens = allUsersWithTokens
      .map(user => user.fcmtoken)
      .filter(token => token && typeof token === "string" && token.trim() && token !== "null" && token !== "undefined") as string[];

    console.log(`📊 Users with valid FCM tokens: ${tokens.length}`);
    console.log(`🔍 Sample tokens:`, tokens.slice(0, 2).map(t => `${t.substring(0, 20)}...`));

    if (!tokens.length) {
      return res.json({
        success: true,
        message: "Notification saved but no valid FCM tokens found",
        notificationId: newNotification._id,
        stats: {
          totalUsers: allUsersWithTokens.length,
          validTokens: 0,
          usersWithTokens: allUsersWithTokens.filter(u => u.fcmtoken).length,
        },
      });
    }

    const message = {
      notification: { title, body },
      tokens,
    };

    const response = await messaging.sendEachForMulticast(message);

    console.log("✅ FCM Response received:");
    console.log(`✅ Success: ${response.successCount}`);
    console.log(`❌ Failures: ${response.failureCount}`);

    if (response.failureCount > 0) {
      response.responses.forEach((resp, index) => {
        if (!resp.success && resp.error) {
          console.log(`  Token ${index}: ${resp.error.code} - ${resp.error.message}`);
        }
      });
    }

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
        totalUsers: allUsersWithTokens.length,
        validTokens: tokens.length,
        usersWithTokens: allUsersWithTokens.filter(u => u.fcmtoken).length,
      },
    });

  } catch (error) {
    console.error("❌ Error in sendNotificationToAll:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
};


export const getallNotification =async (req: Request, res: Response) => {
  if(!req.user){
    throw new UnauthorizedError("You are not authorized to access this resource")
  }
    const notifications = await NotificationModels.find({});
    if(!notifications.length)
      throw new NotFound("No notification found")
    return SuccessResponse(res, { 
    message: "Login successful", 
     notifications,
  }, 200);
}

export const getNotificationById= async(req:Request, res:Response)=>{
  if(!req.user)
    throw new UnauthorizedError("You are not authorized to access this resource")
  
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
  if(!req.user)
    throw new UnauthorizedError("You are not authorized to access this resource")
  
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
  if(!req.user)
    throw new UnauthorizedError("You are not authorized to access this resource")
  
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