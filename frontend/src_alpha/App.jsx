import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CreateProjectPage from "./pages/CreateProjectPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import { AuthProvider, useAuth } from "./context/AuthContext";

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#6c757d" }}>
        Loading...
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route element={<PrivateRoute />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/create" element={<CreateProjectPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
