import './globals.css'
import PwaRegister from '@/components/PwaRegister'

export const metadata = {
  title: 'Coral DB Lite',
  description: 'ショップに見せやすい海水水槽カルテと水質記録',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/app-icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/icon-192.png',
  },
  appleWebApp: { capable: true, title: 'Coral DB Lite', statusBarStyle: 'black-translucent' },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0891b2',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body className="bg-slate-950 min-h-screen">
        <PwaRegister />
        {children}
      </body>
    </html>
  )
}
