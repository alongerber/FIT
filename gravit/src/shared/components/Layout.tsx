import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'דשבורד' },
  { to: '/history', label: 'היסטוריה' },
  { to: '/insights', label: 'תובנות' },
  { to: '/settings', label: 'הגדרות' },
];

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 pb-24">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 inset-x-0 bg-primary border-t border-surface">
        <div className="max-w-lg mx-auto flex">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex-1 py-3 text-center text-sm transition-colors ${
                  isActive ? 'text-accent font-medium' : 'text-text-secondary hover:text-text-primary'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
