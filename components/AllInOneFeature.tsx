import { Camera, MapPin, ShieldCheck, Clock } from "lucide-react";

const benefits = [
  { icon: Camera, text: "AI-powered photo analysis in seconds" },
  { icon: MapPin, text: "Find professional clinics near you" },
  { icon: ShieldCheck, text: "100% confidential — no data stored" },
  { icon: Clock, text: "Results in under 30 seconds" },
];

const AllInOneFeature = () => {
  return (
    <section className="py-14 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
          {/* Left: text */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Your All-in-One Head Lice Solution
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              From photo check to professional treatment, NitNot guides you through every step. 
              No guesswork, no embarrassment — just clear answers and expert help when you need it.
            </p>
            <ul className="space-y-4">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <b.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{b.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: photo with icon overlay */}
          <div className="flex justify-center">
            <div className="relative w-full rounded-3xl overflow-hidden border border-border">
              <img
                src="/images/all-in-one.jpg"
                alt="Hair close-up for lice checking"
                className="w-full aspect-square object-cover"
              />
              {/* Icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Camera className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AllInOneFeature;
