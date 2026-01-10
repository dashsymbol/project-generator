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
            navigate("/");
        } catch (err) {
            setError("Generation failed. Please try again.");
            setGenerating(false);
        }
    };

    if (loadingConfig) return <div style={{ padding: 24 }}>Loading config...</div>;
    if (error && !generating) return <div style={{ padding: 24, color: "red" }}>{error}</div>;

    return (
        <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 600, margin: "0 auto" }}>
            <Link to="/">&larr; Back to Home</Link>
            <h1>Create New Project</h1>

            {/* Step 1: Category */}
            {step === 1 && (
                <div>
                    <h2>Step 1: Select Category</h2>
                    <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleCategorySelect(cat)}
                                style={{ padding: 20, fontSize: 18, cursor: "pointer", textAlign: "left" }}
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
                    <h2>Step 2: About You</h2>
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                        {questionnaire.questions.map((q) => (
                            <div key={q.key} style={{ marginBottom: 20 }}>
                                <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                                    {q.label} {q.required && "*"}
                                </label>

                                {q.type === "select" && (
                                    <select
                                        required={q.required}
                                        onChange={(e) => handleAnswerChange(q.key, e.target.value)}
                                        value={answers[q.key] || ""}
                                        style={{ width: "100%", padding: 8 }}
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
                                        style={{ width: "100%", padding: 8 }}
                                    />
                                )}

                                {(q.type === "text") && (
                                    <input
                                        type="text"
                                        required={q.required}
                                        maxLength={q.max_length}
                                        onChange={(e) => handleAnswerChange(q.key, e.target.value)}
                                        value={answers[q.key] || ""}
                                        style={{ width: "100%", padding: 8 }}
                                    />
                                )}

                                {q.type === "multi_select" && (
                                    <div style={{ border: "1px solid #ddd", padding: 10, borderRadius: 4 }}>
                                        <small>Select all that apply:</small>
                                        {q.options?.map(opt => (
                                            <div key={opt}>
                                                <label style={{ fontWeight: "normal" }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={answers[q.key]?.includes(opt) || false}
                                                        onChange={(e) => {
                                                            const current = answers[q.key] || [];
                                                            if (e.target.checked) handleAnswerChange(q.key, [...current, opt]);
                                                            else handleAnswerChange(q.key, current.filter(x => x !== opt));
                                                        }}
                                                    /> {opt}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {generating ? (
                            <div style={{ padding: 20, background: "#eef", borderRadius: 8, textAlign: "center" }}>
                                Generating your project brief... This stub implementation calls no real AI yet.
                            </div>
                        ) : (
                            <button
                                type="submit"
                                style={{ width: "100%", padding: 15, fontSize: 18, background: "#007bff", color: "white", border: "none", cursor: "pointer" }}
                            >
                                Generate Project
                            </button>
                        )}
                    </form>
                </div>
            )}
        </div>
    );
}
