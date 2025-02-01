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
    origin: ["http://localhost:3000"],
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

// Serve static files from the frontend/dist folder
app.use(express.static(path.join(__dirname, "frontend", "dist")));

// Serve the index.html file for all routes that don't match API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Server Running on port ${PORT}`);
});
