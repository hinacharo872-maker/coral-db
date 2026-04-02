import './globals.css'

export const metadata = {
  title: 'World Coral Database | 世界サンゴデータベース',
  description: '世界中のサンゴ飼育データを集めた公開データベース',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body className="bg-slate-950 min-h-screen">
        {children}
      </body>
    </html>
  )
}
