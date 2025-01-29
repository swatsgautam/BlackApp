import { useState } from "react";
import Conversations from "./Conversations";
import LogoutButton from "./LogoutButton";
import SearchInput from "./SearchInput";
import { useAuthContext } from "../../context/AuthContext";
import { BsCamera } from "react-icons/bs";

const Sidebar = () => {
  const { authUser, updateProfilePic } = useAuthContext(); 
  const [isEditing, setIsEditing] = useState(false);
  const [newPic, setNewPic] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPic(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (newPic) {
      updateProfilePic(newPic); // Update the profile picture in context
      setIsEditing(false);
    }
  };

  return (
    <div className="sidebar-container">
      <div className="user-details">
        <div className="user-profile">
          <img
            src={newPic || authUser.profilePic} // Show new picture if available, else the old one
            alt="Profile"
            className="profile-pic"
            onClick={() => setIsEditing(true)} // On click, start editing
          />
          <div className="username">{authUser.fullName}</div>
        </div>
      </div>

      {isEditing && (
        <div className="profile-pic-edit">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input"
          />
          <button onClick={handleSubmit} className="submit-btn">
            <BsCamera /> Save
          </button>
        </div>
      )}

      <SearchInput />
      {/* Create Room Button */}
      <button className="create-room-btn" onClick={() => setShowPopup(true)}>
        + Create Room
      </button>

      {/* Render Popup if showPopup is true */}
      {showPopup && <CreateRoomPopup onClose={() => setShowPopup(false)} />}
      <div className="divider"></div>
      <Conversations />
      <LogoutButton />
    </div>
  );
};
export default Sidebar;
