"use client";

import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

type IconName = keyof typeof Icons;

type IconProps = {
  name: IconName;
  className?: string;
  strokeWidth?: number;
} & React.ComponentProps<LucideIcon>;

export default function Icon({
  name,
  className,
  strokeWidth = 1.75,
  ...rest
}: IconProps) {
  // lucide-react экспортирует компоненты-иконки.
  // Явно приводим к LucideIcon и ставим запасную иконку.
  const Component = (Icons[name] as unknown as LucideIcon) || Icons.HelpCircle;
  return <Component className={className} strokeWidth={strokeWidth} {...rest} />;
}
