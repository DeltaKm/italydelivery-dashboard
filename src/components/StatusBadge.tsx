import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const COLOR_CLASSES: Record<string, string> = {
  default: "bg-muted text-muted-foreground",
  success: "bg-emerald-100 text-emerald-700",
  processing: "bg-blue-100 text-blue-700",
  warning: "bg-amber-100 text-amber-800",
  error: "bg-red-100 text-red-700",
};

export default function StatusBadge({
  children,
  color = "default",
  className,
}: {
  children: React.ReactNode;
  color?: keyof typeof COLOR_CLASSES;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn("border-transparent", COLOR_CLASSES[color], className)}>
      {children}
    </Badge>
  );
}
