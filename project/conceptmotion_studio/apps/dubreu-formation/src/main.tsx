import React from 'react';
import { createRoot } from 'react-dom/client';
import { LocaleProvider } from '@datapass/ui';
import '@datapass/ui/styles.css';
import '@datapass/learning/styles.css';
import { App } from './App';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('Application root is missing.');
createRoot(root).render(<React.StrictMode><LocaleProvider><App /></LocaleProvider></React.StrictMode>);
