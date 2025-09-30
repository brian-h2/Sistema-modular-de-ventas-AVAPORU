// routes/AppRoutes.jsx
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import Navbar from "../components/ui/Navbar";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Auth/Login";
import NotFound from "../pages/NotFound";

function MainLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default function AppRoutes() {

  return (
    <Routes>
      {/* redirección inicial: de "/" a "/login" */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Login sin Navbar */}
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />

      {/* Todo lo demás con Navbar */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}