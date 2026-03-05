import { getStatusStyle, getStatusDot } from "@/lib/utils";

interface StatusBadgeProps {
  status: string | null;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium
        ${getStatusStyle(status)}
        ${size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"}
      `}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(status)}`} />
      {status ?? "Sem status"}
    </span>
  );
}
