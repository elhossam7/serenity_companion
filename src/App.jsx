import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Routes from './Routes';
import './styles/index.css';
import { I18nProvider } from './contexts/I18nContext';

function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </I18nProvider>
  );
}

export default App;