import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserModel } from "../models/shema/auth/User";
import jwt from "jsonwebtoken";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_REDIRECT_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await UserModel.findOne({ $or: [{ googleId: profile.id }, { email: profile.emails?.[0].value }] });

        if (!user) {
       user = await UserModel.create({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails?.[0].value,
        role: "member",
        isVerified: true,
        imageBase64: profile.photos?.[0]?.value || "", // 

  });
     } else {
      if (!user.googleId) {
           user.googleId = profile.id;
          await user.save();
    }
         }


        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
          expiresIn: "7d",
        });

        return done(null, { user, token });
      } catch (err) {
        return done(err as any, undefined);
      }
    }
  )
);

export default passport;
