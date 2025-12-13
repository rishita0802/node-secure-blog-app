const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt"); // MUST BE INSTALLED: npm install bcrypt

module.exports = async (req, res) => {
    const { name, email, password } = req.body;
    const userRole = "user"; // Security Fix: Hardcode default role

    if (!name || !email || !password) {
        return res.status(400).send("All fields (name, email, password) are required.");
    }
    
    const userFilePath = path.join(__dirname, "../user1.json");

    try {
        let users = [];
        try {
            const data = fs.readFileSync(userFilePath, "utf-8");
            users = JSON.parse(data || '[]'); 
        } catch (readError) {
            if (readError.code !== 'ENOENT') { 
                console.error("Error reading user data:", readError);
            }
        }

        if (users.find(u => u.email === email)) {
            return res.status(409).send("User with this email already exists.");
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = { 
            name, 
            email, 
            password: hashedPassword, // Store the hash
            role: userRole 
        };
        users.push(newUser);

        fs.writeFileSync(userFilePath, JSON.stringify(users, null, 2));

        res.redirect("/login");
        

    } catch (error) {
        console.error("Signup failed:", error);
        res.status(500).send("Internal Server Error during registration.");
    }
};