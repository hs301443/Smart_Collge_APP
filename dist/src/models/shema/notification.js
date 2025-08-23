"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserNotificationModel = exports.NotificationModels = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const NotificationSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
});
exports.NotificationModels = mongoose_1.default.model('Notification', NotificationSchema);
const UserNotificationSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    notification: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Notification',
        required: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true
});
exports.UserNotificationModel = mongoose_1.default.model('UserNotification', UserNotificationSchema);
