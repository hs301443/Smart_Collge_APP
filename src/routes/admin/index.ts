import { Router } from "express";
import authRouter from "./auth";
import { authenticated } from "../../middlewares/authenticated";
import { authorizeRoles } from "../../middlewares/authorized";
import notificationRouter from "./notification"
import NewsRouter from "./News";
export const route = Router();

route.use("/auth", authRouter);
route.use(authenticated,authorizeRoles("admin"));
route.use("/notification", notificationRouter);
route.use("/news", NewsRouter);

export default route;