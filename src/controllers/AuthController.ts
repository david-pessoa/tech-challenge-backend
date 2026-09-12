import { NextFunction, Request, Response } from 'express';

import { authService } from '../services/auth/AuthService';
import { env } from '../config/env';

const cookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'lax' as const,
  maxAge: env.auth.cookieMaxAgeMs,
  path: '/',
};

export class AuthController {
  async login(request: Request, response: Response, next: NextFunction) {
    try {
      // Pega matrícula e senha do corpo da requisição e passa pro service
      const resultado = await authService.login(request.body);

      response.cookie(env.auth.cookieName, resultado.token, cookieOptions);

      // O token fica somente no cookie HttpOnly; o frontend recebe apenas os dados públicos.
      const { token: _token, ...resposta } = resultado;
      response.json(resposta);
    } catch (error) {
      next(error);
    }
  }

  async logout(request: Request, response: Response, next: NextFunction) {
    try {
      response.clearCookie(env.auth.cookieName, {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: 'lax',
        path: '/',
      });
      response.json({ message: 'Logout realizado com sucesso!' });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
