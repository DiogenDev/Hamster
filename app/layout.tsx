import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Пиксельный 2D Тамагочи: Хомячок',
  description: 'Интерактивный ретро-симулятор хомячка с Canvas 2D, 20 окрасами, кастомизацией клетки и пиксельной мастерской',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Silkscreen:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#181425] text-white h-[100dvh] w-full antialiased overflow-hidden m-0 p-0 select-none flex flex-col items-center justify-between">
        {children}
      </body>
    </html>
  );
}
