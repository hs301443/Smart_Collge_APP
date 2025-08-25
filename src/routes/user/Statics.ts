import { Router } from "express";
import { getGraduatedProfile, updateGraduatedProfile } from "../../controller/users/Statics";
import { authenticated, requireGraduated } from "../../middlewares/authenticated";
import { authorizeRoles } from "../../middlewares/authorized";

const router=Router();

router.get(
  "/profile",
  authenticated,
 getGraduatedProfile
);

router.put(
  "/profile",
  authenticated,
  updateGraduatedProfile
);

export default router;