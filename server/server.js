const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const dbConnection = require("./src/config/dbConnectionString");
const authRouter = require("./src/routes/authRoute");
const orgRouter = require("./src/routes/organizationRoute");
const venueRouter = require("./src/routes/venueRoute");
const cameraRouter = require("./src/routes/cameraRoute");
const sensorRouter = require("./src/routes/sensorRoute");
const companyRouter = require("./src/routes/dashboardRoutes/companyRoute");
const categoryRouter = require("./src/routes/dashboardRoutes/categoryRoutes");
const cookieParser = require("cookie-parser");
const authUser = require("./src/middlewares/authMiddleware");
const path = require("path");





dotenv.config();
const app = express();
PORT = process.env.PORT || 8000;
dbConnection();

//default middleware here
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));




app.use(cookieParser());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "src", "images")));


//routes here
app.use("/auth", authRouter)
app.use("/organization", authUser, orgRouter);
app.use("/venue", authUser, venueRouter);
app.use("/camera", cameraRouter);
app.use("/sensor", authUser, sensorRouter);
app.use("/company", companyRouter);
app.use("/category", categoryRouter);


//serever
app.listen(PORT, () => {
    console.log(`The Server is running on Port:No ${PORT} `);
});