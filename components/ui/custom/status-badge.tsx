import { Badge } from "@/components/ui/badge";

const VARIANTS = ["default", "secondary", "success", "warning", "info", "outline"] as const;

function hashToIndex(value: string, length: number) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % length;
}

interface StatusBadgeProps {
  value: string;
}

export function StatusBadge({ value }: StatusBadgeProps) {
  const variant = VARIANTS[hashToIndex(value, VARIANTS.length)];
  return (
    <Badge variant={variant} className="capitalize">
      {value}
    </Badge>
  );
}
