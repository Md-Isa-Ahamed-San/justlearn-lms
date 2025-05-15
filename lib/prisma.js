// lib/prisma.js
import { PrismaClient } from '../lib/generated/prisma'
const global ={
    prisma:PrismaClient
}
export const db = globalThis.prisma || new PrismaClient();
if(process.env.NODE_ENV !=="production") globalThis.prisma = db;
