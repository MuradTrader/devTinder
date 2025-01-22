const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { userAuth } = require("../middlewares/auth");
const userRouter = express.Router();

const prisma = new PrismaClient();

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequest = await prisma.connectionRequest.findMany({
      where: {
        toUserId: loggedInUser.id,
        status: "interested",
      },
      include: {
        fromUser: {
          select: {
            firstName: true,
            lastName: true,
            photoUrl: true,
            age: true,
          },
        },
      },
    });

    res.json({
      message: "Data fetched successfully",
      data: connectionRequest,
    });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequest = await prisma.connectionRequest.findMany({
      where: {
        OR: [
          { fromUserId: loggedInUser.id, status: "accepted" },
          { toUserId: loggedInUser.id, status: "accepted" },
        ],
      },
      include: {
        fromUser: {
          select: {
            firstName: true,
            lastName: true,
            photoUrl: true,
            age: true,
          },
        },
        toUser: {
          select: {
            firstName: true,
            lastName: true,
            photoUrl: true,
            age: true,
          },
        },
      },
    });

    // Фильтруем только инициаторов, где текущий пользователь — fromUserId
    const data = connectionRequest
      .filter((row) => row.fromUserId === loggedInUser.id) // Только запросы, инициированные пользователем
      .map((row) => row.toUser); // Возвращаем только данные о получателях

    res.json({ data });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    // все запросы на подключение которые я отправил или получил
    const connectionRequest = await prisma.connectionRequest.findMany({
      where: {
        OR: [{ fromUserId: loggedInUser.id }, { toUserId: loggedInUser.id }],
      },
    });

    const hideUsersFromFeed = new Set();
    connectionRequest.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId);
      hideUsersFromFeed.add(req.toUserId);
    });

    //Таким образом, этот запрос будет искать всех пользователей, чьи id не входят в массив hideUsersFromFeed.
    //Пояснение:
    //notIn: Это эквивалент $nin из MongoDB, используется для исключения значений из массива.
    //not: Это эквивалент $ne из MongoDB, используется для исключения конкретного значения (в данном случае, исключаем loggedInUser.id).
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: { notIn: Array.from(hideUsersFromFeed) },
          },
          {
            id: { not: loggedInUser.id },
          },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
        about: true,
        skills: true,
      },
      skip: skip,
      take: limit,
    });

    res.json({ users, page, limit, skip });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = userRouter;
