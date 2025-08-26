"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.route = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const notification_1 = __importDefault(require("./notification"));
const News_1 = __importDefault(require("./News"));
exports.route = (0, express_1.Router)();
exports.route.use("/auth", auth_1.default);
exports.route.use("/notification", notification_1.default);
exports.route.use("/news", News_1.default);
exports.default = exports.route;
