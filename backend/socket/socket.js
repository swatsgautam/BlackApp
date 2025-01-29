const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Adjust to your front-end URL
    methods: ["GET", "POST"],
  },
});

const userSocketMap = new Map(); // Using Map instead of object for better key-value handling

const getReceiverSocketId = (receiverId) => {
  return userSocketMap.get(receiverId);
};

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap.set(userId, socket.id);
  }

  // Notify all users about the current online users
  io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

  // Handle making a call
  socket.on("makeCall", ({ offer, to, from }) => {
    const receiverSocketId = userSocketMap.get(to);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveCall", {
        offer,
        from,
      });
    } else {
      socket.emit("callError", "Receiver is not online");
    }
  });

  // Handle call answer
  socket.on("answerCall", ({ answer, to }) => {
    const callerSocketId = userSocketMap.get(to);

    if (callerSocketId) {
      io.to(callerSocketId).emit("receiveAnswer", {
        answer,
        from: userId,
      });
    }
  });

  // Handle call rejection
  socket.on("rejectCall", ({ to }) => {
    const callerSocketId = userSocketMap.get(to);

    if (callerSocketId) {
      io.to(callerSocketId).emit("receiveReject", {
        from: userId,
      });
    }
  });

  // Handle call end
  socket.on("endCall", ({ to }) => {
    const receiverSocketId = userSocketMap.get(to);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("callEnded", {
        from: userId,
      });
    }
  });

  // Handle ICE candidates
  socket.on("iceCandidate", ({ candidate, to }) => {
    const receiverSocketId = userSocketMap.get(to);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveIceCandidate", {
        candidate,
        from: userId,
      });
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);

    // Find and remove the disconnected user
    for (const [key, value] of userSocketMap.entries()) {
      if (value === socket.id) {
        userSocketMap.delete(key);
        break;
      }
    }

    // Notify remaining users about updated online users list
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  });
});

// Export app, io, and server using module.exports
module.exports = { app, io, server, getReceiverSocketId };
