"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewDeliveryButton() {
  return (
    <Link href="/dashboard/deliveries/new">
      <Button className="gap-1.5">
        <Plus className="size-4" />
        Nuova consegna
      </Button>
    </Link>
  );
}
