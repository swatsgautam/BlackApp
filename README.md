# Real-Time Chat Application

A real-time chat application built with React, Node.js, and WebSocket for instant messaging and communication. The app includes user authentication (signup/signin), a user dashboard displaying user details, a people list to view available users, real-time messaging, and a calling feature.

## Features

- **Signup and Signin**: Users can sign up and log in using their credentials. The user session is stored using session storage.
- **Dashboard**: Once signed in, users can view their profile and related information on the dashboard.
- **User List**: A list of users available for chat is displayed. Users can click on a profile to start a conversation.
- **Chat with Individual Users**: Real-time chat with individual users. Messages are sent and received instantly.
- **Real-time Messaging**: Uses WebSocket to ensure real-time communication between users.
- **Calling Feature**: Users can initiate voice or video calls with other users.

## Technologies Used

- **Frontend**: React, React Router, WebSocket
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (for storing user details and message history)
- **Authentication**: JWT for user authentication
- **Real-Time Communication**: WebSocket for real-time messaging and calling

## Installation

### Prerequisites

Before you start, ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/try/download/community) (local or cloud database)
- [Git](https://git-scm.com/)

### Clone the repository

Clone this repository to your local machine:

```bash
git clone https://github.com/swatsgautam/BlackApp.git
