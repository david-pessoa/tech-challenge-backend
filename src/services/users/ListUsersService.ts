import { User } from '../../entities/User';
import { userRepository } from '../../repositories/UserRepository';

export class ListUsersService {
  async execute(
    usuarioLogado: User,
    filterRole: string = '',
    currentPage: number = 1,
    pageLength: number = 10
  ) {
    
    // Realiza tratamento dos dados
    if(currentPage < 1)
      currentPage = 1
    if(pageLength < 1)
      pageLength = 10

    const filterRoleUpper = filterRole.toUpperCase();

    let where; //Se o usuário for professor, retorna somente usuários alunos
    if (usuarioLogado.role.nome === 'PROFESSOR')
      where = {
        role: {
          nome: 'ALUNO',
        },
      };
    else if (
      filterRoleUpper === 'ADMIN' ||
      filterRoleUpper === 'PROFESSOR' ||
      filterRoleUpper === 'ALUNO'
    ) {
      // Se o usuário for admin e houver uma role passada por parâmetro, filtra os usuários por essa role
      where = {
        role: {
          nome: filterRoleUpper,
        },
      };
    } else {
      // Senão, retorna todos os usuários
      where = {};
    }

    // Paginação
    let skip = (currentPage - 1) * pageLength; //OFFSET: determina a página atual através dos registros que devem ser pulados

    const [users, registerNum] = await userRepository.findAndCount({
      where,
      relations: ['role'],
      order: {
        nome: 'ASC',
      },
      take: pageLength,
      skip,
    });

    // Calcula o total de páginas existentes
    const totalPages = Math.ceil(registerNum / pageLength);

    return {
      users: users.map(user => ({
        id: user.id,
        matricula: user.matricula,
        nome: user.nome,
        birthDate: user.birthDate,
        image: user.image ? `/api/user/${user.id}/image` : null,
        role: user.role.nome,
      })),
      pagination: {
        currentPage,
        totalPages,
        pageLength,
      },
    };
  }
}

export const listUsersService = new ListUsersService();
