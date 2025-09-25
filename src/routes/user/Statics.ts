import { Router } from "express";
import {  graduationStats } from "../../controller/users/Statics";
import { authenticated } from "../../middlewares/authenticated";

const router=Router();

router.get(
  "/",
  graduationStats
 
);

export default router;