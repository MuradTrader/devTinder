const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password, age, photoUrl } = req.body;
  if (!firstName || !lastName) {
    throw new Error("Name is not valid!");
  } else if (firstName.length < 4 && firstName.length > 50) {
    throw new Error("FirstName should be 4-50 charaters");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Invalid email format");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong enough");
  } else if (photoUrl && !validator.isURL(photoUrl)) {
    throw new Error("Invalid URL format for photoUrl");
  } else if (age && age < 18) {
    throw new Error("Age must be at least 18");
  }
};

const validateEditProfileData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "emailId",
    "photoUrl",
    "gender",
    "age",
    "about",
    "skills",
  ];
  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );
  return isEditAllowed;
};

module.exports = {
  validateSignUpData,
  validateEditProfileData,
};
