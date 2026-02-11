"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string;
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        href={to}
        className={cn(className)}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
