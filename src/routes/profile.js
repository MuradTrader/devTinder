const express = require("express");
const profileRouter = express.Router();
const { PrismaClient } = require("@prisma/client");

const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");
const { userService } = require("../utils/userService");

const prisma = new PrismaClient();
profileRouter.use(express.json());

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Edit Request!");
    }
    const loggedInUser = req.user;

    // Такая строка могла бы быть полезна, если вы хотите временно обновить данные локального объекта loggedInUser для последующего использования в коде до обращения к базе данных. Например:
    //Если вы используете измененный объект loggedInUser где-то дальше в коде.
    //Для логирования изменений перед выполнением обновления в базе данных.
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    const updatedUser = await prisma.user.update({
      where: { id: loggedInUser.id },
      data: req.body,
    });
    res.status(200).json({
      message: `${loggedInUser.firstName}, yor profile updated successful!`,
      user: updatedUser,
    });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { oldPassword, newPassword } = req.body;

    const isPasswordValid = await userService.comparePasswords(
      oldPassword,
      loggedInUser.password
    );

    if (!isPasswordValid) {
      throw new Error("Invalid old password!"); // Ошибка, если старый пароль не совпадает
    }

    const hashedNewPassword = await userService.passwordHash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: loggedInUser.id },
      data: { password: hashedNewPassword },
    });

    res.status(200).json({
      message: `${loggedInUser.firstName}, yor password updated successful!`,
      user: updatedUser,
    });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

module.exports = profileRouter;
