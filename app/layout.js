import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import PwaRegister from '@/components/PwaRegister'
import Footer from '@/components/Footer'
import { configuredSiteUrl } from '@/lib/siteUrl'

const siteUrl = configuredSiteUrl()
const socialDescription = '海水水槽の水質・水換え・添加剤・写真をかんたんに記録し、ショップに見せやすくする無料ログアプリ。'

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'ReefChart Lite',
  description: socialDescription,
  applicationName: 'ReefChart Lite',
  alternates: { canonical: '/' },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/app-icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/icon-192.png',
  },
  appleWebApp: { capable: true, title: 'ReefChart Lite', statusBarStyle: 'black-translucent' },
  openGraph: {
    title: 'ReefChart Lite',
    description: socialDescription,
    siteName: 'ReefChart Lite',
    url: siteUrl,
    type: 'website',
    images: [{
      url: '/og/reefchart-lite-beta.png',
      width: 1200,
      height: 630,
      alt: 'ReefChart Lite β版',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReefChart Lite',
    description: socialDescription,
    images: ['/og/reefchart-lite-beta.png'],
  },
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
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
