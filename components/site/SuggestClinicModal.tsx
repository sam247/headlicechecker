"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import SuggestClinicForm from "@/components/site/SuggestClinicForm";
import { trackEvent } from "@/lib/data/events";

interface SuggestClinicModalProps {
  sourcePath: string;
  defaultOpen?: boolean;
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "ghost";
  triggerClassName?: string;
}

export default function SuggestClinicModal({
  sourcePath,
  defaultOpen = false,
  triggerLabel = "Suggest a clinic",
  triggerVariant = "outline",
  triggerClassName = "rounded-full",
}: SuggestClinicModalProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen && !open) {
          void trackEvent({
            event_type: "clinic_suggestion_modal_opened",
            metadata: { source_path: sourcePath },
          });
        }
        setOpen(nextOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button variant={triggerVariant} className={triggerClassName}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Suggest a clinic</DialogTitle>
          <DialogDescription>Share clinic details for manual review. Suggestions are reviewed before publication.</DialogDescription>
        </DialogHeader>
        <SuggestClinicForm sourcePath={sourcePath} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
