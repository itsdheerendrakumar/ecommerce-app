export { cn } from "cn";

export function getInitials(name?: string): string {
  if (!name) return "U";
  const cleaned = name.trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase();
}
