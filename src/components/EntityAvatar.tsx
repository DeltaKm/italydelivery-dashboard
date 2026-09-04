import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

export default function EntityAvatar({
  name,
  imgUrl,
  size = "default",
}: {
  name: string;
  imgUrl?: string | null;
  size?: "sm" | "default" | "lg";
}) {
  return (
    <Avatar size={size}>
      {imgUrl && <AvatarImage src={imgUrl} alt={name} />}
      <AvatarFallback>{initials(name)}</AvatarFallback>
    </Avatar>
  );
}
