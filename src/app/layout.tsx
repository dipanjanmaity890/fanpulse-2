import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "FanPulse 2.0 | 2nd Innings Challenge",
  description: "Gamified Fan Engagement Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '2rem', alignItems: 'center', background: 'rgba(10, 15, 28, 0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
            <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>🏏 FanPulse 2.0</Link>
            <div style={{ flex: 1 }} />
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Dashboard</Link>
            <Link href="/leaderboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Leaderboard</Link>
            <Link href="/rewards" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Rewards</Link>
          </nav>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
