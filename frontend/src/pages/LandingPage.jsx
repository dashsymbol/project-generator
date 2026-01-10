import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

export default function LandingPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadProjects = () => {
        api.getProjects()
            .then((res) => setProjects(res.data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadProjects();
        // Optional: poll every 10s to update statuses on dashboard too
        const interval = setInterval(loadProjects, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            background: "#f8f9fa",
            minHeight: "100vh",
            padding: "40px 20px"
        }}>
            <div style={{ maxWidth: 800, margin: "0 auto", background: "#fff", padding: 40, borderRadius: 8, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
                    <h1 style={{ margin: 0, fontSize: 28, color: "#212529" }}>Creative Projects</h1>
                    <Link to="/create">
                        <button style={{
                            padding: "10px 20px",
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: "pointer",
                            background: "#0d6efd",
                            color: "white",
                            border: "none",
                            borderRadius: 4
                        }}>
                            + Create New
                        </button>
                    </Link>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", color: "#6c757d", padding: 40 }}>Loading projects...</div>
                ) : projects.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 60, background: "#f8f9fa", borderRadius: 8, color: "#495057" }}>
                        <p style={{ fontSize: 18, marginBottom: 16 }}>No projects found yet.</p>
                        <p>Start by creating your first creative brief!</p>
                    </div>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid #e9ecef" }}>
                                <th style={{ padding: "12px 8px", color: "#495057", fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>Title</th>
                                <th style={{ padding: "12px 8px", color: "#495057", fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>Category</th>
                                <th style={{ padding: "12px 8px", color: "#495057", fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>Client</th>
                                <th style={{ padding: "12px 8px", color: "#495057", fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((p) => {
                                const isGenerating = p.status === 'GENERATING';
                                return (
                                    <tr key={p.id} style={{ borderBottom: "1px solid #f1f3f5" }}>
                                        <td style={{ padding: "16px 8px" }}>
                                            <Link to={`/projects/${p.id}`} style={{ color: "#0d6efd", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                                                {p.title}
                                                {isGenerating && (
                                                    <span style={{
                                                        background: "#fff3cd",
                                                        color: "#856404",
                                                        padding: "2px 6px",
                                                        borderRadius: 4,
                                                        fontSize: 10,
                                                        border: "1px solid #ffeeba",
                                                        fontWeight: "bold",
                                                        textTransform: "uppercase"
                                                    }}>
                                                        Generating...
                                                    </span>
                                                )}
                                            </Link>
                                        </td>
                                        <td style={{ padding: "16px 8px", color: "#495057" }}>
                                            <span style={{ background: "#e9ecef", padding: "4px 8px", borderRadius: 4, fontSize: 12 }}>{p.category}</span>
                                        </td>
                                        <td style={{ padding: "16px 8px", color: "#212529" }}>{p.client ? p.client.name : "N/A"}</td>
                                        <td style={{ padding: "16px 8px", color: "#868e96", fontSize: 14 }}>{new Date(p.created_at).toLocaleDateString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
