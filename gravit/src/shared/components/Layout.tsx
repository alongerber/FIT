import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'דשבורד', icon: '◉' },
  { to: '/history', label: 'היסטוריה', icon: '☰' },
  { to: '/insights', label: 'תובנות', icon: '◈' },
  { to: '/settings', label: 'הגדרות', icon: '⚙' },
];

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <a href="#main-content" className="skip-link">דלג לתוכן הראשי</a>
      <main id="main-content" className="flex-1 max-w-lg mx-auto w-full px-4 py-6 pb-24">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 inset-x-0 bg-primary border-t border-surface z-40" role="navigation" aria-label="ניווט ראשי">
        <div className="max-w-lg mx-auto flex">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              aria-label={item.label}
              className={({ isActive }) =>
                `flex-1 py-3 text-center transition-colors flex flex-col items-center gap-0.5 ${
                  isActive ? 'text-accent font-medium' : 'text-text-secondary hover:text-text-primary'
                }`
              }
            >
              <span className="text-lg" aria-hidden="true">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
