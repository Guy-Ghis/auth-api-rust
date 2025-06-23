import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <nav className="flex gap-4 p-4 bg-gray-100 border-b">
        <Link to="/login" className="text-blue-600">Login</Link>
        <Link to="/register" className="text-blue-600">Register</Link>
        <Link to="/profile" className="text-blue-600">Profile</Link>
      </nav>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
