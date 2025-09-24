import { Router } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import * as EXamController from '../../controller/admin/Exam';

const router = Router();

/** ======= Exam Routes ======= **/
router
  .post('/create', catchAsync(EXamController.createExamWithQuestions))          // إنشاء امتحان
  .get('/get', catchAsync(EXamController.getAllExams))           // جلب كل الامتحانات
  .get('/get/:id', catchAsync(EXamController.getExamById))       // جلب امتحان محدد
  .put('/update/:id', catchAsync(EXamController.updateExam))        // تعديل امتحان
  .delete('/delete/:id', catchAsync(EXamController.deleteExam));    // حذف امتحان

/** ======= Question Routes ======= **/
router
  .get('/questions/:examId', catchAsync(EXamController.getAllQuestionsForExam))   // جلب كل أسئلة الامتحان
  .get('/question/:id', catchAsync(EXamController.getQuestionById))               // جلب سؤال واحد
  .put('/question/:id', catchAsync(EXamController.updateQuestionById))            // تعديل سؤال
  .delete('/question/:id', catchAsync(EXamController.deleteQuestionById));        // حذف سؤال

export default router;
