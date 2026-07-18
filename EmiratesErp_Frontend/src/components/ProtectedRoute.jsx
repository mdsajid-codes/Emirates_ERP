import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute — Guards a route behind authentication and optional role checks.
 *
 * @param {React.ReactNode} children     - The page/component to render if access is granted.
 * @param {string[]}        allowedRoles - Optional. If provided, the user must have at least
 *                                         one of these roles. If omitted, any authenticated
 *                                         user (with a valid token) is allowed through.
 *
 * Access rules (checked in order):
 *  1. No token in localStorage       → redirect to /login
 *  2. allowedRoles provided but user
 *     has none of them               → redirect to /login
 *  3. All checks pass                → render children
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');

    // 1. Not authenticated at all
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 2. Role-based check (only when allowedRoles is specified)
    if (allowedRoles && allowedRoles.length > 0) {
        try {
            const roles = JSON.parse(localStorage.getItem('roles') || '[]');
            const hasAccess = allowedRoles.some(role => roles.includes(role));
            if (!hasAccess) {
                return <Navigate to="/login" replace />;
            }
        } catch {
            // Malformed roles data — treat as unauthorised
            return <Navigate to="/login" replace />;
        }
    }

    // 3. All checks passed
    return children;
};

export default ProtectedRoute;
