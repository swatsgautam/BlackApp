const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const authRoutes = require("./routes/authRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const chatRoomRoutes = require("./routes/chatRoomRoutes.js");
const connectToMongoDB = require("./db/connection.js");
const { app, server } = require("./socket/socket.js");
const cors = require("cors");
const fs = require("fs");

dotenv.config();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: ["https://blackapp-1.onrender.com"],
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Set up storage engine for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Save file with timestamp to avoid name collisions
  },
});

const upload = multer({ storage });

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
// app.use("/api/rooms", chatRoomRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Server Running on port ${PORT}`);
});
