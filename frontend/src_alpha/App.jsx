import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CreateProjectPage from "./pages/CreateProjectPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import SkillProfilePage from "./pages/SkillProfilePage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#6c757d" }}>
        Loading...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/profile" element={
              <PrivateRoute>
                <SkillProfilePage />
              </PrivateRoute>
            } />
            <Route path="/" element={
              <PrivateRoute>
                <LandingPage />
              </PrivateRoute>
            } />
            <Route path="/create-project" element={
              <PrivateRoute>
                <CreateProjectPage />
              </PrivateRoute>
            } />
            <Route path="/project/:id" element={
              <PrivateRoute>
                <ProjectDetailPage />
              </PrivateRoute>
            } />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
