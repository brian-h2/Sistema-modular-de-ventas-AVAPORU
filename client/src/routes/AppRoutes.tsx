// routes/AppRoutes.jsx
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import ProtectedRoute from "../routes/ProtectedRoute";
import Navbar from "../components/ui/Navbar";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Auth/Login";
import NotFound from "../pages/NotFound";
import Sales from "../pages/Sales";
import Register from "../pages/Auth/Register";
import Stock from "../pages/Products";

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
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<NotFound />} />

      {/* Todo lo demás con Navbar */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/stock" element={<Stock />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sales" element={<Sales />} />
        </Route>
      </Route>
    </Routes>
  );
}