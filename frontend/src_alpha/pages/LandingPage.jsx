import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const STATUS_STYLES = {
    GENERATING: { bg: "#fef3c7", color: "#92400e", label: "⏳ Generating" },
    DRAFT: { bg: "#e0e7ff", color: "#3730a3", label: "📝 Draft" },
    IN_PROGRESS: { bg: "#dbeafe", color: "#1e40af", label: "🔄 In Progress" },
    DELIVERED: { bg: "#d1fae5", color: "#065f46", label: "✅ Delivered" },
    FAILED: { bg: "#fee2e2", color: "#991b1b", label: "❌ Failed" },
};

const CATEGORY_COLORS = {
    "Software Development": "#3b82f6",
    "Web Development": "#8b5cf6",
    "Design": "#ec4899",
    "Writing": "#f59e0b",
    "General": "#6b7280",
};

export default function LandingPage() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadProjects = () => {
        api.getProjects()
            .then((res) => setProjects(res.data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        api.getSkillProfile()
            .then(() => loadProjects())
            .catch((err) => {
                if (err.response && err.response.status === 404) {
                    navigate("/profile");
                } else {
                    loadProjects();
                }
            });

        const interval = setInterval(loadProjects, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            background: "linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)",
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
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
                {/* Header */}
                <div style={{
                    background: "white",
                    padding: "24px 32px",
                    borderRadius: 16,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                    marginBottom: 24,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#111827" }}>
                            🎯 Project Generator
                        </h1>
                        <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 14 }}>
                            AI-powered project challenges tailored to you
                        </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ color: "#6b7280", fontSize: 14, marginRight: 8 }}>Hi, {user?.username} 👋</span>
                        <Link to="/profile">
                            <button style={{
                                padding: "10px 16px",
                                background: "#f3e8ff",
                                border: "none",
                                borderRadius: 10,
                                cursor: "pointer",
                                color: "#7c3aed",
                                fontSize: 14,
                                fontWeight: 600
                            }}>
                                🧠 Profile
                            </button>
                        </Link>
                        <button
                            onClick={logout}
                            style={{ padding: "10px 16px", background: "#f3f4f6", border: "none", borderRadius: 10, cursor: "pointer", color: "#374151", fontSize: 14 }}
                        >
                            Logout
                        </button>
                        <Link to="/create">
                            <button style={{
                                padding: "12px 20px",
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: "pointer",
                                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                color: "white",
                                border: "none",
                                borderRadius: 10,
                                boxShadow: "0 4px 14px rgba(59, 130, 246, 0.3)"
                            }}>
                                ✨ New Project
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Projects Grid */}
                <div style={{
                    background: "white",
                    padding: "32px",
                    borderRadius: 16,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.06)"
                }}>
                    <h2 style={{ margin: "0 0 24px", fontSize: 18, fontWeight: 600, color: "#374151" }}>
                        Your Projects
                    </h2>

                    {loading ? (
                        <div style={{ textAlign: "center", color: "#6b7280", padding: 60 }}>Loading projects...</div>
                    ) : projects.length === 0 ? (
                        <div style={{ textAlign: "center", padding: 80, background: "#f9fafb", borderRadius: 12 }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>🎨</div>
                            <p style={{ fontSize: 18, color: "#374151", marginBottom: 8, fontWeight: 600 }}>No projects yet</p>
                            <p style={{ color: "#6b7280", marginBottom: 24 }}>Generate your first AI-powered project challenge!</p>
                            <Link to="/create">
                                <button style={{
                                    padding: "14px 28px",
                                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: 10,
                                    fontSize: 15,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.3)"
                                }}>
                                    🚀 Create Your First Project
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gap: 16 }}>
                            {projects.map((p) => {
                                const status = STATUS_STYLES[p.status] || STATUS_STYLES.DRAFT;
                                const categoryColor = CATEGORY_COLORS[p.category] || CATEGORY_COLORS.General;

                                return (
                                    <Link
                                        key={p.id}
                                        to={`/projects/${p.id}`}
                                        style={{ textDecoration: "none" }}
                                    >
                                        <div style={{
                                            padding: "20px 24px",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: 12,
                                            background: "#fff",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            transition: "all 0.15s ease",
                                            cursor: "pointer"
                                        }}
                                            onMouseOver={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(59,130,246,0.1)"; }}
                                            onMouseOut={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                                                    <span style={{ fontWeight: 600, fontSize: 16, color: "#111827" }}>{p.title}</span>
                                                    <span style={{
                                                        background: status.bg,
                                                        color: status.color,
                                                        padding: "4px 10px",
                                                        borderRadius: 6,
                                                        fontSize: 11,
                                                        fontWeight: 600
                                                    }}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#6b7280", fontSize: 13 }}>
                                                    <span style={{
                                                        background: `${categoryColor}15`,
                                                        color: categoryColor,
                                                        padding: "3px 8px",
                                                        borderRadius: 4,
                                                        fontWeight: 500
                                                    }}>
                                                        {p.category}
                                                    </span>
                                                    <span>📋 {p.client?.name || "Client"}</span>
                                                    <span>📅 {new Date(p.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div style={{ color: "#9ca3af", fontSize: 20 }}>→</div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
