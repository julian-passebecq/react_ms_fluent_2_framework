import { createRoot } from 'react-dom/client';
import { FluentProvider } from '@fluentui/react-components';
import { datapassLightTheme, LocaleProvider } from '@datapass/ui';
import '@datapass/ui/styles.css';
import './styles.css';
import App from './App';
createRoot(document.getElementById('root')!).render(<FluentProvider theme={datapassLightTheme}><LocaleProvider><App /></LocaleProvider></FluentProvider>);
