import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProtectedService, AuthService } from "../api";
import type { User } from "../api";

function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export default function Profile() {
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
      // Set token for OpenAPI
      const { OpenAPI } = await import("../api");
      OpenAPI.TOKEN = token;
      try {
        const userData = await ProtectedService.profileRoute();
        setUser(userData);
      } catch {
        setError("Failed to fetch profile. Please login again.");
        setTimeout(() => navigate("/login"), 1500);
      }
    };
    fetchProfile();
  }, [navigate]);

  if (error) return <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow text-red-600">{error}</div>;
  if (!user) return <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">Loading...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Profile</h2>
      <div className="space-y-2">
        <div><b>Email:</b> {user.email}</div>
        <div><b>First Name:</b> {user.first_name}</div>
        <div><b>Last Name:</b> {user.last_name}</div>
        <div><b>Role:</b> {user.role}</div>
      </div>
    </div>
  );
} 