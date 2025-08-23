"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = __importDefault(require("./user/index"));
const index_2 = __importDefault(require("./admin/index"));
const route = (0, express_1.Router)();
route.use('/admin', index_2.default);
route.use('/user', index_1.default);
exports.default = route;
