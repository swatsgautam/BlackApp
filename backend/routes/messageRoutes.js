const express = require("express");
const multer = require("multer");
const { getMessages, sendMessage } = require("../controllers/messageController");
const protectRoute = require("../middleware/protectedRoute");

// Set up multer for file uploads
const upload = multer({ dest: "uploads/" }); // Store uploaded files in 'uploads' directory

const router = express.Router();

// Get messages for a specific conversation
router.get("/:id", protectRoute, getMessages);

// Send a message (with optional file upload)
router.post("/send/:id", protectRoute, upload.single("file"), sendMessage);

module.exports = router;
