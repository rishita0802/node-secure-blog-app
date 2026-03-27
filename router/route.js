const express = require("express");
const router = express.Router();
const path = require("path");
const db = require("../db");
const multer = require("multer");
const signup = require("../controller/signup");
const login = require("../controller/login");
const { isAuthenticated, isAdmin } = require("./authenticate");

const upload = multer({ dest: "uploads1/" });

// --- PAGE ROUTES ---
router.get("/", (req, res) => res.sendFile(path.join(__dirname, "../src/home.html")));
router.get("/login", (req, res) => res.sendFile(path.join(__dirname, "../src/login.html")));
router.get("/signup", (req, res) => res.sendFile(path.join(__dirname, "../src/signup.html")));
router.get("/user/dashboard", isAuthenticated, (req, res) => res.sendFile(path.join(__dirname, "../src/upload.html")));
router.get("/admin/dashboard", isAdmin, (req, res) => res.sendFile(path.join(__dirname, "../src/admin.html")));

// --- AUTH ---
router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", (req, res) => req.session.destroy(() => res.redirect("/")));

// --- FETCH BLOGS ---
router.get("/blogs", async (req, res) => {
    try {
        const [blogs] = await db.execute("SELECT * FROM blogs ORDER BY id DESC");
        const formattedBlogs = blogs.map(blog => {
            const safeParse = (data) => {
                try {
                    if (!data) return [];
                    return (typeof data === 'string') ? JSON.parse(data) : data;
                } catch (e) { return []; }
            };
            return {
                ...blog,
                likes: safeParse(blog.likes),
                dislikes: safeParse(blog.dislikes),
                comments: safeParse(blog.comments)
            };
        });
        res.json({ blogs: formattedBlogs, currentUser: req.session.user || null });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// --- SUBMIT BLOG (Admin & User both can post) ---
router.post("/submit", isAuthenticated, upload.single("pic"), async (req, res) => {
    try {
        const { title, desc } = req.body;
        const img = req.file ? req.file.filename : null;
        const user = req.session.user.username;
        await db.execute("INSERT INTO blogs (title, `desc`, image, author, authorName, likes, dislikes, comments) VALUES (?,?,?,?,?, '[]','[]','[]')", 
            [title, desc, img, user, user]);
        res.json({ message: "Success" });
    } catch (err) { res.status(500).json({ error: "Upload failed" }); }
});

// --- LIKE LOGIC ---
router.post("/like/:id", isAuthenticated, async (req, res) => {
    const username = req.session.user.username;
    try {
        const [rows] = await db.execute("SELECT likes FROM blogs WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).send("Not found");
        let likes = JSON.parse(rows[0].likes || "[]");
        if (!likes.includes(username)) {
            likes.push(username);
            await db.execute("UPDATE blogs SET likes = ? WHERE id = ?", [JSON.stringify(likes), req.params.id]);
        }
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- DISLIKE LOGIC ---
router.post("/dislike/:id", isAuthenticated, async (req, res) => {
    const username = req.session.user.username;
    try {
        const [rows] = await db.execute("SELECT dislikes FROM blogs WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).send("Not found");
        let dislikes = JSON.parse(rows[0].dislikes || "[]");
        if (!dislikes.includes(username)) {
            dislikes.push(username);
            await db.execute("UPDATE blogs SET dislikes = ? WHERE id = ?", [JSON.stringify(dislikes), req.params.id]);
        }
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- COMMENT LOGIC ---
router.post("/comments/:id", isAuthenticated, async (req, res) => {
    const { comment } = req.body;
    const username = req.session.user.username;
    try {
        const [rows] = await db.execute("SELECT comments FROM blogs WHERE id = ?", [req.params.id]);
        let currentComments = JSON.parse(rows[0].comments || "[]");
        currentComments.push({ username, text: comment, date: new Date().toLocaleString() });
        await db.execute("UPDATE blogs SET comments = ? WHERE id = ?", [JSON.stringify(currentComments), req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Comment failed" }); }
});

// --- DELETE (Admin can delete anything) ---
router.delete("/delete/:id", isAuthenticated, async (req, res) => {
    try {
        const [blog] = await db.execute("SELECT author FROM blogs WHERE id = ?", [req.params.id]);
        if (blog.length > 0) {
            const isAuthor = blog[0].author === req.session.user.username;
            const isAdmin = req.session.user.role === 'admin';
            if (isAuthor || isAdmin) {
                await db.execute("DELETE FROM blogs WHERE id = ?", [req.params.id]);
                return res.json({ message: "Deleted" });
            }
        }
        res.status(403).json({ message: "Unauthorized" });
    } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});

module.exports = router;