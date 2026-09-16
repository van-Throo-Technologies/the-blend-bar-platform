import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="shell py-28 text-center">
      <p className="eyebrow">404</p>
      <span aria-hidden className="rule-gold mx-auto mt-5" />
      <h1 className="display mt-6 text-4xl">This blend is not on the menu.</h1>
      <p className="muted mx-auto mt-4 max-w-xl leading-7">The page you are looking for may have moved or is not part of this edition.</p>
      <Link href="/" className="btn mt-9">Return home</Link>
    </div>
  )
}
