import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Routes from './Routes';
import './styles/index.css';
import { I18nProvider } from './contexts/I18nContext';
import ConsentGate from './components/ConsentGate';

function App() {
  return (
    <I18nProvider>
      <AuthProvider>
  <ConsentGate />
  <Routes />
      </AuthProvider>
    </I18nProvider>
  );
}

export default App;