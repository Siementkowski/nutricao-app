import { NavLink } from 'react-router-dom'

const tabs = [
  {
    to: '/',
    label: 'Home',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    to: '/refeicoes',
    label: 'Refeições',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 2.2 1.8 4 4 4s4-1.8 4-4V2" />
        <line x1="7" y1="2" x2="7" y2="22" />
        <path d="M21 15V2a5 5 0 0 0-5 5v6h3.5" />
        <line x1="17" y1="15" x2="17" y2="22" />
      </svg>
    ),
  },
  {
    to: '/dieta',
    label: 'Dieta',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="9" y1="7" x2="15" y2="7" />
        <line x1="9" y1="11" x2="15" y2="11" />
        <line x1="9" y1="15" x2="13" y2="15" />
      </svg>
    ),
  },
  {
    to: '/substituicoes',
    label: 'Substituições',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 16V4m0 0L3 8m4-4 4 4" />
        <path d="M17 8v12m0 0 4-4m-4 4-4-4" />
      </svg>
    ),
  },
  {
    to: '/progresso',
    label: 'Progresso',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
]

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        backgroundColor: 'rgba(251,250,244,0.82)',
        backdropFilter: 'saturate(1.4) blur(14px)',
        WebkitBackdropFilter: 'saturate(1.4) blur(14px)',
        borderTop: '1px solid #E2DBC9',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex max-w-lg mx-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className="flex-1"
          >
            {({ isActive }) => (
              <div className="flex flex-col items-center gap-1 pt-2 pb-2.5">
                <span
                  className="flex items-center justify-center rounded-full"
                  style={{
                    color: isActive ? '#3B6B4D' : '#8B8170',
                    backgroundColor: isActive ? '#E3E9D6' : 'transparent',
                    width: 44,
                    height: 28,
                    transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)',
                  }}
                >
                  {tab.icon}
                </span>
                <span
                  className="text-[10px] leading-none"
                  style={{
                    color: isActive ? '#3B6B4D' : '#8B8170',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {tab.label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
