import { AppError } from '../../middlewares/errorHandler';
import { commentRepository } from '../../repositories/CommentRepository';
import { postRepository } from '../../repositories/PostRepository';
import { IsNull } from 'typeorm';

export class ListPostCommentsService {
  async execute(id: string) {
    const post = await postRepository.findOne({
      where: { id },
      relations: {
        comments: true,
      },
    });

    if (!post) {
      throw new AppError(404, 'Post não encontrado');
    }

    const result = await Promise.all(
      post.comments.map(async comment => {
        const commentData = await commentRepository.findOne({
          where: { id: comment.id, parentComment: IsNull() },
          relations: {
            user: true, 
            childComment: {
              user: true,
            },
            parentComment: true,
          },
        });

        if(commentData == null) return null;

        return {
          id: commentData.id,
          childComment: commentData.childComment ? {
            id: commentData.childComment.id,
            conteudo: commentData.childComment.conteudo,
            dataCriacao: commentData.childComment.dataCriacao,
            dataModificacao: commentData.childComment.dataModificacao,
            image: commentData.childComment.user?.image ? `/api/user/${commentData.childComment.user.id}/image` : null,
          } : null,
          user: commentData.user.nome,
          conteudo: commentData.conteudo,
          dataCriacao: commentData.dataCriacao,
          dataModificacao: commentData.dataModificacao,
          image: commentData.user?.image ? `/api/user/${commentData.user.id}/image` : null,
        };
      })
    );

    const filteredResult = result.filter(data => data != null);
    return filteredResult;
  }
}

export const listPostCommentsService = new ListPostCommentsService();