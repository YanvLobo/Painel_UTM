// Apaga todos os pedidos (e atribuições UTM) do banco.
// Usado uma única vez ao migrar pro modelo multi-loja, pra limpar pedidos
// de teste que não têm storeId (que passou a ser obrigatório).
// Uso: node scripts/reset-orders.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const { count } = await prisma.order.deleteMany({});
console.log(`${count} pedido(s) removido(s).`);
await prisma.$disconnect();
