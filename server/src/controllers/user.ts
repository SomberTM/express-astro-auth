import prisma from "../db";
import { AuthedRequestHandler } from "../middleware/express/auth";

export const getMe: AuthedRequestHandler = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
  });

  res.status(200).send({ user });
};
