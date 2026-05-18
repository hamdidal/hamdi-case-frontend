import { useEffect, useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Spin } from 'antd';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleToggle = () => {
    if (isMobile) {
      setMobileOpen((o) => !o);
    } else {
      setCollapsed((o) => !o);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={collapsed}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      {isMobile && mobileOpen && (
        <div className="app-backdrop" onClick={() => setMobileOpen(false)} />
      )}
      <div className="app-main">
        <Header onToggle={handleToggle} />
        <div className="app-content">
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><Spin size="large" /></div>}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
