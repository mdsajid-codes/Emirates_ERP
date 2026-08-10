import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en.json';
import ar from '../locales/ar.json';

const translations = { en, ar };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('app_language') || 'en';
    });

    const isRTL = language === 'ar';

    useEffect(() => {
        localStorage.setItem('app_language', language);
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [language, isRTL]);

    const t = (key) => {
        const langData = translations[language] || translations.en;
        return langData[key] || translations.en[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
