import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import ConfirmProvider from './components/tools/ConfirmDialog';

const container = document.getElementById('root');
if (!container) throw new Error('Élément #root introuvable');

createRoot(container).render(
    <StrictMode>
        <AuthProvider>
            <ConfirmProvider>
                <App />
            </ConfirmProvider>
        </AuthProvider>
    </StrictMode>,
);
