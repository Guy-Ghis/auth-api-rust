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
    <div className="flex items-center justify-center mt-16">
      <div className="w-full max-w-md p-8 space-y-6 bg-secondary rounded-lg shadow-lg text-red-400">
        {error}
      </div>
    </div>
  );
  if (!user) return (
    <div className="flex items-center justify-center mt-16">
      <div className="w-full max-w-md p-8 space-y-6 bg-secondary rounded-lg shadow-lg">
        Loading...
      </div>
    </div>
  );


  return (
    <div className="flex items-center justify-center mt-16">
      <div className="w-full max-w-md p-8 space-y-6 bg-secondary rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-light-text">User Profile</h2>
        <div className="space-y-4 text-light-text">
          <div className="flex justify-between border-b border-accent pb-2">
            <span className="font-bold text-dark-text">Email:</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between border-b border-accent pb-2">
            <span className="font-bold text-dark-text">First Name:</span>
            <span>{user.first_name}</span>
          </div>
          <div className="flex justify-between border-b border-accent pb-2">
            <span className="font-bold text-dark-text">Last Name:</span>
            <span>{user.last_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-dark-text">Role:</span>
            <span>{user.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 