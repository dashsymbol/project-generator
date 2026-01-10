import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    return (
        <div style={{ display: "flex", gap: 8 }}>
            <button
                onClick={() => setLanguage('en')}
                style={{
                    background: language === 'en' ? '#3b82f6' : '#e5e7eb',
                    color: language === 'en' ? 'white' : '#4b5563',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 13,
                    transition: 'all 0.2s'
                }}
            >
                EN
            </button>
            <button
                onClick={() => setLanguage('es')}
                style={{
                    background: language === 'es' ? '#3b82f6' : '#e5e7eb',
                    color: language === 'es' ? 'white' : '#4b5563',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 13,
                    transition: 'all 0.2s'
                }}
            >
                ES
            </button>
        </div>
    );
}
