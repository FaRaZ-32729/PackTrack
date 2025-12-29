const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Create transporter using your SMTP credentials
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const emails = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: `FoodTrace <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,

            // Attach inline image similar to Nodemailer "cid"
            attachments: [
                {
                    filename: "logo.png",
                    path: path.join(__dirname, "../assets/logo.png"),
                    cid: "logo"
                }
            ]
        });

        console.log("Email sent ✔");
    } catch (err) {
        console.error("error while sending email :", err);
        throw new Error("Email could not be sent");
    }
};

module.exports = emails;
