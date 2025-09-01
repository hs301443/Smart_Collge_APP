"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const templates_1 = require("../../controller/users/templates");
const authenticated_1 = require("../../middlewares/authenticated");
const router = (0, express_1.Router)();
router.get('/', authenticated_1.authenticated, templates_1.getTemplates);
router.get('/:id', authenticated_1.authenticated, templates_1.getTemplateById);
exports.default = router;
