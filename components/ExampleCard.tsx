import Link from "next/link";

interface ExampleCardProps {
  title: string;
  description: string;
  href: string;
  icon?: React.ReactNode;
  tags?: string[];
}

export default function ExampleCard({
  title,
  description,
  href,
  icon,
  tags,
}: ExampleCardProps) {
  return (
    <Link href={href} className="block h-full group">
      <div className="h-full bg-card border border-border rounded-2xl p-8 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 flex flex-col">
        <div className="flex items-start justify-between mb-6">
          {icon && (
            <div className="p-3 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 text-2xl">
              {icon}
            </div>
          )}
          <div className="text-primary opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
        
        <h3 className="text-xl font-bold mb-3 text-foreground tracking-tight group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-6 flex-grow">
          {description}
        </p>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto">
            {tags.map((tag) => (
              <span 
                key={tag} 
                className="px-2.5 py-1 rounded-lg bg-muted text-xs font-medium text-muted-foreground border border-border group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
