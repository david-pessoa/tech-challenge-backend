// Define o formato dos dados esperados para atualização de usuário.
// Todos os campos são opcionais — o cliente manda só o que quer mudar.
export interface UpdateUserDTO {
  nome?: string;
  birthDate?: Date;
  matricula?: string;
  senha?: string;
  role?: string;
  image?: Buffer | null;
  removeImage?: string | boolean;
}
