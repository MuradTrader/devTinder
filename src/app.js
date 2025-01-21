// import express
const express = require("express");
// import - prisma
const { PrismaClient } = require("@prisma/client");
// import - файлы
const connectDB = require("./config/database.js");
// import Библиотеки
const cookieParser = require("cookie-parser");

// Глобальные переменные
const port = 3000;
const app = express();
const prisma = new PrismaClient();

// Middleware для обработки JSON-запросов
app.use(express.json());
// Middleware cookie-parser
app.use(cookieParser());

const authRouter = require("./routes/auth.js");
const profileRouter = require("./routes/profile.js");
const requestRouter = require("./routes/request.js");
const userRouter = require("./routes/user.js");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDB()
  .then(() => {
    console.log("Database connection established....");
    app.listen(port, () =>
      console.log(`Example app listening on port ${port}!`)
    );
  })
  .catch((err) => {
    console.log("Database cannot be connected!!!", err);
    process.exit(1); // Завершить процесс с ошибкой
  });
