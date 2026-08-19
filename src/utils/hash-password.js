const bcrypt = require("bcryptjs")



exports.hashPassword = async (password) => {
  const rounds = 10;
  return await bcrypt.hash(password, rounds);
};

exports.comparePassword = async (plainPassword, hashedPassword) => {
  // try {
  //    console.log(plainPassword, hashedPassword);
  //    if (!plainPassword || !hashedPassword) {
  //     return false;
  //   }

  //   await bcrypt.compare(plainPassword, hashedPassword);
  // } catch (error) {
  //   return false;
  // }
 
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// module.exports = { hashPassword, comparePassword };
