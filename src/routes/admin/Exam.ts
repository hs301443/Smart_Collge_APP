import { Router } from 'express';
import {createExam,getAllExams,getExamById,deleteExam,updateExam} from '../../controller/admin/Exam'
import { catchAsync } from '../../utils/catchAsync';

const router =Router();

router
    .post('/', catchAsync(createExam))
    .get('/', catchAsync(getAllExams))
    .get('/:id', catchAsync(getExamById))
    .delete('/:id', catchAsync(deleteExam))
    .put('/:id', catchAsync(updateExam))

export default router