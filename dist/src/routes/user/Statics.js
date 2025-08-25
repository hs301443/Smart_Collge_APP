"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Statics_1 = require("../../controller/users/Statics");
const authenticated_1 = require("../../middlewares/authenticated");
const router = (0, express_1.Router)();
router.get("/profile", authenticated_1.authenticated, Statics_1.getGraduatedProfile);
router.put("/profile", authenticated_1.authenticated, Statics_1.updateGraduatedProfile);
exports.default = router;
