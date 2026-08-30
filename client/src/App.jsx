import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup         from "./pages/Signup";
import Login          from "./pages/Login";
import Dashboard      from "./pages/Dashboard";
import ImportantTasks from "./pages/ImportantTasks";
import Chatbot        from "./pages/Chatbot";

function App() {
  return (
    <Router>
      <Routes>
        {/* Root redirect → login */}
        <Route path="/"                element={<Navigate to="/login" replace />} />
        <Route path="/signup"          element={<Signup />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/dashboard"       element={<Dashboard />} />
        <Route path="/important-tasks" element={<ImportantTasks />} />
        <Route path="/chatbot"         element={<Chatbot />} />
        {/* Fallback */}
        <Route path="*"                element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
