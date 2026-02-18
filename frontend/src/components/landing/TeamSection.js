import React from "react";
import { Link } from "react-router-dom";
import { Award, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const teamMembers = [
  {
    id: "manish-kumawat",
    name: "Manish Kumawat",
    role: "Founder & CEO",
    image: "https://ifsseeds.com/wp-content/uploads/2023/05/WhatsApp-Image-2023-05-22-at-10.20.34-PM.jpeg",
    achievement: "World Record Holder",
    achievementIcon: Trophy,
    description: "Visionary leader driving agricultural innovation and empowering farmers across India with premium quality seeds.",
    color: "amber"
  },
  {
    id: "sundaram-verma",
    name: "Sundaram Verma",
    role: "Director",
    image: "https://ifsseeds.com/wp-content/uploads/2023/05/WhatsApp-Image-2023-05-22-at-10.18.21-PM.jpeg",
    achievement: "President Award Winner",
    achievementIcon: Award,
    description: "Recognized nationally for outstanding contribution to Indian agriculture and farmer welfare.",
    color: "blue"
  }
];

export default function TeamSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-green-50 to-white" data-testid="team-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Our Leadership</span>
          <h2 className="text-4xl md:text-5xl font-semibold text-stone-900 mt-2 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Meet the Visionaries
          </h2>
          <p className="text-stone-600 mt-4">
            Award-winning leaders dedicated to transforming Indian agriculture through 
            innovation and quality.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {teamMembers.map((member, index) => (
            <Link
              key={index}
              to={`/team/${member.id}`}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-stone-100 cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-80 overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Achievement Badge */}
                <Badge 
                  className={`absolute top-4 right-4 ${
                    member.color === "amber" 
                      ? "bg-amber-500 hover:bg-amber-600" 
                      : "bg-blue-500 hover:bg-blue-600"
                  } text-white gap-1.5 py-1.5 px-3`}
                >
                  <member.achievementIcon className="w-4 h-4" />
                  {member.achievement}
                </Badge>

                {/* Name & Role Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{member.name}</h3>
                  <p className="text-green-300 font-medium">{member.role}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-stone-600 leading-relaxed">
                  {member.description}
                </p>
                <span className="inline-block mt-4 text-green-600 font-semibold text-sm group-hover:underline">
                  View Full Profile →
                </span>
              </div>

              {/* Decorative Element */}
              <div className={`absolute top-0 left-0 w-1 h-full ${
                member.color === "amber" ? "bg-amber-500" : "bg-blue-500"
              }`} />
            </div>
          ))}
        </div>

        {/* Recognition Banner */}
        <div className="mt-16 bg-gradient-to-r from-green-700 via-green-800 to-green-700 rounded-2xl p-8 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-40 h-40 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Trophy className="w-8 h-8 text-amber-300" />
              <Award className="w-8 h-8 text-blue-300" />
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Award-Winning Excellence</h3>
            <p className="text-green-100 max-w-2xl mx-auto">
              Led by industry pioneers recognized at national and international levels for 
              their contribution to agriculture and farmer empowerment.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
