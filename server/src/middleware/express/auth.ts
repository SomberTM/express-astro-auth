import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
  RouterOptions,
} from "express";
import jwt from "jsonwebtoken";
import prisma from "../../db";
import { User } from "@prisma/client";

const jwtSecret = process.env.JWT_SECRET as string;

// Add this to a router or request method to make it
// protected (only authed users can use it)
export const authMiddleware: RequestHandler = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token)
    return res
      .status(401)
      .send({ success: false, reason: `Authentication token missing` });

  const unverifiedDecoded = jwt.decode(token) as jwt.JwtPayload;

  try {
    const decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
    const userId = decoded.sub;

    if (!userId)
      return res
        .status(401)
        .send({ success: false, reason: `Malformed authentication token` });

    const user = await prisma.user.findUnique({
      where: { id: userId as string },
    });

    // @ts-ignore
    req.user = user;

    next();
  } catch (error: any) {
    let err = error as jwt.VerifyErrors;

    if (err.name === "TokenExpiredError") {
      prisma.token.delete({
        where: {
          id: unverifiedDecoded.jti,
        },
      });
      res.clearCookie("jwt");
      return res
        .status(401)
        .send({ success: false, reason: `Authentication token expired` });
    } else {
      return res
        .status(401)
        .send({ success: false, reason: `Authentication token invalid` });
    }
  }
};

// Shitty protected router type
type ProtectedRouter = Router & {
  get<P>(path: P, ...handlers: AuthedRequestHandler[]): void;
  post<P>(path: P, ...handlers: AuthedRequestHandler[]): void;
  delete<P>(path: P, ...handlers: AuthedRequestHandler[]): void;
  put<P>(path: P, ...handlers: AuthedRequestHandler[]): void;
  patch<P>(path: P, ...handlers: AuthedRequestHandler[]): void;
};

// It would be super cool to see all the methods of the router
// like get, post, delete, etc... have the proper AuthedRequest type
// but at the moment it appears express doesnt expose the ability to
// do such. To get that functionality/typing use the AuthedRequestHandler
export function ProtectedRouter(options?: RouterOptions) {
  const router = Router(options);
  router.use(authMiddleware);
  return router as ProtectedRouter;
}

export type AuthedRequest = Request & { user: User };

export type AuthedRequestHandler = (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => void;
