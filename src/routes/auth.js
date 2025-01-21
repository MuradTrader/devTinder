const express = require("express");
const authRouter = express.Router();

const { PrismaClient } = require("@prisma/client");

const { userService } = require("../utils/userService.js");
const { validateSignUpData } = require("../utils/validation.js");

const prisma = new PrismaClient();

authRouter.post("/signup", async (req, res) => {
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
        password: passwordHash,
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

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    // Проверка правильно ли ввели данные пользователь
    // Есть ли в базе данных почта и пароль которые пишет пользователь
    const user = await userService.findUserByEmail(emailId);
    if (!user) {
      throw new Error("Invalid credentials! (emailId)");
    }
    const isPasswordValid = await userService.comparePasswords(
      password,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error("Invalid credentials! (password)");
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

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()), // истекает время действии cookie прямой сейчас
  });
  res.send("Logout Successful!");
});

module.exports = authRouter;
