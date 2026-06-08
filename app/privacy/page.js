import Header from '@/components/Header'

export const metadata = {
  title: 'プライバシーポリシー | Coral DB Lite',
  description: 'Coral DB Liteのプライバシーポリシー',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm font-bold text-cyan-300">Coral DB Lite</p>
        <h1 className="mt-2 text-3xl font-bold text-white">プライバシーポリシー</h1>
        <p className="mt-3 text-sm text-slate-400">最終更新日: 2026年6月8日</p>

        <PolicySection title="取得する情報">
          <p>Coral DB Liteは、アカウント情報、メールアドレス、水槽名、水量、水換え頻度、水質ログ、写真、添加剤情報、ショップに見せる画面で必要な情報を保存します。</p>
        </PolicySection>

        <PolicySection title="共有リンクと閲覧">
          <p>ショップ共有リンクを作成した場合、リンクを知っている人は期限内に水槽カルテを閲覧できます。共有リンクの閲覧時刻、状態、フィードバック内容を、共有機能の改善と安全確認のために記録することがあります。</p>
        </PolicySection>

        <PolicySection title="利用目的">
          <p>取得した情報は、水槽管理記録、ショップへ見せるカルテ表示、共有リンク管理、エラー対応、品質改善、利用者からの問い合わせ対応に利用します。</p>
        </PolicySection>

        <PolicySection title="エラー監視と解析">
          <p>今後エラー監視を導入する場合、画面遷移、ブラウザ情報、エラー内容などを取得することがあります。水槽写真、共有トークン、メールアドレス、自由入力メモなどの個人情報は送信しない設定を優先します。</p>
        </PolicySection>

        <PolicySection title="第三者提供">
          <p>利用者が共有リンクを作成した場合を除き、本人の同意なく個人の水槽データを第三者へ提供しません。法令に基づく場合はこの限りではありません。</p>
        </PolicySection>

        <PolicySection title="データ削除">
          <p>アカウント情報、水槽情報、水質ログ、写真、添加剤情報の削除を希望する場合は、アプリ内の削除機能または運営者への連絡により依頼できます。本人確認後、合理的な範囲で対応します。</p>
        </PolicySection>
      </main>
    </div>
  )
}

function PolicySection({ title, children }) {
  return (
    <section className="mt-7 border-t border-slate-800 pt-5">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <div className="mt-3 leading-7 text-slate-300">{children}</div>
    </section>
  )
}
