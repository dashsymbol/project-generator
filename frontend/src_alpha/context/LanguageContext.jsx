import { createContext, useState, useContext, useEffect } from 'react';
import { en } from '../translations/en';
import { es } from '../translations/es';

const LanguageContext = createContext();

const translations = { en, es };

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('app_language') || 'en';
    });

    useEffect(() => {
        localStorage.setItem('app_language', language);
    }, [language]);

    const t = (key) => {
        return translations[language]?.[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
