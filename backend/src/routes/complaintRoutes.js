import { Router } from 'express';
import * as complaintController from '../controllers/complaintController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import {
  createSchema,
  listQuerySchema,
  idParamSchema,
  updateSchema,
} from '../validators/complaintValidator.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createSchema), complaintController.create);
router.get('/', validate(listQuerySchema), complaintController.list);
router.get('/:id', validate(idParamSchema), complaintController.getDetail);
router.patch(
  '/:id',
  validate(idParamSchema),
  validate(updateSchema),
  complaintController.update
);

export default router;
