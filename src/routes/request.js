const express = require("express");
const requestRouter = express.Router();
const { PrismaClient } = require("@prisma/client");
const { userAuth } = require("../middlewares/auth");

const prisma = new PrismaClient();

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user.id;
      const toUserId = parseInt(req.params.toUserId, 10);
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: "Invalid status type: " + status,
        });
      }
      const toUser = await prisma.user.findUnique({
        where: { id: toUserId },
      });
      if (!toUser) {
        return res.status(404).json({
          message: "User not found!",
        });
      }

      const existingConnectionRequest =
        await prisma.connectionRequest.findFirst({
          where: {
            OR: [
              { fromUserId: fromUserId, toUserId: toUserId }, // id2 > id3
              { fromUserId: toUserId, toUserId: fromUserId }, // id3 > id2
            ],
          },
        });

      if (existingConnectionRequest) {
        return res
          .status(400)
          .send({ message: "Connection Request Already Exists!" });
      }

      // Проверка: нельзя отправлять запрос самому себе
      if (fromUserId === toUserId) {
        throw new Error("Cannot send a connection request to yourself!");
      }

      const ConnectionRequest = await prisma.connectionRequest.create({
        data: {
          fromUserId,
          toUserId,
          status,
        },
      });

      res.json({
        message: `${req.user.firstName} is ${status} in ${toUser.firstName}`,
        data: ConnectionRequest,
      });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  }
);

requestRouter.patch(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const status = req.params.status;
      const requestId = parseInt(req.params.requestId);

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Status not allowed!" });
      }

      const connectionRequest = await prisma.connectionRequest.findFirst({
        where: {
          id: requestId,
          toUserId: loggedInUser.id,
          status: "interested",
        },
      });

      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection request not found" });
      }

      const updatedRequest = await prisma.connectionRequest.update({
        where: { id: requestId },
        data: { status }, // создается новый объект с ключом status, а значением будет новый статус переменной status. Можно вот так status: status
      });

      res.json({
        message: `Connection request ${status}`,
        data: updatedRequest,
      });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  }
);

module.exports = requestRouter;
