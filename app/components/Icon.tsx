import * as Lucide from "lucide-react";

export function Icon(
  { name, className = "h-6 w-6", strokeWidth = 2 }: 
  { name: keyof typeof Lucide; className?: string; strokeWidth?: number }
) {
  const C = Lucide[name];
  return <C className={className} strokeWidth={strokeWidth} />;
}