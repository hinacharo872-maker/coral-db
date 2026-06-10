'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ProError({ error, reset }) {
  useEffect(() => {
    console.error('ReefChart Pro render error', error)
  }, [error])

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-16 text-zinc-100">
      <main className="mx-auto max-w-lg border border-rose-800 bg-zinc-900 p-6">
        <p className="text-sm font-bold text-rose-300">ReefChart Pro</p>
        <h1 className="mt-2 text-2xl font-bold text-white">画面を読み込めませんでした</h1>
        <p className="mt-3 leading-7 text-zinc-300">
          データは削除されていません。再読み込みしても直らない場合は、Proホームへ戻ってもう一度お試しください。
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => reset()} className="min-h-14 bg-emerald-400 px-5 font-bold text-zinc-950">
            再読み込み
          </button>
          <Link href="/pro" className="flex min-h-14 items-center justify-center border border-zinc-600 px-5 font-bold text-white">
            Proホームへ戻る
          </Link>
        </div>
      </main>
    </div>
  )
}
