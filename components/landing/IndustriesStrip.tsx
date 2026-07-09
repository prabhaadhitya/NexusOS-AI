import { Stethoscope, Building, Store , Dumbbell, Wrench, GraduationCap, BriefcaseBusiness  } from "lucide-react";

const INDUSTRIES = [
  { name: "Restaurants & Hotels", icon: Building },
  { name: "Clinics & Hospitals", icon: Stethoscope },
  { name: "Retail Stores", icon: Store  },
  { name: "Coaching Centers", icon: GraduationCap },
  { name: "Gyms", icon: Dumbbell },
  { name: "Service Businesses", icon: Wrench },
  { name: "Small and Medium Enterprises", icon: BriefcaseBusiness  }
];

export function IndustriesStrip() {
  return (
    <section id="industries" className="py-12 bg-[#0A0B0F] border-t border-[#1F2230]/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-sm font-medium text-gray-500 mb-8 uppercase tracking-widest">
          Built for businesses of all shapes and sizes
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {INDUSTRIES.map((ind, i) => {
            const Icon = ind.icon;
            return (
              <div key={i} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <Icon size={20} />
                <span className="font-semibold">{ind.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
