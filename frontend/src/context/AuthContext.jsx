import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("chat-user");

    if (storedUser && storedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(storedUser);
        setAuthUser(parsedUser);
      } catch (error) {
        console.error("Error parsing 'chat-user' from localStorage", error);
        // Optionally clear invalid entry from localStorage
        localStorage.removeItem("chat-user");
      }
    }
  }, []);
  // Update profile picture
  const updateProfilePic = (newPic) => {
    setAuthUser((prevUser) => ({
      ...prevUser,
      profilePic: newPic,
    }));
  };

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser, updateProfilePic }}>
      {children}
    </AuthContext.Provider>
  );
};
