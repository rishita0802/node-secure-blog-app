require('dotenv').config(); // Sabse pehli line
const express = require('express');
const db = require('./db'); // Ye line add karein (check karein path sahi ho)
const path = require("path");
const session = require("express-session");
const router = require("./router/route");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: "blogger-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.use("/uploads1", express.static(path.join(__dirname, "uploads1")));
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use(express.static(path.join(__dirname, "src")));

app.use("/", router);

db.execute("SELECT 1")
  .then(() => console.log("✅ TiDB Connected!"))
  .catch((err) => console.log("❌ TiDB Connection Error:", err.message));   

app.listen(3000, (err) => {
    if (err) console.error("Error starting server:", err);
    else console.log("Server running on http://localhost:3000"); 
    
});