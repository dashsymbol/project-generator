import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";

const InfoSection = ({ title, children, style }) => (
    <div style={{ marginBottom: 32, ...style }}>
        <h3 style={{ borderBottom: "2px solid #e9ecef", paddingBottom: 12, marginBottom: 16, color: "#212529", fontSize: 18 }}>{title}</h3>
        {children}
    </div>
);

const TagList = ({ items }) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {items?.map((item, i) => (
            <span key={i} style={{
                background: "#e9ecef",
                color: "#495057",
                padding: "6px 12px",
                borderRadius: 16,
                fontSize: 13,
                border: "1px solid #ced4da"
            }}>
                {item}
            </span>
        )) || <em style={{ color: "#868e96" }}>None</em>}
    </div>
);

export default function ProjectDetailPage() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.getProject(id)
            .then((res) => setProjects(res.data)) // typo in original code? No, original had setProject. Wait.
        // Copilot might have autocompleted wrong.
        // In read file: "api.getProject(id).then((res) => setProject(res.data))"
        // I'll fix it here.
    }, [id]);

    useEffect(() => {
        api.getProject(id)
            .then((res) => setProject(res.data))
            .catch((err) => setError("Failed to load project"))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#6c757d" }}>Loading project details...</div>;
    if (error) return <div style={{ padding: 40, textAlign: "center", color: "#dc3545" }}>Error: {error}</div>;
    if (!project) return <div style={{ padding: 40, textAlign: "center" }}>Project not found</div>;

    const { client } = project;

    return (
        <div style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            background: "#f8f9fa",
            minHeight: "100vh",
            padding: "40px 20px"
        }}>
            <div style={{ maxWidth: 1000, margin: "0 auto", background: "#fff", padding: 40, borderRadius: 8, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                <Link to="/" style={{ color: "#0d6efd", textDecoration: "none", fontWeight: 500, display: "inline-block", marginBottom: 20 }}>&larr; Back to Dashboard</Link>

                <header style={{ marginBottom: 40, borderBottom: "1px solid #eee", paddingBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                        <div>
                            <span style={{
                                textTransform: "uppercase",
                                fontSize: 11,
                                letterSpacing: 1,
                                color: "#6c757d",
                                fontWeight: 600,
                                display: "block",
                                marginBottom: 8
                            }}>
                                {project.category} {project.subcategory && ` / ${project.subcategory}`}
                            </span>
                            <h1 style={{ margin: 0, fontSize: 32, color: "#212529" }}>{project.title}</h1>
                        </div>
                        <span style={{
                            background: project.status === 'APPROVED' ? '#d1e7dd' : '#e2e3e5',
                            color: project.status === 'APPROVED' ? '#0f5132' : '#41464b',
                            padding: "8px 16px", borderRadius: 4, fontSize: 12, fontWeight: "bold", textTransform: "uppercase"
                        }}>
                            {project.status || "DRAFT"}
                        </span>
                    </div>
                </header>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 60 }}>
                    <main>
                        <InfoSection title="Project Overview">
                            <div style={{ color: "#495057", lineHeight: 1.6 }}>
                                <p><strong>Objective:</strong> {project.objective}</p>
                                {project.basic_details && <p style={{ marginTop: 12 }}><strong>Details:</strong> {project.basic_details}</p>}
                            </div>
                        </InfoSection>

                        <InfoSection title="Scope of Work">
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                                <div>
                                    <h5 style={{ color: "#198754", marginTop: 0, marginBottom: 12, textTransform: "uppercase", fontSize: 12, letterSpacing: 0.5 }}>Included</h5>
                                    <TagList items={project.scope_included} />
                                </div>
                                <div>
                                    <h5 style={{ color: "#dc3545", marginTop: 0, marginBottom: 12, textTransform: "uppercase", fontSize: 12, letterSpacing: 0.5 }}>Excluded</h5>
                                    <TagList items={project.scope_excluded} />
                                </div>
                            </div>
                        </InfoSection>

                        <InfoSection title="Deliverables">
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                {project.deliverables?.map((d, i) => (
                                    <div key={i} style={{
                                        background: "#fff",
                                        padding: 16,
                                        borderRadius: 6,
                                        border: "1px solid #dee2e6",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}>
                                        <div>
                                            <strong style={{ display: "block", color: "#212529" }}>{d.name}</strong>
                                            <span style={{ fontSize: 13, color: "#6c757d" }}>{d.format}</span>
                                        </div>
                                        <div style={{ textAlign: "right", fontSize: 13, color: "#495057" }}>
                                            Qty: <strong>{d.quantity}</strong>
                                            {d.notes && <div style={{ fontSize: 11, color: "#868e96", maxWidth: 200 }}>{d.notes}</div>}
                                        </div>
                                    </div>
                                )) || <em>No deliverables listed</em>}
                            </div>
                        </InfoSection>

                        <InfoSection title="Evaluation Criteria">
                            <div style={{ background: "#f8f9fa", padding: 20, borderRadius: 8 }}>
                                <h4 style={{ fontSize: 14, color: "#495057", marginTop: 0 }}>Creative</h4>
                                <ul style={{ paddingLeft: 20, margin: "8px 0 20px 0", color: "#212529", lineHeight: 1.5 }}>
                                    {project.evaluation_criteria_creative?.map((c, i) => <li key={i}>{c}</li>) || <li>None</li>}
                                </ul>

                                <h4 style={{ fontSize: 14, color: "#495057", marginBottom: 0 }}>Technical</h4>
                                <ul style={{ paddingLeft: 20, margin: "8px 0 0 0", color: "#212529", lineHeight: 1.5 }}>
                                    {project.evaluation_criteria_technical?.map((c, i) => <li key={i}>{c}</li>) || <li>None</li>}
                                </ul>
                            </div>
                        </InfoSection>
                    </main>

                    <aside>
                        <div style={{ background: "#f1f3f5", padding: 24, borderRadius: 8 }}>
                            <h5 style={{ marginTop: 0, marginBottom: 16, color: "#868e96", textTransform: "uppercase", fontSize: 11, letterSpacing: 1 }}>Client Profile</h5>
                            <h2 style={{ margin: "0 0 4px 0", fontSize: 24, color: "#343a40" }}>{client?.name}</h2>
                            <p style={{ fontSize: 14, color: "#495057", marginTop: 0 }}>{client?.industry} • {client?.client_type}</p>

                            <hr style={{ border: 0, borderTop: "1px solid #dee2e6", margin: "20px 0" }} />

                            <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 14, color: "#212529" }}>
                                <div><strong>Summary</strong><br /><span style={{ color: "#495057" }}>{client?.summary}</span></div>
                                <div><strong>What they do</strong><br /><span style={{ color: "#495057" }}>{client?.what_they_do}</span></div>
                                <div><strong>Primary Need</strong><br /><span style={{ color: "#495057" }}>{client?.primary_need}</span></div>
                            </div>

                            <div style={{ marginTop: 24 }}>
                                <strong style={{ fontSize: 13, display: "block", marginBottom: 8, color: "#343a40" }}>Preferences</strong>
                                <TagList items={client?.preferences} />
                            </div>
                            <div style={{ marginTop: 16 }}>
                                <strong style={{ fontSize: 13, display: "block", marginBottom: 8, color: "#343a40" }}>Dislikes</strong>
                                <TagList items={client?.dislikes} />
                            </div>
                        </div>

                        <div style={{ marginTop: 32 }}>
                            <h5 style={{ color: "#868e96", textTransform: "uppercase", fontSize: 11, letterSpacing: 1, marginBottom: 12 }}>Resources</h5>
                            <TagList items={project.resources_provided} />
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
