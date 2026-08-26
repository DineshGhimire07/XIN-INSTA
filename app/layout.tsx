import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'XINVORA | Social Commerce Automation Engine',
  description: 'First-party Meta-compliant social commerce automation platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-canvas text-foreground antialiased selection:bg-accent/20 selection:text-accent">
        {children}
      </body>
    </html>
  );
}
