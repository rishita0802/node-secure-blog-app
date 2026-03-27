const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt"); // 🚨 MUST BE INSTALLED: npm install bcrypt

module.exports = async (req, res) => {
    const { email, password } = req.body;
    console.log("BODY:", req.body);
console.log("EMAIL:", email);
console.log("PASSWORD:", password);

    const userFilePath = path.join(__dirname, "../user1.json");

    if (!email || !password) {
        return res.status(400).send("Email and password are required.");
    }
    
    try {
        let users = [];
        try {
            const data = fs.readFileSync(userFilePath, "utf-8");
            users = JSON.parse(data || '[]'); 
        } catch (readError) {
            if (readError.code !== 'ENOENT') { 
                console.error("Error reading user data:", readError);
            }
            return res.status(401).send("Invalid credentials");
        }

        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(401).send("Invalid credentials"); 
        }

        // 🚨 Security Fix: Compare Hashed Password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("BCRYPT RESULT:", isMatch);


        if (!isMatch) {
            return res.status(401).send("Invalid credentials");
        }

        const sessionUser = {
            id: user.id || email, 
            name: user.name,
            email: user.email,
            role: user.role
        };
        
        req.session.user = sessionUser;
        
        const redirectPath = user.role === "admin" ? "/admin/dashboard" : "/user/dashboard";
        res.redirect(redirectPath);

    } catch (error) {
        console.error("Login failed:", error);
        res.status(500).send("Internal Server Error during login.");
    }
};