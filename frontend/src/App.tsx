import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserProfile from "./pages/UserProfile";

function App() {
  return (
    <Router>
      <header className="bg-secondary">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-highlight">Auth Portal</div>
          <div className="flex gap-6">
            <Link to="/login" className="text-light-text hover:text-highlight transition-colors duration-300">Login</Link>
            <Link to="/register" className="text-light-text hover:text-highlight transition-colors duration-300">Register</Link>
            <Link to="/profile" className="text-light-text hover:text-highlight transition-colors duration-300">Profile</Link>
          </div>
        </nav>
      </header>
      <main className="container mx-auto p-6">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
