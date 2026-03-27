const express = require("express");
const path = require("path");
const session = require("express-session");
const router = require("./router/route");

const app = express();

// 1. CHANGE: Port selection for Cloud
// Render/Railway will provide their own port via process.env.PORT
const PORT = process.env.PORT || 3000; 

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 2. RECOMMENDATION: Use a more secure secret for production
app.use(session({
    secret: process.env.SESSION_SECRET || "keyboard", 
    resave: false,
    saveUninitialized: true,
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000,
        // 3. ADDITION: Secure cookies in production (Optional but good)
        secure: process.env.NODE_ENV === "production" 
    }
}));

// Static folders
app.use("/uploads1", express.static(path.join(__dirname, "uploads1")));
app.use("/css", express.static(path.join(__dirname, "public/css")));

// Main router
app.use("/", router);

// Start server
app.listen(PORT, () => {
    // 4. CHANGE: Dynamic log message
    console.log(`✅ Server running on port ${PORT}`);
});