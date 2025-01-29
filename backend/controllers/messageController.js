const Conversation = require("../models/Conversations");
const Message = require("../models/Messages");
const { getReceiverSocketId, io } = require("../socket/socket");
const path = require("path");

// Handle sending message with optional file upload
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // If neither message nor file is provided, return an error
    if (!message.trim() && !req.file) {
      return res.status(400).json({ error: "Message or file is required." });
    }

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      // Create new conversation if it doesn't exist
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // Prepare the new message object
    const newMessage = new Message({
      senderId,
      receiverId,
      message: message ? message.trim() : "", // If no message, it's an empty string
      file: req.file ? req.file.path : null, // Store file path if file exists
    });

    if (newMessage) {
      // Add new message to conversation's message list
      conversation.messages.push(newMessage._id);
    }

    // Save the conversation and message in parallel
    await Promise.all([conversation.save(), newMessage.save()]);

    // Emit the new message to the receiver via socket
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // Send the saved message in response
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get messages for a conversation
const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    // Find the conversation between the sender and the receiver
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages");

    if (!conversation) return res.status(200).json([]); // No conversation found

    // Return the messages in the conversation
    const messages = conversation.messages;

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  sendMessage,
  getMessages,
};
