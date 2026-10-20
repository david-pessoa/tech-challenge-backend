import { AppError } from '../../middlewares/errorHandler';
import { userRepository } from '../../repositories/UserRepository';

export class GetUserImageService {
  async execute(id: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
      throw new AppError(400, 'ID de usuário inválido');
    }

    const user = await userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new AppError(404, 'Usuário não encontrado');
    }

    return user.image ? user.image : null;
  }
}

export const getUserImageService = new GetUserImageService();
