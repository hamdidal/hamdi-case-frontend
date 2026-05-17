import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './i18n';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense
      fallback={
        <div className="suspense-fallback">Loading…</div>
      }
    >
      <App />
    </Suspense>
  </React.StrictMode>,
);
