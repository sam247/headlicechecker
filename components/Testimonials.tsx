import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "I was so worried it was nits — uploaded a photo and had an answer in seconds. Turns out it was just dandruff! Saved me a lot of stress.",
    author: "Sarah M.",
    role: "Parent of two",
    rating: 5,
  },
  {
    quote: "We use NitNot at our school to help parents identify cases quickly. It's reduced unnecessary absences and panic calls enormously.",
    author: "James P.",
    role: "Primary School Head",
    rating: 5,
  },
  {
    quote: "The clinic was brilliant — friendly, fast, and my daughter actually enjoyed the experience. I wish I'd found NitNot sooner!",
    author: "Laura K.",
    role: "Mum from Brighton",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-14 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          They love us. You will too.
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          Thousands of families trust NitNot for fast, accurate head lice checks.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-background rounded-2xl border border-border p-6 text-left flex flex-col"
            >
              <div className="flex mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-secondary text-secondary" />
                ))}
              </div>
              <p className="text-foreground leading-relaxed flex-1 mb-5">"{t.quote}"</p>
              <div>
                <p className="font-semibold text-foreground text-sm">{t.author}</p>
                <p className="text-muted-foreground text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
