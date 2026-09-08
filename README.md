# API de Gerenciamento de Posts
API backend para cadastro de usuários, autenticação via JWT e gerenciamento de posts com controle de perfis.
O sistema permite criar, listar, buscar, atualizar, excluir e marcar posts como visualizados.

## Problema
Em escolas da rede pública, os professores não têm uma plataforma em que possam postar suas aulas e transmitir conhecimento para alunos de forma prática, centralizada e tecnológica. Além disso, é preciso controlar quem pode criar, atualizar e deletar materiais e registrar quem já visualizou cada postagem.
Sem uma API centralizada, esse fluxo fica disperso e difícil de auditar.

## Solução
Foi construída uma API REST em Node.js para gerenciar usuários, roles, autenticação, posts e visualizações.
A solução organiza o fluxo com Express, TypeORM, PostgreSQL e JWT, além de documentação Swagger disponível em `/docs`.

### Link para API em produção no Render:
[https://tech-challenge-fase-2-1uhu.onrender.com/docs/#/Usu%C3%A1rios/post_user](https://tech-challenge-fase-2-1uhu.onrender.com/docs/#/Usu%C3%A1rios/post_user)

### Níveis de acesso dentro do sistema
Há 3 diferentes níveis de acesso (roles) para a API. Eles são: `ALUNO`, `PROFESSOR` e `ADMIN`.

#### `ALUNO`
É o nível mais baixo, deve ser usado para os alunos da escola. Nesse nível, o usuário pode:
- Acessar a lista completa de posts
- Acessar uma lista de posts que contém determinado termo
- Encontrar um post pelo seu ID

#### `PROFESSOR`
Essa role representa os professores da escola. Nesse nível o usuário:
- Tem todas as permissões do `ALUNO`
- Pode criar novos posts
- Pode atualizar apenas os posts que criou
- Pode deletar apenas os posts que criou
- Pode cadastrar um novo usuário `ALUNO`

#### `ADMIN`
Esse é o nível mais alto de acesso. Representa os administradores do sistema, que realizam o desenvolvimento e manutenção do mesmo. O adminstrador:
- Tem todas as permissões do `PROFESSOR`
- Pode atualizar e deletar qualquer post
- Pode cadastrar um novo usuário `ALUNO`, `PROFESSOR` ou `ADMIN`

## Integrantes
- Beatriz Santos Mendonça Costa - RM372102
- David Varão Lima Bentes Pessoa - RM373633
- Michele Cristina Fernandes - RM372306
- Vitor Hugo dos Santos Alves - RM372987

## Responsabilidades
Neste repositório, as responsabilidades foram dividas em:

### Base e infraestrutura - David
- Iniciar o projeto.
- Configuração do TypeScript.
- Configuração do Express.
- Configuração das variáveis de ambiente.
- Criação das entidades `Post`, `User`, `PostView` e `Role`.
- Criação das Migrations.
- Configuração do Docker.
- Adicionar GitHub Actions (CI/CD).
- Documentação do projeto

### Posts - Michele
- Criar repository de posts.
- Implementar CRUD completo de posts.
- Implementar busca de posts.
- Criar testes relacionados a posts.
- Criar registro de visualizações.

### Usuários & Roles - Victor
- Criar cadastro de usuário.
- Criar login com JWT.
- Criar middleware de autenticação.
- Criar controle de permissões.

### Testes - Beatriz
- Implementar testes unitários
- Revisão da documentação
- Vídeo apresentação
- Ajudar na integração final.

## Funcionalidades
- Cadastro de usuários com senha criptografada
- Login com geração de token JWT
- CRUD de posts com controle de acesso por role
- Busca de posts por termo
- Marcação de post como visualizado por aluno
- Swagger UI para exploração da API

## Tecnologias
- Node.js
- TypeScript
- Express
- PostgreSQL
- TypeORM
- JWT
- bcryptjs
- Swagger UI
- Docker e Docker Compose
- Jest e Supertest

## Arquitetura
Fluxo principal da aplicação:

```text
Cliente
    ⬇︎
Rotas Express
    ⬇︎
Middleware de autenticação e autorização
    ⬇︎
Controllers
    ⬇︎
Services
    ⬇︎
Repositories / TypeORM
    ⬇︎
PostgreSQL
```

O `authMiddleware` valida o token JWT e injeta o usuário autenticado na requisição.
As rotas de posts usam `authorizeRoles` para restringir operações de escrita a `PROFESSOR` e `ADMIN`.
Quando um `ALUNO` acessa um post pelo endpoint de detalhe, a visualização é registrada automaticamente.

## Como rodar
### Instalação
```bash
npm install
```

Antes de executar, crie o arquivo `.env` com base em `.env.example` e preencha os valores necessários.

### Como rodar localmente
```bash
npm run dev
```

O projeto executa as migrations na inicialização da aplicação.
Se preferir subir a versão compilada:
```bash
npm run build
npm run start
```

Se quiser rodar as migrations manualmente após compilar:
```bash
npm run build
npm run migration:run
```

#### Criando usuário `ADMIN`
É necessário criar um usuário `ADMIN` para que ele possa cadastrar os outros usuários da aplicação.
Esse usuário deverá ser adicionado diretamente ao banco de dados por meio do script em shell `createUser`.


Dê permissão de execução ao arquivo e execute-o em seguida
```bash
chmod +x createUser.sh 
./createUser.sh local
```

Cadastre o novo usuário informando as informações solicitadas
```
Cadastro de Usuários
Digite a matrícula do usuário: 898989
Digite o nome do usuário: SuperUsuario
Digite a senha do usuário: 
Digite o nome da role [ADMIN]: 
```
> [!NOTE]
> É possível deixar em branco o campo de role apertando a tecla Enter. Nesse caso, a role atribuída ao usuário será a de admin

### Como rodar com Docker
```bash
docker compose up -d --build
```

#### Criando o usuário `ADMIN`
Ao rodar a aplicação com docker, utiliza-se o mesmo script para criação de usuários, mas passando o argumento com valor diferente, indicando que estamos usando o docker.
```bash
./createUser.sh docker
```

O comando para inserção de dados na base de dados permanece igual.

Para encerrar os containers:
```bash
docker compose down
```

## Variáveis de ambiente
Crie um arquivo `.env` a partir de [.env.example](./.env.example).

| Variável | Exemplo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `PORT` | `3000` | Sim (apenas quando rodar localmente) | Porta da API |
| `DB_HOST` | `localhost` ou `postgres` | Sim | Host do banco PostgreSQL |
| `DB_PORT` | `5432` | Sim | Porta do banco |
| `DB_USERNAME` | `postgres` | Sim | Usuário do banco |
| `DB_PASSWORD` | `postgres` | Sim | Senha do banco |
| `DB_DATABASE` | `tech_challenge` | Sim | Nome do banco |
| `JWT_SECRET` | `uma-chave-forte` | Sim | Chave usada para assinar o JWT |
| `JWT_EXPIRES_IN` | `1d` | Não | Tempo de expiração do token |
| `IS_PRODUCTION` | `false` | Sim | Determina se a aplicação rodará em modo produção (`true`) ou desenvolvimento (`false`) |

## Endpoints
| Método | Rota | Autenticação | Permissão | Descrição |
| --- | --- | --- | --- | --- |
| `GET` | `/docs` | Não | - | Documentação Swagger da API |
| `POST` | `/api/auth/login` | Não | - | Realiza login e retorna token JWT |
| `GET` | `/api/user` | Sim | `PROFESSOR`, `ADMIN` | Lista usuários cadastrados. O Admin vê todos os usuários, enquanto os professores têm acesso apenas aos alunos |
| `POST` | `/api/user` | Sim | `PROFESSOR`, `ADMIN` | Cadastra um novo usuário |
| `GET` | `/api/user/:id` | Sim | Qualquer usuário autenticado | Obtém os dados do usuário pelo ID |
| `PATCH` | `/api/user/:id` | Sim | `PROFESSOR`, `ADMIN` | Atualiza os dados de um usuário. Os Administradores podem alterar o dado de qualquer usuário, mas professores só podem atualiza dados de alunos |
| `DELETE` | `/api/user/:id` | Sim | `ADMIN` | Remove um usuário. Posts criados por ele e visualizações desses posts são removidos em cascata |
| `GET` | `/api/user/me` | Sim | Qualquer usuário autenticado | Obtém dados do usuário logado
| `GET` | `/api/user/:id/image` | Não | - | Obtém a imagem do aluno
| `GET` | `/api/posts` | Sim | Qualquer usuário autenticado | Lista todos os posts |
| `GET` | `/api/posts/search?termo=...` | Sim | Qualquer usuário autenticado | Busca posts por termo |
| `GET` | `/api/posts/:id` | Sim | Qualquer usuário autenticado | Retorna um post pelo ID e registra visualização se o usuário for `ALUNO` |
| `POST` | `/api/posts` | Sim | `PROFESSOR`, `ADMIN` | Cria um novo post |
| `PUT` | `/api/posts/:id` | Sim | `PROFESSOR`*, `ADMIN` | Atualiza um post |
| `DELETE` | `/api/posts/:id` | Sim | `PROFESSOR`*, `ADMIN` | Remove um post |
| `GET` | `/api/posts/:id/image` | Não | - | Obtém a imagem anexada ao post 
| `POST` | `/post/comment/{postId}` | Sim | Qualquer usuário autenticado | Cria um novo comentário vinculado ao post informado. O usuário autor é obtido pelo token autenticado. |
| `GET` | `/post/comment/{commentId}` | Sim | Qualquer usuário autenticado | Busca um comentário específico pelo seu ID. |
| `GET` | `/post/comment/list/{postId}` | Sim | Qualquer usuário autenticado | Lista todos os comentários vinculados a um post. |
| `PATCH` | `/post/comment/{commentId}` | Sim | Autor do comentário, `ADMIN` | Atualiza o conteúdo de um comentário. A edição é feita pelo autor do comentário ou por um administrador. |
| `DELETE` | `/post/comment/{commentId}` | Sim | Autor do comentário, Autor do post, `ADMIN` | Remove um comentário. A exclusão pode ser feita pelo autor do comentário, pelo autor do post ou por um administrador. |

> [!NOTE]
> *OBS: Quando um usuário professor cria um post, ele será o único professor que poderá editá-lo. Contudo, administradores podem realizar todas as ações de CRUD com qualquer post, mesmo não tendo criado o post.

## Autenticação
A autenticação é feita com JWT.
O endpoint `/api/auth/login` valida matrícula e senha, retorna o token e os dados básicos do usuário.

Nas rotas protegidas, o cliente deve enviar o header:
```http
Authorization: Bearer <token>
```

O middleware `authMiddleware` valida o token, busca o usuário no banco e anexa os dados à requisição.
Depois disso, `authorizeRoles` restringe o acesso conforme o perfil.

## Decisões técnicas
- Usamos JWT para manter a API stateless e simplificar a autenticação.
- Aplicamos roles no banco para centralizar a autorização por perfil.
- A visualização de posts fica em uma tabela própria (`post_views`) com restrição de unicidade por usuário e post, evitando duplicidade.
- As migrations são versionadas com TypeORM para manter o schema reproduzível.
- A documentação em OpenAPI facilita testes e consumo da API.

## Melhorias futuras
- Adicionar paginação nas listagens de posts
- Padronizar validações de entrada em todos os endpoints com schemas reutilizáveis
- Implementar refresh token
- Criar seeds automáticas para ambientes de desenvolvimento
- Melhorar o tratamento de erros com respostas mais consistentes
