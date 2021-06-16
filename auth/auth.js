const jwt = require("jsonwebtoken");
require("dotenv/config");

let refreshTokens = {}; //todo je toto dobre?

const generateToken = (user) => {
  return jwt.sign({ user: user }, process.env.TOKEN_SECRET, {
    expiresIn: parseInt(process.env.TOKEN_SECRET_EXPIRATION),
  });
};

const generateRefreshToken = (user) => {
  const token = jwt.sign(
    { user: user }, 
    process.env.REFRESH_TOKEN, 
    {
      expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRATION),
  });
  refreshTokens[user.id] = token;
  return token;
};

const authenticateToken = function (req, res, next) {
  const token = req.header("auth-token");

  if (token == null) return res.sendStatus(401);

  try {
    jwt.verify(token, process.env.TOKEN_SECRET);
    next();
  } catch (error) {
    res.status(401).send({ message: error.message });
  }
};

const decodeToken = (token) => {
  return jwt.decode(token, process.env.TOKEN_SECRET);
};

const isRefreshTokenValid = (userId, token) => {
  if (userId in refreshTokens && refreshTokens[userId] == token) {
    return true;
  }
  return false;
};

const getUserToken = (req, res) => {
  try {
    const token = req.header("auth-token");
    if (token == null) return res.sendStatus(401);

    const data = jwt.decode(token, process.env.TOKEN_SECRET);
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getUser = (req, res) => {
  try {
    const token = getUserToken(req, res);
    return token.user;
  } catch (error) {
    console.log(error);
    return null;
  }
};

module.exports = {
  generateToken,
  authenticateToken,
  decodeToken,
  generateRefreshToken,
  isRefreshTokenValid,
  getUser,
  getUserToken,
};

//FE
// get token from fetch request
// const token = await res.json();

// set token in cookie
// document.cookie = `token=${token}`;
