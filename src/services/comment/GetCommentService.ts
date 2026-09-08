import { AppError } from "../../middlewares/errorHandler";
import { commentRepository } from "../../repositories/CommentRepository";

export class GetCommentService {
  async execute(id: string) {
    const comment = await commentRepository.findOne({
      where: { id },
      relations: {
        user: true,
        post: true,
        parentComment: true,
      },
    });

    if (!comment) {
      throw new AppError(404, 'Comentário não encontrado');
    }

    return {
      commentId: comment.id,
      parentCommentId: comment.parentComment?.id,
      postId: comment.post.id,
      userId: comment.user.id,
      conteudo: comment.conteudo,
      dataCriacao: comment.dataCriacao,
      dataModificacao: comment.dataModificacao,
      image: comment.user.image ? `/api/user/${comment.user.id}/image` : null,
    };
  }
}

export const getCommentService = new GetCommentService();