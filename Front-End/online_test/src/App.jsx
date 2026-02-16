import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeComponent from "./components/HomeComponent";
import TestPageComponent from "./components/TestPageComponent";
import ResultPage from "./components/ResultPage";
import AdminLogin from "./components/admin/AdminLogin";
import AdminAttempts from "./components/admin/AdminAttempts";
import AdminRoute from "./components/admin/AdminRoute";
import AdminAudit from "./components/admin/AdminAudit";
import AdminAnswer from "./components/admin/AdminAnswer";
import NotFound from "./components/NotFound";
import ProtectedTestRoute from "./components/ProtectedTestRoute";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeComponent />} />
        <Route path="/test/:attemptId" element={<ProtectedTestRoute><TestPageComponent /></ProtectedTestRoute>} />
        <Route path="/result/:attemptId" element={<ResultPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/attempts"
          element={
            <AdminRoute>
              <AdminAttempts />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/attempt/:attemptId"
          element={
            <AdminRoute>
              <AdminAudit />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/attempt/:attemptId/answers"
          element={
            <AdminRoute>
              <AdminAnswer />
            </AdminRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
