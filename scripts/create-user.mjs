// Cria (ou atualiza a senha de) um usuário para login no painel.
// Uso: node scripts/create-user.mjs email@exemplo.com "senha-forte" [AGENCY_ADMIN|CLIENT]
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const [, , email, password, role] = process.argv;

if (!email || !password) {
  console.error(
    'Uso: node scripts/create-user.mjs email@exemplo.com "senha-forte" [AGENCY_ADMIN|CLIENT]'
  );
  process.exit(1);
}

const finalRole = role === "CLIENT" ? "CLIENT" : "AGENCY_ADMIN";

const prisma = new PrismaClient();

const hashed = await bcrypt.hash(password, 10);

const user = await prisma.user.upsert({
  where: { email },
  create: { email, password: hashed, role: finalRole },
  update: { password: hashed, role: finalRole },
});

console.log(`Usuário pronto: ${user.email} (role: ${user.role})`);
await prisma.$disconnect();
