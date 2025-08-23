import { Router } from "express";

import authRouter from "./auth";
import { authenticated } from "../../middlewares/authenticated";
import { authorizeRoles } from "../../middlewares/authorized";
import visionmMissionRouter from "./VisionMission";
import notificationRouter from "./notification"
export const route = Router();

route.use("/auth", authRouter);
route.use(authenticated,authorizeRoles("admin"));
route.use("/vision-mission", visionmMissionRouter);
route.use("/notification", notificationRouter);

export default route;