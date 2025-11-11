import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface PricingBadgeProps {
  amount: string;
  currency?: string;
  period?: string;
  accent?: string;
  className?: string;
}

export function PricingBadge({ amount, currency = "₽", period = "/мес", accent = "Экономия", className }: PricingBadgeProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-white backdrop-blur",
        className
      )}
    >
      <div>
        <p className="text-xs uppercase tracking-wide text-white/60">{accent}</p>
        <p className="text-2xl font-semibold">
          {amount}
          <span className="ml-1 text-base font-medium">{currency}</span>
          <span className="ml-1 text-xs text-white/60">{period}</span>
        </p>
      </div>
    </motion.div>
  );
}
