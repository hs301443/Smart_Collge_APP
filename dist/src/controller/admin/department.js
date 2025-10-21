"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDepartment = exports.updateDepartment = exports.deleteDepartment = exports.getDepartmentById = exports.getDepartments = void 0;
const department_1 = require("../../models/shema/department");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const getDepartments = async (req, res) => {
    const departments = await department_1.DepartmentModel.find();
    (0, response_1.SuccessResponse)(res, departments);
};
exports.getDepartments = getDepartments;
const getDepartmentById = async (req, res) => {
    const department = await department_1.DepartmentModel.findById(req.params.id);
    if (!department)
        throw new Errors_1.NotFound("Department not found");
    (0, response_1.SuccessResponse)(res, department);
};
exports.getDepartmentById = getDepartmentById;
const deleteDepartment = async (req, res) => {
    const department = await department_1.DepartmentModel.findByIdAndDelete(req.params.id);
    if (!department)
        throw new Errors_1.NotFound("Department not found");
    (0, response_1.SuccessResponse)(res, department);
};
exports.deleteDepartment = deleteDepartment;
const updateDepartment = async (req, res) => {
    const department = await department_1.DepartmentModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!department)
        throw new Errors_1.NotFound("Department not found");
    (0, response_1.SuccessResponse)(res, department);
};
exports.updateDepartment = updateDepartment;
const createDepartment = async (req, res) => {
    const department = await department_1.DepartmentModel.create(req.body);
    (0, response_1.SuccessResponse)(res, department);
};
exports.createDepartment = createDepartment;
