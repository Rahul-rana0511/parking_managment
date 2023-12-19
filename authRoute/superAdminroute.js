import express from 'express';
const router = express.Router();
import {checkUserRole} from '../middlewares/authorization.js';
import { authenticateToken } from '../middlewares/authentication.js';
import { checkValidation } from '../middlewares/userValidation.js';
import { editDataBySuperadmin } from '../authController/superAdminController.js';
router.use(express.json());
router.put('/editData/:id',authenticateToken,checkUserRole('1'),checkValidation,editDataBySuperadmin);
export default router;