import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";

export default function ProjectDetailPage() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.getProject(id)
            .then((res) => setProject(res.data))
            .catch((err) => setError("Failed to load project"))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
    if (error) return <div style={{ padding: 24, color: "red" }}>{error}</div>;
    if (!project) return <div style={{ padding: 24 }}>Project not found</div>;

    const { client } = project;

    return (
        <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 800, margin: "0 auto" }}>
            <Link to="/">&larr; Back to List</Link>

            <div style={{ marginTop: 20, border: "1px solid #ddd", padding: 20, borderRadius: 8 }}>
                <h1 style={{ marginTop: 0 }}>{project.title}</h1>
                <span style={{ background: "#eee", padding: "4px 8px", borderRadius: 4, fontSize: 14 }}>
                    {project.category}
                </span>

                <h3>Objective</h3>
                <p>{project.objective}</p>

                <h3>Problem Statement</h3>
                <p>{project.problem_statement}</p>

                <h3>Client: {client?.name}</h3>
                <p><strong>Summary:</strong> {client?.summary}</p>
                <p><strong>Target Audience:</strong> {client?.target_audience}</p>
                <p><strong>Primary Problem:</strong> {client?.primary_problem}</p>

                <h3>Deliverables</h3>
                <ul>
                    {project.deliverables?.map((d, i) => (
                        <li key={i}>{d.name} ({d.format}) - Qty: {d.quantity}</li>
                    ))}
                </ul>

                <h3>Evaluation Criteria</h3>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ textAlign: "left" }}>
                            <th>Criterion</th>
                            <th>Weight</th>
                            <th>Pass</th>
                        </tr>
                    </thead>
                    <tbody>
                        {project.evaluation_criteria?.map((c, i) => (
                            <tr key={i}>
                                <td>{c.criterion} <br /><small>{c.description}</small></td>
                                <td>{c.weight}</td>
                                <td>{c.pass_threshold}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
