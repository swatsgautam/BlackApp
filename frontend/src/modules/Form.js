import React, { useState } from 'react';
import Button from "../components/Button";
import Input from "../components/Input";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Form = ({ isSignInPage = true }) => {
    const [data, setData] = useState({
        ...(!isSignInPage && { fullName: '' }), // Only add fullName if it's not a sign-in page
        email: '',
        password: ''
    });
    const navigate = useNavigate();
    const { login } = useAuth(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation before submitting
        if (!data.email || !data.password) {
            alert('Email and password are required.');
            return;
        }

        if (!isSignInPage && !data.fullName) {
            alert('Full name is required for signup.');
            return;
        }

        try {
            const resData = isSignInPage 
                ? await fetchLogin(data)
                : await fetchSignup(data);

            if (resData.token) {
                login(resData); // Login after successful signup or login
                navigate('/');
            } else {
                alert('Failed to authenticate. Please try again.');
            }
        } catch (error) {
            console.error('Error during authentication:', error);
            alert('An error occurred. Please try again later.');
        }
    };

    const fetchLogin = async (data) => {
        const res = await fetch('https://blackapp-pjs5.onrender.com/api/login', {  // Login endpoint
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error('Login failed');
        return await res.json();
    };

    const fetchSignup = async (data) => {
        try {
            const res = await fetch('https://blackapp-pjs5.onrender.com/api/register', {  // Signup endpoint
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorResponse = await res.json(); // Capture the error response body
                throw new Error(errorResponse.message || 'Signup failed'); // Display specific error message
            }

            return await res.json();
        } catch (error) {
            console.error('Error during signup:', error);
            alert(`An error occurred during signup: ${error.message}. Please try again later.`);
        }
    };

    return (
        <div className="bg-light h-screen flex items-center justify-center">
            <div className="bg-white w-[600px] h-[800px] shadow-lg rounded-lg flex flex-col justify-center items-center">
                <div className="text-4xl font-extrabold">Welcome {isSignInPage ? 'Back' : 'New User'}</div>
                <div className="text-xl font-light mb-14">{isSignInPage ? 'Sign in to get explored' : 'Sign up to get started'}</div>
                <form className="flex flex-col items-center w-full" onSubmit={handleSubmit}>
                    {!isSignInPage && (
                        <Input
                            label="Full name"
                            name="fullName"
                            placeholder="Enter your full name"
                            className="mb-6 w-[75%]"
                            value={data.fullName}
                            onChange={(e) => setData({ ...data, fullName: e.target.value })}
                        />
                    )}
                    <Input
                        label="Email address"
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        className="mb-6 w-[75%]"
                        value={data.email}
                        onChange={(e) => setData({ ...data, email: e.target.value })}
                    />
                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        placeholder="Enter your Password"
                        className="mb-14 w-[75%]"
                        value={data.password}
                        onChange={(e) => setData({ ...data, password: e.target.value })}
                    />
                    <Button label={isSignInPage ? 'Sign in' : 'Sign up'} type="submit" className="w-[75%] mb-2" />
                </form>
                <div>
                    {isSignInPage ? (
                        "Don't have an account? "
                    ) : (
                        "Already have an account? "
                    )}
                    <span
                        className="text-primary cursor-pointer underline"
                        onClick={() => navigate(`/users/${isSignInPage ? 'sign_up' : 'sign_in'}`)}
                    >
                        {isSignInPage ? 'Sign up' : 'Sign in'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Form;
