const express = require("express");
const path = require("path");
const router = express.Router();

// User dashboard redirects to the post creation page
router.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "../src/upload.html"));
});

module.exports = router;