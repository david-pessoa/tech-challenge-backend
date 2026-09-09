import { userService } from '../services/users/UserService';
import { userRepository } from '../repositories/UserRepository';
import { roleRepository } from '../repositories/RoleRepository';
import { User } from '../entities/User';
import { Role } from '../entities/Role';

jest.mock('../repositories/UserRepository', () => ({
  userRepository: {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  },
}));

jest.mock('../repositories/RoleRepository', () => ({
  roleRepository: {
    findOne: jest.fn(),
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('senha_criptografada_fake'),
}));

describe('UserService - Criação de Usuários', () => {
  const roleAdmin = { id: 'bd1de63c-5df5-4dfd-9736-ace2d7f092b1', nome: 'ADMIN' } as Role;
  const roleProfessor = { id: '5a0e25a2-afa5-44e1-b519-4d1e2139725a', nome: 'PROFESSOR' } as Role;
  const roleAluno = { id: 'ffc3d557-17c0-474e-a2f5-5fa816f2d854', nome: 'ALUNO' } as Role;

  const adminLogado = { id: '16dd67fd-afec-4080-a36f-0c8605d9c662', role: roleAdmin } as User;
  const professorLogado = { id: 'cea50a97-f63e-4cd6-8a2c-e2a02f93c6e4', role: roleProfessor } as User;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Deve permitir que um ADMIN crie um PROFESSOR', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue(null);
    (roleRepository.findOne as jest.Mock).mockResolvedValue(roleProfessor);

    const mockUsuarioSalvo = {
      matricula: '345678',
      nome: 'Novo Prof',
      senha: 'senha_criptografada_fake',
      role: roleProfessor,
    };

    (userRepository.create as jest.Mock).mockReturnValue(mockUsuarioSalvo);
    (userRepository.save as jest.Mock).mockResolvedValue(mockUsuarioSalvo);

    const resultado = await userService.create(
      { matricula: '345678', nome: 'Novo Prof', senha: 'Prof345', role: 'PROFESSOR' },
      adminLogado
    );

    expect(resultado).toHaveProperty('matricula', '345678');
    expect(resultado).not.toHaveProperty('senha');
    expect(userRepository.save).toHaveBeenCalled();
  });

  it('Deve permitir que um PROFESSOR crie um ALUNO', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue(null);
    (roleRepository.findOne as jest.Mock).mockResolvedValue(roleAluno); 

    const mockUsuarioSalvo = {
      matricula: '874569',
      nome: 'Novo Aluno',
      senha: 'senha_criptografada_fake',
      role: roleAluno,
    };

    (userRepository.create as jest.Mock).mockReturnValue(mockUsuarioSalvo);
    (userRepository.save as jest.Mock).mockResolvedValue(mockUsuarioSalvo);

    const resultado = await userService.create(
      { matricula: '874569', nome: 'Novo Aluno', senha: 'Aluni936', role: 'ALUNO' },
      professorLogado
    );

    expect(resultado.matricula).toBe('874569');
    expect(userRepository.save).toHaveBeenCalled();
  });


  it('Não deve permitir que um PROFESSOR crie um ADMIN', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue(null);
    (roleRepository.findOne as jest.Mock).mockResolvedValue(roleAdmin);

    await expect(
      userService.create(
        { matricula: '754914', nome: 'Admin Invasor', senha: 'Admin853', role: 'ADMIN' },
        professorLogado 
      )
    ).rejects.toMatchObject({
      statusCode: 403,
      message: 'Professores só possuem permissão para cadastrar alunos.',
    });

    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('Não deve permitir que um PROFESSOR crie outro PROFESSOR', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue(null);
    (roleRepository.findOne as jest.Mock).mockResolvedValue(roleProfessor); 

    await expect(
      userService.create(
        { matricula: '564959', nome: 'Prof Falso', senha: 'Prof457', role: 'PROFESSOR' },
        professorLogado 
      )
    ).rejects.toMatchObject({
      statusCode: 403,
      message: 'Professores só possuem permissão para cadastrar alunos.',
    });

    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('Não deve permitir o cadastro de uma matrícula já existente', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue(new User());

    await expect(
      userService.create(
        { matricula: '000', nome: 'Clone', senha: 'Clone754', role: 'PROFESSOR' },
        adminLogado
      )
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Matrícula já cadastrada',
    });
  });

  it('Deve permitir que um ADMIN liste todos os usuários sem retornar senha', async () => {
    const image = Buffer.from('foto-fake');
    const usuario = {
      id: 'ffc3d557-17c0-474e-a2f5-5fa816f2d854',
      matricula: '874569',
      nome: 'Novo Aluno',
      birthDate: new Date('2010-08-15'),
      senha: 'senha_criptografada_fake',
      image,
      role: roleAluno,
    } as User;

    (userRepository.find as jest.Mock).mockResolvedValue([usuario]);

    const resultado = await userService.list(adminLogado);

    expect(resultado).toEqual([
      {
        id: usuario.id,
        matricula: usuario.matricula,
        nome: usuario.nome,
        birthDate: usuario.birthDate,
        image: `/api/user/${usuario.id}/image`,
        role: roleAluno.nome,
      },
    ]);
    expect(resultado[0]).not.toHaveProperty('senha');
    expect(userRepository.find).toHaveBeenCalledWith({
      where: {},
      relations: ['role'],
      order: {
        nome: 'ASC',
      },
    });
  });

  it('Deve permitir que um PROFESSOR liste apenas alunos', async () => {
    (userRepository.find as jest.Mock).mockResolvedValue([]);

    const resultado = await userService.list(professorLogado);

    expect(resultado).toEqual([]);
    expect(userRepository.find).toHaveBeenCalledWith({
      where: {
        role: {
          nome: 'ALUNO',
        },
      },
      relations: ['role'],
      order: {
        nome: 'ASC',
      },
    });
  });
});

describe('UserService - Atualização de Usuários', () => {
  const roleProfessor = { id: '5a0e25a2-afa5-44e1-b519-4d1e2139725a', nome: 'PROFESSOR' } as Role;
  const roleAluno = { id: 'ffc3d557-17c0-474e-a2f5-5fa816f2d854', nome: 'ALUNO' } as Role;
  const roleAdmin = { id: 'bd1de63c-5df5-4dfd-9736-ace2d7f092b1', nome: 'ADMIN' } as Role;

  const adminLogado = { id: '16dd67fd-afec-4080-a36f-0c8605d9c662', role: roleAdmin } as User;
  const professorLogado = { id: 'cea50a97-f63e-4cd6-8a2c-e2a02f93c6e4', role: roleProfessor } as User;

  const idValido = '16dd67fd-afec-4080-a36f-0c8605d9c662';
  const idInvalido = 'id-invalido';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Deve atualizar o nome de um usuário existente', async () => {
    const usuarioExistente = { id: idValido, nome: 'Nome Antigo', senha: 'senha_antiga', role: roleAluno } as User;

    (userRepository.findOne as jest.Mock).mockResolvedValue(usuarioExistente);
    (userRepository.save as jest.Mock).mockResolvedValue(usuarioExistente);

    const resultado = await userService.update(idValido, { nome: 'Nome Novo' }, adminLogado);

    expect(resultado).toHaveProperty('nome', 'Nome Novo');
    expect(resultado).not.toHaveProperty('senha');
    expect(userRepository.save).toHaveBeenCalled();
  });

  it('Deve criptografar a nova senha ao atualizar', async () => {
    const usuarioExistente = { id: idValido, nome: 'Fulano', senha: 'senha_antiga', role: roleAluno } as User;

    (userRepository.findOne as jest.Mock).mockResolvedValue(usuarioExistente);
    (userRepository.save as jest.Mock).mockResolvedValue(usuarioExistente);

    await userService.update(idValido, { senha: 'NovaSenha123' }, adminLogado);

    expect(usuarioExistente.senha).toBe('senha_criptografada_fake');
    expect(userRepository.save).toHaveBeenCalled();
  });

  it('Deve atualizar a role de um usuário para uma role válida', async () => {
    const usuarioExistente = { id: idValido, nome: 'Fulano', senha: 'senha_antiga', role: roleAluno } as User;

    (userRepository.findOne as jest.Mock).mockResolvedValue(usuarioExistente);
    (roleRepository.findOne as jest.Mock).mockResolvedValue(roleProfessor);
    (userRepository.save as jest.Mock).mockResolvedValue(usuarioExistente);

    const resultado = await userService.update(idValido, { role: 'PROFESSOR' }, adminLogado);

    expect(resultado.role).toEqual(roleProfessor);
    expect(userRepository.save).toHaveBeenCalled();
  });

  it('Não deve atualizar para uma role inexistente', async () => {
    const usuarioExistente = { id: idValido, nome: 'Fulano', senha: 'senha_antiga', role: roleAluno } as User;

    (userRepository.findOne as jest.Mock).mockResolvedValue(usuarioExistente);
    (roleRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      userService.update(idValido, { role: 'INEXISTENTE' }, adminLogado)
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Role não encontrada',
    });

    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('Não deve atualizar um usuário com id em formato inválido', async () => {
    await expect(
      userService.update(idInvalido, { nome: 'Qualquer Nome' }, adminLogado)
    ).rejects.toMatchObject({
      statusCode: 404,
      message: 'Usuário não encontrado',
    });

    expect(userRepository.findOne).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('Não deve atualizar um usuário que não existe', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      userService.update(idValido, { nome: 'Qualquer Nome' }, adminLogado)
    ).rejects.toMatchObject({
      statusCode: 404,
      message: 'Usuário não encontrado',
    });

    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('Deve permitir que um ADMIN liste todos os usuários sem retornar senha', async () => {
    const image = Buffer.from('foto-fake');
    const usuario = {
      id: 'ffc3d557-17c0-474e-a2f5-5fa816f2d854',
      matricula: '874569',
      nome: 'Novo Aluno',
      birthDate: new Date('2010-08-15'),
      senha: 'senha_criptografada_fake',
      image,
      role: roleAluno,
    } as User;

    (userRepository.find as jest.Mock).mockResolvedValue([usuario]);

    const resultado = await userService.list(adminLogado);

    expect(resultado).toEqual([
      {
        id: usuario.id,
        matricula: usuario.matricula,
        nome: usuario.nome,
        birthDate: usuario.birthDate,
        image: `/api/user/${usuario.id}/image`,
        role: roleAluno.nome,
      },
    ]);
    expect(resultado[0]).not.toHaveProperty('senha');
    expect(userRepository.find).toHaveBeenCalledWith({
      where: {},
      relations: ['role'],
      order: {
        nome: 'ASC',
      },
    });
  });

  it('Deve permitir que um PROFESSOR liste apenas alunos', async () => {
    (userRepository.find as jest.Mock).mockResolvedValue([]);

    const resultado = await userService.list(professorLogado);

    expect(resultado).toEqual([]);
    expect(userRepository.find).toHaveBeenCalledWith({
      where: {
        role: {
          nome: 'ALUNO',
        },
      },
      relations: ['role'],
      order: {
        nome: 'ASC',
      },
    });
  });
});

describe('UserService - Busca de usuário por ID', () => {
  const roleProfessor = { id: '5a0e25a2-afa5-44e1-b519-4d1e2139725a', nome: 'PROFESSOR' } as Role;
  const roleAluno = { id: 'ffc3d557-17c0-474e-a2f5-5fa816f2d854', nome: 'ALUNO' } as Role;
  const roleAdmin = { id: 'bd1de63c-5df5-4dfd-9736-ace2d7f092b1', nome: 'ADMIN' } as Role;

  const adminLogado = { id: '16dd67fd-afec-4080-a36f-0c8605d9c662', role: roleAdmin } as User;
  const professorLogado = { id: 'cea50a97-f63e-4cd6-8a2c-e2a02f93c6e4', role: roleProfessor } as User;

  const idValido = '16dd67fd-afec-4080-a36f-0c8605d9c662';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Deve permitir que um ADMIN busque um usuário pelo ID sem retornar senha', async () => {
    const image = Buffer.from('foto-fake');
    const usuario = {
      id: idValido,
      matricula: '874569',
      nome: 'Novo Aluno',
      senha: 'senha_criptografada_fake',
      image,
      role: roleAluno,
    } as User;

    (userRepository.findOne as jest.Mock).mockResolvedValue(usuario);

    const resultado = await userService.getById(idValido);

    expect(resultado).toEqual({
      id: usuario.id,
      matricula: usuario.matricula,
      nome: usuario.nome,
      image: `/api/user/${usuario.id}/image`,
      role: roleAluno.nome,
    });
    expect(resultado).not.toHaveProperty('senha');
  });

  it('Deve permitir que um PROFESSOR busque um ALUNO pelo ID', async () => {
    const usuario = {
      id: idValido,
      matricula: '874569',
      nome: 'Novo Aluno',
      senha: 'senha_criptografada_fake',
      image: null,
      role: roleAluno,
    } as User;

    (userRepository.findOne as jest.Mock).mockResolvedValue(usuario);

    const resultado = await userService.getById(idValido);

    expect(resultado.role).toBe('ALUNO');
  });

  it('Não deve buscar usuário com ID inválido', async () => {
    await expect(userService.getById('id-invalido')).rejects.toMatchObject({
      statusCode: 400,
      message: 'ID de usuário inválido',
    });

    expect(userRepository.findOne).not.toHaveBeenCalled();
  });

  it('Não deve buscar usuário inexistente', async () => {
    (userRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(userService.getById(idValido)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Usuário não encontrado',
    });
  });
});
