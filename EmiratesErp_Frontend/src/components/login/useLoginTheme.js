import { useState, useEffect } from 'react';
import axios from 'axios';
import { DEFAULT_THEME, loadThemeFromStorage } from '../../utils/themeUtils';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const LOGIN_FALLBACK_THEME = {
  primary: DEFAULT_THEME.primaryColor,     // '#00A9A8'
  secondary: DEFAULT_THEME.secondaryColor, // '#ffffff'
  surface: DEFAULT_THEME.backgroundColor,   // '#F7FAFF'
  cardBg: DEFAULT_THEME.surfaceColor,       // '#ffffff'
  accent: DEFAULT_THEME.accentColor,       // '#02888D'
  text: DEFAULT_THEME.textColor,           // '#18233B'

  // Dedicated 3D Animation Object Palette (high contrast against right panel bg)
  animPrimary: '#003E5B',   // Deep Teal / Navy
  animSecondary: '#FFA713', // Warm Amber / Gold
  animAccent: DEFAULT_THEME.accentColor, // '#02888D'
  animLight: DEFAULT_THEME.primaryColor, // '#00A9A8'
  animGlow: DEFAULT_THEME.primaryColor,  // '#00A9A8'
};

export function useLoginTheme() {
  const [loginTheme, setLoginTheme] = useState(() => {
    const cached = loadThemeFromStorage();
    if (!cached) return LOGIN_FALLBACK_THEME;
    return {
      ...LOGIN_FALLBACK_THEME,
      primary: cached.primaryColor || LOGIN_FALLBACK_THEME.primary,
      secondary: cached.secondaryColor || LOGIN_FALLBACK_THEME.secondary,
      accent: cached.accentColor || LOGIN_FALLBACK_THEME.accent,
      surface: cached.backgroundColor || LOGIN_FALLBACK_THEME.surface,
      cardBg: cached.surfaceColor || LOGIN_FALLBACK_THEME.cardBg,
      text: cached.textColor || LOGIN_FALLBACK_THEME.text,

      // Dedicated 3D Animation Palette override (allows custom color mapping)
      animPrimary: cached.animPrimary || LOGIN_FALLBACK_THEME.animPrimary,
      animSecondary: cached.animSecondary || LOGIN_FALLBACK_THEME.animSecondary,
      animAccent: cached.animAccent || LOGIN_FALLBACK_THEME.animAccent,
      animLight: cached.animLight || LOGIN_FALLBACK_THEME.animLight,
      animGlow: cached.animGlow || LOGIN_FALLBACK_THEME.animGlow,
    };
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/themes/active`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const apiTheme = res.data;
        if (apiTheme) {
          const mappedTheme = {
            ...LOGIN_FALLBACK_THEME,
            primary: apiTheme.primaryColor || LOGIN_FALLBACK_THEME.primary,
            secondary: apiTheme.secondaryColor || LOGIN_FALLBACK_THEME.secondary,
            accent: apiTheme.accentColor || LOGIN_FALLBACK_THEME.accent,
            surface: apiTheme.backgroundColor || LOGIN_FALLBACK_THEME.surface,
            cardBg: apiTheme.surfaceColor || LOGIN_FALLBACK_THEME.cardBg,
            text: apiTheme.textColor || LOGIN_FALLBACK_THEME.text,

            animPrimary: apiTheme.animPrimary || LOGIN_FALLBACK_THEME.animPrimary,
            animSecondary: apiTheme.animSecondary || LOGIN_FALLBACK_THEME.animSecondary,
            animAccent: apiTheme.animAccent || LOGIN_FALLBACK_THEME.animAccent,
            animLight: apiTheme.animLight || LOGIN_FALLBACK_THEME.animLight,
            animGlow: apiTheme.animGlow || LOGIN_FALLBACK_THEME.animGlow,
          };
          setLoginTheme(mappedTheme);
        }
      } catch (err) {
        console.log('Login theme fetch fallback:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();
  }, []);

  return { loginTheme, loading };
}

