# Chat Application with Video Calls and JWT Authentication


## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Socket Events](#socket-events)
- [Image Upload](#image-upload)
- [Error Handling](#error-handling)

## Introduction

This is a real-time **chat application** built with **Node.js**, **Socket.IO**, and **MongoDB**. The app supports:
- **JWT Authentication**
- **Real-time messaging**
- **Video calls** using **WebRTC**
- **Profile management** with image upload

## Features

- **User Authentication**: JWT-based authentication for login and registration.
- **Real-time Messaging**: Users can chat with each other in real-time.
- **Video Calls**: Users can initiate and answer video calls via WebRTC.
- **Profile Management**: Users can update their profile details and profile picture.
- **Image Upload**: Supports image upload for both profile images and chat messages.
- **Persistent Chat Data**: All messages and profiles are stored in MongoDB.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Real-time Communication**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: `multer` for image uploads
- **WebRTC**: Real-time communication for video calls
- **Frontend**: HTML, CSS, JavaScript


## Installation

To set up and run this project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/chat-app.git
2. Navigate into the project directory::
   ```bash
   cd chat-App
3. Install the necessary dependencies::
   ```bash
   npm install

# Environment Variables

1. Create a .env file in the project root with the following keys:
   ```bash
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/chatApp
   ACCESS_TOKEN_SECRET=your_access_token_secret
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   
Replace your_access_token_secret and your_refresh_token_secret with secure random strings.

# Usage

1. Start mongoDB
   ```bash
   mongod
2. Run the server
   ```bash
   npm start
3. Run the app in your browser
   ```bash
   http://localhost:3000

# API Documentation

**Authentication Routes**
POST /auth/register: Register a new user.
POST /auth/login: Login and obtain access tokens.
POST /auth/refresh: Refresh the access token using a refresh token.

**Profile Routes**
GET /profile?id={userId}: Get user profile by ID.
PUT /profile?id={userId}: Update user profile information (username, profile picture).

**Contact Routes**
GET /contact: Get a list of user contacts.
POST /contact/add: Add a new contact.
DELETE /contact/remove: Remove a contact.

**Image Upload Route**
POST /upload-image: Upload an image as part of the chat.

# Socket Events

**Client-Side Events**
'entered': Registers the user’s connection.
'joinRoom': Join a specific room and load previous chat messages.
'chatMessage': Send a new chat message to a room.
'call-user': Initiate a video call with another user.
'call-answered': Answer an incoming call.
'call-declined': Decline an incoming call.
'ice-candidate': Send ICE candidates for WebRTC connection.

**Server-Side Events**
'receiveMessage': Receive a new chat message.
'call-made': Notify when a video call is made.
'call-answered': Notify when a video call is answered.
'call-declined': Notify when a video call is declined.
'ice-candidate': Share ICE candidates for WebRTC.

# Image Upload
Images can be uploaded for both profile pictures and chat messages. The multer middleware handles file uploads and stores them in the /uploads directory.

**Profile Images**: Users can change profile pictures using the profile route.
**Chat Images**: Users can send images within chat messages.

# Error Handling
**Authentication Errors**: Handles invalid or expired JWT tokens.
**MongoDB Errors**: Catches errors related to MongoDB queries and connection.
**File Upload Errors**: Handles errors during file upload, such as invalid file types or missing files.


