import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Хомячок Диоген — Пиксельный 2D Тамагочи (Windows, Android, Web)',
  description: 'Уютный пиксельный тамагочи-философ с режимом живых обоев, питомцем на рабочем столе Windows (Desktop Pet), 20 окрасами и интерактивной виллой.',
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
      <body className="bg-[#181425] text-white h-[100dvh] w-full antialiased overflow-hidden m-0 p-0 select-none">
        {children}
      </body>
    </html>
  );
}
