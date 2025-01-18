const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient(); // автоматически использует DATABASE_URL из .env

const connectDB = async () => {
  await prisma.$connect();
};

module.exports = connectDB;
