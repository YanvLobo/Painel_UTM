// Cria (ou atualiza a senha de) um usuário para login no painel.
// Uso: node scripts/create-user.mjs email@exemplo.com "senha-forte"
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error('Uso: node scripts/create-user.mjs email@exemplo.com "senha-forte"');
  process.exit(1);
}

const prisma = new PrismaClient();

const hashed = await bcrypt.hash(password, 10);

const user = await prisma.user.upsert({
  where: { email },
  create: { email, password: hashed },
  update: { password: hashed },
});

console.log(`Usuário pronto: ${user.email}`);
await prisma.$disconnect();
