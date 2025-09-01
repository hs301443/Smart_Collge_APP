import { Router } from "express";
import authRouter from "./auth";
import { authenticated } from "../../middlewares/authenticated";
import { authorizeRoles } from "../../middlewares/authorized";
import notificationRouter from "./notification"
import rolesRouter from"./roles";
import adminRouter from "./admin";
import NewsRouter from "./News";
import TempletsRouter from "./templates"
export const route = Router();

route.use("/auth", authRouter);
route.use("/notification", notificationRouter);
route.use("/news", NewsRouter);
route.use("/roles", rolesRouter);
route.use("/admins", authenticated, adminRouter);
route.use("/templates", TempletsRouter);

export default route;