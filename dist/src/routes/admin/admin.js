"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_1 = require("../../controller/admin/admin");
const router = (0, express_1.Router)();
// 🟢 SuperAdmin only
router.post("/", admin_1.createAdmin);
router.get("/", admin_1.getAdmins);
router.get("/:id", admin_1.getAdminById);
router.put("/:id", admin_1.updateAdmin);
router.delete("/:id", admin_1.deleteAdmin);
exports.default = router;
