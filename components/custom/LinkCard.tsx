import Link from "next/link";
import type { Icon } from "@phosphor-icons/react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

interface LinkCardProps {
  href: string;
  label: string;
  icon: Icon;
  disabled?: boolean;
  external?: boolean;
}

const baseClasses =
  "flex items-center gap-3 border border-border rounded-lg px-5 py-4 min-h-[56px] bg-card text-card-foreground transition-colors duration-150";

export function LinkCard({
  href,
  label,
  icon: IconComponent,
  disabled = false,
  external = false,
}: LinkCardProps) {
  const content = (
    <>
      <IconComponent size={20} weight="regular" aria-hidden="true" />
      <span className="flex-1 font-sans text-base">{label}</span>
      {!disabled && (
        <ArrowRight
          size={16}
          weight="regular"
          aria-hidden="true"
          className="ml-auto text-muted-foreground"
        />
      )}
    </>
  );

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={cn(
          baseClasses,
          "opacity-60 cursor-not-allowed pointer-events-none",
        )}
      >
        {content}
      </span>
    );
  }

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(baseClasses, "hover:border-accent")}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={cn(baseClasses, "hover:border-accent")}>
      {content}
    </Link>
  );
}
