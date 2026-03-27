const db = require("../db");
const bcrypt = require("bcrypt");

module.exports = async (req, res) => {
    const { email, password } = req.body; // email field uses username
    try {
        const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [email]);
        if (rows.length === 0) return res.status(401).send("User not found");

        const user = rows[0];
        if (await bcrypt.compare(password, user.password)) {
            req.session.user = { id: user.id, username: user.username, role: user.role };
            req.session.save(() => res.redirect("/"));
        } else { res.status(401).send("Wrong password"); }
    } catch (err) { res.status(500).send("Error"); }
};