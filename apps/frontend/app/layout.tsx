import '../styles/globals.css';
import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { Topbar } from '../components/layout/Topbar';
import { Sidebar } from '../components/layout/Sidebar';
import { ClientSessionProvider } from '../components/ClientSessionProvider';

export const metadata = {
  title: 'Prico',
  description: 'Collaborative Coding Platform'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ClerkProvider>
          <ClientSessionProvider>
            <Topbar />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto p-6 bg-background">{children}</main>
            </div>
          </ClientSessionProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
