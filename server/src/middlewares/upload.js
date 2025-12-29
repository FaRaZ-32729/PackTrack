const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure images directory exists
const uploadDir = path.join(__dirname, "../images");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

// File filter (optional)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG and PNG files are allowed"), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
