import Header from '@/components/Header'

export const metadata = {
  title: '利用規約 | Coral DB Lite',
  description: 'Coral DB Liteの利用規約',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm font-bold text-cyan-300">Coral DB Lite</p>
        <h1 className="mt-2 text-3xl font-bold text-white">利用規約</h1>
        <p className="mt-3 text-sm text-slate-400">最終更新日: 2026年6月8日</p>

        <TermsSection title="サービスの位置づけ">
          <p>Coral DB Liteは、海水水槽の記録とショップ相談を補助するツールです。診断、医療、獣医療、専門業務、メーカー公式説明の代替ではありません。</p>
        </TermsSection>

        <TermsSection title="添加・購入判断">
          <p>添加剤の使用や購入、水換え、設備変更は、ショップ、メーカー公式説明、専門家の助言を確認したうえで利用者の判断で行ってください。Coral DB Liteは自己判断で急な添加を促すものではありません。</p>
        </TermsSection>

        <TermsSection title="データとバックアップ">
          <p>通信障害、端末故障、ブラウザ設定、外部サービス障害によりデータが失われる可能性があります。重要な記録はCSVなどで定期的にバックアップしてください。</p>
        </TermsSection>

        <TermsSection title="共有リンク">
          <p>共有リンクを知っている人は期限内に水槽カルテを閲覧できます。不要になったリンクは停止してください。新規リンクの有効期限は24時間または7日です。</p>
        </TermsSection>

        <TermsSection title="禁止事項">
          <ul className="list-disc space-y-2 pl-6">
            <li>他人のアカウントや共有リンクを不正に利用する行為</li>
            <li>虚偽、権利侵害、違法な写真や情報を登録する行為</li>
            <li>サービスの解析、攻撃、過剰なアクセス、妨害行為</li>
            <li>ショップや第三者に誤解を与える目的でデータを改ざんする行為</li>
          </ul>
        </TermsSection>

        <TermsSection title="免責">
          <p>Coral DB Liteの表示や提案は、水槽の状態や生体の安全を保証するものではありません。利用により生じた損害について、法令で認められる範囲で責任を負いません。</p>
        </TermsSection>
      </main>
    </div>
  )
}

function TermsSection({ title, children }) {
  return (
    <section className="mt-7 border-t border-slate-800 pt-5">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <div className="mt-3 leading-7 text-slate-300">{children}</div>
    </section>
  )
}
