
const express = require("express");
const { createChatRoom, getAllUsers } = require("../controllers/chatRoomController");
const router = express.Router();
const protectRoute = require("../middleware/protectedRoute");
const { getUsersForSidebar } = require("../controllers/userController");

// Route to create a new chat room
router.post("/create", protectRoute, createChatRoom);

// Route to fetch all users excluding the logged-in user
router.get("/users", protectRoute, getUsersForSidebar); // Correct the route to match frontend request

module.exports = router;
