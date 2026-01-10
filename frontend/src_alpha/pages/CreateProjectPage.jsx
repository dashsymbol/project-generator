import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function CreateProjectPage() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);

    const [difficulty, setDifficulty] = useState("INTERMEDIATE");
    const [timeBudget, setTimeBudget] = useState("10");
    const [projectType, setProjectType] = useState("surprise");

    const PROJECT_TYPES = [
        { value: "surprise", emoji: "🎲", label: t('create.type.surprise.label'), desc: t('create.type.surprise.desc') },
        { value: "practical", emoji: "🛠️", label: t('create.type.practical.label'), desc: t('create.type.practical.desc') },
        { value: "learning", emoji: "📚", label: t('create.type.learning.label'), desc: t('create.type.learning.desc') },
        { value: "portfolio", emoji: "💼", label: t('create.type.portfolio.label'), desc: t('create.type.portfolio.desc') },
        { value: "fun", emoji: "🎮", label: t('create.type.fun.label'), desc: t('create.type.fun.desc') },
    ];

    const DIFFICULTIES = [
        { value: "BASIC", color: "#22c55e", label: t('create.diff.basic.label'), desc: t('create.diff.basic.desc') },
        { value: "INTERMEDIATE", color: "#f59e0b", label: t('create.diff.intermediate.label'), desc: t('create.diff.intermediate.desc') },
        { value: "ADVANCED", color: "#ef4444", label: t('create.diff.advanced.label'), desc: t('create.diff.advanced.desc') },
    ];

    const TIME_OPTIONS = [
        { value: "2", label: "2h", desc: t('create.time.2h.desc') },
        { value: "5", label: "5h", desc: t('create.time.5h.desc') },
        { value: "10", label: "10h", desc: t('create.time.10h.desc') },
        { value: "20", label: "20h", desc: t('create.time.20h.desc') },
        { value: "40", label: "40h+", desc: t('create.time.40h.desc') },
    ];

    useEffect(() => {
        api.getSkillProfile()
            .then(res => {
                if (res.data && res.data.skill_level) setDifficulty(res.data.skill_level);
            })
            .catch(() => { });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGenerating(true);
        setError(null);

        const answers = {
            time_budget_hours: parseInt(timeBudget, 10),
            project_type: projectType,
        };

        try {
            await api.generateProject("Auto", answers, difficulty, "");
            setTimeout(() => navigate("/"), 5000);
        } catch (err) {
            console.error("Generation error:", err.response?.data);
            const msg = err.response?.data?.error || JSON.stringify(err.response?.data) || t('common.error');
            setError(msg);
            setGenerating(false);
        }
    };

    const cardStyle = (isSelected) => ({
        padding: "14px 16px",
        border: isSelected ? "2px solid #3b82f6" : "1px solid #e5e7eb",
        borderRadius: 12,
        cursor: "pointer",
        background: isSelected ? "#eff6ff" : "#fff",
        transition: "all 0.15s ease",
        textAlign: "center",
        flex: 1,
        minWidth: 80,
    });

    return (
        <div style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
            minHeight: "100vh",
            padding: "40px 20px",
            animation: "fadeIn 0.3s ease-in"
        }}>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
            <div style={{ maxWidth: 560, margin: "0 auto", background: "#fff", padding: "36px 40px", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <Link to="/" style={{ color: "#3b82f6", textDecoration: "none", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
                        ← {t('common.dashboard')}
                    </Link>
                    <LanguageSwitcher />
                </div>

                <h1 style={{ marginTop: 0, marginBottom: 8, fontSize: 32, fontWeight: 700, color: "#111827" }}>
                    {t('create.title')}
                </h1>
                <p style={{ color: "#6b7280", marginBottom: 32, fontSize: 15, lineHeight: 1.5 }}>
                    {t('create.subtitle')}
                </p>

                {error && (
                    <div style={{ color: "#dc2626", background: "#fef2f2", padding: 14, borderRadius: 10, marginBottom: 24, fontSize: 14 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Project Type */}
                    <div style={{ marginBottom: 28 }}>
                        <label style={{ display: "block", marginBottom: 12, fontWeight: 600, color: "#374151", fontSize: 14 }}>
                            {t('create.projectType')}
                        </label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                            {PROJECT_TYPES.slice(0, 3).map(pt => (
                                <div
                                    key={pt.value}
                                    onClick={() => setProjectType(pt.value)}
                                    style={cardStyle(projectType === pt.value)}
                                >
                                    <div style={{ fontSize: 24, marginBottom: 4 }}>{pt.emoji}</div>
                                    <div style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{pt.label}</div>
                                    <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{pt.desc}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginTop: 10 }}>
                            {PROJECT_TYPES.slice(3).map(pt => (
                                <div
                                    key={pt.value}
                                    onClick={() => setProjectType(pt.value)}
                                    style={cardStyle(projectType === pt.value)}
                                >
                                    <div style={{ fontSize: 24, marginBottom: 4 }}>{pt.emoji}</div>
                                    <div style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{pt.label}</div>
                                    <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{pt.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div style={{ marginBottom: 28 }}>
                        <label style={{ display: "block", marginBottom: 12, fontWeight: 600, color: "#374151", fontSize: 14 }}>
                            {t('create.difficulty')}
                        </label>
                        <div style={{ display: "flex", gap: 10 }}>
                            {DIFFICULTIES.map(d => (
                                <div
                                    key={d.value}
                                    onClick={() => setDifficulty(d.value)}
                                    style={{
                                        ...cardStyle(difficulty === d.value),
                                        borderColor: difficulty === d.value ? d.color : "#e5e7eb",
                                        background: difficulty === d.value ? `${d.color}10` : "#fff",
                                    }}
                                >
                                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: d.color, margin: "0 auto 8px" }} />
                                    <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{d.label}</div>
                                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{d.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Time Budget */}
                    <div style={{ marginBottom: 32 }}>
                        <label style={{ display: "block", marginBottom: 12, fontWeight: 600, color: "#374151", fontSize: 14 }}>
                            {t('create.timeBudget')}
                        </label>
                        <div style={{ display: "flex", gap: 8 }}>
                            {TIME_OPTIONS.map(t => (
                                <div
                                    key={t.value}
                                    onClick={() => setTimeBudget(t.value)}
                                    style={{
                                        ...cardStyle(timeBudget === t.value),
                                        padding: "12px 8px",
                                    }}
                                >
                                    <div style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>{t.label}</div>
                                    <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{t.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {generating ? (
                        <div style={{ padding: 32, textAlign: "center", background: "#f0f9ff", borderRadius: 12 }}>
                            <div style={{ fontSize: 18, fontWeight: 600, color: "#1e40af", marginBottom: 8 }}>
                                ✨ {t('create.generating')}
                            </div>
                            <div style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>
                                {t('create.generating.subtitle')}
                            </div>
                            <div style={{
                                width: 32,
                                height: 32,
                                border: "3px solid #dbeafe",
                                borderTop: "3px solid #3b82f6",
                                borderRadius: "50%",
                                animation: "spin 1s linear infinite",
                                margin: "0 auto"
                            }}>
                                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="submit"
                            style={{
                                width: "100%",
                                padding: "16px 24px",
                                fontSize: 16,
                                fontWeight: 600,
                                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                color: "white",
                                border: "none",
                                borderRadius: 12,
                                cursor: "pointer",
                                boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)",
                                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                            }}
                            onMouseOver={(e) => { e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.5)"; }}
                            onMouseOut={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 14px rgba(59, 130, 246, 0.4)"; }}
                        >
                            {t('create.generate')}
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
}
