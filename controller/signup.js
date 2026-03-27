const db = require("../db");
const bcrypt = require("bcrypt");

module.exports = async (req, res) => {
    // 1. Email ko bhi destructure karein
    const { name, email, password } = req.body; 
    
    try {
        const hash = await bcrypt.hash(password, 10);
        
        // 2. Check karein users table empty hai ya nahi
        const [users] = await db.execute("SELECT id FROM users");
        const role = users.length === 0 ? 'admin' : 'user';
        
        // 3. INSERT query mein email add karein
        // Note: Agar form mein email nahi hai, toh abhi ke liye dummy email bhej sakte hain
        await db.execute(
            "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)", 
            [name, email || `${name}@test.com`, hash, role]
        );

        res.send("<script>alert('Signup Success!'); window.location.href='/login';</script>");
    } catch (err) { 
        // 4. Debugging ke liye console par error dekhein
        console.error("Signup Error Details:", err.message); 
        
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).send("User already exists!");
        } else {
            res.status(500).send("Database Error: " + err.message);
        }
    }
};