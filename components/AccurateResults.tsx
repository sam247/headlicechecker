import { Check, AlertTriangle, Sparkles } from "lucide-react";

const cards = [
  {
    label: "Lice",
    image: "/images/lice.jpeg",
    icon: AlertTriangle,
    title: "Active Lice Detected",
    description: "Our checker identified live lice near the scalp. Professional treatment is recommended for fast, effective removal.",
    color: "text-destructive",
    iconColor: "text-destructive",
  },
  {
    label: "Dandruff",
    image: "/images/dandruff.jpeg",
    icon: Sparkles,
    title: "Likely Dandruff",
    description: "The flakes appear to be dandruff, not nits. Dandruff flakes move easily and aren't cemented to the hair shaft.",
    color: "text-muted-foreground",
    iconColor: "text-muted-foreground",
  },
  {
    label: "Clean",
    image: "/images/clean.jpeg",
    icon: Check,
    title: "All Clear!",
    description: "No signs of lice or nits detected. Regular checks help catch any issues early — we recommend weekly combing.",
    color: "text-green-600",
    iconColor: "text-green-600",
  },
];

const AccurateResults = () => {
  return (
    <section className="py-14 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Accurate Results You Can Trust
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
          Our photo checker analyses hair and scalp images to give you a clear indication of what you&apos;re dealing with.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div key={card.label} className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm">
              {/* Alert bar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
                <card.icon className={`h-5 w-5 shrink-0 ${card.iconColor}`} />
                <span className={`font-semibold text-sm ${card.color}`}>{card.title}</span>
              </div>
              {/* Photo */}
              <div className="aspect-[4/3] overflow-hidden group">
                <img
                  src={card.image}
                  alt={card.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              {/* Description */}
              <div className="px-5 py-4">
                <p className="text-muted-foreground text-sm leading-relaxed">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AccurateResults;
