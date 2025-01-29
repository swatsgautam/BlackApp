const { getUsersForSidebar } = require("../controllers/userController");

// Create a new chat room
const createChatRoom = async (req, res) => {
  const { name, description, isPrivate, participants } = req.body;

  try {
    const newChatRoom = new ChatRoom({
      name,
      description,
      isPrivate,
      participants,
    });

    await newChatRoom.save();
    res.status(201).json(newChatRoom);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating chat room", error: err.message });
  }
};

// Use the getUsersForSidebar logic for fetching users excluding the logged-in user
const getAllUsers = async (req, res) => {
  try {
    const users = await getUsersForSidebar(req, res); // This will return filtered users
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: err.message });
  }
};

module.exports = { createChatRoom, getAllUsers };
