import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import authRouter from "./routers/auth";
import userRouter from "./routers/user";

const PORT = 7777;

(async function () {
  const app = express();

  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser());
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use("/auth", authRouter);
  app.use("/user", userRouter);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
