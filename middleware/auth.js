const jwt = require("jsonwebtoken");


function auth(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: "JWT_SECRET environment variable is not set" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: "Token is not valid" });
  }
}

module.exports = auth;
