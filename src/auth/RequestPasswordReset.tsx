import React, { useState } from "react";
import supabase from "@/lib/supabaseClient";
import StudentPageTemplate from "@/pages/Student Side/StudentPageTemplate";

// Reset Password Request Page (Enter Email)
export const RequestPasswordReset: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage("Password reset link has been sent to your email!");
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentPageTemplate pageTitle="Reset Password">
      <div className="flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ color: "#680000" }}
          >
            Forgot your password?
          </h2>
          <p className="text-gray-600 mb-6">
            Enter your email address and we'll send you a link to reset your
            password.
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
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-900 focus:border-transparent"
                placeholder="your.email@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: loading ? "#999" : "#680000" }}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/login"
              className="text-sm hover:underline"
              style={{ color: "#680000" }}
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </StudentPageTemplate>
  );
};
