import bcrypt from 'bcryptjs';

import { AppDataSource } from '../../config/data-source';
import { Role } from '../../entities/Role';
import { User } from '../../entities/User';
import { AppError } from '../../middlewares/errorHandler';
import { CreateUserDTO } from '../../dto/CreateUserDTO';
import { UpdateUserDTO } from '../../dto/UpdateUserDTO';
import { userRepository } from '../../repositories/UserRepository';
import { roleRepository } from '../../repositories/RoleRepository';

export class UserService {
  async getById(id: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
      throw new AppError(400, 'ID de usuário inválido');
    }

    const user = await userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new AppError(404, 'Usuário não encontrado');
    }

    return {
      id: user.id,
      matricula: user.matricula,
      nome: user.nome,
      image: user.image ? `/api/user/${user.id}/image` : null,
      role: user.role.nome,
      birthDate: user?.birthDate,
    };
  }

  async list(usuarioLogado: User) {
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

  async create(dados: CreateUserDTO, usuarioLogado: User) {
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

  // Atualiza dados de um usuário existente. Só ADMIN pode chamar esse método
  // (a checagem de role é feita na rota, via authorizeRoles('ADMIN')).
  async update(id: string, dados: UpdateUserDTO, usuarioLogado: User) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
      throw new AppError(404, 'Usuário não encontrado');
    }

    const usuario = await userRepository.findOne({
      where: { id },
      relations: { role: true },
    });

    if (!usuario) {
      throw new AppError(404, 'Usuário não encontrado');
    }

    if (dados.nome) {
      usuario.nome = dados.nome;
    }

    if (dados.birthDate) {
      usuario.birthDate = dados.birthDate;
    }

    if (dados.matricula && dados.matricula !== usuario.matricula) {
      const usuarioComMatricula = await userRepository.findOne({
        where: { matricula: dados.matricula },
      });

      if (usuarioComMatricula && usuarioComMatricula.id !== id) {
        throw new AppError(400, 'Já existe um usuário cadastrado com essa matrícula');
      }

      usuario.matricula = dados.matricula;
    }

    if (dados.senha) {
      usuario.senha = await bcrypt.hash(dados.senha, 10);
    }

    if (dados.removeImage === true || dados.removeImage === 'true') {
      usuario.image = null;
    } else if (dados.image) {
      usuario.image = dados.image;
    }

    if (dados.role) {
      const roleBuscada = await roleRepository.findOne({
        where: { nome: dados.role.toUpperCase() },
      });

      if (!roleBuscada) {
        throw new AppError(400, 'Role não encontrada');
      }

      // Professor não pode promover outro usuário
      if (usuarioLogado.role.nome === 'PROFESSOR' && roleBuscada.nome !== 'ALUNO') {
        throw new AppError(
          403,
          'Professor não pode alterar dados de outros professores ou administradores!'
        );
      }

      usuario.role = roleBuscada;
    }

    await userRepository.save(usuario);

    const { senha: _, ...usuarioSemSenha } = usuario;
    return {
      ...usuarioSemSenha,
      image: usuario.image ? `/api/user/${usuario.id}/image` : null,
    };
  }

  async delete(id: string) {
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

    await userRepository.remove(user);

    return {
      message: 'Usuário deletado com sucesso',
    };
  }

  async getImage(id: string) {
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

export const userService = new UserService();
