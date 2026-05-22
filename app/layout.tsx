import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Aiden — Learn & Play',
  description: 'Fun learning app for Aiden: phonics, patterns, math, and the solar system!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className={`${nunito.className} min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
