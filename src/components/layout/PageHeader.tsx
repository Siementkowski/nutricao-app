interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  avatar?: string  // initials, e.g. "N"
}

export function PageHeader({ title, subtitle, action, avatar }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 pt-10 pb-4">
      <div className="flex items-center gap-3 min-w-0">
        {avatar && (
          <div
            className="shrink-0 flex items-center justify-center rounded-full"
            style={{ width: 38, height: 38, backgroundColor: '#2D7D46' }}
          >
            <span style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 700 }}>{avatar}</span>
          </div>
        )}
        <div className="min-w-0">
          {subtitle && (
            <p style={{ color: '#999999', fontSize: 13, fontWeight: 400, marginBottom: 1 }}>
              {subtitle}
            </p>
          )}
          <h1 style={{ color: '#111111', fontSize: 24, fontWeight: 800, lineHeight: 1.1 }}>
            {title}
          </h1>
        </div>
      </div>
      {action && <div className="shrink-0 ml-3">{action}</div>}
    </div>
  )
}
