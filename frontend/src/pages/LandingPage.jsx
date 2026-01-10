import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

export default function LandingPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getProjects()
            .then((res) => setProjects(res.data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 800, margin: "0 auto" }}>
            <h1>Creative Projects</h1>
            <div style={{ marginBottom: 20 }}>
                <Link to="/create">
                    <button style={{ padding: "10px 20px", fontSize: 16, cursor: "pointer" }}>Create New Project</button>
                </Link>
            </div>

            {loading ? (
                <p>Loading projects...</p>
            ) : projects.length === 0 ? (
                <p>No projects found. Start by creating one!</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ background: "#f4f4f4" }}>
                            <th style={{ padding: 10 }}>Title</th>
                            <th style={{ padding: 10 }}>Category</th>
                            <th style={{ padding: 10 }}>Client</th>
                            <th style={{ padding: 10 }}>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map((p) => (
                            <tr key={p.id} style={{ borderBottom: "1px solid #ddd" }}>
                                <td style={{ padding: 10 }}>
                                    <Link to={`/projects/${p.id}`}>{p.title}</Link>
                                </td>
                                <td style={{ padding: 10 }}>{p.category}</td>
                                <td style={{ padding: 10 }}>{p.client ? p.client.name : "N/A"}</td>
                                <td style={{ padding: 10 }}>{new Date(p.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
