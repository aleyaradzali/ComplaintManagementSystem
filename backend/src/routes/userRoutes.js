import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { USER_ROLE } from '../constants/userRole.js';

const router = Router();

router.get('/officers', authenticate, authorize(USER_ROLE.ADMIN), userController.listOfficers);

export default router;
