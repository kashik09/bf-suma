import { Badge } from "@/components/ui/badge";

export function StatusPill({
  status
}: {
  status: "success" | "warning" | "danger" | "info" | "neutral";
}) {
  return <Badge variant={status}>{status.replace("_", " ")}</Badge>;
}
