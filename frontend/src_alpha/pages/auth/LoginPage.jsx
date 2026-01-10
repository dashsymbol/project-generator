import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import LanguageSwitcher from "../../components/LanguageSwitcher";

export default function LoginPage() {
    const { login } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await login(formData.username, formData.password);
            navigate("/");
        } catch (err) {
            setError(t('auth.login.invalidCredentials'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            background: "linear-gradient(135deg, #dbeafe 0%, #ede9fe 50%, #fce7f3 100%)",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            padding: 20,
            animation: "fadeIn 0.3s ease-in",
            position: "relative"
        }}>
            <div style={{ position: "absolute", top: 20, right: 20 }}>
                <LanguageSwitcher />
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
            <div style={{
                background: "white",
                padding: "48px 40px",
                borderRadius: 16,
                boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
                width: "100%",
                maxWidth: 400
            }}>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
                    <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#111827" }}>{t('auth.login.title')}</h2>
                    <p style={{ color: "#6b7280", marginTop: 8, fontSize: 15 }}>{t('auth.login.subtitle')}</p>
                </div>

                {error && (
                    <div style={{ color: "#dc2626", background: "#fef2f2", padding: 12, borderRadius: 10, marginBottom: 20, fontSize: 14, textAlign: "center" }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#374151", fontSize: 14 }}>{t('auth.username')}</label>
                        <input
                            type="text"
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                borderRadius: 10,
                                border: "1px solid #e5e7eb",
                                fontSize: 16,
                                transition: "border-color 0.15s ease"
                            }}
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            onFocus={e => e.target.style.borderColor = "#3b82f6"}
                            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: 28 }}>
                        <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#374151", fontSize: 14 }}>{t('auth.password')}</label>
                        <input
                            type="password"
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                borderRadius: 10,
                                border: "1px solid #e5e7eb",
                                fontSize: 16
                            }}
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            onFocus={e => e.target.style.borderColor = "#3b82f6"}
                            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "16px",
                            background: loading ? "#9ca3af" : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: 12,
                            cursor: loading ? "wait" : "pointer",
                            fontSize: 16,
                            fontWeight: 600,
                            boxShadow: loading ? "none" : "0 4px 14px rgba(59, 130, 246, 0.4)",
                        }}
                    >
                        {loading ? t('common.loading') : `🚀 ${t('auth.submit.login')}`}
                    </button>
                </form>

                <div style={{ marginTop: 28, textAlign: "center", fontSize: 14, color: "#6b7280" }}>
                    {t('auth.noAccount')} <Link to="/signup" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}>{t('auth.link.signup')}</Link>
                </div>
            </div>
        </div>
    );
}
