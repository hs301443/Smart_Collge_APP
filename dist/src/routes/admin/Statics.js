"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Statics_1 = require("../../controller/admin/Statics");
const authenticated_1 = require("../../middlewares/authenticated");
const authorized_1 = require("../../middlewares/authorized");
const router = (0, express_1.Router)();
// لازم الأدمن يكون عامل تسجيل دخول + يكون Admin
router.get("/dashboard", authenticated_1.authenticated, (0, authorized_1.authorizeRoles)("admin"), Statics_1.getGraduatedDashboardStats);
router.get("/analytics", authenticated_1.authenticated, (0, authorized_1.authorizeRoles)("admin"), Statics_1.getEmploymentAnalytics);
exports.default = router;
