import './globals.css'

export const metadata = {
  title: 'Aqua Reef Log',
  description: '海水水槽の水質管理とサンゴデータベースを統合するアクアリウム管理アプリ',
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
