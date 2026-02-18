import React, { useEffect, useState } from "react";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { API } from "../../App";
import { toast } from "sonner";

const WHATSAPP_NUMBER = "+919950279664";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [siteSettings, setSiteSettings] = useState({
    whatsapp_number: WHATSAPP_NUMBER
  });

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const res = await axios.get(`${API}/settings/site`);
        setSiteSettings(res.data);
      } catch (error) {
        console.error("Failed to fetch site settings:", error);
      }
    };
    fetchSiteSettings();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const message = `🌱 *IFS Seeds - New Contact Message*\n\n` +
      `*Name:* ${formData.name}\n` +
      `*Phone:* ${formData.phone}\n` +
      `*Email:* ${formData.email || "Not provided"}\n` +
      `*Subject:* ${formData.subject}\n` +
      `*Message:*\n${formData.message}`;

    const whatsappNumber = siteSettings.whatsapp_number?.replace(/[^0-9]/g, "") || WHATSAPP_NUMBER.replace(/[^0-9]/g, "");
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    const popup = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    if (!popup) {
      window.location.href = whatsappUrl;
    }

    // Keep storing contact inquiries in backend for admin records.
    axios.post(`${API}/contact`, formData).catch(() => {});

    toast.success("Opening WhatsApp with your message...");
    setFormData({ name: "", phone: "", email: "", subject: "", message: "" });
    setLoading(false);
  };

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-green-50 to-white" data-testid="contact-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Get In Touch</span>
          <h2 className="text-4xl md:text-5xl font-semibold text-stone-900 mt-2 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Contact Us
          </h2>
          <p className="text-stone-600 mt-4">
            Have questions about our seeds or want to become a distributor? We'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-stone-100">
              <h3 className="text-xl font-bold text-stone-900 mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900">Address</h4>
                    <p className="text-stone-600 mt-1">
                      Ward no. 1, dhabai wali kothi, Danta,<br />
                      Sikar, Rajasthan, India 332702
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900">Phone</h4>
                    <a href="tel:+919950279664" className="text-stone-600 mt-1 hover:text-green-700 transition-colors">+91 99502 79664</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900">Email</h4>
                    <p className="text-stone-600 mt-1">info@ifsseeds.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900">Business Hours</h4>
                    <p className="text-stone-600 mt-1">Mon - Sat: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Distributor CTA */}
            <div className="bg-gradient-to-r from-green-700 to-green-800 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Become a Distributor</h3>
              <p className="text-green-100 text-sm mb-4">
                Join our network of authorized dealers across Gujarat and Rajasthan.
              </p>
              <Button className="bg-white text-green-700 hover:bg-green-50 w-full rounded-full">
                Apply Now
              </Button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-stone-100">
            <h3 className="text-xl font-bold text-stone-900 mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>Send us a Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Name</label>
                  <Input 
                    placeholder="Your name" 
                    className="rounded-xl h-12"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    data-testid="contact-name-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Phone</label>
                  <Input 
                    placeholder="Your phone number" 
                    className="rounded-xl h-12"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    data-testid="contact-phone-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Email</label>
                <Input 
                  type="email" 
                  placeholder="your@email.com" 
                  className="rounded-xl h-12"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  data-testid="contact-email-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Subject</label>
                <Input 
                  placeholder="How can we help?" 
                  className="rounded-xl h-12"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required
                  data-testid="contact-subject-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Message</label>
                <Textarea 
                  placeholder="Tell us about your requirements..." 
                  rows={4}
                  className="rounded-xl"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                  data-testid="contact-message-input"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-700 hover:bg-green-800 text-white gap-2 rounded-full h-12"
                disabled={loading}
                data-testid="contact-submit-btn"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
