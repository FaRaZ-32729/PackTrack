const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel');

const authUser = async (req, res, next) => {
    try {
        let token = null;

        //  Check cookies
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
            console.log(" token", token)
        }

        // If not in cookies, check Authorization header
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;

            if (authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            }
        }

        if (!token) return res.status(401).json({ msg: "Unauthanticated User" });

        const { _id } = jwt.verify(token, process.env.JWT_SECRET_KEY);

        const authanticatedUser = await userModel.findById(_id);
        if (!authanticatedUser) return res.status(404).json("User Not Found");

        req.user = authanticatedUser;

        next();

    } catch (error) {
        return res.status(500).json({ msg: "Invalid Token or Token Expired" });
    }
}

module.exports = authUser