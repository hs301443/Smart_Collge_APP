import { Router } from "express";
import {  graduationStats } from "../../controller/users/Statics";
import { authenticated, requireGraduated } from "../../middlewares/authenticated";

const router=Router();

router.get(
  "/",
  authenticated,
 graduationStats
);

export default router;