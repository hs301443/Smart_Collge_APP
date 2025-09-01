"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTemplate = exports.updateTemplate = exports.getTemplateById = exports.getTemplates = exports.createTemplate = void 0;
const templates_1 = require("../../models/shema/templates");
const Errors_1 = require("../../Errors");
const Errors_2 = require("../../Errors");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
const createTemplate = async (req, res) => {
    if (!req.user)
        throw new Errors_2.UnauthorizedError("Authentication required");
    const data = req.body;
    if (!data.title || !data.content || !data.category || !data.startdate || !data.enddate || !data.location) {
        throw new BadRequest_1.BadRequest("All fields are required");
    }
    const template = new templates_1.TemplateModel({ ...data, user: req.user._id });
    await template.save();
    return (0, response_1.SuccessResponse)(res, { message: "Template created" });
};
exports.createTemplate = createTemplate;
const getTemplates = async (req, res) => {
    if (!req.user)
        throw new Errors_2.UnauthorizedError("Authentication required");
    const templates = await templates_1.TemplateModel.find();
    return (0, response_1.SuccessResponse)(res, { templates });
};
exports.getTemplates = getTemplates;
const getTemplateById = async (req, res) => {
    if (!req.user)
        throw new Errors_2.UnauthorizedError("Authentication required");
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("Template Id is required");
    const template = await templates_1.TemplateModel.findById(id);
    if (!template)
        throw new Errors_1.NotFound("Template not found");
    return (0, response_1.SuccessResponse)(res, { template });
};
exports.getTemplateById = getTemplateById;
const updateTemplate = async (req, res) => {
    if (!req.user)
        throw new Errors_2.UnauthorizedError("Authentication required");
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("Template Id is required");
    const { title, content, Image, category, startdate, enddate, location, IsActive } = req.body;
    const template = await templates_1.TemplateModel.findById(id);
    if (!template)
        throw new Errors_1.NotFound("Template not found");
    if (title)
        template.title = title;
    if (content)
        template.content = content;
    if (Image)
        template.Image = Image;
    if (category)
        template.category = category;
    if (startdate)
        template.startdate = startdate;
    if (enddate)
        template.enddate = enddate;
    if (location)
        template.location = location;
    if (IsActive !== undefined)
        template.IsActive = IsActive;
    await template.save();
    return (0, response_1.SuccessResponse)(res, { message: "Template updated" });
};
exports.updateTemplate = updateTemplate;
const deleteTemplate = async (req, res) => {
    if (!req.user)
        throw new Errors_2.UnauthorizedError("Authentication required");
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("Template Id is required");
    const template = await templates_1.TemplateModel.findById(id);
    if (!template)
        throw new Errors_1.NotFound("Template not found");
    await template.deleteOne();
    return (0, response_1.SuccessResponse)(res, { message: "Template deleted" });
};
exports.deleteTemplate = deleteTemplate;
