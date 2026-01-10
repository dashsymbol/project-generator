import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";

const CATEGORIES = ["Branding", "UI Design", "Packaging"];

export default function CreateProjectPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState("");
    const [questionnaire, setQuestionnaire] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loadingConfig, setLoadingConfig] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);

    // Load questionnaire on mount
    useEffect(() => {
        setLoadingConfig(true);
        api.getQuestionnaire()
            .then((res) => setQuestionnaire(res.data))
            .catch((err) => setError("Failed to load configuration"))
            .finally(() => setLoadingConfig(false));
    }, []);

    const handleCategorySelect = (cat) => {
        setCategory(cat);
        setStep(2);
    };

    const handleAnswerChange = (key, value) => {
        setAnswers(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        setGenerating(true);
        setError(null);
        try {
            await api.generateProject(category, answers);
            // Show "Generating" UI for 5 seconds, then go to Dashboard
            setTimeout(() => {
                navigate("/");
            }, 5000);
        } catch (err) {
            setError("Generation failed. Please try again.");
            setGenerating(false);
        }
    };

    if (loadingConfig) return <div style={{ padding: 40, textAlign: "center", color: "#6c757d" }}>Loading config...</div>;
    if (error && !generating) return <div style={{ padding: 40, textAlign: "center", color: "#dc3545" }}>Error: {error}</div>;

    return (
        <div style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            background: "#f8f9fa",
            minHeight: "100vh",
            padding: "40px 20px"
        }}>
            <div style={{ maxWidth: 600, margin: "0 auto", background: "#fff", padding: 40, borderRadius: 8, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                <Link to="/" style={{ color: "#0d6efd", textDecoration: "none", marginBottom: 20, display: "inline-block" }}>&larr; Back to Home</Link>
                <h1 style={{ marginTop: 0, fontSize: 28, color: "#212529" }}>Create New Project</h1>

                {/* Step 1: Category */}
                {step === 1 && (
                    <div>
                        <h2 style={{ fontSize: 20, color: "#495057", marginBottom: 20 }}>Step 1: Select Category</h2>
                        <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategorySelect(cat)}
                                    style={{
                                        padding: "16px 20px",
                                        fontSize: 16,
                                        cursor: "pointer",
                                        textAlign: "left",
                                        background: "#fff",
                                        border: "1px solid #ced4da",
                                        borderRadius: 6,
                                        color: "#212529",
                                        transition: "all 0.2s"
                                    }}
                                    onMouseOver={(e) => { e.target.style.borderColor = "#0d6efd"; e.target.style.background = "#f8f9fa"; }}
                                    onMouseOut={(e) => { e.target.style.borderColor = "#ced4da"; e.target.style.background = "#fff"; }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Questionnaire */}
                {step === 2 && questionnaire && (
                    <div>
                        <h2 style={{ fontSize: 20, color: "#495057", marginBottom: 20 }}>Step 2: About You</h2>
                        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                            {questionnaire.questions.map((q) => (
                                <div key={q.key} style={{ marginBottom: 24 }}>
                                    <label style={{ display: "block", marginBottom: 8, fontWeight: 500, color: "#212529" }}>
                                        {q.label} {q.required && <span style={{ color: "#dc3545" }}>*</span>}
                                    </label>

                                    {q.type === "select" && (
                                        <select
                                            required={q.required}
                                            onChange={(e) => handleAnswerChange(q.key, e.target.value)}
                                            value={answers[q.key] || ""}
                                            style={{ width: "100%", padding: "10px", borderRadius: 4, border: "1px solid #ced4da", fontSize: 16 }}
                                        >
                                            <option value="">Select...</option>
                                            {q.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    )}

                                    {q.type === "number" && (
                                        <input
                                            type="number"
                                            required={q.required}
                                            min={q.min}
                                            max={q.max}
                                            onChange={(e) => handleAnswerChange(q.key, e.target.value)}
                                            value={answers[q.key] || ""}
                                            style={{ width: "100%", padding: "10px", borderRadius: 4, border: "1px solid #ced4da", fontSize: 16 }}
                                        />
                                    )}

                                    {(q.type === "text") && (
                                        <input
                                            type="text"
                                            required={q.required}
                                            maxLength={q.max_length}
                                            onChange={(e) => handleAnswerChange(q.key, e.target.value)}
                                            value={answers[q.key] || ""}
                                            style={{ width: "100%", padding: "10px", borderRadius: 4, border: "1px solid #ced4da", fontSize: 16 }}
                                        />
                                    )}

                                    {q.type === "multi_select" && (
                                        <div style={{ border: "1px solid #ced4da", padding: 12, borderRadius: 4 }}>
                                            <small style={{ display: "block", marginBottom: 8, color: "#6c757d" }}>Select all that apply:</small>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                {q.options?.map(opt => (
                                                    <label key={opt} style={{ fontWeight: "normal", display: "flex", alignItems: "center", gap: 8 }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={answers[q.key]?.includes(opt) || false}
                                                            onChange={(e) => {
                                                                const current = answers[q.key] || [];
                                                                if (e.target.checked) handleAnswerChange(q.key, [...current, opt]);
                                                                else handleAnswerChange(q.key, current.filter(x => x !== opt));
                                                            }}
                                                        />
                                                        {opt}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {generating ? (
                                <div style={{ padding: 40, textAlign: "center", color: "#495057", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                    <div style={{ fontSize: 20, marginBottom: 12 }}>✨ Generating your project details...</div>
                                    <div style={{ color: "#868e96", marginBottom: 20 }}>This usually takes about 10-20 seconds with the AI model.</div>
                                    <div style={{
                                        width: 30,
                                        height: 30,
                                        border: "3px solid #e9ecef",
                                        borderTop: "3px solid #0d6efd",
                                        borderRadius: "50%",
                                        animation: "spin 1s linear infinite"
                                    }}>
                                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="submit"
                                    style={{
                                        width: "100%",
                                        padding: 16,
                                        fontSize: 16,
                                        fontWeight: 600,
                                        background: "#0d6efd",
                                        color: "white",
                                        border: "none",
                                        borderRadius: 6,
                                        cursor: "pointer"
                                    }}
                                >
                                    Generate Project using Gemma-3
                                </button>
                            )}
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
