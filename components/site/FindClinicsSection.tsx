"use client";

import { useState } from "react";
import ClinicFinder from "@/components/ClinicFinder";
import ClinicContactForm from "@/components/site/ClinicContactForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Clinic } from "@/lib/data/types";

interface FindClinicsSectionProps {
  clinics: Clinic[];
}

export default function FindClinicsSection({ clinics }: FindClinicsSectionProps) {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactClinicId, setContactClinicId] = useState<string | null>(null);

  const contactClinic = contactClinicId
    ? clinics.find((c) => c.id === contactClinicId)
    : null;

  const handleContactClinic = (clinicId: string) => {
    setContactClinicId(clinicId);
    setContactModalOpen(true);
  };

  return (
    <>
      <ClinicFinder
        country="ALL"
        hideDirectContact
        hideClinicContactDetails
        onContactClinic={handleContactClinic}
      />
      <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Contact clinic</DialogTitle>
          </DialogHeader>
          <ClinicContactForm
            clinicId={contactClinic?.id}
            clinicName={contactClinic?.name}
            source="modal"
            compact
            onSuccess={() => setContactModalOpen(false)}
            onCancel={() => setContactModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
