import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, className }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      viewport={{ once: true }}
      className={cn("space-y-2 text-center md:text-left", className)}
    >
      {eyebrow ? <p className="text-xs uppercase tracking-[0.3em] text-primary">{eyebrow}</p> : null}
      <h2 className="text-3xl font-bold tracking-tight text-text dark:text-white">{title}</h2>
      {description ? <p className="text-base text-mutedForeground">{description}</p> : null}
    </motion.div>
  );
}
