import React, { useState, useEffect } from "react";
import { useChatContext } from "../../context/ChatContext";

const CreateRoomPopup = ({ onClose }) => {
  const [roomName, setRoomName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]); // Selected users
  const { users, createRoom, fetchUsers, error } = useChatContext(); // Use users from context

  // Fetch users when popup is opened
  useEffect(() => {
    fetchUsers(); // Fetch users from the context
  }, [fetchUsers]);

  const handleCreateRoom = async () => {
    if (!roomName.trim() || selectedUsers.length === 0) return;

    try {
      await createRoom(roomName, selectedUsers);
      onClose(); // Close the popup after room is created
    } catch (err) {
      console.error("Error creating room:", err);
    }
  };

  const handleUserSelect = (user) => {
    if (!selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((user) => user._id !== userId));
  };

  return (
    <div className="create-room-overlay">
      <div className="create-room-popup">
        <div className="create-room-header">
          <h3>Create Room</h3>
          <button className="create-room-close" onClick={onClose}>
            ×
          </button>
        </div>

        <input
          type="text"
          className="create-room-input"
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />

        {/* Show error */}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* Display users list */}
        <ul className="create-room-user-list">
          {users.map((user) => (
            <li
              key={user._id}
              className="create-room-user-item"
              onClick={() => handleUserSelect(user)}
            >
              {user.name} <span>+</span>
            </li>
          ))}
        </ul>

        {/* Display selected users */}
        <div>
          <strong>Selected Users:</strong>
          <div className="selected-users">
            {selectedUsers.map((user) => (
              <span key={user._id} className="selected-user">
                {user.name}{" "}
                <button onClick={() => handleRemoveUser(user._id)}>x</button>
              </span>
            ))}
          </div>
        </div>

        <button className="create-room-btn" onClick={handleCreateRoom}>
          Create
        </button>
        <button className="create-room-btn cancel" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CreateRoomPopup;
