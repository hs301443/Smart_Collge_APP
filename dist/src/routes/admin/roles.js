"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/roleRoutes.ts
const express_1 = require("express");
const roles_1 = require("../../controller/admin/roles");
const authenticated_1 = require("../../middlewares/authenticated");
const authorized_1 = require("../../middlewares/authorized");
const router = (0, express_1.Router)();
// 🟢 SuperAdmin only
router.post("/", authenticated_1.authenticated, (0, authorized_1.authorizeRoles)("superAdmin"), roles_1.createRole);
router.put("/:id", authenticated_1.authenticated, (0, authorized_1.authorizeRoles)("superAdmin"), roles_1.updateRole);
router.delete("/:id", authenticated_1.authenticated, (0, authorized_1.authorizeRoles)("superAdmin"), roles_1.deleteRole);
// 🟢 SuperAdmin: يشوف كل الرولز
router.get("/", authenticated_1.authenticated, (0, authorized_1.authorizeRoles)("superAdmin"), roles_1.getRoles);
// 🟢 SuperAdmin: يشوف أي role
router.get("/:id", authenticated_1.authenticated, (0, authorized_1.authorizeRoles)("superAdmin"), roles_1.getRoleById);
// 🟢 Admin: يشوف بس الـ role بتاعه
router.get("/my-role", authenticated_1.authenticated, (0, authorized_1.authorizeRoles)("admin"), roles_1.getMyRole);
exports.default = router;
