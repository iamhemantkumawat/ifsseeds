import React, { useState, useEffect } from "react";
import { Mail, Save, Send, CheckCircle, CreditCard, MessageCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const [razorpaySettings, setRazorpaySettings] = useState({
    enabled: true,
    key_id: "",
    key_secret: ""
  });

  const [whatsappSettings, setWhatsappSettings] = useState({
    number: "+919950279664",
    enabled: true
  });

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const [smtpRes, razorpayRes, whatsappRes] = await Promise.all([
        axios.get(`${API}/admin/settings/smtp`, { headers }),
        axios.get(`${API}/admin/settings/razorpay`, { headers }),
        axios.get(`${API}/admin/settings/whatsapp`, { headers })
      ]);
      
      setSmtpSettings(smtpRes.data);
      setRazorpaySettings(razorpayRes.data);
      setWhatsappSettings(whatsappRes.data);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSMTP = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/admin/settings/smtp`, smtpSettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("SMTP settings saved successfully");
    } catch (error) {
      toast.error("Failed to save SMTP settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRazorpay = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/admin/settings/razorpay`, razorpaySettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Razorpay settings saved successfully");
    } catch (error) {
      toast.error("Failed to save Razorpay settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWhatsApp = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/admin/settings/whatsapp`, whatsappSettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("WhatsApp settings saved successfully");
    } catch (error) {
      toast.error("Failed to save WhatsApp settings");
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
      <Tabs defaultValue="smtp" className="max-w-2xl">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="smtp" className="gap-2">
            <Mail className="w-4 h-4" />
            SMTP
          </TabsTrigger>
          <TabsTrigger value="razorpay" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Razorpay
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </TabsTrigger>
        </TabsList>

        {/* SMTP Settings */}
        <TabsContent value="smtp">
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
              <form onSubmit={handleSaveSMTP} className="space-y-4">
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
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-green-700 hover:bg-green-800"
                  disabled={saving}
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save SMTP Settings
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
                  />
                  <Button
                    type="button"
                    onClick={handleTestEmail}
                    disabled={testing}
                    variant="outline"
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
        </TabsContent>

        {/* Razorpay Settings */}
        <TabsContent value="razorpay">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Razorpay Payment Settings
              </CardTitle>
              <CardDescription>
                Configure Razorpay payment gateway for online payments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveRazorpay} className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                  <div>
                    <Label className="text-base font-semibold">Enable Razorpay Payments</Label>
                    <p className="text-sm text-stone-500">Allow customers to pay online</p>
                  </div>
                  <Switch
                    checked={razorpaySettings.enabled}
                    onCheckedChange={(checked) => setRazorpaySettings({...razorpaySettings, enabled: checked})}
                  />
                </div>

                <div>
                  <Label htmlFor="razorpay_key_id">Key ID *</Label>
                  <Input
                    id="razorpay_key_id"
                    value={razorpaySettings.key_id}
                    onChange={(e) => setRazorpaySettings({...razorpaySettings, key_id: e.target.value})}
                    placeholder="rzp_test_xxxxx"
                    className="mt-1 font-mono"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="razorpay_key_secret">Key Secret *</Label>
                  <Input
                    id="razorpay_key_secret"
                    type="password"
                    value={razorpaySettings.key_secret}
                    onChange={(e) => setRazorpaySettings({...razorpaySettings, key_secret: e.target.value})}
                    placeholder="Enter key secret"
                    className="mt-1"
                    required
                  />
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Get your Razorpay keys from{" "}
                    <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer" className="underline">
                      Razorpay Dashboard
                    </a>
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={saving}
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Razorpay Settings
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Settings */}
        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-500" />
                WhatsApp Settings
              </CardTitle>
              <CardDescription>
                Configure WhatsApp number for order notifications and customer support.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveWhatsApp} className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                  <div>
                    <Label className="text-base font-semibold">Enable WhatsApp Orders</Label>
                    <p className="text-sm text-stone-500">Allow customers to order via WhatsApp</p>
                  </div>
                  <Switch
                    checked={whatsappSettings.enabled}
                    onCheckedChange={(checked) => setWhatsappSettings({...whatsappSettings, enabled: checked})}
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp_number">WhatsApp Number *</Label>
                  <Input
                    id="whatsapp_number"
                    value={whatsappSettings.number}
                    onChange={(e) => setWhatsappSettings({...whatsappSettings, number: e.target.value})}
                    placeholder="+919950279664"
                    className="mt-1"
                    required
                  />
                  <p className="text-xs text-stone-500 mt-1">Include country code (e.g., +91 for India)</p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-800">
                    This number will be used across the entire website for:
                  </p>
                  <ul className="text-sm text-green-700 mt-2 list-disc list-inside">
                    <li>Order via WhatsApp button on checkout</li>
                    <li>Footer contact section</li>
                    <li>Customer support inquiries</li>
                  </ul>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#25D366] hover:bg-[#128C7E]"
                  disabled={saving}
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save WhatsApp Settings
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
