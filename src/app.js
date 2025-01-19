const express = require("express");
const app = express();
const { PrismaClient } = require("@prisma/client");
const connectDB = require("./config/database.js");
const validator = require("validator");
const port = 3000;

const prisma = new PrismaClient();

// Middleware для обработки JSON-запросов
app.use(express.json());

// POST API для signup
app.post("/signup", async (req, res) => {
  const { firstName, lastName, emailId, age, skills, password, photoUrl } =
    req.body;

  // Валидация email
  if (!validator.isEmail(emailId)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Валидация URL (например, для фото профиля)
  if (photoUrl && !validator.isURL(photoUrl)) {
    return res.status(400).json({ message: "Invalid URL format for photoUrl" });
  }

  // Валидация пароля (например, минимальная длина, наличие цифр, символов)
  if (!validator.isStrongPassword(password)) {
    return res.status(400).json({ message: "Password is not strong enough" });
  }

  if (age < 18) {
    return res.status(400).json({ message: "Age must be at least 18" });
  }

  try {
    // Сохранение нового пользователя в базе данных
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        age,
        emailId,
        skills,
        password,
      },
    });
    res.send("User created successfully");
    // res.status(201).json({
    //   message: "User created successfully",
    //   user: newUser,
    // });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      message: "Error creating user",
      error: error.message,
    });
  }
});

app.get("/user", async (req, res) => {
  const { emailId } = req.query; // emailId передается как query параметр
  try {
    // Поиск пользователя по emailId
    const user = await prisma.user.findUnique({
      where: { emailId },
    });

    res.send(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      message: "Error fetching user",
      error: error.message,
    });
  }
});

app.get("/feed", async (req, res) => {
  try {
    // Получение всех пользователей
    const users = await prisma.user.findMany();
    res.send(users);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      message: "Error fetching user",
      error: error.message,
    });
  }
});

app.delete("/user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await prisma.user.delete({
      where: { id: parseInt(id) }, // Преобразуем строковый ID в число
    });
    res.json({ message: "User deleted successfully", user: deletedUser });
  } catch (error) {
    console.error("Error deleting user:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
});

app.patch("/user/:id", async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, emailId, password } = req.body; // частичные данные для обновления

  // Применение trim() и toLowerCase()
  const trimmedAndLowercasedData = {
    firstName: firstName.trim().toLowerCase(),
    lastName: lastName.trim().toLowerCase(),
    emailId: emailId.trim().toLowerCase(),
    password: password.trim(),
  };

  // Валидация на минимальную длину пароля
  if (trimmedAndLowercasedData.password.length < 4) {
    return res.status(400).json({
      message: "Password must be at least 4 characters long",
    });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) }, // Преобразуем id в число
      data: trimmedAndLowercasedData,
    });

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({
      message: "Error updating user",
      error: error.message,
    });
  }
});

// Только разрешенные поля для обновлений
app.patch("/updateUser/:id", async (req, res) => {
  const userId = parseInt(req.params.id); // Получаем ID пользователя из параметра запроса
  const data = req.body; // Получаем данные для обновления

  try {
    // Разрешенные поля для обновления
    const ALLOWED_UPDATES = [
      "firstName",
      "lastName",
      "gender",
      "age",
      "skills",
    ];

    // Проверяем, что все переданные поля разрешены для обновления
    const isUpdateAllowed = Object.keys(data).every((key) =>
      ALLOWED_UPDATES.includes(key)
    );

    if (!isUpdateAllowed) {
      throw new Error("Update not allowed");
    }

    if (data?.skills.length > 10) {
      throw new Error("Skills cannot be more than 10");
    }

    // Обновление пользователя
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data, // Передаем только разрешенные данные, так как проверка уже выполнена
    });

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      message: "Error updating user",
      error: error.message,
    });
  }
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
  });
