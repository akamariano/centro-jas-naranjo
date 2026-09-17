const jwt = require("jsonwebtoken");
const env = require("../config/env");

function signAdminToken(admin) {
  return jwt.sign({ sub: admin.id, usuario: admin.usuario }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
}

function verifyToken(token) {
  return jwt.verify(token, env.jwt.secret);
}

module.exports = { signAdminToken, verifyToken };
