import express from 'express';
import { createEmployee, editEmployee, deleteEmployee } from '../controller/employee.controller.js';
import { upload } from '../middleware/multer.middleware.js';
import { varifyJwt } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(varifyJwt)


router.post('/', upload.single('image'), createEmployee);
router.put('/:id', upload.single('image'), editEmployee);
router.delete('/:id', deleteEmployee);

export default router;