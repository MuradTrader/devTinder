// Автор курса создал схему для user, в папке models файл user.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  emailId: {
    type: String,
  },
  password: {
    type: String,
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
  },
});

// Автор курса создает модель в mogoose
const userModel = mongoose.model("User", userSchema);
module.exports = userModel;

// Как мне это реализовать в PostgreSQL с Prisma?
