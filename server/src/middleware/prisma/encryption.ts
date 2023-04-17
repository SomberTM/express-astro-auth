import { Prisma } from "@prisma/client";

import { decryptJWT, encryptJWT } from "../../util";

export const encryptJWTOnCreate: Prisma.Middleware = async (params, next) => {
  if (params.model === "Token" && params.action === "create") {
    const jwt = params.args.data.jwt;
    // If the jwt is not already encrypted it contain '.'
    if (jwt.includes(".")) params.args.data.jwt = encryptJWT(jwt);
  }

  const result = await next(params);
  return result;
};

export const decryptJWTOnGet: Prisma.Middleware = async (params, next) => {
  if (params.model === "Token" && params.action === "findUnique") {
    const jwt = params.args.data.jwt;
    params.args.data.jwt = decryptJWT(jwt);
  }

  const result = await next(params);
  return result;
};
