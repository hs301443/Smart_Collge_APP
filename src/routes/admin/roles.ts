// routes/roleRoutes.ts
import { Router } from "express";
import {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getMyRole
} from "../../controller/admin/roles";
import { authenticated } from "../../middlewares/authenticated";
import { auth, authorizeRoles } from "../../middlewares/authorized";

const router = Router();

// 🟢 SuperAdmin only
router.post("/", auth, authorizeRoles("superAdmin"), createRole);
router.put("/:id", auth, authorizeRoles("superAdmin"), updateRole);
router.delete("/:id", auth, authorizeRoles("superAdmin"), deleteRole);

// 🟢 SuperAdmin: يشوف كل الرولز
router.get("/", auth, authorizeRoles("superAdmin"), getRoles);

// 🟢 SuperAdmin: يشوف أي role
router.get("/:id", auth, authorizeRoles("superAdmin"), getRoleById);

// 🟢 Admin: يشوف بس الـ role بتاعه
router.get("/my-role", auth, authorizeRoles("admin"), getMyRole);

export default router;