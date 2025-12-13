const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const { isAuthenticated, isAdmin } = require("./authenticate");
const userRouter = require("./user");
const adminRouter = require("./admin");

const signup = require("../controller/signup");
const login = require("../controller/login");

const USER_PATH = path.join(__dirname, "../user1.json");
const BLOG_PATH = path.join(__dirname, "../blog.json");

// --- Multer Storage (Image Upload) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../uploads1");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});
const upload = multer({ storage });

// ------------------- PUBLIC ROUTES -------------------

router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../src/home.html"));
});

// Authentication Routes
router.get("/login", (req, res) => res.sendFile(path.join(__dirname, "../src/login.html")));
router.post("/login", login); 

router.get("/signup", (req, res) => res.sendFile(path.join(__dirname, "../src/signup.html")));
router.post("/signup", signup);

router.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send("Could not log out.");
        res.redirect("/");
    });
});

// ------------------- BLOG API ROUTES -------------------

// Get all blogs (Publicly accessible)
router.get("/blogs", (req, res) => {
    try {
        const data = fs.readFileSync(BLOG_PATH, "utf-8");
        const blogs = JSON.parse(data || '[]');
        
        let users = [];
        try {
            const userData = fs.readFileSync(USER_PATH, "utf-8");
            users = JSON.parse(userData || '[]');
        } catch (e) { /* Ignore if user data fails, blogs can still load */ }

        // Map author email to name for better frontend display
        const blogsWithNames = blogs.map(blog => {
            const author = users.find(u => u.email === blog.author);
            return {
                ...blog,
                authorName: author ? author.name : blog.author
            };
        });

        res.json({ blogs: blogsWithNames, currentUser: req.session.user || null });
    } catch (err) {
        console.error("Error reading/parsing blog.json:", err);
        res.status(500).json({ error: "Server error fetching blogs" });
    }
});

// Create blog (Requires authentication)
router.post("/submit", isAuthenticated, upload.single("pic"), (req, res) => {
    if (!req.body.title || !req.body.desc || !req.file) {
        return res.status(400).json({ error: "Missing title, description, or image." });
    }
    
    try {
        const { title, desc } = req.body;
        const image = req.file.filename;
        const newBlog = {
            id: Date.now(),
            title,
            desc,
            image,
            author: req.session.user.email,
            likes: [],
            dislikes: [],
            comments: []
        };
        
        let blogs = JSON.parse(fs.readFileSync(BLOG_PATH, "utf-8") || '[]');
        blogs.push(newBlog);
        
        fs.writeFileSync(BLOG_PATH, JSON.stringify(blogs, null, 2));
        res.status(201).json({ success: true, blog: newBlog });
        
    } catch (error) {
        console.error("Blog creation failed:", error);
        res.status(500).json({ error: "Internal Server Error during post creation." });
    }
});

// Like, Dislike, Comment routes (logic remains the same)
router.post("/like/:id", isAuthenticated, (req, res) => {
    const email = req.session.user.email;
    try {
        let blogs = JSON.parse(fs.readFileSync(BLOG_PATH, "utf-8") || '[]');
        blogs = blogs.map(blog => {
            if (blog.id == req.params.id) {
                if (!blog.likes.includes(email)) blog.likes.push(email);
                blog.dislikes = blog.dislikes.filter(e => e !== email);
            }
            return blog;
        });
        fs.writeFileSync(BLOG_PATH, JSON.stringify(blogs, null, 2));
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Server error on like." }); }
});

router.post("/dislike/:id", isAuthenticated, (req, res) => {
    const email = req.session.user.email;
    try {
        let blogs = JSON.parse(fs.readFileSync(BLOG_PATH, "utf-8") || '[]');
        blogs = blogs.map(blog => {
            if (blog.id == req.params.id) {
                if (!blog.dislikes.includes(email)) blog.dislikes.push(email);
                blog.likes = blog.likes.filter(e => e !== email);
            }
            return blog;
        });
        fs.writeFileSync(BLOG_PATH, JSON.stringify(blogs, null, 2));
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Server error on dislike." }); }
});

router.post("/comments/:id", isAuthenticated, (req, res) => {
    const email = req.session.user.email;
    const { comment } = req.body;
    try {
        let blogs = JSON.parse(fs.readFileSync(BLOG_PATH, "utf-8") || '[]');
        blogs = blogs.map(blog => {
            if (blog.id == req.params.id) {
                blog.comments.push({ email, comment });
            }
            return blog;
        });
        fs.writeFileSync(BLOG_PATH, JSON.stringify(blogs, null, 2));
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Server error on comment." }); }
});

// Delete blog (Owner or Admin)
router.delete("/delete/:id", isAuthenticated, (req, res) => {
    const email = req.session.user.email;
    const isUserAdmin = req.session.user.role === "admin";
    
    try {
        let blogs = JSON.parse(fs.readFileSync(BLOG_PATH, "utf-8") || '[]');
        const blogToDelete = blogs.find(b => b.id == req.params.id);
        
        if (!blogToDelete) return res.status(404).json({ error: "Blog not found" });
        
        // Permission Check
        if (blogToDelete.author !== email && !isUserAdmin) {
            return res.status(403).json({ error: "Permission denied: Only the owner or an Admin can delete this post." });
        }
        
        blogs = blogs.filter(b => b.id != req.params.id);
        fs.writeFileSync(BLOG_PATH, JSON.stringify(blogs, null, 2));
        res.json({ success: true, message: "Post deleted." });
        
    } catch (e) {
        console.error("Delete failed:", e);
        res.status(500).json({ error: "Internal Server Error during deletion." });
    }
});

// --- ADMIN-ONLY FUNCTIONALITY ---
// New Route: Admin can delete all posts
router.delete("/admin/delete-all-posts", isAuthenticated, isAdmin, (req, res) => {
    try {
        fs.writeFileSync(BLOG_PATH, JSON.stringify([], null, 2));
        res.json({ success: true, message: "All posts have been successfully deleted by Admin." });
    } catch (e) {
        console.error("Delete all failed:", e);
        res.status(500).json({ error: "Server error deleting all posts." });
    }
});

// ------------------- USER & ADMIN ROUTERS -------------------
router.use("/user", isAuthenticated, userRouter);
router.use("/admin", isAuthenticated, isAdmin, adminRouter);

module.exports = router;