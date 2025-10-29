# 💬 Chat App with Backend Auto Response

## Overview
A full-stack chat application built with **React**, **Express.js**, and **MongoDB (Atlas)**.  
It features authentication, real-time chat with backend auto responses (random quotes),  
and a clean, adaptive UI — all without using any external UI libraries.

---

## Features

### 🔐 Authentication
- Login with **email** and **password**
- JWT-based authorization
- Protected routes (chats available only for authorized users)
- Logout functionality

### 💬 Chat Functionality
- Display list of chats (3 predefined + ability to add new ones)
- Create, update, and delete chats  
  - Deletion requires confirmation  
- Search chats by name
- Send messages (auto-response from backend after 3 seconds using a random quote API)
- Toast notifications for new messages
- Adaptive layout:
  - Left: chat list (resizable or collapsible)
  - Right: active chat view

### ⚡ Additional
- Real-time messaging via **Socket.io**
- Optional live mode: messages automatically sent to random chats
- Update your own messages
- SVG icons from **Heroicons**
- No UI frameworks — only **HTML + CSS**

---

## 🧩 Tech Stack

**Frontend**
- React (JS/TS)
- HTML, CSS
- Heroicons (as SVG)
- Axios (API requests)
- Context API for state management
- React Router for navigation

**Backend**
- Node.js + Express.js
- MongoDB (Atlas)
- Mongoose (ODM)
- JWT for authentication
- Bcrypt for password hashing
- Socket.io for live chat

---

## 🚀 Installation & Setup
1. Clone the repository   
```
git clone https://github.com/your-username/chat-app.git   
cd chat-app
```
2. Install dependencies
```
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```
3. Run development servers
```
# Backend
npm run dev  # runs on http://localhost:5000

# Frontend
npm runn dev    # runs on http://localhost:5173
```
4. Create a `.env` file in the `server/` folder

## Random Quote Auto Response

The backend automatically sends a random quote as an auto-reply
after 3 seconds using one of the following APIs:

ZenQuotes API