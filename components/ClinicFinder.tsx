"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Search, ExternalLink } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Clinic {
  id: number;
  name: string;
  address: string;
  city: string;
  postcode: string;
  phone: string;
  lat: number;
  lng: number;
}

const CLINICS: Clinic[] = [
  { id: 1, name: "NitNot London", address: "42 High Street, Kensington", city: "London", postcode: "W8 4PT", phone: "020 7946 0958", lat: 51.4995, lng: -0.1927 },
  { id: 2, name: "NitNot Manchester", address: "15 Deansgate", city: "Manchester", postcode: "M3 1AZ", phone: "0161 496 0321", lat: 53.4808, lng: -2.2426 },
  { id: 3, name: "NitNot Birmingham", address: "8 Colmore Row", city: "Birmingham", postcode: "B3 2QD", phone: "0121 496 0147", lat: 52.4814, lng: -1.8998 },
  { id: 4, name: "NitNot Edinburgh", address: "23 Princes Street", city: "Edinburgh", postcode: "EH2 2AN", phone: "0131 496 0285", lat: 55.9533, lng: -3.1883 },
  { id: 5, name: "NitNot Bristol", address: "5 Queen Square", city: "Bristol", postcode: "BS1 4JQ", phone: "0117 496 0193", lat: 51.4545, lng: -2.5879 },
  { id: 6, name: "NitNot Leeds", address: "31 The Headrow", city: "Leeds", postcode: "LS1 6PU", phone: "0113 496 0412", lat: 53.7997, lng: -1.5492 },
];

const ClinicFinder = () => {
  const [postcode, setPostcode] = useState("");
  const [showMap, setShowMap] = useState(false);
  const isMobile = useIsMobile();

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=-6.5,50.0,2.0,57.0&layer=mapnik`;

  return (
    <div id="clinic-finder">
      <div className="mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Find a Clinic Near You
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Our professional clinics across the UK offer fast, friendly, and thorough head lice removal. 
            Search by postcode to find your nearest one.
          </p>
        </div>

        {/* Postcode search */}
        <div className="max-w-md mx-auto mb-10">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter your postcode…"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className="pl-10 rounded-full border-primary/30 focus-visible:ring-primary"
              />
            </div>
            <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Search
            </Button>
          </div>
        </div>

        {/* Mobile toggle */}
        {isMobile && (
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-full bg-muted p-1">
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !showMap ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
                onClick={() => setShowMap(false)}
              >
                List
              </button>
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  showMap ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
                onClick={() => setShowMap(true)}
              >
                Map
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Clinic list */}
          {(!isMobile || !showMap) && (
            <div className="space-y-4 order-2 lg:order-1">
              {CLINICS.map((clinic) => (
                <Card key={clinic.id} className="hover:shadow-md transition-shadow border-border/60">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground text-lg mb-1">{clinic.name}</h3>
                        <div className="flex items-start gap-2 text-muted-foreground text-sm mb-1">
                          <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                          <span>{clinic.address}, {clinic.city} {clinic.postcode}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Phone className="h-4 w-4 shrink-0 text-primary" />
                          <span>{clinic.phone}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
                      >
                        Book Now
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Map */}
          {(!isMobile || showMap) && (
            <div className="order-1 lg:order-2">
              <div className="rounded-2xl overflow-hidden shadow-lg border border-border/60 aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[500px]">
                <iframe
                  title="Clinic locations map"
                  src={mapSrc}
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicFinder;
