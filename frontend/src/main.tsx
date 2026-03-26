import React from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import { env } from './config/Env.ts';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={env.googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);