import { feedbackUrl } from '@/lib/publicFeatures'

export default function LiteFeedbackLink() {
  const href = feedbackUrl(process.env.NEXT_PUBLIC_FEEDBACK_URL)
  if (!href) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-8 flex min-h-14 w-full items-center justify-center border-2 border-cyan-600 bg-slate-900 px-5 py-3 text-lg font-bold text-cyan-100 hover:border-cyan-300"
    >
      ご意見・ご要望
      <span className="sr-only">（新しいタブで開きます）</span>
    </a>
  )
}
