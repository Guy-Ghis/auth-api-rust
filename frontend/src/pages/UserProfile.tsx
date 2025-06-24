import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProtectedService, OpenAPI, AuthService } from "../api";
import type { User } from "../api";

function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      let token = sessionStorage.getItem("token");
      let expiry = token ? getTokenExpiry(token) : null;

      // If token is expired or missing, try refresh
      if (!token || !expiry || expiry < Date.now()) {
        try {
          const res = await AuthService.refreshToken();
          token = res.token;
          sessionStorage.setItem("token", token);
          const newExpiry = getTokenExpiry(token);
          if (newExpiry) sessionStorage.setItem("token_expiry", newExpiry.toString());
          expiry = newExpiry;
        } catch {
          setError("Session expired. Please login again.");
          setTimeout(() => navigate("/login"), 1500);
          return;
        }
      }

      // Set auto-logout timer
      if (expiry) {
        setTimeout(() => {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("token_expiry");
          navigate("/login");
        }, expiry - Date.now());
      }
      
      OpenAPI.TOKEN = token;
      try {
        // Call the /profile endpoint
        const userData = await ProtectedService.profileRoute();
        setUser(userData);
      } catch {
        setError("Failed to fetch profile. Please login again.");
        setTimeout(() => navigate("/login"), 1500);
      }
    };
    fetchProfile();
  }, [navigate]);

  if (error) return (
    <div className="error-message">
      <div className="message-box">
        {error}
      </div>
    </div>
  );
  if (!user) return (
    <div className="loading-message">
      <div className="message-box">
        Loading...
      </div>
    </div>
  );


  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        <h2 className="profile-title">User Profile</h2>
        <div className="profile-info">
          <div className="profile-info-item">
            <span className="profile-info-label">Email:</span>
            <span>{user.email}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">First Name:</span>
            <span>{user.first_name}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">Last Name:</span>
            <span>{user.last_name}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">Role:</span>
            <span>{user.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 