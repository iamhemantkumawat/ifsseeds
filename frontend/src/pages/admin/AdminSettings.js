import React, { useState, useEffect } from "react";
import { Mail, Save, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import axios from "axios";
import { API } from "../../App";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "sonner";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [smtpSettings, setSmtpSettings] = useState({
    smtp_server: "",
    smtp_port: 2525,
    smtp_username: "",
    smtp_password: "",
    from_email: ""
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/admin/settings/smtp`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSmtpSettings(res.data);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/admin/settings/smtp`, smtpSettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("SMTP settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error("Please enter a test email address");
      return;
    }
    setTesting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/admin/settings/smtp/test`, { email: testEmail }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Test email sent successfully!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to send test email");
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-600" />
              SMTP Email Settings
            </CardTitle>
            <CardDescription>
              Configure your email server for sending order notifications and alerts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp_server">SMTP Server *</Label>
                  <Input
                    id="smtp_server"
                    value={smtpSettings.smtp_server}
                    onChange={(e) => setSmtpSettings({...smtpSettings, smtp_server: e.target.value})}
                    placeholder="mail.smtp2go.com"
                    className="mt-1"
                    required
                    data-testid="smtp-server-input"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_port">SMTP Port *</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={smtpSettings.smtp_port}
                    onChange={(e) => setSmtpSettings({...smtpSettings, smtp_port: parseInt(e.target.value)})}
                    placeholder="2525"
                    className="mt-1"
                    required
                    data-testid="smtp-port-input"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="smtp_username">SMTP Username *</Label>
                <Input
                  id="smtp_username"
                  value={smtpSettings.smtp_username}
                  onChange={(e) => setSmtpSettings({...smtpSettings, smtp_username: e.target.value})}
                  placeholder="your-username"
                  className="mt-1"
                  required
                  data-testid="smtp-username-input"
                />
              </div>

              <div>
                <Label htmlFor="smtp_password">SMTP Password *</Label>
                <Input
                  id="smtp_password"
                  type="password"
                  value={smtpSettings.smtp_password}
                  onChange={(e) => setSmtpSettings({...smtpSettings, smtp_password: e.target.value})}
                  placeholder="Enter password"
                  className="mt-1"
                  required
                  data-testid="smtp-password-input"
                />
              </div>

              <div>
                <Label htmlFor="from_email">From Email *</Label>
                <Input
                  id="from_email"
                  type="email"
                  value={smtpSettings.from_email}
                  onChange={(e) => setSmtpSettings({...smtpSettings, from_email: e.target.value})}
                  placeholder="noreply@ifsseeds.com"
                  className="mt-1"
                  required
                  data-testid="smtp-from-email-input"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-700 hover:bg-green-800"
                disabled={saving}
                data-testid="save-smtp-btn"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </form>

            {/* Test Email Section */}
            <div className="mt-8 pt-6 border-t border-stone-200">
              <h4 className="font-semibold text-stone-900 mb-4">Test Email Configuration</h4>
              <div className="flex gap-3">
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter test email address"
                  data-testid="test-email-input"
                />
                <Button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={testing}
                  variant="outline"
                  data-testid="send-test-email-btn"
                >
                  {testing ? (
                    <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Test
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Current SMTP2GO Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-stone-50 p-4 rounded-xl text-sm space-y-2">
              <p><strong>Server:</strong> mail.smtp2go.com</p>
              <p><strong>Ports:</strong> 2525, 8025, 587, 80, or 25 (TLS available)</p>
              <p><strong>SSL Ports:</strong> 465, 8465, 443</p>
              <p className="text-green-600 flex items-center gap-1 mt-2">
                <CheckCircle className="w-4 h-4" />
                SMTP credentials are pre-configured
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
