import { Router } from "express";
import AuthRoute from "./auth/index";
import VisionMissionRouter from './VisionMission';
import { app } from "firebase-admin";

const route = Router();
route.use("/auth", AuthRoute);
route.use("/vision-mission", VisionMissionRouter);
export default route;