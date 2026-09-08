import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`A variavel de ambiente ${name} nao foi definida`);
  }

  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  database: {
    host: required('DB_HOST', 'postgres'),
    port: Number(process.env.DB_PORT ?? 5432),
    username: required('DB_USERNAME', 'postgres'),
    password: required('DB_PASSWORD', 'postgres'),
    name: required('DB_DATABASE', 'tech_challenge'),
  },
  jwt: {
    secret: required('JWT_SECRET', 'development-secret'),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },
  isProduction: process.env.IS_PRODUCTION?.toLowerCase() === 'true'
};
