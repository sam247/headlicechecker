import { Button } from "@/components/ui/button";
import { MapPin, ShieldCheck, Clock, Heart } from "lucide-react";

const FeatureHighlight = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
          {/* Left: visual */}
          <div className="flex justify-center">
            <div className="w-full aspect-[4/3] rounded-3xl bg-gradient-to-br from-secondary/15 via-primary/10 to-muted border border-border flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(var(--primary)/0.1),transparent_60%)]" />
              <div className="text-center relative z-10">
                <MapPin className="h-14 w-14 text-primary mx-auto mb-4" />
                <p className="text-foreground font-bold text-lg">40+ Clinics</p>
                <p className="text-muted-foreground text-sm">Across the UK</p>
              </div>
            </div>
          </div>

          {/* Right: text */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Boost Your Confidence with Expert Help
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Our network of professional clinics provides fast, friendly treatment. 
              No judgement, no fuss — just experienced specialists who've seen it all.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { icon: ShieldCheck, text: "Guaranteed removal" },
                { icon: Clock, text: "60-min sessions" },
                { icon: Heart, text: "Child-friendly" },
                { icon: MapPin, text: "UK-wide clinics" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                  <item.icon className="h-4 w-4 text-primary shrink-0" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
            <Button
              onClick={() => scrollTo("photo-checker")}
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Find a Clinic Near You
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureHighlight;
