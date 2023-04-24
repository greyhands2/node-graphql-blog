import { PrismaClient } from '@prisma/client';


const prismaContext = new PrismaClient();


export {prismaContext as default}