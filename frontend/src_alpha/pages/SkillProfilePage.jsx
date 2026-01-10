import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function SkillProfilePage() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [profileId, setProfileId] = useState(null);
    const [formData, setFormData] = useState({
        skill_level: "INTERMEDIATE",
        skills: "",
        preferred_tools: "",
        excluded_tools: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiInput, setAiInput] = useState("");
    const [aiGenerating, setAiGenerating] = useState(false);

    const SKILL_LEVELS = [
        { value: "BASIC", color: "#22c55e", label: t('profile.level.basic.label'), desc: t('profile.level.basic.desc') },
        { value: "INTERMEDIATE", color: "#f59e0b", label: t('profile.level.intermediate.label'), desc: t('profile.level.intermediate.desc') },
        { value: "ADVANCED", color: "#ef4444", label: t('profile.level.advanced.label'), desc: t('profile.level.advanced.desc') },
    ];

    useEffect(() => {
        api.getSkillProfile()
            .then(res => {
                const p = res.data;
                setProfileId(p.id);
                setFormData({
                    skill_level: p.skill_level,
                    skills: p.skills.join(", "),
                    preferred_tools: p.preferred_tools.join(", "),
                    excluded_tools: p.excluded_tools.join(", ")
                });
            })
            .catch(err => {
                if (err.response && err.response.status === 404) {
                    // No profile yet
                } else {
                    setError(t('profile.error.load'));
                }
            })
            .finally(() => setLoading(false));
    }, [t]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        setSuccess("");

        const payload = {
            skill_level: formData.skill_level,
            skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
            preferred_tools: formData.preferred_tools.split(",").map(s => s.trim()).filter(Boolean),
            excluded_tools: formData.excluded_tools.split(",").map(s => s.trim()).filter(Boolean),
        };

        try {
            if (profileId) {
                await api.updateSkillProfile(profileId, payload);
                setSuccess(t('common.save') + "!");
                setTimeout(() => setSuccess(""), 3000);
            } else {
                // First time creating profile - redirect to dashboard after success
                const res = await api.createSkillProfile(payload);
                setProfileId(res.data.id);
                setSuccess(t('common.save') + "! Redirecting...");
                setTimeout(() => navigate("/"), 1500);
            }
        } catch (err) {
            console.error("Profile save error:", err.response?.data);
            const msg = err.response?.data?.[0] || JSON.stringify(err.response?.data) || t('common.error');
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleAIGenerate = async () => {
        if (!aiInput || aiInput.trim().length < 10) {
            setError(t('profile.error.desc_short'));
            return;
        }

        setAiGenerating(true);
        setError("");

        try {
            const res = await api.generateSkillProfile(aiInput);
            const suggestions = res.data;

            // Auto-fill form with AI suggestions
            setFormData({
                skill_level: suggestions.skill_level,
                skills: suggestions.skills.join(", "),
                preferred_tools: suggestions.preferred_tools.join(", "),
                excluded_tools: suggestions.excluded_tools?.join(", ") || ""
            });

            setShowAIModal(false);
            setAiInput("");
            setSuccess(t('profile.success.generated'));
            setTimeout(() => setSuccess(""), 5000);
        } catch (err) {
            console.error("AI generation error:", err.response?.data);
            const msg = err.response?.data?.error || t('common.error');
            setError(msg);
        } finally {
            setAiGenerating(false);
        }
    };

    const cardStyle = (isSelected, color) => ({
        padding: "16px",
        border: isSelected ? `2px solid ${color}` : "1px solid #e5e7eb",
        borderRadius: 12,
        cursor: "pointer",
        background: isSelected ? `${color}10` : "#fff",
        transition: "all 0.15s ease",
        textAlign: "center",
        flex: 1,
        minWidth: 80,
    });

    if (loading) {
        return (
            <div style={{ padding: 60, textAlign: "center", color: "#6b7280" }}>
                {t('common.loading')}
            </div>
        );
    }

    return (
        <div style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
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
                    <Link to="/" style={{ color: "#8b5cf6", textDecoration: "none", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
                        ← {t('common.dashboard')}
                    </Link>
                    <LanguageSwitcher />
                </div>

                <h1 style={{ marginTop: 0, marginBottom: 8, fontSize: 32, fontWeight: 700, color: "#111827" }}>
                    {t('profile.title')}
                </h1>
                <p style={{ color: "#6b7280", marginBottom: 16, fontSize: 15, lineHeight: 1.5 }}>
                    {t('profile.subtitle')}
                </p>

                {/* AI Help Button */}
                <button
                    onClick={() => setShowAIModal(true)}
                    style={{
                        padding: "12px 20px",
                        background: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(139, 92, 246, 0.3)",
                        marginBottom: 24,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        whiteSpace: "nowrap"
                    }}
                    onMouseOver={(e) => { e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = "0 6px 20px rgba(139, 92, 246, 0.4)"; }}
                    onMouseOut={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 14px rgba(139, 92, 246, 0.3)"; }}
                >
                    {t('profile.ai.button')}
                </button>

                {error && (
                    <div style={{ color: "#dc2626", background: "#fef2f2", padding: 14, borderRadius: 10, marginBottom: 20, fontSize: 14 }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{ color: "#059669", background: "#ecfdf5", padding: 14, borderRadius: 10, marginBottom: 20, fontSize: 14 }}>
                        ✓ {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Skill Level */}
                    <div style={{ marginBottom: 28 }}>
                        <label style={{ display: "block", marginBottom: 12, fontWeight: 600, color: "#374151", fontSize: 14 }}>
                            {t('profile.level.title')}
                        </label>
                        <div style={{ display: "flex", gap: 10 }}>
                            {SKILL_LEVELS.map(sl => (
                                <div
                                    key={sl.value}
                                    onClick={() => setFormData({ ...formData, skill_level: sl.value })}
                                    style={cardStyle(formData.skill_level === sl.value, sl.color)}
                                >
                                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: sl.color, margin: "0 auto 10px" }} />
                                    <div style={{ fontWeight: 600, fontSize: 15, color: "#111827" }}>{sl.label}</div>
                                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{sl.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Skills */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#374151", fontSize: 14 }}>
                            {t('profile.skills.title')}
                        </label>
                        <textarea
                            value={formData.skills}
                            onChange={e => setFormData({ ...formData, skills: e.target.value })}
                            placeholder={t('profile.skills.placeholder')}
                            rows={2}
                            style={{
                                width: "100%",
                                padding: 14,
                                borderRadius: 10,
                                border: "1px solid #e5e7eb",
                                fontSize: 15,
                                resize: "vertical",
                                fontFamily: "inherit"
                            }}
                        />
                    </div>

                    {/* Preferred Tools */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#374151", fontSize: 14 }}>
                            {t('profile.tools.title')}
                        </label>
                        <input
                            type="text"
                            value={formData.preferred_tools}
                            onChange={e => setFormData({ ...formData, preferred_tools: e.target.value })}
                            placeholder={t('profile.tools.placeholder')}
                            style={{
                                width: "100%",
                                padding: 14,
                                borderRadius: 10,
                                border: "1px solid #e5e7eb",
                                fontSize: 15
                            }}
                        />
                    </div>

                    {/* Excluded Tools */}
                    <div style={{ marginBottom: 32 }}>
                        <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#374151", fontSize: 14 }}>
                            {t('profile.avoid.title')}
                        </label>
                        <input
                            type="text"
                            value={formData.excluded_tools}
                            onChange={e => setFormData({ ...formData, excluded_tools: e.target.value })}
                            placeholder={t('profile.avoid.placeholder')}
                            style={{
                                width: "100%",
                                padding: 14,
                                borderRadius: 10,
                                border: "1px solid #e5e7eb",
                                fontSize: 15
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            width: "100%",
                            padding: "16px 24px",
                            fontSize: 16,
                            fontWeight: 600,
                            background: submitting ? "#9ca3af" : "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: 12,
                            cursor: submitting ? "wait" : "pointer",
                            boxShadow: submitting ? "none" : "0 4px 14px rgba(139, 92, 246, 0.4)",
                            transition: "all 0.15s ease",
                        }}
                    >
                        {submitting ? t('common.loading') : t('profile.save')}
                    </button>
                </form>
            </div>

            {/* AI Modal */}
            {showAIModal && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    animation: "fadeIn 0.2s ease-in"
                }}>
                    <div style={{
                        background: "white",
                        padding: "32px",
                        borderRadius: 16,
                        maxWidth: 500,
                        width: "90%",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
                    }}>
                        <h2 style={{ margin: "0 0 12px 0", fontSize: 24, fontWeight: 700, color: "#111827" }}>
                            {t('profile.modal.title')}
                        </h2>
                        <p style={{ color: "#6b7280", marginBottom: 20, fontSize: 14, lineHeight: 1.5 }}>
                            {t('profile.modal.desc')}
                        </p>

                        <textarea
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            placeholder={t('profile.modal.placeholder')}
                            rows={5}
                            style={{
                                width: "100%",
                                padding: 14,
                                borderRadius: 10,
                                border: "1px solid #e5e7eb",
                                fontSize: 15,
                                resize: "vertical",
                                fontFamily: "inherit",
                                marginBottom: 20
                            }}
                        />

                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button
                                onClick={() => { setShowAIModal(false); setAiInput(""); setError(""); }}
                                disabled={aiGenerating}
                                style={{
                                    padding: "12px 20px",
                                    background: "#f3f4f6",
                                    border: "none",
                                    borderRadius: 10,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: aiGenerating ? "not-allowed" : "pointer",
                                    color: "#374151"
                                }}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleAIGenerate}
                                disabled={aiGenerating}
                                style={{
                                    padding: "12px 20px",
                                    background: aiGenerating ? "#9ca3af" : "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: 10,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: aiGenerating ? "wait" : "pointer",
                                    boxShadow: aiGenerating ? "none" : "0 4px 14px rgba(139, 92, 246, 0.3)"
                                }}
                            >
                                {aiGenerating ? t('common.loading') : t('profile.modal.generate')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
