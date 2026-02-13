import { Users, School, Baby, Pill, Scissors, Stethoscope, ArrowRight } from "lucide-react";

const useCases = [
  { icon: Users, label: "For Parents", description: "Quick peace of mind at home" },
  { icon: School, label: "For Schools", description: "Manage outbreaks with confidence" },
  { icon: Baby, label: "For Childcare", description: "Keep little ones nit-free" },
  { icon: Pill, label: "For Pharmacies", description: "Advise customers accurately" },
  { icon: Scissors, label: "For Hair Salons", description: "Spot issues during appointments" },
  { icon: Stethoscope, label: "For GPs", description: "Support clinical assessments" },
];

const UseCasesGrid = () => {
  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          One Tool, Endless Uses
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          Whether you&apos;re a parent, teacher, or healthcare professional — NitNot works for you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {useCases.map((uc, i) => (
            <div
              key={i}
              className="group flex items-center gap-4 p-5 rounded-xl bg-background border border-border hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                <uc.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-foreground">{uc.label}</p>
                <p className="text-sm text-muted-foreground">{uc.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCasesGrid;
