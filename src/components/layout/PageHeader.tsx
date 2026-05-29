interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between px-5 pt-11 pb-5">
      <div>
        {subtitle && (
          <p
            className="text-xs uppercase tracking-[0.18em] mb-1"
            style={{ color: '#8AAF8C', fontWeight: 500 }}
          >
            {subtitle}
          </p>
        )}
        <h1
          className="font-display leading-[1.05]"
          style={{ color: '#EAF2E6', fontWeight: 500, fontSize: '1.9rem' }}
        >
          {title}
        </h1>
      </div>
      {action && <div className="pb-1">{action}</div>}
    </div>
  )
}
