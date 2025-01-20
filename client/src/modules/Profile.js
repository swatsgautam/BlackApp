import React, { useState, useEffect } from 'react';

const Profile = ({ isOpen, onClose }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user:detail')));
  const [newPhoto, setNewPhoto] = useState(null);

  // Load user data from localStorage on page load
  useEffect(() => {
    if (user) {
      setUser(JSON.parse(localStorage.getItem('user:detail')));
    }
  }, [user]);

  // Handle the photo change
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhoto(reader.result); // Set the uploaded image to display immediately
      };
      reader.readAsDataURL(file);
    }
  };

  // Save the updated photo to localStorage
  const handleSaveProfile = () => {
    const updatedUser = { ...user, photo: newPhoto || user.photo }; // Save the new photo or the existing one
    setUser(updatedUser); // Update the user state
    localStorage.setItem('user:detail', JSON.stringify(updatedUser)); // Save to localStorage
    alert('Profile updated successfully!');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96 relative">
            {/* Close Icon */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-xl text-gray-500 hover:text-black"
            >
              &times;
            </button>
            <h2 className="text-2xl mb-4">Profile</h2>
            <div className="profile-details">
              <div className="profile-photo">
                {/* Display the updated photo or default image */}
                <img
                  src={newPhoto || user?.photo || 'default-photo.jpg'}
                  alt="Profile"
                  width={100}
                  height={100}
                  className="rounded-full"
                />
                <input type="file" onChange={handlePhotoChange} />
              </div>
              <div className="profile-info mt-4">
                <h3>{user?.fullName}</h3>
                <p>{user?.email}</p>
                <button
                  onClick={handleSaveProfile}
                  className="mt-4 px-6 py-2 bg-blue-500 text-white rounded"
                >
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
