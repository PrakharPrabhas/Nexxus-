const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const memberRoutes = require("./routes/members");
const eventRoutes = require("./routes/events");
const projectRoutes = require("./routes/projects");
const galleryRoutes = require("./routes/gallery");
const statisticRoutes = require("./routes/statistics");
const settingRoutes = require("./routes/settings");
const authRoutes = require("./routes/auth");

const requiredEnvironment = [
    "MONGODB_URI",
    "JWT_SECRET"
];

const missingEnvironment =
    requiredEnvironment.filter((name) => !process.env[name]);

if (missingEnvironment.length) {
    throw new Error(
        `Missing required environment variables: ${missingEnvironment.join(", ")}`
    );
}

// =====================================
// CREATE EXPRESS APP
// =====================================

const app = express();


// =====================================
// DATABASE AND STARTUP
// =====================================

app.use(cors());
app.use(express.json());
app.use("/api/members", memberRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/statistics", statisticRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {

    res.json({
        success:true,
        message: "NEXUS Backend is running "
    });

});

app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed" || err.status === 400) {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON body"
        });
    }

    console.error(err.message);

    res.status(500).json({
        success: false,
        message: "Server error"
    });
});

// =====================================
// START SERVER
// =====================================

const PORT = process.env.PORT || 5000;

async function startServer() {

    await connectDB();

    app.listen(PORT, () => {

        console.log(
            `NEXUS server running on port ${PORT}`
        );

    });
}

startServer().catch((error) => {

    console.error("Server startup failed");
    console.error(error.message);
    process.exitCode = 1;

});