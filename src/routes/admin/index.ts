import { Router } from "express";
import authRouter from "./auth";
import { authenticated } from "../../middlewares/authenticated";
import { auth, authorizeRoles } from "../../middlewares/authorized";
import notificationRouter from "./notification"
import rolesRouter from"./roles";
import adminRouter from "./admin";
import NewsRouter from "./News";
import TempletsRouter from "./templates"
import chatRouter from './chat';
import ExamRouter from './Exam'
import QuestionsRouter from './Questions'
import AttemptRouter from './Attempt'

export const route = Router();

route.use("/auth", authRouter);
route.use(auth, authorizeRoles("admin", "superadmin"));
route.use("/notification",notificationRouter);
route.use("/news", NewsRouter);
route.use("/roles", rolesRouter);
route.use("/admins", adminRouter);
route.use("/templates", TempletsRouter);
route.use("/chat", chatRouter);
route.use("/exam",ExamRouter);
route.use("/questions",QuestionsRouter)
route.use("/attempt",AttemptRouter)
export default route;