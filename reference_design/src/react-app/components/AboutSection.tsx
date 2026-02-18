import { MapPin, Calendar, Users, Truck, Shield, Headphones } from "lucide-react";

const CERTIFICATIONS = [
  { src: "https://ifsseeds.com/wp-content/uploads/2023/05/1A-e1684861725399.png", alt: "IFS Certification 1" },
  { src: "https://ifsseeds.com/wp-content/uploads/2023/05/2.png", alt: "IFS Certification 2" },
  { src: "https://ifsseeds.com/wp-content/uploads/2023/05/3.png", alt: "IFS Certification 3" },
];

export default function AboutSection() {
  const features = [
    {
      icon: Shield,
      title: "Quality Assured",
      description: "Every seed is lab-tested for germination rate and purity"
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick shipping across Gujarat and Rajasthan"
    },
    {
      icon: Headphones,
      title: "Expert Support",
      description: "Agricultural experts available for guidance"
    }
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">About Us</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                Innovative Farmers Seed
              </h2>
              <p className="text-xl text-gray-600 mt-2 italic">First Choice of Farmers</p>
            </div>

            <p className="text-gray-600 leading-relaxed">
              Founded in 2021 in Sikar, Rajasthan, IFS Seeds has quickly become a trusted name 
              in agricultural excellence. We are committed to empowering farmers with innovative, 
              high-quality seeds that deliver higher yields and better returns.
            </p>

            <p className="text-gray-600 leading-relaxed">
              Our seeds are carefully selected and tested to ensure maximum germination rates 
              and disease resistance. We specialize in varieties perfectly suited for the 
              climate and soil conditions of Gujarat and Rajasthan.
            </p>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-semibold text-gray-900">Sikar, Rajasthan</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Established</p>
                  <p className="font-semibold text-gray-900">2021</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl col-span-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Coverage</p>
                  <p className="font-semibold text-gray-900">Gujarat & Rajasthan through Authorized Dealers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Features */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Why Choose IFS Seeds?</h3>
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{feature.title}</h4>
                      <p className="text-green-100 text-sm mt-1">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mission Statement */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
              <p className="text-amber-800 font-medium text-center italic">
                "Empowering Farmers with Innovative Seeds for Higher Yields, Lower Costs, 
                and a Prosperous Future – Choose IFS Seeds Today!"
              </p>
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="mt-16">
          <h3 className="text-center text-gray-500 font-medium mb-8 uppercase tracking-wider text-sm">
            Our Certifications & Recognition
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {CERTIFICATIONS.map((cert, index) => (
              <div 
                key={index} 
                className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
              >
                <img
                  src={cert.src}
                  alt={cert.alt}
                  className="h-24 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
