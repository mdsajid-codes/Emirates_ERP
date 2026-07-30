export const DEFAULT_THEME = {
    primaryColor: '#1a237e',
    primaryForegroundColor: '#ffffff',
    secondaryColor: '#ffffff',
    accentColor: '#1e3a8a',
    backgroundColor: '#f1f5f9',
    textColor: '#0f172a',
    errorColor: '#ef4444',
    successColor: '#22c55e',
    warningColor: '#f59e0b',
    infoColor: '#3b82f6',
    sidebarBgColor: '#1e293b',
    sidebarTextColor: '#f8fafc',
    sidebarActiveColor: '#334155',
    sidebarHoverColor: '#475569',
    headerBgColor: '#ffffff',
    headerTextColor: '#0f172a',
    footerBgColor: '#ffffff',
    footerTextColor: '#64748b',
    surfaceColor: '#ffffff',
    borderColor: '#e2e8f0',
    hoverColor: '#f8fafc',
    linkColor: '#2563eb',
    fontFamily: 'Inter',
    fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    borderRadius: '0.5rem',
    darkMode: false,
};

export const POS_FALLBACK_THEME = {
    // Layout
    sidebarBg: '#B9D9D5',
    sidebarActive: '#97B3AE',
    sidebarActiveFg: '#1b2421',
    sidebarText: '#2d4542',
    sidebarHover: '#C4DADE',
    cardBg: '#C4DADE',
    cardAlt: '#DDEBED',
    pageBg: '#ECF2F5',
    accent: '#D2E0D3',
    accentFg: '#2d4542',
    primary: '#97B3AE',
    text: '#1e2e2c',
    textMuted: '#5a7875',

    // Status badges
    success: '#dcfce7',
    successFg: '#15803d',
    warning: '#fef9c3',
    warningFg: '#a16207',
    error: '#fee2e2',
    errorFg: '#dc2626',
    info: '#dbeafe',
    infoFg: '#1d4ed8',

    // Bar Chart
    barRevenue: '#97B3AE',
    barProfit: '#C4DADE',
    barLabelBg: '#2d4542',
    barLabelFg: '#ffffff',

    // Donut Chart
    donutSeg1: '#97B3AE',
    donutSeg2: '#C4DADE',
    donutSeg3: '#B9D9D5',
    donutSeg4: '#D2E0D3',
    donutCenter: '#2d4542',

    // Top Products mini-bar chart
    dayBar: '#97B3AE',
};

const THEME_STORAGE_KEY = 'tenant_theme';

/**
 * Saves the theme object to localStorage.
 * @param {Object} theme 
 */
export const saveThemeToStorage = (theme) => {
    if (!theme) return;
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
};

/**
 * Loads the theme object from localStorage.
 * @returns {Object|null}
 */
export const loadThemeFromStorage = () => {
    try {
        const theme = localStorage.getItem(THEME_STORAGE_KEY);
        return theme ? JSON.parse(theme) : null;
    } catch (e) {
        console.error("Failed to parse theme from localStorage", e);
        return null;
    }
};

/**
 * Clears the theme from localStorage.
 */
export const clearThemeFromStorage = () => {
    localStorage.removeItem(THEME_STORAGE_KEY);
};

/**
 * Applies the given theme object to the DOM via CSS variables.
 * If a field is null or undefined, it falls back to DEFAULT_THEME.
 * If the whole object is null, applying DEFAULT_THEME.
 * @param {Object|null} theme 
 */
export const applyTheme = (theme) => {
    const root = document.documentElement;
    const activeTheme = theme || {};

    // Helper to get value
    const getVal = (key) => activeTheme[key] || DEFAULT_THEME[key];

    // Colors
    root.style.setProperty('--color-primary', getVal('primaryColor'));
    root.style.setProperty('--color-primary-foreground', getVal('primaryForegroundColor'));
    root.style.setProperty('--color-secondary', getVal('secondaryColor'));
    root.style.setProperty('--color-accent', getVal('accentColor'));
    root.style.setProperty('--color-background', getVal('backgroundColor'));
    
    // Create muted background (slightly darker/lighter based on theme) - keeping simple for now
    root.style.setProperty('--color-background-muted', getVal('backgroundColor'));

    root.style.setProperty('--color-foreground', getVal('textColor'));
    root.style.setProperty('--color-foreground-muted', getVal('textColor')); // Simplified
    
    root.style.setProperty('--color-error', getVal('errorColor'));
    root.style.setProperty('--color-success', getVal('successColor'));
    root.style.setProperty('--color-warning', getVal('warningColor'));
    root.style.setProperty('--color-info', getVal('infoColor'));

    root.style.setProperty('--color-sidebar-bg', getVal('sidebarBgColor'));
    root.style.setProperty('--color-sidebar-text', getVal('sidebarTextColor'));
    root.style.setProperty('--color-sidebar-active', getVal('sidebarActiveColor'));
    root.style.setProperty('--color-sidebar-hover', getVal('sidebarHoverColor'));

    root.style.setProperty('--color-header-bg', getVal('headerBgColor'));
    root.style.setProperty('--color-header-text', getVal('headerTextColor'));

    root.style.setProperty('--color-footer-bg', getVal('footerBgColor'));
    root.style.setProperty('--color-footer-text', getVal('footerTextColor'));

    root.style.setProperty('--color-card', getVal('surfaceColor'));
    root.style.setProperty('--color-card-foreground', getVal('textColor'));
    root.style.setProperty('--color-border', getVal('borderColor'));
    root.style.setProperty('--color-hover', getVal('hoverColor'));
    root.style.setProperty('--color-link', getVal('linkColor'));
    root.style.setProperty('--color-input', getVal('borderColor')); // Reusing border for input

    // Visual styles
    root.style.setProperty('--theme-border-radius', getVal('borderRadius'));
    
    const fontFamily = getVal('fontFamily');
    if (fontFamily) {
        root.style.setProperty('--font-family-sans', `"${fontFamily}", sans-serif`);
    }

    // Handle Font loading dynamically if provided
    const fontUrl = getVal('fontUrl');
    if (fontUrl) {
        let link = document.getElementById('dynamic-theme-font');
        if (!link) {
            link = document.createElement('link');
            link.id = 'dynamic-theme-font';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
        if (link.href !== fontUrl) {
            link.href = fontUrl;
        }
    }

    // Handle Favicon
    const faviconUrl = getVal('faviconUrl');
    if (faviconUrl) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = faviconUrl;
    }

    // Handle Dark Mode
    const isDarkMode = getVal('darkMode');
    if (isDarkMode) {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
};

/**
 * Initializes the theme on startup.
 */
export const initializeTheme = () => {
    const theme = loadThemeFromStorage();
    applyTheme(theme);
};
