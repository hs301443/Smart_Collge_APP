"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = __importDefault(require("./auth/index"));
const VisionMission_1 = __importDefault(require("./VisionMission"));
const notification_1 = __importDefault(require("./notification"));
const route = (0, express_1.Router)();
route.use("/auth", index_1.default);
route.use("/vision-mission", VisionMission_1.default);
route.use("/notification", notification_1.default);
exports.default = route;
