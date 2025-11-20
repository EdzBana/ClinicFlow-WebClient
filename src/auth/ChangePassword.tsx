import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import supabase from "@/lib/supabaseClient";
import StudentPageTemplate from "@/pages/Student Side/StudentPageTemplate";

export const ChangePassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sessionLoading, setSessionLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Verify OTP token from email link
  React.useEffect(() => {
    const verifyToken = async () => {
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (token_hash && type === "recovery") {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: "recovery",
          });

          if (error) {
            setError(
              "Invalid or expired reset link. Please request a new one."
            );
            setTimeout(() => navigate("/forgot-password"), 3000);
          }
        } catch (err) {
          setError("Failed to verify reset link");
        }
      } else {
        // Check if user already has a valid session (direct navigation)
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setError(
            "No valid reset session found. Please request a new reset link."
          );
          setTimeout(() => navigate("/forgot-password"), 3000);
        }
      }

      setSessionLoading(false);
    };

    verifyToken();
  }, [navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setMessage("Password updated successfully! Redirecting to login...");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <StudentPageTemplate pageTitle="Change Password">
        <div className="flex items-center justify-center px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
            <p className="text-gray-600">Verifying reset link...</p>
          </div>
        </div>
      </StudentPageTemplate>
    );
  }

  return (
    <StudentPageTemplate pageTitle="Change Password">
      <div className="flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ color: "#680000" }}
          >
            Create New Password
          </h2>
          <p className="text-gray-600 mb-6">
            Please enter your new password below.
          </p>

          {message && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm">{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-900 focus:border-transparent"
                placeholder="Enter new password"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-900 focus:border-transparent"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: loading ? "#999" : "#680000" }}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </StudentPageTemplate>
  );
};
