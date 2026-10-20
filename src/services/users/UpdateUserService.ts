import { UpdateUserDTO } from '../../dto/UpdateUserDTO';
import { User } from '../../entities/User';
import { AppError } from '../../middlewares/errorHandler';
import { roleRepository } from '../../repositories/RoleRepository';
import { userRepository } from '../../repositories/UserRepository';
import bcrypt from 'bcryptjs';

export class UpdateUserService {
  // Atualiza dados de um usuário existente. Só ADMIN pode chamar esse método
  // (a checagem de role é feita na rota, via authorizeRoles('ADMIN')).
  async execute(id: string, dados: UpdateUserDTO, usuarioLogado: User) {
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
}

export const updateUserService = new UpdateUserService()
