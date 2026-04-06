import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ToastProvider } from './contexts/ToastContext';
import { StoreProvider } from './store';

export const metadata: Metadata = {
  title: 'Budgtr — Monthly Spending Tracker',
  description: 'Track your monthly spending by category',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#F5F3EF',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-bg text-text-primary font-sans relative  ">
      <body>
        <StoreProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
