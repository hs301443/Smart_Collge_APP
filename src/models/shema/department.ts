import mongoose from "mongoose";

const departmentSchema =new mongoose.Schema({
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
})
export const DepartmentModel = mongoose.model("department", departmentSchema);

