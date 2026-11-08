import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource/dm-mono/400.css';
import '@fontsource/dm-mono/500.css';
import '@fontsource-variable/fraunces';
import './styles/tokens.css';
import './styles/styles.css';
import './styles/dashboard.css';
import './styles/recursos.css';
import './styles/planejamento.css';
import './styles/tema-azul.css';
import { ThemeProvider } from './app/providers/ThemeContext.jsx';
import { AccessibilityProvider } from './app/providers/AccessibilityContext.jsx';
import { StoreProvider } from './app/providers/StoreContext.jsx';
import App from './app/App.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ThemeProvider> 
        <AccessibilityProvider>
          <StoreProvider>
          <App />
        </StoreProvider>
          </AccessibilityProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
