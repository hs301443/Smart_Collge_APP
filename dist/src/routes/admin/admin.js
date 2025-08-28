"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_1 = require("../../controller/admin/admin");
const authenticated_1 = require("../../middlewares/authenticated");
const authorized_1 = require("../../middlewares/authorized");
const router = (0, express_1.Router)();
// 🟢 SuperAdmin only
router.post("/", authenticated_1.authenticated, (0, authorized_1.authorizeRoles)("superAdmin"), admin_1.createAdmin);
router.get("/", authenticated_1.authenticated, (0, authorized_1.authorizeRoles)("superAdmin"), admin_1.getAdmins);
router.get("/:id", authenticated_1.authenticated, (0, authorized_1.authorizeRoles)("superAdmin"), admin_1.getAdminById);
router.put("/:id", authenticated_1.authenticated, (0, authorized_1.authorizeRoles)("superAdmin"), admin_1.updateAdmin);
router.delete("/:id", authenticated_1.authenticated, (0, authorized_1.authorizeRoles)("superAdmin"), admin_1.deleteAdmin);
exports.default = router;
