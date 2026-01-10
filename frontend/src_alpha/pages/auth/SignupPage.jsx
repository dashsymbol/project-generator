import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function SignupPage() {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await signup(formData);
            navigate("/");
        } catch (err) {
            setError(err.response?.data ? JSON.stringify(err.response.data) : "Signup failed. Please try again.");
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
            background: "linear-gradient(135deg, #d1fae5 0%, #dbeafe 50%, #ede9fe 100%)",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            padding: 20,
            animation: "fadeIn 0.3s ease-in"
        }}>
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
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🚀</div>
                    <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#111827" }}>Create Account</h2>
                    <p style={{ color: "#6b7280", marginTop: 8, fontSize: 15 }}>Start generating personalized projects</p>
                </div>

                {error && (
                    <div style={{ color: "#dc2626", background: "#fef2f2", padding: 12, borderRadius: 10, marginBottom: 20, fontSize: 13, wordBreak: "break-word", textAlign: "center" }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#374151", fontSize: 14 }}>Username</label>
                        <input
                            type="text"
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                borderRadius: 10,
                                border: "1px solid #e5e7eb",
                                fontSize: 16
                            }}
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            onFocus={e => e.target.style.borderColor = "#10b981"}
                            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#374151", fontSize: 14 }}>Email</label>
                        <input
                            type="email"
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                borderRadius: 10,
                                border: "1px solid #e5e7eb",
                                fontSize: 16
                            }}
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            onFocus={e => e.target.style.borderColor = "#10b981"}
                            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: 28 }}>
                        <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#374151", fontSize: 14 }}>Password</label>
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
                            onFocus={e => e.target.style.borderColor = "#10b981"}
                            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                            required
                            minLength={5}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "16px",
                            background: loading ? "#9ca3af" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: 12,
                            cursor: loading ? "wait" : "pointer",
                            fontSize: 16,
                            fontWeight: 600,
                            boxShadow: loading ? "none" : "0 4px 14px rgba(16, 185, 129, 0.4)",
                        }}
                    >
                        {loading ? "Creating Account..." : "✨ Sign Up"}
                    </button>
                </form>

                <div style={{ marginTop: 28, textAlign: "center", fontSize: 14, color: "#6b7280" }}>
                    Already have an account? <Link to="/login" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}>Log in</Link>
                </div>
            </div>
        </div>
    );
}
