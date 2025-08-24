import { Router } from "express";
import AuthRoute from "./auth/index";
import NotificationRouter from './notification';
import { app } from "firebase-admin";

const route = Router();
route.use("/auth", AuthRoute);
route.use("/notification", NotificationRouter);

export default route;