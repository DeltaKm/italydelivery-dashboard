"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

function csvEscape(value: string | number) {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export default function CsvExportButton({
  filename,
  headers,
  rows,
}: {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
}) {
  function download() {
    const lines = [headers, ...rows].map((row) => row.map(csvEscape).join(","));
    // BOM iniziale per far riconoscere gli accenti/€ correttamente a Excel
    const csv = "﻿" + lines.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" className="gap-1.5" onClick={download}>
      <Download className="size-3.5" />
      Esporta CSV
    </Button>
  );
}
