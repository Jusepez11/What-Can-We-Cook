const API_BASE_URL = 'https://api-what-can-we-cook.onrender.com';

/**
 * Get access token from sessionStorage
 * @returns {string|null} - Access token or null
 */
function getAccessToken() {
    return sessionStorage.getItem('access_token');
}

/**
 * Set access token in sessionStorage
 * @param {string} token - Access token
 */
function setAccessToken(token) {
    sessionStorage.setItem('access_token', token);
}

/**
 * Remove access token from sessionStorage
 */
function removeAccessToken() {
    sessionStorage.removeItem('access_token');
}

/**
 * Get authorization headers with bearer token from sessionStorage
 * @returns {Object} - Headers object with Authorization
 */
function getAuthHeaders() {
    const token = getAccessToken();
    if (!token) {
        return {};
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

/**
 * Check if user is authenticated by validating token with backend
 * @returns {Promise<boolean>} - True if authenticated with valid token
 */
async function isAuthenticated() {
    const token = getAccessToken();
    if (!token) {
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            // Token is invalid or expired, remove it
            removeAccessToken();
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error validating authentication:', error);
        // On network error, assume not authenticated to be safe
        return false;
    }
}

/**
 * Check if user has a token (fast, synchronous check)
 * Use this for quick checks where you don't need backend validation
 * @returns {boolean} - True if token exists in storage
 */
function hasToken() {
    return getAccessToken() !== null;
}

/**
 * Redirect to login page if not authenticated
 * @returns {Promise<boolean>} - True if authenticated, false otherwise
 */
async function requireAuth() {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
        // Redirect to login page
        window.location.href = 'Login.html';
        return false;
    }
    return true;
}

/**
 * Get current user information from the API
 * @returns {Promise<Object>} - User object with id, username, email, etc.
 */
async function getCurrentUser() {
    const token = getAccessToken();
    if (!token) {
        throw new Error('Not authenticated');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to get user info');
        }

        return await response.json();
    } catch (error) {
        console.error('Error getting user info:', error);
        throw error;
    }
}

/**
 * Get current user ID from token
 * @returns {Promise<number>} - User ID
 */
async function getCurrentUserId() {
    const userInfo = await getCurrentUser();
    return userInfo.id;
}

/**
 * Login user with username and password
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise<Object>} - Token response
 */
async function login(username, password) {
    try {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(JSON.stringify(error));
        }

        const data = await response.json();

        // Store token in sessionStorage
        setAccessToken(data.access_token);

        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

/**
 * Logout user by removing token and redirecting
 * @param {string} redirectUrl - URL to redirect to after logout (default: index.html)
 */
function logout(redirectUrl = 'index.html') {
    removeAccessToken();
    window.location.href = redirectUrl;
}

/**
 * Register a new user
 * @param {string} username - Username
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {Promise<Object>} - Created user object
 */
async function register(username, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(JSON.stringify(error));
        }

        return await response.json();
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

// Export API_BASE_URL for use in other scripts
window.API_BASE_URL = API_BASE_URL;

