import { Router } from 'express';
import { userController } from '../controllers/UserController';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

export const userRouter = Router();

userRouter.get(
  '/',
  authMiddleware,
  authorizeRoles('ADMIN', 'PROFESSOR'),
  userController.list.bind(userController)
);
userRouter.get('/:id/image', userController.getUserImage);

userRouter.use(authMiddleware);

userRouter.get('/me', userController.getMe.bind(userController));

userRouter.get(
  '/:id',
  userController.getById.bind(userController)
);

userRouter.post(
  '/',
  authorizeRoles('ADMIN', 'PROFESSOR'),
  upload.single('image'),
  userController.create.bind(userController)
);

userRouter.patch(
  '/:id',
  authorizeRoles('ADMIN', 'PROFESSOR'),
  upload.single('image'),
  userController.update.bind(userController)
);

userRouter.delete('/:id', authorizeRoles('ADMIN'), userController.delete.bind(userController));
