import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import ComparePage from "./pages/ComparePage";
import FavoritesPage from "./pages/FavoritesPage";
import NotificationsPage from "./pages/NotificationsPage";
import VehicleDetailsPage from "./pages/VehicleDetailsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/compare" element={<ProtectedRoute><ComparePage /></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboardPage /></ProtectedRoute>} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
