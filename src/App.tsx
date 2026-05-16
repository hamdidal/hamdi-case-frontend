// Root application shell — router and theme provider will be wired here.
// Page components and Ant Design ConfigProvider are set up in a subsequent step.

export default function App() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '100vh', fontFamily: 'system-ui' }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>VeriPass DPP</h1>
        <p style={{ color: '#6b7280' }}>Foundation ready — pages coming next.</p>
      </div>
    </div>
  );
}
