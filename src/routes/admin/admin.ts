import { Router } from "express";
import {
  createAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
} from "../../controller/admin/admin";

import { authenticated } from "../../middlewares/authenticated";

const router = Router();

// 🟢 SuperAdmin only
router.post("/", createAdmin);
router.get("/", getAdmins);
router.get("/:id", getAdminById);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

export default router;