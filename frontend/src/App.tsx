import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserProfile from "./pages/UserProfile";

function App() {
  return (
    <div id="app">
      <Router>
        <header>
          <nav className="container">
            <div className="logo">Auth Portal</div>
            <div className="nav-links">
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
              <Link to="/profile">Profile</Link>
            </div>
          </nav>
        </header>
        <main className="container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;
