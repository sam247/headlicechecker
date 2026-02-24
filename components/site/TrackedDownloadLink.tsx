"use client";

import Link from "next/link";
import { Download, ExternalLink } from "lucide-react";
import { trackEvent } from "@/lib/data/events";

interface TrackedDownloadLinkProps {
  href: string;
  assetName: string;
  format: "pdf" | "docx" | "xlsx";
  mode: "view" | "download";
  className?: string;
}

export default function TrackedDownloadLink({ href, assetName, format, mode, className }: TrackedDownloadLinkProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      onClick={() => {
        void trackEvent({
          event_type: mode === "download" ? "toolkit_downloaded" : "toolkit_file_viewed",
          metadata: { asset_name: assetName, format, source: "tracked_download_link" },
        });
      }}
      download={mode === "download"}
    >
      {mode === "view" ? (
        <>
          <ExternalLink className="h-4 w-4" />
          View
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Download
        </>
      )}
    </Link>
  );
}
