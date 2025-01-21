import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Create the AuthContext
const AuthContext = createContext();

// Custom hook to access the AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider component that will wrap your app
export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(false); // State to track authentication
    const [user, setUser] = useState(null);  // State to store user data
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const userToken = sessionStorage.getItem('user:token');
        const userDetails = sessionStorage.getItem('user:detail');
        
        if (userToken && userDetails) {
            setAuth(true);
            setUser(JSON.parse(userDetails));  // Parse and set user data from sessionStorage
        }
    }, []);

    // Login function to update the auth state and store data
    const login = (userData) => {
        setAuth(true);
        setUser(userData);
        // Save the token and user data to sessionStorage
        sessionStorage.setItem('user:token', userData.token);
        sessionStorage.setItem('user:detail', JSON.stringify(userData.user));
    };

    // Signup function to register the user
    const signup = async (userData) => {
        try {
            const res = await fetch('https://blackapp-pjs5.onrender.com/api/register', {  // Your register endpoint here
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
    
            if (!res.ok) {
                const errorResponse = await res.json(); // Get error details from the response
                console.error('Signup failed:', errorResponse);
                throw new Error(errorResponse.message || 'Error during signup');
            }
    
            const resData = await res.json();
    
            if (resData.token) {
                login(resData); // Log the user in after successful signup
                navigate('/'); // Redirect to the home page or dashboard
            } else {
                alert('Signup failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during signup:', error);
            alert(`An error occurred during signup: ${error.message}. Please try again later.`);
        }
    };
    
    // Logout function to clear the auth state and navigate to login page
    const logout = () => {
        setAuth(false);
        setUser(null);
        // Clear the sessionStorage
        sessionStorage.removeItem('user:token');
        sessionStorage.removeItem('user:detail');
        navigate('/users/sign_in'); // Navigate to the sign-in page after logout
    };

    return (
        <AuthContext.Provider value={{ auth, user, login, logout, signup, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
