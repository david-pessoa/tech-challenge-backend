import { ILike } from 'typeorm';

import { AppError } from '../../middlewares/errorHandler';
import { postRepository } from '../../repositories/PostRepository';

export class SearchPostsService {
  async execute(termo: string) {
    const termoBusca = termo.trim();

    if (!termoBusca) {
      throw new AppError(400, 'Termo de busca inválido.');
    }

    const MAX_NUM_POSTS = 10

    const posts = await postRepository.find({
      where: [
        { titulo: ILike(`%${termoBusca}%`) },
        { descricao: ILike(`%${termoBusca}%`) },
        { conteudo: ILike(`%${termoBusca}%`) },
      ],
      relations: { user: true, subject: true },
      order: { dataCriacao: 'ASC' },
      take: MAX_NUM_POSTS
    });

    return posts.map(post => ({
      postId: post.id,
      criadoPor: { userId: post.user ? post.user.id : null },
      titulo: post.titulo,
      descricao: post.descricao,
      conteudo: post.conteudo,
      image: post.image ? `/api/posts/${post.id}/image` : null,
      subject: {
        id: post.subject.id,
        nome: post.subject.nome,
      },
      dataCriacao: post.dataCriacao,
      dataModificacao: post.dataModificacao,
    }));
  }
}

export const searchPostsService = new SearchPostsService();
