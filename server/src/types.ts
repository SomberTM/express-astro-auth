import { Request, Response } from "express";

export type ExpressRouteController<ReqBody = any, ResBody = any> = (
  req: Request<Record<string, string>, any, ReqBody>,
  res: Response<ResBody>
) => void;
