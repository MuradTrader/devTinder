const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const userService = {
  async createJwt(user) {
    return jwt.sign({ id: user.id }, "DEV@Tinder$790", {
      expiresIn: "1d",
    });
  },

  async findUserByEmail(emailId) {
    return prisma.user.findUnique({ where: { emailId } });
  },

  async comparePasswords(inputPassword, userPassword) {
    return bcrypt.compare(inputPassword, userPassword);
  },

  async passwordHash(password, cycleHash = 10) {
    return bcrypt.hash(password, cycleHash);
  },
};

module.exports = {
  userService,
};
