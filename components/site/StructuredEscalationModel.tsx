import { Card, CardContent } from "@/components/ui/card";
import { STANDARD_ESCALATION_MODEL } from "@/lib/data/content-pages";

export default function StructuredEscalationModel() {
  return (
    <Card id="escalation-model" className="mt-8 border-primary/30">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold">Structured escalation model</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">{STANDARD_ESCALATION_MODEL}</p>
      </CardContent>
    </Card>
  );
}
