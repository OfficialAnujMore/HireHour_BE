import { PrismaClient } from '@prisma/client';
import { log } from 'node:console';
const prisma = new PrismaClient();

console.log("------------Prisma Client ts code -----------------", prisma);

export default prisma;
