import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import MainTemplate from "@/components/MainTemplate";
import { Eye, EyeOff } from "lucide-react";
import PWAInstallButton from "@/components/PWAInstallButton";

export default function Settings() {
  // Change password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePasswordMessage, setChangePasswordMessage] = useState("");

  const [showPw, setShowPw] = useState(false);

  // Bug report state
  const [bugSubject, setBugSubject] = useState("");
  const [bugDescription, setBugDescription] = useState("");
  const [bugMessage, setBugMessage] = useState("");

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setChangePasswordMessage(
        "New password and confirm password do not match."
      );
      return;
    }

    // Verify old password by signing in again
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: (await supabase.auth.getUser()).data.user?.email ?? "",
      password: oldPassword,
    });

    if (authError) {
      setChangePasswordMessage("Old password is incorrect.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) setChangePasswordMessage(error.message);
    else {
      setChangePasswordMessage("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  async function handleSubmitBug(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.from("bug_reports").insert({
      subject: bugSubject,
      description: bugDescription,
      created_at: new Date(),
    });

    if (error) setBugMessage(error.message);
    else {
      setBugMessage("Bug submitted successfully!");
      setBugSubject("");
      setBugDescription("");
    }
  }

  return (
    <MainTemplate>
      <div className="max-w-2xl mx-auto p-6 space-y-10">
        {/* Change Password */}
        <section className="p-6 border bg-white rounded-xl shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-700">
            Change Password
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
            {/* Old Password */}
            <div>
              <label className="block text-sm mb-1">Old Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Old Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full p-2 border rounded bg-white shadow-sm"
                  required
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 border rounded bg-white shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 border rounded bg-white shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((prev) => !prev)}
                  className="absolute right-2 top-2 text-gray-600"
                >
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#680000] text-white"
            >
              Update Password
            </button>
          </form>
          {changePasswordMessage && (
            <p className="mt-2">{changePasswordMessage}</p>
          )}
        </section>

        {/* Bug Report */}
        <section className="p-6 border bg-white rounded-xl shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-700">Report a Bug</h2>
          <form onSubmit={handleSubmitBug} className="space-y-4 mt-4">
            {/* Subject */}
            <input
              type="text"
              placeholder="Bug Subject"
              value={bugSubject}
              onChange={(e) => setBugSubject(e.target.value)}
              className="w-full p-2 border rounded bg-white shadow-sm"
              required
            />

            {/* Description */}
            <textarea
              placeholder="Describe the issue"
              value={bugDescription}
              onChange={(e) => setBugDescription(e.target.value)}
              className="w-full p-2 border rounded h-32 bg-white shadow-sm"
              required
            />

            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#680000] text-white"
            >
              Submit Bug
            </button>
          </form>
          {bugMessage && <p className="mt-2">{bugMessage}</p>}
        </section>
        <section className="p-6 border bg-white rounded-xl shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-700">
            Install Application Locally
          </h2>
          <div className="mt-4">
            <PWAInstallButton />
          </div>
        </section>
      </div>
    </MainTemplate>
  );
}
