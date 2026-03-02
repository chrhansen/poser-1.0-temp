interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

export function Section({ children, className }: SectionProps) {
  return (
    <section className={`py-16 md:py-24 ${className ?? ""}`}>
      <div className="container">{children}</div>
    </section>
  );
}
