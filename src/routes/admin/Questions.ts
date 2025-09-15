import {Router} from 'express';
import{createQuestionforExam,getAllQuestionsforExam,getAllQuestionById,deleteQuestionById,updateQuestionById}from '../../controller/admin/Questions'
import { catchAsync } from '../../utils/catchAsync';

const router =Router();

router
    .post('/:id', catchAsync(createQuestionforExam))
    .get('/:id', catchAsync(getAllQuestionsforExam))
    .get('/:id', catchAsync(getAllQuestionById))
    .delete('/:id', catchAsync(deleteQuestionById))
    .put('/:id', catchAsync(updateQuestionById))

export default router