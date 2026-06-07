import './globals.css'
import PwaRegister from '@/components/PwaRegister'

export const metadata = {
  title: 'Coral DB',
  description: '海水水槽の水質記録と推移グラフ',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/app-icon.svg', apple: '/app-icon.svg' },
  appleWebApp: { capable: true, title: 'Coral DB', statusBarStyle: 'black-translucent' },
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
