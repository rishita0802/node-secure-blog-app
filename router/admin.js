const express = require("express");
const path = require("path");
const router = express.Router();

// Admin dashboard serves the admin panel HTML
router.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "../src/admin.html"));
});

module.exports = router;