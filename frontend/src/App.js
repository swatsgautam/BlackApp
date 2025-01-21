import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './modules/Dashboard';
import Form from './modules/Form';
import Profile from './modules/Profile';

const ProtectedRoute = ({ children, auth = false }) => {
    const { auth: isLoggedIn } = useAuth();

    if (!isLoggedIn && auth) {
        return <Navigate to={'/users/sign_in'} />;
    } else if (isLoggedIn && ['/users/sign_in', '/users/sign_up'].includes(window.location.pathname)) {
        return <Navigate to={'/'} />;
    }

    return children;
};

const Logout = () => {
    const { logout } = useAuth();
    logout(); // Call logout function to log out the user and navigate to sign-in page
    return null; // Return nothing as navigation will handle the redirect
};

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path='/' element={
                    <ProtectedRoute auth={true}>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                <Route path='/users/sign_in' element={
                    <ProtectedRoute>
                        <Form isSignInPage={true} />
                    </ProtectedRoute>
                } />
                <Route path='/users/sign_up' element={
                    <ProtectedRoute>
                        <Form isSignInPage={false} />
                    </ProtectedRoute>
                } />
                <Route path="/profile" element={<Profile />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/" element={<Navigate to="/users/sign_in" />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;
