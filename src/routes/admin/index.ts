import { Router } from "express";
import authRouter from "./auth";
import { authenticated } from "../../middlewares/authenticated";
import { authorizeRoles } from "../../middlewares/authorized";
import notificationRouter from "./notification"
import rolesRouter from"./roles";
import adminRouter from "./admin";
import NewsRouter from "./News";
import TempletsRouter from "./templates"
import ExamRouter from './Exam'
import AttemptRouter from './Attempt'

export const route = Router();

route.use("/auth", authRouter);
route.use(authenticated, authorizeRoles("Admin","SuperAdmin"));
route.use("/notification",notificationRouter);
route.use("/news", NewsRouter);
route.use("/roles", rolesRouter);
route.use("/admins", adminRouter);
route.use("/templates", TempletsRouter);
route.use("/exam",ExamRouter);
route.use("/attempt",AttemptRouter)
export default route;