"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Statics_1 = require("../../controller/users/Statics");
const router = (0, express_1.Router)();
router.get("/", Statics_1.graduationStats);
exports.default = router;
