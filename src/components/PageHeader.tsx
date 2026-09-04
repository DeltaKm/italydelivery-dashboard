import type { ReactNode } from "react";

export default function PageHeader({
  title,
  avatar,
  actions,
}: {
  title: string;
  avatar?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {avatar}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      {actions}
    </div>
  );
}
