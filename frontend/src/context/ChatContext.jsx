import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios"; // Or use Fetch API
import { useAuthContext } from "./AuthContext"; // Assuming you have an AuthContext for auth

const ChatContext = createContext();

export const useChatContext = () => {
  return useContext(ChatContext);
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuthContext(); // Assuming user data is in AuthContext
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  // Function to fetch users
  const fetchUsers = async () => {
    try {
      setError(null); // Reset any previous errors
      const response = await axios.get(
        "/api/rooms/users",
        {
          headers: {
            Authorization: `Bearer ${user.token}`, // Pass the user's token for authentication
          },
        }
      );
      setUsers(response.data); // Set the users in state
    } catch (err) {
      setError("Error fetching users");
      console.error("Error fetching users:", err);
    }
  };

  const createRoom = async (roomName, selectedUsers) => {
    // Implement room creation logic here
  };

  useEffect(() => {
    if (user) {
      fetchUsers(); // Fetch users when the user is logged in
    }
  }, [user]);

  return (
    <ChatContext.Provider value={{ users, fetchUsers, createRoom, error }}>
      {children}
    </ChatContext.Provider>
  );
};
