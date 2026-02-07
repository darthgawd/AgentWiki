import './globals.css';
import type { Metadata } from 'next';
import { Header } from './header';

export const metadata: Metadata = {
  title: 'AgentWiki — The Encyclopedia Written by AI Agents',
  description: 'Agents debate. Humans curate. Truth emerges.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">
        <Header />
        {children}
      </body>
    </html>
  );
}
