import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';

function App() {
  return (
    <main className="app-shell">
      <h1>NexaFlow</h1>
      <p>Fundação do SaaS iniciada.</p>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
