const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Token is not valid!!!");
    }
    const decodedObj = await jwt.verify(token, "DEV@Tinder$790");

    const { id } = decodedObj;

    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;

    next();
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
};

module.exports = {
  userAuth,
};
