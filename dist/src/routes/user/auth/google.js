"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("../../../config/passport");
const passport_1 = require("../../../config/passport");
const auth_1 = require("../../../validation/user/auth");
const validation_1 = require("../../../middlewares/validation");
const catchAsync_1 = require("../../../utils/catchAsync");
const router = express_1.default.Router();
router.post("/", (0, validation_1.validate)(auth_1.googlevalidateSchema), (0, catchAsync_1.catchAsync)(passport_1.verifyGoogleToken));
exports.default = router;
