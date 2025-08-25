"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = __importDefault(require("./auth/index"));
const notification_1 = __importDefault(require("./notification"));
const News_1 = __importDefault(require("./News"));
const route = (0, express_1.Router)();
route.use("/auth", index_1.default);
route.use("/notification", notification_1.default);
route.use("/news", News_1.default);
exports.default = route;
