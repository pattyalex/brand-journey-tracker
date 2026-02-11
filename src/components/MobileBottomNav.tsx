import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Clapperboard, Calendar, Handshake } from 'lucide-react';

const navItems = [
  { label: 'Home', icon: Home, path: '/home-page' },
  { label: 'Content', icon: Clapperboard, path: '/production' },
  { label: 'Calendar', icon: Calendar, path: '/task-board' },
  { label: 'Deals', icon: Handshake, path: '/brands' },
];

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: '#ffffff',
        borderTop: '1px solid #f0e8ed',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center flex-1 py-2 transition-colors"
              style={{ minWidth: 0 }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-1 transition-all"
                style={{
                  background: active
                    ? 'linear-gradient(135deg, rgba(122, 56, 104, 0.15) 0%, rgba(97, 42, 79, 0.1) 100%)'
                    : 'transparent',
                }}
              >
                <Icon
                  className="w-5 h-5 transition-colors"
                  style={{
                    color: active ? '#612a4f' : '#8B7082',
                  }}
                />
              </div>
              <span
                className="text-xs font-medium transition-colors"
                style={{
                  color: active ? '#612a4f' : '#8B7082',
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
