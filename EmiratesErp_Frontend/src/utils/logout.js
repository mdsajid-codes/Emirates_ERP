import { clearThemeFromStorage, applyTheme } from './themeUtils';

/**
 * logout.js — Centralised logout utility.
 *
 * Call this from every handleLogout in the app instead of writing
 * localStorage.clear() + navigate() inline. This ensures the sessionStorage
 * company cache is always cleared on logout, so the next user gets fresh data.
 */

/**
 * Clears all auth data from localStorage and the company info cache from
 * sessionStorage, then navigates to the login page.
 *
 * @param {Function} navigate - The navigate function from useNavigate().
 */
export const logout = (navigate) => {
    // Clear auth tokens, roles, modules, etc.
    localStorage.clear();

    // Clear the company info / logo cache so a different tenant on the same
    // browser session doesn't see the previous company's data.
    sessionStorage.removeItem('company_name');
    sessionStorage.removeItem('company_logo');

    // Reset theme to defaults
    clearThemeFromStorage();
    applyTheme(null);

    navigate('/login');
};
