# Node Secure Blog App (Deep Ocean Theme)

## 🚀 Overview
This project is a secure, full-featured blogging platform built using **Node.js** and the **Express** framework. The frontend is rendered using **vanilla JavaScript** and HTML, styled with a modern Deep Ocean/Dark Mode CSS theme.

It showcases robust back-end security practices, including proper password hashing and strict Role-Based Access Control (RBAC), making it a solid foundation for a full-stack application.

## ✨ Key Features

### Security & Authentication
* **Secure Signup/Login:** Uses the `bcrypt` library to securely hash and store user passwords.
* **Role-Based Access Control (RBAC):** Strict middleware ensures access separation:
    * `Admin`: Can delete *any* post and execute the "Delete All Posts" command.
    * `User`: Can only delete their *own* posts and interact with posts (like/comment).
* **Session Management:** Uses `express-session` for stateful authentication.

### Functionality
* **Post Management (CRUD):** Users can create, view, and delete their own blog posts.
* **User Interaction:** Logged-in users can **Like**, **Dislike**, and **Comment** on any post.
* **File Uploads:** Handles image uploads for posts using **Multer**.

## 🛠️ Installation and Setup

### Prerequisites
* Node.js (LTS recommended)
* npm (Node Package Manager)
* Git

### Step 1: Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/node-secure-blog-app.git](https://github.com/YOUR_USERNAME/node-secure-blog-app.git)
cd node-secure-blog-app