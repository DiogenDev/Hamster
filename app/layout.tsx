import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Пиксельный 2D Тамагочи: Хомячок',
  description: 'Интерактивный ретро-симулятор хомячка с Canvas 2D, 20 окрасами, кастомизацией клетки и пиксельной мастерской',
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
      <body className="bg-[#181425] text-white min-h-screen antialiased flex flex-col items-center justify-center p-2 sm:p-4">
        {children}
      </body>
    </html>
  );
}
