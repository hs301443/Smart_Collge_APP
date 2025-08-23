"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotification = exports.deletenotification = exports.getNotificationById = exports.getallNotification = exports.sendNotificationToAll = void 0;
const notification_1 = require("../../models/shema/notification");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
const Errors_2 = require("../../Errors");
const User_1 = require("../../models/shema/auth/User");
const firebase_1 = require("../../utils/firebase");
const sendNotificationToAll = async (req, res) => {
    try {
        const { title, body } = req.body;
        if (!title || !body) {
            throw new BadRequest_1.BadRequest("Title and body are required");
        }
        const newNotification = await notification_1.NotificationModels.create({
            title,
            body,
        });
        const allUsersWithTokens = await User_1.UserModel.find({}, { _id: 1, fcmtoken: 1 }).lean();
        if (!allUsersWithTokens.length) {
            throw new Errors_2.NotFound("No users found");
        }
        console.log(`📊 Total users found: ${allUsersWithTokens.length}`);
        const userNotificationsData = allUsersWithTokens.map(user => ({
            userId: user._id,
            notificationId: newNotification._id,
            status: "unseen",
        }));
        await notification_1.UserNotificationModel.insertMany(userNotificationsData);
        console.log(`✅ Created ${userNotificationsData.length} user-notification relationships`);
        const tokens = allUsersWithTokens
            .map(user => user.fcmtoken)
            .filter(token => token && typeof token === "string" && token.trim() && token !== "null" && token !== "undefined");
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
        const response = await firebase_1.messaging.sendEachForMulticast(message);
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
    }
    catch (error) {
        console.error("❌ Error in sendNotificationToAll:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        throw error;
    }
};
exports.sendNotificationToAll = sendNotificationToAll;
const getallNotification = async (req, res) => {
    if (!req.user) {
        throw new Errors_1.UnauthorizedError("You are not authorized to access this resource");
    }
    const notifications = await notification_1.NotificationModels.find({});
    if (!notifications.length)
        throw new Errors_2.NotFound("No notification found");
    return (0, response_1.SuccessResponse)(res, {
        message: "Login successful",
        notifications,
    }, 200);
};
exports.getallNotification = getallNotification;
const getNotificationById = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("You are not authorized to access this resource");
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("id is required");
    const notification = await notification_1.NotificationModels.findById(id);
    if (!notification) {
        throw new Errors_2.NotFound("Notification not found");
    }
    return (0, response_1.SuccessResponse)(res, {
        message: "Login successful",
        notification,
    }, 200);
};
exports.getNotificationById = getNotificationById;
const deletenotification = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("You are not authorized to access this resource");
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("id is required");
    const notification = await notification_1.NotificationModels.findByIdAndDelete(id);
    if (!notification) {
        throw new Errors_2.NotFound("Notification not found");
    }
    return (0, response_1.SuccessResponse)(res, {
        message: "Login successful",
        notification,
    }, 200);
};
exports.deletenotification = deletenotification;
const updateNotification = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("You are not authorized to access this resource");
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("id is required");
    const { title, body } = req.body;
    if (!title || !body)
        throw new BadRequest_1.BadRequest("title and body are required");
    const notification = await notification_1.NotificationModels.findByIdAndUpdate(id, { title, body }, { new: true });
    if (!notification) {
        throw new Errors_2.NotFound("Notification not found");
    }
    return (0, response_1.SuccessResponse)(res, {
        message: "Login successful",
        notification,
    }, 200);
};
exports.updateNotification = updateNotification;
