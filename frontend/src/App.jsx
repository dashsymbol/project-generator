import { useEffect, useState } from "react";

export default function App() {
  const [apiStatus, setApiStatus] = useState("unknown");
  const apiBase = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetch(`${apiBase}/api/health`)
      .then((r) => r.json())
      .then((data) => setApiStatus(data.status ?? "invalid"))
      .catch(() => setApiStatus("error"));
  }, [apiBase]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>MVP Skeleton</h1>
      <p>API status: {apiStatus}</p>
      <button type="button">Create New Project</button>
    </div>
  );
}
