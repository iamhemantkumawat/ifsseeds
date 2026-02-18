import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, KeyRound } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API } from "../App";
import { toast } from "sonner";
import { SITE_ASSETS, toAssetUrl } from "@/lib/assets";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Reset token is missing");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/reset-password`, {
        token,
        new_password: formData.password
      });
      toast.success("Password reset successful. Please login.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-stone-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-stone-600 hover:text-green-700 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <div className="bg-white rounded-2xl p-8 shadow-xl border border-stone-100">
          <div className="text-center mb-8">
            <img src={toAssetUrl(SITE_ASSETS.logo)} alt="IFS Seeds" className="h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: "Outfit, sans-serif" }}>
              Reset Password
            </h1>
            <p className="text-stone-500 mt-1">Enter your new password below.</p>
          </div>

          {!token ? (
            <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
              Invalid reset link. Please request a new password reset email.
              <div className="mt-3">
                <Link to="/forgot-password" className="text-red-800 font-semibold underline">
                  Request reset link
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    className="mt-1 rounded-xl h-12 pl-10 pr-10"
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 mt-0.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    className="mt-1 rounded-xl h-12 pl-10 pr-10"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 mt-0.5" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-700 hover:bg-green-800 rounded-full h-12 text-lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
