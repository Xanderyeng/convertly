"use client";

import { parseAsInteger, useQueryState } from "nuqs";
import { Slider } from "@/components/ui/slider";

export function QualitySlider() {
  const [quality, setQuality] = useQueryState(
    "quality",
    parseAsInteger.withDefault(85),
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="quality" className="text-sm font-medium">
          Quality
        </label>
        <span className="text-sm text-muted-foreground">{quality}%</span>
      </div>
      <Slider
        id="quality"
        min={1}
        max={100}
        step={1}
        value={[quality]}
        onValueChange={(values) => setQuality(values[0] || 85)}
      />
      <p className="text-xs text-muted-foreground">
        Higher quality = larger file size
      </p>
    </div>
  );
}
