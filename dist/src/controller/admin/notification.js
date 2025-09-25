"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotification = exports.deletenotification = exports.getNotificationById = exports.getallNotification = exports.sendNotificationToAll = void 0;
const notification_1 = require("../../models/shema/notification");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
const Errors_1 = require("../../Errors");
const User_1 = require("../../models/shema/auth/User");
const firebase_1 = require("../../utils/firebase");
const sendNotificationToAll = async (req, res) => {
    const { title, body } = req.body;
    if (!title || !body) {
        throw new BadRequest_1.BadRequest("Title and body are required");
    }
    // هات كل اليوزر ومعاهم fcmtoken
    const allUsers = await User_1.UserModel.find({}, { _id: 1, fcmtoken: 1 }).lean();
    if (!allUsers.length) {
        throw new Errors_1.NotFound("No users found");
    }
    // فلترة اليوزر اللي عندهم fcmtoken صالح
    const validUsers = allUsers.filter(user => user.fcmtoken &&
        typeof user.fcmtoken === "string" &&
        user.fcmtoken.trim() &&
        user.fcmtoken !== "null" &&
        user.fcmtoken !== "undefined");
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
    const newNotification = await notification_1.NotificationModels.create({ title, body });
    // نربطها باليوزر اللي معاهم fcmtoken
    const userNotificationsData = validUsers.map(user => ({
        user: user._id,
        notification: newNotification._id,
    }));
    await notification_1.UserNotificationModel.insertMany(userNotificationsData);
    // جمع التوكنات
    const tokens = validUsers.map(user => user.fcmtoken);
    // إرسال الرسالة
    const message = {
        notification: { title, body },
        tokens,
    };
    const response = await firebase_1.messaging.sendEachForMulticast(message);
    // اطبع الأخطاء بالتفصيل
    response.responses.forEach((resp, idx) => {
        if (!resp.success) {
            console.error(`❌ Error for token[${tokens[idx]}]:`, resp.error?.code, resp.error?.message);
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
exports.sendNotificationToAll = sendNotificationToAll;
const getallNotification = async (req, res) => {
    const notifications = await notification_1.NotificationModels.find({});
    if (!notifications.length)
        throw new Errors_1.NotFound("No notification found");
    return (0, response_1.SuccessResponse)(res, {
        message: "Login successful",
        notifications,
    }, 200);
};
exports.getallNotification = getallNotification;
const getNotificationById = async (req, res) => {
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("id is required");
    const notification = await notification_1.NotificationModels.findById(id);
    if (!notification) {
        throw new Errors_1.NotFound("Notification not found");
    }
    return (0, response_1.SuccessResponse)(res, {
        message: "Login successful",
        notification,
    }, 200);
};
exports.getNotificationById = getNotificationById;
const deletenotification = async (req, res) => {
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("id is required");
    const notification = await notification_1.NotificationModels.findByIdAndDelete(id);
    if (!notification) {
        throw new Errors_1.NotFound("Notification not found");
    }
    return (0, response_1.SuccessResponse)(res, {
        message: "Login successful",
        notification,
    }, 200);
};
exports.deletenotification = deletenotification;
const updateNotification = async (req, res) => {
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("id is required");
    const { title, body } = req.body;
    if (!title || !body)
        throw new BadRequest_1.BadRequest("title and body are required");
    const notification = await notification_1.NotificationModels.findByIdAndUpdate(id, { title, body }, { new: true });
    if (!notification) {
        throw new Errors_1.NotFound("Notification not found");
    }
    return (0, response_1.SuccessResponse)(res, {
        message: "Login successful",
        notification,
    }, 200);
};
exports.updateNotification = updateNotification;
