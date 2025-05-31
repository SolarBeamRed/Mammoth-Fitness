const auth = async (req, res, next) => {
    try {
        // Check if user is logged in via session
        if (!req.session.user) {
            // If it's an API request, return 401
            if (req.path.startsWith('/api/')) {
                return res.status(401).json({ message: 'Please log in to continue' });
            }
            // For non-API requests, redirect to login
            return res.redirect('/login.html');
        }

        // Add user from session to request object
        req.user = req.session.user;
        
        next();
    } catch (error) {
        console.error('Auth error:', error);
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ message: 'Authentication error' });
        }
        res.redirect('/login.html');
    }
};

module.exports = auth;