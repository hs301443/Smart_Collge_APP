"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/roleRoutes.ts
const express_1 = require("express");
const roles_1 = require("../../controller/admin/roles");
const authorized_1 = require("../../middlewares/authorized");
const router = (0, express_1.Router)();
// 🟢 SuperAdmin only
router.post("/", authorized_1.auth, (0, authorized_1.authorizeRoles)("superAdmin"), roles_1.createRole);
router.put("/:id", authorized_1.auth, (0, authorized_1.authorizeRoles)("superAdmin"), roles_1.updateRole);
router.delete("/:id", authorized_1.auth, (0, authorized_1.authorizeRoles)("superAdmin"), roles_1.deleteRole);
// 🟢 SuperAdmin: يشوف كل الرولز
router.get("/", authorized_1.auth, (0, authorized_1.authorizeRoles)("superAdmin"), roles_1.getRoles);
// 🟢 SuperAdmin: يشوف أي role
router.get("/:id", authorized_1.auth, (0, authorized_1.authorizeRoles)("superAdmin"), roles_1.getRoleById);
// 🟢 Admin: يشوف بس الـ role بتاعه
router.get("/my-role", authorized_1.auth, (0, authorized_1.authorizeRoles)("admin"), roles_1.getMyRole);
exports.default = router;
