type CardProps = React.ComponentPropsWithoutRef<"section">;

export function Card({ className = "", ...props }: CardProps) {
  return <section className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_12px_36px_rgba(23,35,28,0.05)] sm:p-6 ${className}`} {...props} />;
}
