import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

const Newsletter = () => {
  return (
    <section className="py-14 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Get Updates
          </h2>
          <p className="text-muted-foreground mb-8">
            Tips, guides, and news about head lice — straight to your inbox. No spam, ever.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex gap-3 max-w-md mx-auto"
          >
            <Input
              type="email"
              placeholder="Your email address"
              className="rounded-full flex-1"
            />
            <Button type="submit" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-6">
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
