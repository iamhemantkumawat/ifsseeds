import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Textarea } from "@/react-app/components/ui/textarea";

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Get In Touch</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Contact Us
          </h2>
          <p className="text-gray-600 mt-4">
            Have questions about our seeds or want to become a distributor? We'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Address</h4>
                    <p className="text-gray-600 mt-1">
                      IFS Seeds (Innovative Farmers Seed)<br />
                      Sikar, Rajasthan, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Phone</h4>
                    <p className="text-gray-600 mt-1">Contact for inquiries</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Email</h4>
                    <p className="text-gray-600 mt-1">info@ifsseeds.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Business Hours</h4>
                    <p className="text-gray-600 mt-1">Mon - Sat: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Distributor CTA */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Become a Distributor</h3>
              <p className="text-green-100 text-sm mb-4">
                Join our network of authorized dealers across Gujarat and Rajasthan.
              </p>
              <Button className="bg-white text-green-700 hover:bg-green-50 w-full">
                Apply Now
              </Button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Send us a Message</h3>
            
            <form className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <Input placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <Input placeholder="Your phone number" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <Input type="email" placeholder="your@email.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <Input placeholder="How can we help?" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <Textarea 
                  placeholder="Tell us about your requirements..." 
                  rows={4}
                />
              </div>

              <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2">
                <Send className="w-4 h-4" />
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
