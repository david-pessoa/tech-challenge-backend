import { CreateUserDTO } from '../../dto/CreateUserDTO';
import { Role } from '../../entities/Role';
import { User } from '../../entities/User';
import { AppError } from '../../middlewares/errorHandler';
import { roleRepository } from '../../repositories/RoleRepository';
import { userRepository } from '../../repositories/UserRepository';
import bcrypt from 'bcryptjs';

export class CreateUserService {
  async execute(dados: CreateUserDTO, usuarioLogado: User) {
    const usuarioExistente = await userRepository.findOne({
      where: { matricula: dados.matricula },
    });

    if (usuarioExistente) {
      throw new AppError(400, 'Matrícula já cadastrada');
    }

    let roleBuscada: Role | null = null;

    // Extraí role passada no corpo da requisição
    if (dados.role) {
      roleBuscada = await roleRepository.findOne({
        where: { nome: dados.role.toUpperCase() },
      });

      if (!roleBuscada) {
        throw new AppError(404, 'Role não encontrada');
      }

      // Na ausência de role no corpo da requsição, atribui role de aluno
    } else {
      roleBuscada = await roleRepository.findOne({
        where: { nome: 'ALUNO' },
      });

      if (!roleBuscada) {
        throw new AppError(500, 'Role padrão ALUNO não encontrada');
      }
    }

    const cargoDoDonoDoToken = usuarioLogado.role.nome;
    const cargoDoNovoUsuario = roleBuscada.nome;

    if (cargoDoDonoDoToken === 'PROFESSOR' && cargoDoNovoUsuario !== 'ALUNO') {
      throw new AppError(403, 'Professores só possuem permissão para cadastrar alunos.');
    }

    const senhaCriptografada = await bcrypt.hash(dados.senha, 10);

    const usuario = userRepository.create({
      matricula: dados.matricula,
      nome: dados.nome,
      birthDate: dados.birthDate ?? null,
      senha: senhaCriptografada,
      image: dados.image ?? null,
      role: roleBuscada,
    });

    await userRepository.save(usuario);

    const { senha: _, ...usuarioSemSenha } = usuario;
    return {
      ...usuarioSemSenha,
      image: usuario.image ? `/api/user/${usuario.id}/image` : null,
    };
  }
}
export const createUserService = new CreateUserService()
