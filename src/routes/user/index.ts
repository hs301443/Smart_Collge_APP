import { Router } from "express";
import AuthRoute from "./auth/index";
import NotificationRouter from './notification';
import NewsRouter from './News';
import StaticsRouter from "./Statics"
import templatesRouter from "./templates"
const route = Router();
route.use("/auth", AuthRoute);
route.use("/notification", NotificationRouter);
route.use("/news", NewsRouter);
route.use("/statics", StaticsRouter);
route.use("/templates", templatesRouter);
export default route;