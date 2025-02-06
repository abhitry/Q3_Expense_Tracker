const jwt = require('jsonwebtoken');
let { JWT_USER_SECRET } = require("../config.js");

const userMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ msg: "Token missing or invalid" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_USER_SECRET);
        req.userId = decoded.id;  // Set userId for further use
        next();
    } catch (error) {
        return res.status(403).json({ msg: "Invalid token", error: error.message });
    }
};

module.exports = { userMiddleware };