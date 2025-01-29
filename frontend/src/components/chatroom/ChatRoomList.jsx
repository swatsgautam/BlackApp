// components/ChatRoomList.js
import { useState, useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext";
import axios from "axios";

const ChatRoomList = () => {
  const { authUser } = useAuthContext();
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [newRoomPrivate, setNewRoomPrivate] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get("/api/chatRooms");
        setRooms(res.data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };
    fetchRooms();
  }, []);

  const createRoom = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/chatRooms/create", {
        name: newRoomName,
        description: newRoomDescription,
        isPrivate: newRoomPrivate,
      });
      setRooms([...rooms, res.data]);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const joinRoom = async (roomId) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/chatRooms/join/${roomId}`);
      console.log("Joined room:", res.data);
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  return (
    <div>
      <h2>Chat Rooms</h2>
      <div>
        <input
          type="text"
          placeholder="Room Name"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
        />
        <textarea
          placeholder="Room Description"
          value={newRoomDescription}
          onChange={(e) => setNewRoomDescription(e.target.value)}
        />
        <label>
          Private:
          <input
            type="checkbox"
            checked={newRoomPrivate}
            onChange={(e) => setNewRoomPrivate(e.target.checked)}
          />
        </label>
        <button onClick={createRoom}>Create Room</button>
      </div>
      <ul>
        {rooms.map((room) => (
          <li key={room._id}>
            {room.name} ({room.isPrivate ? "Private" : "Public"})
            <button onClick={() => joinRoom(room._id)}>Join</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatRoomList;
