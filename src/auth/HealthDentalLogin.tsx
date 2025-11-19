import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "../assets/mseuf_logo.webp";
import { useNavigate } from "react-router-dom";
import { login } from "./auth";

const HealthDentalLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const userData = await login(email, password);
      console.log("Login successful:", userData);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = () => {
    console.log("Reset password clicked");
  };

  const handleStudentAssistance = () => {
    navigate("/student-assistance");
    console.log("Student assistance clicked");
  };

  return (
    <div className="h-screen flex" style={{ backgroundColor: "#E8E9F3" }}>
      {/* Left Section */}
      <div className="flex-1 flex flex-col relative">
        <div className="absolute top-8 left-8 flex items-start gap-4">
          <img src={logo} alt="MSEUF Logo" width={180} height={178} />
          <div className="pt-10">
            <h1
              className="text-4xl font-medium mb-1"
              style={{ color: "#680000" }}
            >
              Manuel S. Enverga
            </h1>
            <h2 className="text-4xl font-medium" style={{ color: "#680000" }}>
              University Foundation
            </h2>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <h1
            className="text-6xl font-bold leading-tight text-center"
            style={{ color: "#680000" }}
          >
            Health and Dental
            <br />
            Services
          </h1>
        </div>
      </div>

      {/* Right Section - Login */}
      <div
        className="w-120 flex flex-col justify-center items-center text-white px-8 h-screen"
        style={{ backgroundColor: "#680000" }}
      >
        <div className="w-full max-w-sm">
          <h2 className="text-4xl font-light mb-12 text-center">Welcome!</h2>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white text-gray-900 placeholder-gray-500 border-0 rounded"
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white text-gray-900 placeholder-gray-500 border-0 rounded"
            />

            {error && <div className="error text-red-300">{error}</div>}

            <div className="text-right mb-6">
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-white hover:text-gray-200 text-sm italic underline bg-transparent border-0 cursor-pointer"
              >
                Reset Password
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-32 py-2 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded mx-auto block"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Student Assistance */}
          <div className="mt-20 text-center">
            <p className="text-white italic mb-4">
              Are you a student? Click here
            </p>
            <Button
              onClick={handleStudentAssistance}
              className="px-8 py-2 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded w-50"
            >
              Student
              <br />
              Assistance
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthDentalLogin;
