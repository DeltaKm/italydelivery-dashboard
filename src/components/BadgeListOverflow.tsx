"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function BadgeListOverflow({
  items,
  title,
  max = 3,
  emptyText = "—",
}: {
  items: { id: string; name: string }[];
  title: string;
  max?: number;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) return <span className="text-sm text-muted-foreground">{emptyText}</span>;

  const visible = items.slice(0, max);
  const hiddenCount = items.length - visible.length;

  return (
    <>
      <div className="flex max-w-48 flex-wrap items-center gap-1">
        {visible.map((item) => (
          <Badge key={item.id} variant="secondary">
            {item.name}
          </Badge>
        ))}
        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
            className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/70"
          >
            +{hiddenCount}
          </button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="flex max-h-80 flex-wrap gap-1.5 overflow-y-auto">
            {items.map((item) => (
              <Badge key={item.id} variant="secondary">
                {item.name}
              </Badge>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
