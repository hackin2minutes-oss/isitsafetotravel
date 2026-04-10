import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Is It Safe To Travel? - Travel Safety Assessment',
  description: 'Evaluate the safety of any global destination based on real-time weather, air quality, and security threat data.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Travel Safe',
  },
};

export const viewport: Viewport = {
  themeColor: '#08090C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-violet-500/30">
        <div className="bg-mesh-container">
          <div className="mesh-gradient" />
        </div>
        <div className="grain-overlay" />
        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}