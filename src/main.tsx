import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { App as AntApp } from 'antd';
import './index.css';
import './i18n';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AntApp>
      <Suspense
        fallback={
          <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
            Loading…
          </div>
        }
      >
        <App />
      </Suspense>
    </AntApp>
  </React.StrictMode>,
);
