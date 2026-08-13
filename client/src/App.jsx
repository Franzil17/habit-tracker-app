import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup    from "./pages/Signup";
import Login     from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Root redirect → login */}
        <Route path="/"          element={<Navigate to="/login" replace />} />
        <Route path="/signup"    element={<Signup />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Fallback */}
        <Route path="*"          element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
