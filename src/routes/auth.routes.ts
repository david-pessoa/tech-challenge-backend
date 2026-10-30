import { Router } from 'express';

import { authController } from '../controllers/AuthController';

export const authRouter = Router();

// Rota pública — qualquer um pode fazer login
authRouter.post('/login', authController.login.bind(authController));
authRouter.post('/login/mobile', authController.mobileLogin.bind(authController));
authRouter.post('/logout', authController.logout.bind(authController));
