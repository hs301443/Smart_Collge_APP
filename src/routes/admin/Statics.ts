import { Router } from "express";
import { getGraduatedDashboardStats, getEmploymentAnalytics } from "../../controller/admin/Statics";
import { authenticated  } from "../../middlewares/authenticated";
import { authorizeRoles } from "../../middlewares/authorized";

const router = Router();

// لازم الأدمن يكون عامل تسجيل دخول + يكون Admin
router.get("/dashboard", authenticated,authorizeRoles("admin") , getGraduatedDashboardStats);
router.get("/analytics", authenticated,authorizeRoles("admin") , getEmploymentAnalytics);

export default router;