import mongoose from 'mongoose';    

const NotificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    }
   
},{
    timestamps: true,
});

export  const NotificationModels = mongoose.model('Notification', NotificationSchema);



const UserNotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    notification: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification',
        required: true,
    },
    read: {
        type: Boolean,
        default: false,
    },

},{
        timestamps: true
    }
);


export const UserNotificationModel = mongoose.model('UserNotification', UserNotificationSchema);