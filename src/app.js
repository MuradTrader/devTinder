const express = require("express");
const app = express();
const { PrismaClient } = require("@prisma/client");
const connectDB = require("./config/database.js");
const port = 3000;

const prisma = new PrismaClient();

// Middleware для обработки JSON-запросов
app.use(express.json());

// POST API для signup
app.post("/signup", async (req, res) => {
  try {
    // Создание фиктивного пользователя
    const user = {
      firstName: "Virata",
      lastName: "Kohli",
      emailId: "virata123@gmail.com",
      password: "74650Virata",
    };

    // Сохранение пользователя в базе данных
    const newUser = await prisma.user.create({
      data: user,
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
