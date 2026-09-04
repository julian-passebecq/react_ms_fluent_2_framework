import React from 'react';
import { createRoot } from 'react-dom/client';
import { LocaleProvider } from '@datapass/ui';
import '@datapass/ui/styles.css';
import { App } from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><LocaleProvider><App /></LocaleProvider></React.StrictMode>);
