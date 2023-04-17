import { PrismaClient } from "@prisma/client";
import {
  decryptJWTOnGet,
  encryptJWTOnCreate,
} from "./middleware/prisma/encryption";
import { logAll } from "./middleware/prisma/logging";

const prisma = new PrismaClient();

prisma.$use(encryptJWTOnCreate);
prisma.$use(decryptJWTOnGet);
prisma.$use(logAll);

export default prisma;
