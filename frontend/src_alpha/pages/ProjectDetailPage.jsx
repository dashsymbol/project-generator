import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";

const STATUS_STYLES = {
    GENERATING: { bg: "#fef3c7", color: "#92400e", label: "⏳ Generating" },
    DRAFT: { bg: "#e0e7ff", color: "#3730a3", label: "📝 Draft" },
    IN_PROGRESS: { bg: "#dbeafe", color: "#1e40af", label: "🔄 In Progress" },
    DELIVERED: { bg: "#d1fae5", color: "#065f46", label: "✅ Delivered" },
    FAILED: { bg: "#fee2e2", color: "#991b1b", label: "❌ Failed" },
};

const InfoSection = ({ title, children, style }) => (
    <div style={{ marginBottom: 32, ...style }}>
        <h3 style={{
            fontSize: 16,
            fontWeight: 600,
            color: "#374151",
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: "2px solid #e5e7eb"
        }}>
            {title}
        </h3>
        {children}
    </div>
);

const TagList = ({ items, color }) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {items?.map((item, i) => (
            <span key={i} style={{
                background: color ? `${color}15` : "#f3f4f6",
                color: color || "#374151",
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                border: `1px solid ${color ? `${color}30` : "#e5e7eb"}`
            }}>
                {item}
            </span>
        )) || <em style={{ color: "#9ca3af" }}>None</em>}
    </div>
);

export default function ProjectDetailPage() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProject = () => {
        api.getProject(id)
            .then((res) => {
                setProject(res.data);
                if (res.data.status !== 'GENERATING') {
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error(err);
                setError("Failed to load project");
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchProject();
        const interval = setInterval(() => {
            if (project && project.status === 'GENERATING') {
                fetchProject();
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [id, project?.status]);

    if (loading && (!project || project.status === 'GENERATING')) {
        return (
            <div style={{
                background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 20 }}>✨</div>
                    <div style={{ fontSize: 20, fontWeight: 600, color: "#1e40af", marginBottom: 12 }}>
                        Generating your project...
                    </div>
                    <div style={{ color: "#6b7280", marginBottom: 24 }}>
                        The AI is crafting your personalized brief
                    </div>
                    <div style={{
                        width: 40,
                        height: 40,
                        border: "4px solid #dbeafe",
                        borderTop: "4px solid #3b82f6",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        margin: "0 auto"
                    }}>
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: 40, textAlign: "center", color: "#dc2626" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Error</div>
                <div>{error}</div>
                <Link to="/" style={{ color: "#3b82f6", marginTop: 20, display: "inline-block" }}>← Back to Dashboard</Link>
            </div>
        );
    }

    if (!project) return <div style={{ padding: 40, textAlign: "center" }}>Project not found</div>;

    if (project.status === 'FAILED') {
        return (
            <div style={{ padding: 60, textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
                <h2 style={{ color: "#dc2626", marginBottom: 8 }}>Generation Failed</h2>
                <p style={{ color: "#6b7280" }}>Something went wrong with the AI generation. Please try again.</p>
                <Link to="/" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 600, marginTop: 20, display: "inline-block" }}>
                    ← Back to Dashboard
                </Link>
            </div>
        );
    }

    const { client } = project;
    const status = STATUS_STYLES[project.status] || STATUS_STYLES.DRAFT;

    return (
        <div style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 20%, #fed7aa 40%, #fecaca 60%, #f9a8d4 80%, #e9d5ff 100%)",
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
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                <Link to="/" style={{
                    color: "#3b82f6",
                    textDecoration: "none",
                    fontSize: 14,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    marginBottom: 20
                }}>
                    ← Back to Dashboard
                </Link>

                {/* Header Card */}
                <div style={{
                    background: "white",
                    padding: "32px 40px",
                    borderRadius: 16,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                    marginBottom: 24
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                        <div>
                            <span style={{
                                textTransform: "uppercase",
                                fontSize: 11,
                                letterSpacing: 1,
                                color: "#9ca3af",
                                fontWeight: 600,
                                display: "block",
                                marginBottom: 12
                            }}>
                                {project.category} {project.subcategory && ` / ${project.subcategory}`}
                            </span>
                            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: "#111827" }}>
                                {project.title}
                            </h1>
                        </div>
                        <span style={{
                            background: status.bg,
                            color: status.color,
                            padding: "8px 16px",
                            borderRadius: 10,
                            fontSize: 13,
                            fontWeight: 600
                        }}>
                            {status.label}
                        </span>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
                    {/* Main Content */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        {/* Project Overview */}
                        <div style={{ background: "white", padding: 32, borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
                            <InfoSection title="📋 Project Overview">
                                <div style={{ color: "#4b5563", lineHeight: 1.7, fontSize: 15 }}>
                                    <p style={{ margin: "0 0 16px 0" }}>
                                        <strong style={{ color: "#111827" }}>Objective:</strong> {project.objective}
                                    </p>
                                    {project.basic_details && (
                                        <p style={{ margin: 0 }}>
                                            <strong style={{ color: "#111827" }}>Details:</strong> {project.basic_details}
                                        </p>
                                    )}
                                </div>
                            </InfoSection>
                        </div>

                        {/* Scope of Work */}
                        <div style={{ background: "white", padding: 32, borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
                            <InfoSection title="🎯 Scope of Work">
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                                    <div>
                                        <h5 style={{
                                            color: "#059669",
                                            marginTop: 0,
                                            marginBottom: 12,
                                            textTransform: "uppercase",
                                            fontSize: 11,
                                            letterSpacing: 1,
                                            fontWeight: 600
                                        }}>
                                            ✓ Included
                                        </h5>
                                        <TagList items={project.scope_included} color="#059669" />
                                    </div>
                                    <div>
                                        <h5 style={{
                                            color: "#dc2626",
                                            marginTop: 0,
                                            marginBottom: 12,
                                            textTransform: "uppercase",
                                            fontSize: 11,
                                            letterSpacing: 1,
                                            fontWeight: 600
                                        }}>
                                            ✗ Excluded
                                        </h5>
                                        <TagList items={project.scope_excluded} color="#dc2626" />
                                    </div>
                                </div>
                            </InfoSection>
                        </div>

                        {/* Deliverables */}
                        <div style={{ background: "white", padding: 32, borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
                            <InfoSection title="📦 Deliverables">
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {project.deliverables?.map((d, i) => (
                                        <div key={i} style={{
                                            background: "#f9fafb",
                                            padding: 18,
                                            borderRadius: 12,
                                            border: "1px solid #e5e7eb",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }}>
                                            <div>
                                                <strong style={{ display: "block", color: "#111827", fontSize: 15, marginBottom: 4 }}>
                                                    {d.name}
                                                </strong>
                                                <span style={{ fontSize: 13, color: "#6b7280" }}>{d.format}</span>
                                            </div>
                                            <div style={{ textAlign: "right", fontSize: 13, color: "#4b5563" }}>
                                                Qty: <strong style={{ color: "#111827" }}>{d.quantity}</strong>
                                                {d.notes && <div style={{ fontSize: 11, color: "#9ca3af", maxWidth: 200, marginTop: 4 }}>{d.notes}</div>}
                                            </div>
                                        </div>
                                    )) || <em style={{ color: "#9ca3af" }}>No deliverables listed</em>}
                                </div>
                            </InfoSection>
                        </div>

                        {/* Evaluation Criteria */}
                        <div style={{ background: "white", padding: 32, borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
                            <InfoSection title="⭐ Evaluation Criteria">
                                <h4 style={{ fontSize: 11, color: "#9ca3af", marginTop: 0, marginBottom: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Creative</h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                                    {project.evaluation_criteria_creative?.map((c, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "start", gap: 10 }}>
                                            <div style={{
                                                width: 18,
                                                height: 18,
                                                border: "2px solid #d1d5db",
                                                borderRadius: 4,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                                marginTop: 2,
                                                background: "white"
                                            }}>
                                                <span style={{ color: "#6b7280", fontSize: 12, fontWeight: "bold" }}>✓</span>
                                            </div>
                                            <span style={{ color: "#374151", flex: 1, lineHeight: 1.6, fontSize: 15 }}>{c}</span>
                                        </div>
                                    )) || <div style={{ color: "#9ca3af" }}>None</div>}
                                </div>

                                <h4 style={{ fontSize: 11, color: "#9ca3af", marginTop: 0, marginBottom: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Technical</h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {project.evaluation_criteria_technical?.map((c, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "start", gap: 10 }}>
                                            <div style={{
                                                width: 18,
                                                height: 18,
                                                border: "2px solid #d1d5db",
                                                borderRadius: 4,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                                marginTop: 2,
                                                background: "white"
                                            }}>
                                                <span style={{ color: "#6b7280", fontSize: 12, fontWeight: "bold" }}>✓</span>
                                            </div>
                                            <span style={{ color: "#374151", flex: 1, lineHeight: 1.6 }}>{c}</span>
                                        </div>
                                    )) || <div style={{ color: "#9ca3af" }}>None</div>}
                                </div>
                            </InfoSection>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        {/* Client Profile */}
                        <div style={{ background: "white", padding: 28, borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
                            <h5 style={{
                                marginTop: 0,
                                marginBottom: 16,
                                color: "#9ca3af",
                                textTransform: "uppercase",
                                fontSize: 11,
                                letterSpacing: 1,
                                fontWeight: 600
                            }}>
                                👤 Client Profile
                            </h5>
                            <h2 style={{ margin: "0 0 6px 0", fontSize: 22, fontWeight: 700, color: "#111827" }}>
                                {client?.name}
                            </h2>
                            <p style={{ fontSize: 14, color: "#6b7280", marginTop: 0, marginBottom: 20 }}>
                                {client?.industry} • {client?.client_type}
                            </p>

                            <hr style={{ border: 0, borderTop: "1px solid #e5e7eb", margin: "20px 0" }} />

                            <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 14 }}>
                                <div>
                                    <strong style={{ color: "#374151", display: "block", marginBottom: 6 }}>Summary</strong>
                                    <span style={{ color: "#6b7280", lineHeight: 1.6 }}>{client?.summary}</span>
                                </div>
                                <div>
                                    <strong style={{ color: "#374151", display: "block", marginBottom: 6 }}>What they do</strong>
                                    <span style={{ color: "#6b7280", lineHeight: 1.6 }}>{client?.what_they_do}</span>
                                </div>
                                <div>
                                    <strong style={{ color: "#374151", display: "block", marginBottom: 6 }}>Primary Need</strong>
                                    <span style={{ color: "#6b7280", lineHeight: 1.6 }}>{client?.primary_need}</span>
                                </div>
                            </div>

                            <div style={{ marginTop: 24 }}>
                                <strong style={{ fontSize: 13, display: "block", marginBottom: 10, color: "#374151" }}>
                                    💚 Preferences
                                </strong>
                                <TagList items={client?.preferences} color="#059669" />
                            </div>
                            <div style={{ marginTop: 20 }}>
                                <strong style={{ fontSize: 13, display: "block", marginBottom: 10, color: "#374151" }}>
                                    🚫 Dislikes
                                </strong>
                                <TagList items={client?.dislikes} color="#dc2626" />
                            </div>
                        </div>

                        {/* Resources */}
                        <div style={{ background: "white", padding: 28, borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
                            <h5 style={{
                                color: "#9ca3af",
                                textTransform: "uppercase",
                                fontSize: 11,
                                letterSpacing: 1,
                                marginBottom: 12,
                                fontWeight: 600,
                                marginTop: 0
                            }}>
                                🔧 Resources Provided
                            </h5>
                            <TagList items={project.resources_provided} color="#3b82f6" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
