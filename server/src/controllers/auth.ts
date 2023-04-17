import prisma from "../db";
import * as uuid from "uuid";
import { ExpressRouteController } from "../types";
import {
  createSignedUserJWT,
  generateVerificationCode,
  sendVerificationEmail,
} from "../util";
import { AuthedRequestHandler } from "../middleware/express/auth";

type LoginReqBody = {
  email: string;
};

type LoginResBody =
  | {
      success: true;
      redirectHash: string;
    }
  | {
      success: false;
      reason: string;
    };

// Generates an account for the soon to be user.
// Generates the verification code and sends the email.
export const initiateLogin: ExpressRouteController<
  LoginReqBody,
  LoginResBody
> = async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res
      .status(400)
      .send({ success: false, reason: `No email provided` });

  const userExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  const code = generateVerificationCode();
  const expirationMinutes = 5;
  const verificationCodeData = {
    email,
    code,
    expiresAt: new Date(Date.now() + expirationMinutes * 60000),
  };

  if (userExists) {
    try {
      await prisma.verificationCode.delete({ where: { email } });
    } catch (err) {
      // no code active
    }
    await prisma.account.update({
      where: { userId: userExists.id },
      data: {
        verificationCode: {
          create: verificationCodeData,
        },
      },
    });
  } else {
    await prisma.account.create({
      data: {
        verificationCode: {
          create: verificationCodeData,
        },
      },
    });
  }

  sendVerificationEmail(email, code);

  const redirectHash = `${Buffer.from(email).toString("base64")}.${Buffer.from(
    code
  ).toString("base64")}`;

  return res.status(200).send({ success: true, redirectHash });
};

type CompleteLoginReqBody = {
  email: string;
};

type CompleteLoginResBody =
  | {
      jwt: string;
      success: true;
    }
  | {
      success: false;
      reason: string;
    };

// If user with valid JWT exists, res with that JWT
// If user with invalid JWT, res with new JWT
// If no user, create user & JWT.
// Also make sure verification code is correct
export const completeLogin: ExpressRouteController<
  CompleteLoginReqBody,
  CompleteLoginResBody
> = async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res
      .status(400)
      .send({ success: false, reason: `No email provided` });

  const { code } = req.params;

  if (!code)
    return res
      .status(400)
      .send({ success: false, reason: `No verification code provided` });

  const account = await prisma.account.findUnique({
    where: {
      verificationEmail: email,
    },
    include: {
      verificationCode: true,
      user: true,
      token: true,
    },
  });

  if (!account)
    return res.status(500).send({
      success: false,
      reason: `No verification email is active for ${email}`,
    });

  if (!account.verificationCode)
    return res.status(500).send({
      success: false,
      reason: `No verification code found for ${email}`,
    });

  const verificationCodeExpirationTime =
    account.verificationCode.expiresAt.getTime();
  if (verificationCodeExpirationTime < Date.now())
    return res
      .status(400)
      .send({ success: false, reason: `Verification code expired` });

  if (account.verificationCode.code !== code)
    return res
      .status(400)
      .send({ success: false, reason: `Invalid verification code` });

  let { user, token } = account;

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
      },
    });
    await prisma.account.update({
      where: {
        id: account.id,
      },
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }

  if (token && token.expiresAt.getTime() > Date.now()) {
    await prisma.verificationCode.delete({ where: { email } });
    res.cookie("jwt", token.jwt, {
      path: "/",
      // 3 days
      maxAge: 1000 * 60 * 60 * 24 * 3,
      httpOnly: true,
      secure: false,
    });
    return res.status(200).send({ success: true, jwt: token.jwt });
  }

  const jwtId = uuid.v4();
  const expTime = Date.now() + 1 * 24 * 60 * 60 * 1000;
  const jwt = createSignedUserJWT(user.id, { jwtId, expTime });

  await prisma.account.update({
    where: {
      id: account.id,
    },
    data: {
      token: {
        create: {
          id: jwtId,
          jwt,
          expiresAt: new Date(expTime),
        },
      },
    },
  });

  await prisma.verificationCode.delete({ where: { email } });

  res.cookie("jwt", jwt, {
    path: "/",
    // 3 days
    maxAge: 1000 * 60 * 60 * 24 * 3,
    httpOnly: true,
    secure: false,
  });
  return res.status(200).send({ success: true, jwt });
};

export const logout: AuthedRequestHandler = (req, res) => {
  res.clearCookie("jwt");
  res.status(200).send();
};
