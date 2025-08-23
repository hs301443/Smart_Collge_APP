"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const User_1 = require("../models/shema/auth/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URL,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User_1.UserModel.findOne({ $or: [{ googleId: profile.id }, { email: profile.emails?.[0].value }] });
        if (!user) {
            user = await User_1.UserModel.create({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails?.[0].value,
                role: "member",
                isVerified: true,
                imageBase64: profile.photos?.[0]?.value || "", // 
            });
        }
        else {
            if (!user.googleId) {
                user.googleId = profile.id;
                await user.save();
            }
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        return done(null, { user, token });
    }
    catch (err) {
        return done(err, undefined);
    }
}));
exports.default = passport_1.default;
