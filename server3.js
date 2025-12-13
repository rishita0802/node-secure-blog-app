const express = require("express");
const path = require("path");
const session = require("express-session");
const router = require("./router/route");

const app = express();
const PORT = 3000;

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session setup
app.use(session({
 secret: "keyboard", // Change this to a long, random string in production
  resave: false,
saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Static folders
// IMPORTANT: Ensure 'uploads1' and 'public/css' folders exist!
app.use("/uploads1", express.static(path.join(__dirname, "uploads1")));
app.use("/css", express.static(path.join(__dirname, "public/css")));

// Main router
app.use("/", router);

// Start server
app.listen(PORT, () => {
 console.log(`✅ Server running at http://localhost:${PORT}`);
});