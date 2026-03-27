/**
 * Helper function: Jab user login na ho aur kisi protected route (like Create Post) 
 * ko access karne ki koshish kare.
 */
function sendUnauthorizedResponse(req, res, redirectPath = "/login") {
    // Agar frontend AJAX/Fetch se request bhej raha hai (JSON response chahiye)
    if (req.accepts('html', 'json') === 'json') {
        return res.status(401).json({ 
            success: false, 
            message: "Unauthorized access: Session expired or user not logged in." 
        });
    }
    // Agar normal browser se page access kar raha hai (Redirect)
    res.redirect(redirectPath);
}

/**
 * Helper function: Jab user login toh ho, par uske paas Admin permissions na hon.
 */
function sendForbiddenResponse(req, res, redirectPath = "/") {
    if (req.accepts('html', 'json') === 'json') {
        return res.status(403).json({ 
            success: false, 
            message: "Forbidden: You do not have the required permissions (Admin role required)." 
        });
    }
    res.redirect(redirectPath);
}

/**
 * Middleware: Check karta hai ki user logged in hai ya nahi.
 * FIX: Humne 'email' ko hatakar 'username' kiya hai kyunki session mein wahi save ho raha hai.
 */
function isAuthenticated(req, res, next) {
    if (req.session.user && req.session.user.username) { 
        return next();
    }
    sendUnauthorizedResponse(req, res, "/login");
}

/**
 * Middleware: Check karta hai ki logged-in user ka role 'admin' hai ya nahi.
 */
function isAdmin(req, res, next) {
    // Optional chaining (?.) use kiya hai taaki agar user object null ho toh error na aaye
    if (req.session.user && req.session.user.role === "admin") {
        return next();
    }
    sendForbiddenResponse(req, res, "/"); // Admin nahi hai toh Home page par bhej do
}

module.exports = { isAuthenticated, isAdmin };