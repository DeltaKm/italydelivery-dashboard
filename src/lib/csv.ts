function csvEscape(value: string | number) {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

// Es. "consegne.csv" -> "consegne_2026-09-07_14-32.csv": evita che ogni
// export sovrascriva (o si accumuli come "(1)", "(2)"...) il precedente.
function withTimestamp(filename: string) {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? `${filename}_${stamp}` : `${filename.slice(0, dot)}_${stamp}${filename.slice(dot)}`;
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const lines = [headers, ...rows].map((row) => row.map(csvEscape).join(","));
  // BOM iniziale per far riconoscere gli accenti/€ correttamente a Excel
  const csv = "﻿" + lines.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = withTimestamp(filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
