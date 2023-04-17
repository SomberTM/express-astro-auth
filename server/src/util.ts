import crypto from "crypto";
import { createTransport } from "nodemailer";
import jwt from "jsonwebtoken";
import uuid from "uuid";

const encryptionKey = process.env.JWT_ENCRPYTION_SECRET as string;

export function encryptJWT(rawJWT: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);
  let encrypted = cipher.update(rawJWT, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, encrypted, tag]).toString("base64");
}

export function decryptJWT(encryptedJWT: string): string {
  const encryptedData = Buffer.from(encryptedJWT, "base64");
  const receivedIv = encryptedData.subarray(0, 16);
  const receivedEncrypted = encryptedData.subarray(16, -16);
  const receivedTag = encryptedData.subarray(-16);
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    encryptionKey,
    receivedIv
  );
  decipher.setAuthTag(receivedTag);
  let decrypted = decipher.update(receivedEncrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export function generateVerificationCode(): string {
  const min = 100000;
  const max = 999999;
  const randomNum = Math.floor(Math.random() * (max - min + 1) + min);
  return randomNum.toString();
}

const jwtSecret = process.env.JWT_SECRET as string;

type JWTClaimOptions = { jwtId?: string; expTime?: number };

export function createSignedUserJWT(userId: string, options?: JWTClaimOptions) {
  // Default expiration is one day
  const exp = options?.expTime ?? Date.now() + 1 * 24 * 60 * 60 * 1000;
  const jti = options?.jwtId ?? uuid.v4();
  return jwt.sign(
    {
      sub: userId,
      iat: Date.now(),
      exp,
      jti,
    },
    jwtSecret
  );
}

const transporter = createTransport({
  service: "gmail",
  auth: {
    // This is who will 'send' the email
    user: "thughes080603@gmail.com",
    pass: "lgjxjtrdnxqzivry",
  },
});

export function sendVerificationEmail(email: string, code: string): void {
  const loginLink = `http://localhost:3000/auth/login/c?i=${Buffer.from(
    email
  ).toString("base64")}.${Buffer.from(code).toString("base64")}`;

  const mailOptions = {
    // from: "noreply@boilerexams.com",
    to: email,
    subject: "Your login code",
    text: `Your login code is ${code}.\nOr click to login: ${loginLink}`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });
}
