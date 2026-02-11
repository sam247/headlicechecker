import { Star } from "lucide-react";

const footerLinks = {
  Tools: ["Photo Checker", "Clinic Finder", "Nit vs Dandruff Guide", "Treatment Tips"],
  Support: ["Help Centre", "Contact Us", "FAQs", "Book a Clinic"],
  Company: ["About NitNot", "Our Clinics", "Careers", "Press"],
  Resources: ["Blog", "Head Lice Guide", "School Resources", "For Professionals"],
};

const Footer = () => {
  return (
    <footer id="contact">
      {/* Trust bar */}
      <div className="bg-foreground/95 py-4">
        <div className="container mx-auto px-4 flex items-center justify-center gap-3">
          <span className="text-primary-foreground/80 text-sm font-medium">Excellent</span>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
            ))}
          </div>
          <span className="text-primary-foreground/60 text-sm">4.9 out of 5</span>
          <span className="text-primary-foreground/40 text-sm hidden sm:inline">based on 2,400+ reviews</span>
        </div>
      </div>

      {/* Main footer */}
      <div className="bg-foreground text-primary-foreground py-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand col */}
            <div className="col-span-2 md:col-span-1">
              <img src="/images/logo_white.png" alt="NitNot" className="h-8 mb-4" />
              <p className="text-primary-foreground/60 text-sm leading-relaxed max-w-xs">
                Professional head lice checks and clinics across the UK. Fast, friendly, and nothing to worry about.
              </p>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="font-semibold mb-4 text-xs uppercase tracking-wider text-primary-foreground/40">
                  {title}
                </h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-primary-foreground/60 hover:text-primary transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-primary-foreground/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-primary-foreground/40">
              © {new Date().getFullYear()} NitNot. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs text-primary-foreground/40">
              <a href="#" className="hover:text-primary-foreground/70 transition-colors">Terms</a>
              <a href="#" className="hover:text-primary-foreground/70 transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary-foreground/70 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
