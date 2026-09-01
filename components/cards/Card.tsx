type CardProps = React.ComponentPropsWithoutRef<"section">;

export function Card({ className = "", ...props }: CardProps) {
  return <section className={`rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_14px_34px_rgba(78,49,37,0.06)] sm:p-6 ${className}`} {...props} />;
}
