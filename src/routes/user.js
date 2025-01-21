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
          { toUserId: loggedInUser.id, status: "accepted" },
          { fromUserId: loggedInUser.id, status: "accepted" },
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
      },
    });
    res.json({
      data: connectionRequest,
    });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

module.exports = userRouter;
