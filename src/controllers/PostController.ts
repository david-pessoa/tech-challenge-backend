import { NextFunction, Request, Response } from 'express';
import { createPostService } from '../services/post/CreatePostService';
import { getPostService } from '../services/post/GetPostService';
import { listPostsService } from '../services/post/ListPostsService';
import { updatePostService } from '../services/post/UpdatePostService';
import { deletePostService } from '../services/post/DeletePostService';
import { searchPostsService } from '../services/post/SearchPostsService';
import { markPostAsViewedService } from '../services/post/MarkPostAsViewedService';
import { getPostImageService } from '../services/post/GetPostImageService';
import { getImageMimeType } from '../services/imageMimeType';

export class PostController {
  async create(request: Request, response: Response, next: NextFunction) {
    try {
      await createPostService.execute({
        ...request.body,
        image: request.file?.buffer ?? null,
        userId: request.user!.id,
      });

      return response.status(201).json({
        message: 'Post criado com sucesso!',
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(request: Request, response: Response, next: NextFunction) {
    try {
      const id = String(request.params.id);
      const post = await getPostService.execute(id);

      if (request.user!.role.nome === 'ALUNO' || request.user!.role.nome === 'ADMIN') {
        await markPostAsViewedService.execute(id, request.user!.id);
      }

      return response.status(200).json(post);
    } catch (error) {
      next(error);
    }
  }

  async list(request: Request, response: Response) {
    const posts = await listPostsService.execute(request.user!.id, request.user!.role.nome);

    return response.status(200).json(posts);
  }

  async update(request: Request, response: Response, next: NextFunction) {
    try {
      const id = String(request.params.id);

      await updatePostService.execute(id, request.user!.id, request.user!.role.nome, {
        ...request.body,
        image: request.file?.buffer,
      });

      return response.status(200).json({
        message: 'Post atualizado com sucesso!',
      });
    } catch (error) {
      return next(error);
    }
  }

  async delete(request: Request, response: Response, next: NextFunction) {
    try {
      const id = String(request.params.id);

      const result = await deletePostService.execute(id, request.user!.id, request.user!.role.nome);

      return response.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async search(request: Request, response: Response, next: NextFunction) {
    try {
      const termo = String(request.query.termo ?? '');
      const posts = await searchPostsService.execute(termo);

      return response.status(200).json(posts);
    } catch (error) {
      return next(error);
    }
  }

  async getPostImage(request: Request, response: Response, next: NextFunction) {
    try {
      const id = String(request.params.id);
      const post = await getPostImageService.execute(id);

      if (!post.image) {
        return response.status(404).json({
          message: 'Imagem não encontrada',
        });
      }

      const mimeType = getImageMimeType(post.image);

      if (!mimeType) {
        return response.status(415).json({
          message: 'Tipo de imagem não identificado',
        });
      }

      response.type(mimeType);
      return response.send(post.image);
    } catch (error) {
      next(error);
    }
  }
}

export const postController = new PostController();
