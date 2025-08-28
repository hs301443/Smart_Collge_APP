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
import { authorizeRoles } from "../../middlewares/authorized";

const router = Router();

// 🟢 SuperAdmin only
router.post("/", authenticated, authorizeRoles("superAdmin"), createRole);
router.put("/:id", authenticated, authorizeRoles("superAdmin"), updateRole);
router.delete("/:id", authenticated, authorizeRoles("superAdmin"), deleteRole);

// 🟢 SuperAdmin: يشوف كل الرولز
router.get("/", authenticated, authorizeRoles("superAdmin"), getRoles);

// 🟢 SuperAdmin: يشوف أي role
router.get("/:id", authenticated, authorizeRoles("superAdmin"), getRoleById);

// 🟢 Admin: يشوف بس الـ role بتاعه
router.get("/my-role", authenticated, authorizeRoles("admin"), getMyRole);

export default router;