import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Award, Trophy, MapPin, Calendar, Leaf, Target, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import { useCart } from "../App";

const teamData = {
  "manish-kumawat": {
    name: "Manish Kumawat",
    role: "Founder & CEO",
    image: "https://ifsseeds.com/wp-content/uploads/2023/05/WhatsApp-Image-2023-05-22-at-10.20.34-PM.jpeg",
    achievement: "World Record Holder",
    achievementIcon: Trophy,
    color: "amber",
    tagline: "Visionary Leader in Agricultural Innovation",
    bio: `Manish Kumawat is the visionary founder and CEO of IFS Seeds (Innovative Farmers Seed), a company dedicated to revolutionizing agriculture in India. Born and raised in Sikar, Rajasthan, Manish has always been deeply connected to farming and understands the challenges faced by Indian farmers firsthand.

With a strong entrepreneurial spirit and a passion for innovation, Manish established IFS Seeds in 2021 with the mission of providing premium quality seeds to farmers across Gujarat and Rajasthan. His commitment to quality and farmer welfare has made IFS Seeds a trusted name in the agricultural sector.`,
    achievements: [
      "World Record Holder for agricultural innovation",
      "Founded IFS Seeds in 2021",
      "Built a network of 5000+ satisfied farmers",
      "Pioneered disease-resistant seed varieties for arid regions",
      "Established dealer network across Gujarat and Rajasthan"
    ],
    vision: "To empower every farmer in India with access to high-quality, innovative seeds that ensure higher yields and better livelihoods.",
    mission: "Empowering Farmers with Innovative Seeds for Higher Yields, Lower Costs, and a Prosperous Future.",
    education: "Agricultural Sciences & Business Management",
    location: "Sikar, Rajasthan",
    expertise: ["Agricultural Innovation", "Seed Technology", "Farmer Empowerment", "Business Development"]
  },
  "sundaram-verma": {
    name: "Sundaram Verma",
    role: "Director",
    image: "https://ifsseeds.com/wp-content/uploads/2023/05/WhatsApp-Image-2023-05-22-at-10.18.21-PM.jpeg",
    achievement: "President Award Winner",
    achievementIcon: Award,
    color: "blue",
    tagline: "National Recognition for Agricultural Excellence",
    bio: `Sundaram Verma is a highly respected figure in Indian agriculture, serving as the Director of IFS Seeds. His decades of experience and dedication to farmer welfare have earned him national recognition, including the prestigious President Award.

Sundaram ji brings invaluable expertise in agricultural practices, seed quality management, and farmer relations. His hands-on approach and deep understanding of farming challenges have been instrumental in developing IFS Seeds' product line and quality standards.`,
    achievements: [
      "Recipient of President Award for contribution to Indian agriculture",
      "Over 25 years of experience in agricultural sector",
      "Expert in seed quality and germination standards",
      "Instrumental in establishing quality control processes",
      "Mentor to hundreds of young agricultural entrepreneurs"
    ],
    vision: "To see every Indian farmer prosper through access to quality seeds and modern agricultural knowledge.",
    mission: "Ensuring that every seed we provide meets the highest standards of quality and germination rates.",
    education: "Advanced Studies in Agricultural Sciences",
    location: "Sikar, Rajasthan",
    expertise: ["Seed Quality Management", "Agricultural Research", "Farmer Training", "Quality Assurance"]
  }
};

export default function TeamMemberPage() {
  const { memberId } = useParams();
  const { cartCount } = useCart();
  const member = teamData[memberId];

  if (!member) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar cartCount={cartCount} />
        <div className="pt-24 text-center py-20">
          <h1 className="text-2xl font-bold text-stone-900">Team member not found</h1>
          <Link to="/">
            <Button className="mt-4 bg-green-700 hover:bg-green-800 rounded-full">
              Back to Home
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const AchievementIcon = member.achievementIcon;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar cartCount={cartCount} />
      
      <main className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link to="/#team" className="inline-flex items-center gap-2 text-stone-600 hover:text-green-700 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Team
          </Link>

          {/* Hero Section */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-stone-100 mb-8">
            <div className={`h-32 bg-gradient-to-r ${member.color === 'amber' ? 'from-amber-500 to-orange-500' : 'from-blue-500 to-indigo-500'}`} />
            
            <div className="px-8 pb-8 -mt-16">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg object-cover object-top"
                />
                <div className="flex-1">
                  <Badge className={`${member.color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'} mb-2`}>
                    <AchievementIcon className="w-4 h-4 mr-1" />
                    {member.achievement}
                  </Badge>
                  <h1 className="text-3xl md:text-4xl font-bold text-stone-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {member.name}
                  </h1>
                  <p className="text-green-600 font-semibold text-lg">{member.role}</p>
                  <p className="text-stone-500 italic mt-1">{member.tagline}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Bio */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <h2 className="text-xl font-bold text-stone-900 mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>About</h2>
                <div className="text-stone-600 leading-relaxed whitespace-pre-line">
                  {member.bio}
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <Star className="w-5 h-5 text-amber-500" />
                  Key Achievements
                </h2>
                <ul className="space-y-3">
                  {member.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${member.color === 'amber' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                        <span className="text-xs font-bold">{index + 1}</span>
                      </div>
                      <span className="text-stone-600">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Vision & Mission */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-green-600" />
                    <h3 className="font-bold text-stone-900">Vision</h3>
                  </div>
                  <p className="text-stone-600 text-sm">{member.vision}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-5 h-5 text-amber-600" />
                    <h3 className="font-bold text-stone-900">Mission</h3>
                  </div>
                  <p className="text-stone-600 text-sm">{member.mission}</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <h3 className="font-bold text-stone-900 mb-4">Quick Info</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">Location</p>
                      <p className="font-medium text-stone-900">{member.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">Education</p>
                      <p className="font-medium text-stone-900">{member.education}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expertise */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-600" />
                  Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {member.expertise.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-50 text-green-700 border border-green-200">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className={`rounded-2xl p-6 text-white ${member.color === 'amber' ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-gradient-to-br from-blue-500 to-indigo-500'}`}>
                <AchievementIcon className="w-10 h-10 mb-3 opacity-80" />
                <h3 className="font-bold text-lg mb-2">{member.achievement}</h3>
                <p className="text-sm opacity-90 mb-4">
                  Recognized for exceptional contribution to Indian agriculture.
                </p>
                <Link to="/shop">
                  <Button className="w-full bg-white text-stone-900 hover:bg-stone-100 rounded-full">
                    Shop Our Seeds
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
