import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('🚀 V3 Starting...');
window.addEventListener('error', (e) => console.error('❌ Global Error:', e.error));

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (e) {
  console.error('❌ Render Error:', e);
  document.body.innerHTML = `<h1 style="color:red">Error Fatal: ${e}</h1>`;
}
