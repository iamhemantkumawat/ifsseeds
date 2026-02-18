import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Send } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API } from "../App";
import { toast } from "sonner";
import { SITE_ASSETS, toAssetUrl } from "@/lib/assets";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
      setSubmitted(true);
      toast.success("If your email is registered, reset instructions were sent.");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Unable to process request");
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
              Forgot Password
            </h1>
            <p className="text-stone-500 mt-1">
              Enter your registered email to receive reset instructions.
            </p>
          </div>

          {submitted ? (
            <div className="p-4 rounded-xl border border-green-200 bg-green-50 text-green-800 text-sm">
              Reset link has been sent (if account exists). Please check your inbox and spam folder.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="forgot-email">Email</Label>
                <div className="relative">
                  <Input
                    id="forgot-email"
                    type="email"
                    className="mt-1 rounded-xl h-12 pl-10"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 mt-0.5" />
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
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </form>
          )}

          <p className="text-center text-stone-600 mt-6">
            Remember your password?{" "}
            <Link to="/login" className="text-green-700 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
