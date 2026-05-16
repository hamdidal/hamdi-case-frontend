import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ConfigProvider, Layout } from 'antd';
import { useThemeStore } from '@/store/useThemeStore';
import { lightTheme, darkTheme } from '@/theme';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const { Sider, Content } = Layout;

export function AppLayout() {
  const { theme } = useThemeStore();
  const [collapsed, setCollapsed] = useState(false);

  const sidebarBg  = theme === 'dark' ? '#0A1813' : '#102A20';
  const activeTheme = theme === 'dark' ? darkTheme : lightTheme;

  // Sync data-theme attribute for CSS variable overrides
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ConfigProvider theme={activeTheme}>
      <Layout style={{ height: '100vh', overflow: 'hidden' }}>
        <Sider
          width={240}
          collapsedWidth={64}
          collapsed={collapsed}
          trigger={null}
          style={{
            background: sidebarBg,
            borderRight: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}
        >
          <Sidebar collapsed={collapsed} />
        </Sider>

        <Layout
          className="main-content"
          style={{ background: 'var(--bg-app)' }}
        >
          <Header
            collapsed={collapsed}
            onToggle={() => setCollapsed((c) => !c)}
          />
          <Content className="scroll-area">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
