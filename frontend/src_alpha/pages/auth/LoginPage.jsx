import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
    const { login } = useAuth();
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
            setError("Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f8f9fa", fontFamily: "system-ui" }}>
            <div style={{ background: "white", padding: 40, borderRadius: 8, boxShadow: "0 2px 10px rgba(0,0,0,0.1)", width: "100%", maxWidth: 400 }}>
                <h2 style={{ textAlign: "center", marginBottom: 24, marginTop: 0 }}>Welcome Back</h2>
                {error && <div style={{ color: "#dc3545", background: "#f8d7da", padding: 10, borderRadius: 4, marginBottom: 20, fontSize: 14 }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Username</label>
                        <input
                            type="text"
                            style={{ width: "100%", padding: "10px 12px", borderRadius: 4, border: "1px solid #ced4da", fontSize: 16 }}
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Password</label>
                        <input
                            type="password"
                            style={{ width: "100%", padding: "10px 12px", borderRadius: 4, border: "1px solid #ced4da", fontSize: 16 }}
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: 12,
                            background: "#0d6efd",
                            color: "white",
                            border: "none",
                            borderRadius: 4,
                            cursor: loading ? "wait" : "pointer",
                            opacity: loading ? 0.7 : 1,
                            fontSize: 16,
                            fontWeight: 600
                        }}
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>
                <div style={{ marginTop: 24, textAlign: "center", fontSize: 14, color: "#6c757d" }}>
                    Don't have an account? <Link to="/signup" style={{ color: "#0d6efd", textDecoration: "none" }}>Sign up</Link>
                </div>
            </div>
        </div>
    );
}
