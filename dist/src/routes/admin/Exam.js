"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catchAsync_1 = require("../../utils/catchAsync");
const EXamController = __importStar(require("../../controller/admin/Exam"));
const router = (0, express_1.Router)();
/** ======= Exam Routes ======= **/
router
    .post('/create', (0, catchAsync_1.catchAsync)(EXamController.createExamWithQuestions)) // إنشاء امتحان
    .get('/get', (0, catchAsync_1.catchAsync)(EXamController.getAllExams)) // جلب كل الامتحانات
    .get('/get/:id', (0, catchAsync_1.catchAsync)(EXamController.getExamById)) // جلب امتحان محدد
    .put('/update/:id', (0, catchAsync_1.catchAsync)(EXamController.updateExam)) // تعديل امتحان
    .delete('/delete/:id', (0, catchAsync_1.catchAsync)(EXamController.deleteExam)); // حذف امتحان
/** ======= Question Routes ======= **/
router
    .get('/questions/:examId', (0, catchAsync_1.catchAsync)(EXamController.getAllQuestionsForExam)) // جلب كل أسئلة الامتحان
    .get('/question/:id', (0, catchAsync_1.catchAsync)(EXamController.getQuestionById)) // جلب سؤال واحد
    .put('/question/:id', (0, catchAsync_1.catchAsync)(EXamController.updateQuestionById)) // تعديل سؤال
    .delete('/question/:id', (0, catchAsync_1.catchAsync)(EXamController.deleteQuestionById)); // حذف سؤال
exports.default = router;
