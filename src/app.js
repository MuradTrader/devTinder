// import express
const express = require("express");
// import - prisma
const { PrismaClient } = require("@prisma/client");
// import - файлы
const connectDB = require("./config/database.js");
const { validateSignUpData } = require("./utils/validation.js");
const { userAuth } = require("./middlewares/auth.js");
const { userService } = require("./utils/userService.js");
// import Библиотеки
const validator = require("validator");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

// Глобальные переменные
const port = 3000;
const app = express();
const prisma = new PrismaClient();

// Middleware для обработки JSON-запросов
app.use(express.json());
// Middleware cookie-parser
app.use(cookieParser());

app.post("/signup", async (req, res) => {
  try {
    // Функция для валидации данных
    validateSignUpData(req);

    // Извлекаем поля которые нам нужны
    const { firstName, lastName, emailId, password } = req.body;

    // Зашифруем password
    const passwordHash = await userService.passwordHash(password, 10);

    // Сохранение нового пользователя в базе данных
    const newUser = await prisma.user.create({
      data: {
        firstName: firstName.trim().toLowerCase(),
        lastName: lastName.trim().toLowerCase(),
        emailId: emailId.trim().toLowerCase(),
        password: passwordHash.toLowerCase(),
      },
    });
    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      message: "Error creating user",
      error: error.message,
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    // Проверка правильно ли ввели данные пользователь
    // Есть ли в базе данных почта и пароль которые пишет пользователь
    const user = await userService.findUserByEmail(emailId);
    if (!user) {
      throw new Error("Invalid credentials!");
    }
    const isPasswordValid = await userService.comparePasswords(
      password,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error("Invalid credentials!");
    }
    // Создания токена JWT
    const token = await userService.createJwt(user);
    // Добавление JWT в Cookies
    res.cookie("token", token);
    res.send("Login Successful!!!");
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

app.post("/sendConnectionRequest", userAuth, async (req, res) => {
  const user = req.user;
  res.send(user.firstName + " sent the connect request!");
});

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
