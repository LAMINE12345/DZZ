import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Atelier - Constructeur de Sites & App-Builder No-Code',
  description: 'Plateforme no-code complète et interactive pour concevoir des sites web modernes avec balises HTML sémantiques, logique visuelle, CMS intégré et export propre.',
  openGraph: {
    title: 'Atelier - Constructeur de Sites & App-Builder No-Code',
    description: 'Plateforme no-code complète et interactive pour concevoir des sites web modernes avec balises HTML sémantiques, logique visuelle, CMS intégré et export propre.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
