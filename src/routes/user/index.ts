import { Router } from "express";
import AuthRoute from "./auth/index";
import NotificationRouter from './notification';
import NewsRouter from './News';
import { app } from "firebase-admin";

const route = Router();
route.use("/auth", AuthRoute);
route.use("/notification", NotificationRouter);
route.use("/news", NewsRouter);
export default route;