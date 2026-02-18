import { Award, Trophy } from "lucide-react";
import { Badge } from "@/react-app/components/ui/badge";

const teamMembers = [
  {
    name: "Manish Kumawat",
    role: "Founder & CEO",
    image: "https://ifsseeds.com/wp-content/uploads/2023/05/WhatsApp-Image-2023-05-22-at-10.20.34-PM.jpeg",
    achievement: "World Record Holder",
    achievementIcon: Trophy,
    description: "Visionary leader driving agricultural innovation and empowering farmers across India with premium quality seeds.",
    color: "amber"
  },
  {
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
    <section className="py-20 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Our Leadership</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Meet the Visionaries
          </h2>
          <p className="text-gray-600 mt-4">
            Award-winning leaders dedicated to transforming Indian agriculture through 
            innovation and quality.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100"
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
                  <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
                  <p className="text-green-300 font-medium">{member.role}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 leading-relaxed">
                  {member.description}
                </p>
              </div>

              {/* Decorative Element */}
              <div className={`absolute top-0 left-0 w-1 h-full ${
                member.color === "amber" ? "bg-amber-500" : "bg-blue-500"
              }`} />
            </div>
          ))}
        </div>

        {/* Recognition Banner */}
        <div className="mt-16 bg-gradient-to-r from-green-600 via-green-700 to-green-600 rounded-2xl p-8 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-40 h-40 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Trophy className="w-8 h-8 text-amber-300" />
              <Award className="w-8 h-8 text-blue-300" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Award-Winning Excellence</h3>
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
