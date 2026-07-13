"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, MapPin, CalendarDays, CheckCircle2 } from "lucide-react";
import { formatDisplayDate } from "./date-field";
import { formatDuration } from "./duration";

export interface RouteSummary {
  operatorName: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number | null;
  distanceKm: string;
  fareRupees: string;
  availableFrom: string;
  availableUntil: string;
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground/70 font-semibold">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

export function RoutePreviewCard({ summary }: { summary: RouteSummary }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Route Preview</CardTitle>
        <Badge className="bg-action text-action-foreground border-transparent">Ready to Publish</Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-xs text-muted-foreground">This is how travelers will see this route.</p>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{summary.operatorName}</p>
          <div className="flex items-center gap-2 text-lg font-bold">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            {summary.origin}
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            {summary.destination}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted/50 p-3">
          <Fact label="Departure" value={summary.departureTime} />
          <Fact label="Arrival" value={summary.arrivalTime} />
          <Fact
            label="Duration"
            value={
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {formatDuration(summary.durationMinutes)}
              </span>
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Fact label="Distance" value={`${summary.distanceKm} KM`} />
          <Fact label="Fare per seat" value={`₹${summary.fareRupees}`} />
        </div>

        <Fact
          label="Availability"
          value={
            <span className="inline-flex items-center gap-1 text-xs font-semibold">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              {formatDisplayDate(summary.availableFrom)}
              {" → "}
              {summary.availableUntil ? formatDisplayDate(summary.availableUntil) : "No end date"}
            </span>
          }
        />
      </CardContent>
    </Card>
  );
}

export function RouteSuccessCard({ summary }: { summary: RouteSummary }) {
  return (
    <Card>
      <CardContent className="space-y-5 pt-6">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-action shrink-0" />
          <h2 className="text-lg font-bold">Route Published Successfully</h2>
        </div>

        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground/70 font-semibold">Route</p>
          <div className="flex items-center gap-2 text-base font-bold">
            {summary.origin}
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            {summary.destination}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted/50 p-3">
          <Fact label="Departure" value={summary.departureTime} />
          <Fact label="Arrival" value={summary.arrivalTime} />
          <Fact label="Duration" value={formatDuration(summary.durationMinutes)} />
        </div>

        <Fact label="Fare per seat" value={`₹${summary.fareRupees}`} />

        <Fact
          label="Availability"
          value={
            <span className="text-xs font-semibold">
              {formatDisplayDate(summary.availableFrom)}
              {" → "}
              {summary.availableUntil ? formatDisplayDate(summary.availableUntil) : "No end date"}
            </span>
          }
        />

        <p className="text-sm text-muted-foreground leading-relaxed">
          Your route has been successfully published. It will automatically become available to
          travelers during the selected availability period.
        </p>
      </CardContent>
    </Card>
  );
}
