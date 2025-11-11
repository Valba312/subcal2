"use client";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { PricingBadge } from "../../components/ui/pricing-badge";
import { SectionHeading } from "../../components/ui/section-heading";

export default function StyleguidePage() {
  return (
    <div className="bg-background py-10">
      <div className="container space-y-10">
        <SectionHeading title="UI Playground" description="Набор ключевых компонентов SubKeeper." />
        <div className="flex flex-wrap gap-4">
          <Button>Primary button</Button>
          <Button variant="outline">Outline button</Button>
          <Button variant="ghost">Ghost button</Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <Badge>Default</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <p className="text-sm text-mutedForeground">Card component</p>
            <p className="text-lg font-semibold text-text dark:text-white">Используем для панелей и форм</p>
          </Card>
          <Card className="bg-gradient-to-br from-primary/15 to-purple-500/15">
            <PricingBadge amount="4 990" currency="₽" period="/мес" />
          </Card>
        </div>
      </div>
    </div>
  );
}
