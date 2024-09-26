import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';


inject();
injectSpeedInsights();

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Updateable Dimension App',
  description: 'Simple UI to update a table in a DB for users who lack SQL skills.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
