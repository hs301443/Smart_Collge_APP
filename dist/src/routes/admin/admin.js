"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_1 = require("../../controller/admin/admin");
const authorized_1 = require("../../middlewares/authorized");
const router = (0, express_1.Router)();
// 🟢 SuperAdmin only
router.post("/", authorized_1.auth, (0, authorized_1.authorizeRoles)("superAdmin"), admin_1.createAdmin);
router.get("/", authorized_1.auth, (0, authorized_1.authorizeRoles)("superAdmin"), admin_1.getAdmins);
router.get("/:id", authorized_1.auth, (0, authorized_1.authorizeRoles)("superAdmin"), admin_1.getAdminById);
router.put("/:id", authorized_1.auth, (0, authorized_1.authorizeRoles)("superAdmin"), admin_1.updateAdmin);
router.delete("/:id", authorized_1.auth, (0, authorized_1.authorizeRoles)("superAdmin"), admin_1.deleteAdmin);
exports.default = router;
