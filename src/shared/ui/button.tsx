import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-sans font-medium transition-[opacity,transform,background-color,color] duration-[var(--motion-quick)] ease-[var(--ease-out)] disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink",
  {
    variants: {
      variant: {
        text: "bg-transparent text-ink text-base tracking-wide disabled:opacity-40 active:not-disabled:scale-[0.96]",
        pill: "h-14 w-full rounded-full bg-surface text-ink text-sm tracking-wide disabled:text-ink-subtle active:not-disabled:scale-[0.98]",
        ink: "h-14 w-full rounded-full bg-ink text-paper text-sm tracking-wide active:not-disabled:scale-[0.98] focus-visible:outline-ink",
        frost:
          "h-14 w-full rounded-full bg-paper text-ink text-sm tracking-wide disabled:bg-paper/45 disabled:text-ink/50 active:not-disabled:scale-[0.98] focus-visible:outline-paper",
        ghost:
          "bg-transparent text-ink-muted text-xs tracking-[0.18em] uppercase disabled:opacity-40 active:not-disabled:opacity-70",
      },
    },
    defaultVariants: { variant: "pill" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant }), className)} {...props} />;
}
