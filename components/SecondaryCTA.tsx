import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

const SecondaryCTA = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-14 md:py-20 bg-primary/5">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Check Your Photo Now
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-6">
          It takes less than 30 seconds. Upload a photo and get your result — completely free and confidential.
        </p>
        <Button
          onClick={() => scrollTo("photo-checker")}
          size="lg"
          className="rounded-full px-8 py-6 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
        >
          <Upload className="mr-2 h-5 w-5" />
          Upload Photo
        </Button>
      </div>
    </section>
  );
};

export default SecondaryCTA;
