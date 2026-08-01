import { useState, useEffect } from 'react';
import axios from 'axios';
import { POS_FALLBACK_THEME } from '../../utils/themeUtils';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const HRMS_THEME_STORAGE_KEY = 'hrms_active_theme';

export function useHrmsTheme() {
    const [hrmsTheme, setHrmsTheme] = useState(() => {
        try {
            const cached = sessionStorage.getItem(HRMS_THEME_STORAGE_KEY);
            return cached ? JSON.parse(cached) : POS_FALLBACK_THEME;
        } catch {
            return POS_FALLBACK_THEME;
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHrmsTheme = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/themes/active`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });

                const apiTheme = res.data;
                if (apiTheme) {
                    const mappedTheme = {
                        ...POS_FALLBACK_THEME,
                        sidebarBg: apiTheme.sidebarBgColor || apiTheme.primaryColor || POS_FALLBACK_THEME.sidebarBg,
                        sidebarActive: apiTheme.sidebarActiveColor || apiTheme.accentColor || POS_FALLBACK_THEME.sidebarActive,
                        sidebarActiveFg: '#ffffff',
                        sidebarText: apiTheme.sidebarTextColor || POS_FALLBACK_THEME.sidebarText,
                        sidebarHover: apiTheme.sidebarHoverColor || POS_FALLBACK_THEME.sidebarHover,
                        cardBg: apiTheme.surfaceColor || apiTheme.secondaryColor || POS_FALLBACK_THEME.cardBg,
                        cardAlt: apiTheme.backgroundColor || POS_FALLBACK_THEME.cardAlt,
                        pageBg: apiTheme.backgroundColor || POS_FALLBACK_THEME.pageBg,
                        accent: apiTheme.accentColor || POS_FALLBACK_THEME.accent,
                        accentFg: apiTheme.textColor || POS_FALLBACK_THEME.accentFg,
                        primary: apiTheme.primaryColor || POS_FALLBACK_THEME.primary,
                        text: apiTheme.textColor || POS_FALLBACK_THEME.text,

                        barRevenue: apiTheme.primaryColor || POS_FALLBACK_THEME.barRevenue,
                        barProfit: apiTheme.accentColor || POS_FALLBACK_THEME.barProfit,
                        barLabelBg: apiTheme.sidebarActiveColor || POS_FALLBACK_THEME.barLabelBg,

                        donutSeg1: apiTheme.primaryColor || POS_FALLBACK_THEME.donutSeg1,
                        donutSeg2: apiTheme.accentColor || POS_FALLBACK_THEME.donutSeg2,
                        donutSeg3: apiTheme.secondaryColor || POS_FALLBACK_THEME.donutSeg3,
                        donutSeg4: apiTheme.borderColor || POS_FALLBACK_THEME.donutSeg4,
                        donutCenter: apiTheme.textColor || POS_FALLBACK_THEME.donutCenter,

                        dayBar: apiTheme.primaryColor || POS_FALLBACK_THEME.dayBar,
                    };

                    setHrmsTheme(mappedTheme);
                    sessionStorage.setItem(HRMS_THEME_STORAGE_KEY, JSON.stringify(mappedTheme));
                }
            } catch (err) {
                console.log('Active theme fetch failed, using fallback theme', err);
            } finally {
                setLoading(false);
            }
        };

        fetchHrmsTheme();
    }, []);

    return { hrmsTheme, loading };
}
