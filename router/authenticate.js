function sendUnauthorizedResponse(req, res, redirectPath = "/login") {
    if (req.accepts('html', 'json') === 'json') {
        return res.status(401).json({ 
            success: false, 
            message: "Unauthorized access: Session expired or user not logged in." 
        });
    }
    res.redirect(redirectPath);
}

function sendForbiddenResponse(req, res, redirectPath = "/user/dashboard") {
    if (req.accepts('html', 'json') === 'json') {
        return res.status(403).json({ 
            success: false, 
            message: "Forbidden: You do not have the required permissions (Admin role required)." 
        });
    }
    res.redirect(redirectPath);
}

function isAuthenticated(req, res, next) {
    if (req.session.user && req.session.user.email) { 
        return next();
    }
    sendUnauthorizedResponse(req, res, "/login");
}

function isAdmin(req, res, next) {
    if (req.session.user?.role === "admin") {
        return next();
    }
    sendForbiddenResponse(req, res, "/user/dashboard");
}

module.exports = { isAuthenticated, isAdmin };