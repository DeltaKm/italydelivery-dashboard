"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";

const STATUS_OPTIONS = [
  { value: "CREATED", label: "Creata" },
  { value: "ASSIGNED", label: "Assegnata" },
  { value: "ONDELIVERY", label: "In consegna" },
  { value: "COMPLETED", label: "Completata" },
  { value: "NOTDELIVERED", label: "Non consegnata" },
  { value: "RELEASED", label: "Rilasciata" },
  { value: "DELETED", label: "Cancellata" },
];

// Base UI's <Select.Value> shows the raw value instead of the item's label
// unless the Root is given an items map to resolve it from.
const STATUS_ITEMS = Object.fromEntries(STATUS_OPTIONS.map((o) => [o.value, o.label]));

export default function DeliveriesFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") ?? "";
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const range: DateRange | undefined =
    dateFrom && dateTo ? { from: new Date(dateFrom), to: new Date(dateTo) } : undefined;

  function updateParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    router.push(`/dashboard/deliveries?${params.toString()}`);
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Select
        items={STATUS_ITEMS}
        value={status}
        onValueChange={(value) => updateParams({ status: value ?? undefined })}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Filtra per stato" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {status && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => updateParams({ status: undefined })}
          aria-label="Rimuovi filtro stato"
        >
          <X className="size-3.5" />
        </Button>
      )}

      <Popover>
        <PopoverTrigger render={<Button variant="outline" className="gap-2" />}>
          <CalendarIcon className="size-4" />
          {range?.from && range?.to
            ? `${format(range.from, "dd/MM/yyyy")} - ${format(range.to, "dd/MM/yyyy")}`
            : "Intervallo date"}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            locale={it}
            selected={range}
            onSelect={(newRange) => {
              if (!newRange?.from || !newRange?.to) return;
              const from = new Date(newRange.from);
              from.setHours(0, 0, 0, 0);
              const to = new Date(newRange.to);
              to.setHours(23, 59, 59, 999);
              updateParams({ dateFrom: from.toISOString(), dateTo: to.toISOString() });
            }}
          />
        </PopoverContent>
      </Popover>
      {range && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => updateParams({ dateFrom: undefined, dateTo: undefined })}
          aria-label="Rimuovi filtro date"
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
