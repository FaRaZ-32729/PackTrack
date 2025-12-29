const roleAccess = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        // console.log(user);

        if (!user) return res.status(401).json({ message: "Unauthanticated User" });

        if (!allowedRoles.includes(user.role)) {
            return res.status(401).json({ message: "Access Denied" })
        }

        next();
    }
}


module.exports = roleAccess;