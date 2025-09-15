import {Router} from 'express';
import{createQuestionForExam,getAllQuestionsforExam,getAllQuestionById,deleteQuestionById,updateQuestionById}from '../../controller/admin/Questions'
import { catchAsync } from '../../utils/catchAsync';
import { uploadQuestionImage } from '../../utils/multer';

const router =Router();

router
    .post('/:examId',uploadQuestionImage.single("image"),
    catchAsync(createQuestionForExam))
    .get('/:examId', catchAsync(getAllQuestionsforExam))
    .get('/:id', catchAsync(getAllQuestionById))
    .delete('/:id', catchAsync(deleteQuestionById))
    .put('/:id', catchAsync(updateQuestionById))

export default router