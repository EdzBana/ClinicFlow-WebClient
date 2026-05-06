import { useState } from "react";
import logo from "../assets/mseuf_logo.webp";
import { useNavigate } from "react-router-dom";
import { login } from "./auth";
import PWAInstallButton from "@/components/PWAInstallButton";

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

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{
        backgroundColor: "#E8E9F3",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&family=DM+Serif+Display&display=swap');

        .login-input {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff;
          padding: 14px 18px;
          border-radius: 10px;
          font-size: 15px;
          width: 100%;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .login-input::placeholder { color: rgba(255,255,255,0.5); }
        .login-input:focus {
          border-color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.18);
        }

        .btn-login {
          background: #fff;
          color: #680000;
          font-weight: 600;
          font-size: 15px;
          border: none;
          border-radius: 10px;
          padding: 14px;
          width: 100%;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: background 0.2s, transform 0.1s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-login:hover { background: #f0e8e8; }
        .btn-login:active { transform: scale(0.98); }
        .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-student {
          background: transparent;
          color: #fff;
          font-weight: 500;
          font-size: 14px;
          border: 1px solid rgba(255,255,255,0.35);
          border-radius: 10px;
          padding: 12px 28px;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: background 0.2s, border-color 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-student:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.55);
        }

        .reset-link {
          color: rgba(255,255,255,0.6);
          font-size: 13px;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.2s;
        }
        .reset-link:hover { color: rgba(255,255,255,0.9); }

        .cross-accent {
          position: absolute;
          opacity: 0.06;
          pointer-events: none;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(104, 0, 0, 0.15);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .fade-up-d1 { animation-delay: 0.05s; }
        .fade-up-d2 { animation-delay: 0.12s; }
        .fade-up-d3 { animation-delay: 0.2s; }
        .fade-up-d4 { animation-delay: 0.28s; }
        .fade-up-d5 { animation-delay: 0.36s; }
      `}</style>

      {/* ── LEFT PANEL ── */}
      <div
        className="flex-1 flex flex-col relative"
        style={{ padding: "48px 56px" }}
      >
        {/* Decorative large circles */}
        <div
          style={{
            position: "absolute",
            bottom: -120,
            left: -120,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(104,0,0,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 40,
            width: 260,
            height: 260,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(104,0,0,0.05) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Logo + University name */}
        <div className="flex items-center gap-5 fade-up">
          <img
            src={logo}
            alt="MSEUF Logo"
            width={64}
            height={64}
            style={{ objectFit: "contain" }}
          />
          <div
            style={{
              borderLeft: "2px solid rgba(104,0,0,0.2)",
              paddingLeft: 16,
            }}
          >
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#680000",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Manuel S. Enverga
            </p>
            <p
              style={{
                fontSize: 13,
                fontWeight: 400,
                color: "rgba(104,0,0,0.65)",
                margin: 0,
              }}
            >
              University Foundation
            </p>
          </div>
        </div>

        {/* Hero text */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            maxWidth: 480,
          }}
        >
          <h1
            className="fade-up fade-up-d2"
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "clamp(42px, 5vw, 64px)",
              fontWeight: 400,
              color: "#680000",
              lineHeight: 1.1,
              margin: "0 0 24px",
            }}
          >
            Health &amp;
            <br />
            Dental Services
          </h1>

          {/* Small feature pills */}
          <div
            className="fade-up fade-up-d4"
            style={{
              display: "flex",
              gap: 10,
              marginTop: 36,
              flexWrap: "wrap",
            }}
          >
            {["Medical Records", "Appointments", "Dental Care"].map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#680000",
                  background: "rgba(104,0,0,0.08)",
                  border: "1px solid rgba(104,0,0,0.12)",
                  borderRadius: 20,
                  padding: "6px 14px",
                  letterSpacing: "0.02em",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <p
          className="fade-up fade-up-d5"
          style={{ fontSize: 12, color: "rgba(104,0,0,0.35)", margin: 0 }}
        >
          © {new Date().getFullYear()} MSEUF · Health &amp; Dental Services
          Portal
        </p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div
        style={{
          width: 440,
          background: "#680000",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "56px 48px",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* Subtle background geometry */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            border: "60px solid rgba(255,255,255,0.03)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 220,
            height: 220,
            borderRadius: "50%",
            border: "40px solid rgba(255,255,255,0.04)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 34,
                fontWeight: 400,
                color: "#fff",
                margin: "0 0 8px",
              }}
            >
              Welcome back
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.5)",
                margin: 0,
              }}
            >
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.6)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Email address
              </label>
              <input
                type="email"
                placeholder="you@mseuf.edu.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-input"
              />
            </div>

            <div>
              <label
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.6)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Password
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="reset-link"
                  style={{
                    textTransform: "none",
                    letterSpacing: 0,
                    fontWeight: 400,
                  }}
                >
                  Forgot password?
                </button>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
              />
            </div>

            {error && (
              <div
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,100,100,0.4)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "#ffaaaa",
                }}
              >
                {error}
              </div>
            )}

            <div style={{ marginTop: 8 }}>
              <button type="submit" disabled={loading} className="btn-login">
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              margin: "36px 0",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "rgba(255,255,255,0.12)",
              }}
            />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
              or
            </span>
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "rgba(255,255,255,0.12)",
              }}
            />
          </div>

          {/* Student Assistance */}
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.5)",
                marginBottom: 16,
              }}
            >
              Are you a student?
            </p>
            <button
              onClick={() => navigate("/student-assistance")}
              className="btn-student"
            >
              Student Assistance
            </button>
          </div>

          {/* PWA Install */}
          <div
            style={{ marginTop: 36, display: "flex", justifyContent: "center" }}
          >
            <PWAInstallButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthDentalLogin;
