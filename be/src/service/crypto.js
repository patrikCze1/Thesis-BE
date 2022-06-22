const crypto = require("crypto-js");

const password = "d6F3Efeq";

function encrypt(text) {
  const result = crypto.AES.encrypt(text, password);
  return result.toString();
}

function decrypt(text) {
  const result = crypto.AES.decrypt(text, password);
  return result.toString(crypto.enc.Utf8);
}

module.exports = {
  encrypt,
  decrypt,
};
