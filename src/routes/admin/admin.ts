import { Router } from "express";
import {
  createAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
} from "../../controller/admin/admin";

import { authenticated } from "../../middlewares/authenticated";
import { authorizeRoles } from "../../middlewares/authorized";

const router = Router();

// 🟢 SuperAdmin only
router.post("/", authenticated, authorizeRoles("superAdmin"), createAdmin);
router.get("/", authenticated, authorizeRoles("superAdmin"), getAdmins);
router.get("/:id", authenticated, authorizeRoles("superAdmin"), getAdminById);
router.put("/:id", authenticated, authorizeRoles("superAdmin"), updateAdmin);
router.delete("/:id", authenticated, authorizeRoles("superAdmin"), deleteAdmin);

export default router;