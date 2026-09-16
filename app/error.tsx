'use client'

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="shell py-28 text-center">
      <p className="eyebrow">Something went wrong</p>
      <span aria-hidden className="rule-gold mx-auto mt-5" />
      <h1 className="display mt-6 text-4xl">We could not complete that step.</h1>
      <p className="muted mx-auto mt-4 max-w-xl leading-7">
        Your information has not been intentionally discarded. Please retry the action. If the problem persists, return to My Blend Bar.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="btn">Try again</button>
        <a href="/my-blend-bar" className="btn-ghost">My Blend Bar</a>
      </div>
    </div>
  )
}
