import { Router } from 'express';
import authRoutes from './authRoutes.js';
import complaintRoutes from './complaintRoutes.js';
import userRoutes from './userRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import { Result } from '../utils/result.js';

const router = Router();

router.get('/health', async (req, res) => {
  res.status(200).json(Result.ok(null, 'Backend is running'));
});

router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
