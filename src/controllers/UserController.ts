import { NextFunction, Request, Response } from 'express';
import { getUserImageService } from '../services/users/GetUserImageService';
import { getImageMimeType } from '../services/imageMimeType';
import { getUserService } from '../services/users/GetUserService';
import { listUsersService } from '../services/users/ListUsersService';
import { createUserService } from '../services/users/CreateUserService';
import { updateUserService } from '../services/users/UpdateUserService';
import { deleteUserService } from '../services/users/DeleteUserService';

export class UserController {
  async getById(request: Request, response: Response, next: NextFunction) {
    try {
      const id = String(request.params.id);
      const usuario = await getUserService.execute(id);

      return response.status(200).json(usuario);
    } catch (error) {
      return next(error);
    }
  }

  async list(request: Request, response: Response, next: NextFunction) {
    try {
      const filterRole = String(request.query.role ?? '');
      const currentPage = Number(String(request.query.p ?? '1'));
      const pageLength = Number(String(request.query.l ?? '0'));
      const usuarios = await listUsersService.execute(request.user, filterRole, currentPage, pageLength);

      return response.status(200).json(usuarios);
    } catch (error) {
      return next(error);
    }
  }

  async create(request: Request, response: Response, next: NextFunction) {
    try {
      const usuarioLogado = request.user;
      const usuario = await createUserService.execute(
        {
          ...request.body,
          image: request.file?.buffer ?? null,
        },
        usuarioLogado
      );

      response.status(201).json(usuario);
    } catch (error) {
      next(error);
    }
  }

  async update(request: Request, response: Response, next: NextFunction) {
    try {
      const id = String(request.params.id);
      const usuarioLogado = request.user;
      const usuario = await updateUserService.execute(
        id,
        {
          ...request.body,
          image: request.file?.buffer,
        },
        usuarioLogado
      );

      response.status(200).json(usuario);
    } catch (error) {
      next(error);
    }
  }

  async delete(request: Request, response: Response, next: NextFunction) {
    try {
      const id = String(request.params.id);
      const result = await deleteUserService.execute(id);

      return response.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async getMe(request: Request, response: Response, next: NextFunction) {
    try {
      const usuarioLogado = request.user;
      delete usuarioLogado.senha;
      usuarioLogado.role = usuarioLogado.role.nome;
      if (usuarioLogado.image) usuarioLogado.image = `/api/user/${usuarioLogado.id}/image`;
      if (usuarioLogado.image) usuarioLogado.birthDate = usuarioLogado.birthDate;

      response.status(200).json(usuarioLogado);
    } catch (error) {
      return next(error);
    }
  }

  async getUserImage(request: Request, response: Response, next: NextFunction) {
    try {
      const id = String(request.params.id);
      const userImage = await getUserImageService.execute(id);

      if (!userImage) {
        return response.status(404).json({
          message: 'Imagem não encontrada',
        });
      }

      const mimeType = getImageMimeType(userImage);

      if (!mimeType) {
        return response.status(415).json({
          message: 'Tipo de imagem não identificado',
        });
      }

      response.type(mimeType);
      return response.send(userImage);
    } catch (error) {
      return next(error);
    }
  }
}

export const userController = new UserController();
