import type { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  comingSoon?: boolean;
  href?: string;
  reverse?: boolean;
}

export default function ServiceCard({
  icon: Icon,
  title,
  subtitle,
  description,
  reverse = false,
}: ServiceCardProps) {
  return (
    <div
      className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-10 md:gap-20`}
    >
      <div className="flex-1 w-full">
        <div className="bg-section-light rounded-3xl p-16 flex items-center justify-center aspect-[4/3] md:aspect-auto md:min-h-[360px]">
          <Icon className="text-muted/30" size={100} strokeWidth={0.8} />
        </div>
      </div>
      <div className="flex-1">
        <p className="text-accent text-sm font-medium mb-2">
          {subtitle}
        </p>
        <h3 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4 leading-tight">
          {title}
        </h3>
        <p className="text-muted text-lg leading-relaxed mb-6">{description}</p>
        <a
          href="#contact"
          className="text-accent text-lg hover:underline"
        >
          Learn more &gt;
        </a>
      </div>
    </div>
  );
}
