import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";

//Creamos la rutas de la aplicacion
export default function AppRoutes() {
  return (
     <Routes>
      <Route path="/" element={<Dashboard />} />
      {/* <Route path="/about" element={<About />} /> */}
    </Routes>
  )
}
