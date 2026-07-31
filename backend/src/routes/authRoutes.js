import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema } from '../validators/authValidator.js';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
