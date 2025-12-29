const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel');

const authUser = async (req, res, next) => {
    const { token } = req.cookies;
    try {
        if (!token) return res.status(401).json({ msg: "Unauthanticated User" });

        const { _id } = jwt.verify(token, process.env.JWT_SECRET_KEY);

        const authanticatedUser = await userModel.findById(_id);
        if (!authanticatedUser) return res.status(404).json("User Not Found");

        req.authanticatedUser = authanticatedUser;

        next();

    } catch (error) {
        return res.status(500).json({ msg: "Invalid Token or Token Expired" });
    }
}

module.exports = authUser