import Link from 'next/link'
import Header from '@/components/Header'

export const metadata = {
  title: 'ReefChart Lite',
  description: '海水水槽の水質・水換え・添加剤・写真をかんたんに記録し、ショップに見せやすくする無料ログアプリ。',
}

const PARAMETERS = [
  { label: 'KH（炭酸塩硬度）', unit: 'dKH' },
  { label: '水温', unit: '℃' },
  { label: '塩分濃度', unit: 'SG' },
  { label: '硝酸塩（NO3）', unit: 'ppm' },
  { label: 'リン酸塩（PO4）', unit: 'ppm' },
]

const ACTIONS = [
  {
    href: '/lite',
    label: 'Liteをはじめる',
    description: '水槽を作成して記録を始めます',
    primary: true,
  },
  {
    href: '/lite/measure',
    label: '水質を記録',
    description: '測れた項目だけで大丈夫です',
  },
  {
    href: '/lite/record?type=water-change',
    label: '水換えを記録',
    description: '日付と換水量を残します',
  },
  {
    href: '/lite/record?type=additive',
    label: '添加剤を記録',
    description: '使っている添加剤を登録します',
  },
  {
    href: '/lite/record?type=photo',
    label: '写真を追加',
    description: '現在の水槽写真を残します',
  },
  {
    href: '/lite/shop-card',
    label: 'ショップに見せる',
    description: '店員が読みやすい水槽カルテを開きます',
    shop: true,
  },
]

export default function ReefChartLiteHome() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <section className="relative min-h-[300px] overflow-hidden border-b border-cyan-900/60 sm:min-h-[360px]">
        <img
          src="/lite-review-tank.webp"
          alt="リーフ水槽"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/75" />
        <div className="relative mx-auto flex min-h-[300px] max-w-6xl flex-col justify-end px-4 py-8 sm:min-h-[360px] sm:py-10">
          <p className="text-sm font-bold text-cyan-200">ReefChart Lite β版</p>
          <h1 className="mt-2 text-4xl font-bold text-white sm:text-5xl">ReefChart Lite</h1>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-100">
            海水水槽の状態を、ショップに見せやすくする無料ログアプリです。
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            測れた項目だけ記録できます。現在はβ版のため、大切な記録はCSVでのバックアップをおすすめします。
          </p>
          <Link
            href="/lite"
            className="mt-6 flex min-h-14 w-full max-w-sm items-center justify-center bg-cyan-400 px-5 py-3 text-lg font-bold text-slate-950 hover:bg-cyan-300"
          >
            Liteをはじめる
          </Link>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-7">
        <section>
          <h2 className="text-xl font-bold text-white">記録できる水質</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {PARAMETERS.map(parameter => (
              <div key={parameter.label} className="min-h-24 border border-slate-700 bg-slate-900 p-3">
                <p className="text-sm font-bold leading-5 text-white">{parameter.label}</p>
                <p className="mt-2 text-xs text-cyan-300">{parameter.unit}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-white">記録する</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ACTIONS.map(action => (
              <Link
                key={action.label}
                href={action.href}
                className={`flex min-h-24 flex-col justify-center border px-5 py-4 ${
                  action.primary
                    ? 'border-cyan-300 bg-cyan-400 text-slate-950'
                    : action.shop
                      ? 'border-emerald-500 bg-emerald-950 text-emerald-50'
                      : 'border-slate-700 bg-slate-900 text-white hover:border-cyan-500'
                }`}
              >
                <strong className="text-lg">{action.label}</strong>
                <span className={`mt-1 text-sm ${action.primary ? 'text-slate-800' : 'text-slate-300'}`}>
                  {action.description}
                </span>
              </Link>
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}
