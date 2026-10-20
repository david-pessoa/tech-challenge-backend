import { User } from '../../entities/User';
import { userRepository } from '../../repositories/UserRepository';

export class ListUsersService {
  async execute(usuarioLogado: User) {
    const where =
      usuarioLogado.role.nome === 'PROFESSOR'
        ? {
            role: {
              nome: 'ALUNO',
            },
          }
        : {};

    const users = await userRepository.find({
      where,
      relations: ['role'],
      order: {
        nome: 'ASC',
      },
    });

    return users.map(user => ({
      id: user.id,
      matricula: user.matricula,
      nome: user.nome,
      birthDate: user.birthDate,
      image: user.image ? `/api/user/${user.id}/image` : null,
      role: user.role.nome,
    }));
  }
}

export const listUsersService = new ListUsersService()
