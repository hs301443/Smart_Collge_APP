import { Router } from "express";
import {
  createAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
} from "../../controller/admin/admin";

import { authenticated } from "../../middlewares/authenticated";
import { auth, authorizeRoles } from "../../middlewares/authorized";

const router = Router();

// 🟢 SuperAdmin only
router.post("/", auth, authorizeRoles("superAdmin"), createAdmin);
router.get("/", auth, authorizeRoles("superAdmin"), getAdmins);
router.get("/:id", auth, authorizeRoles("superAdmin"), getAdminById);
router.put("/:id", auth, authorizeRoles("superAdmin"), updateAdmin);
router.delete("/:id", auth, authorizeRoles("superAdmin"), deleteAdmin);

export default router;