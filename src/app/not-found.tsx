import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-32 space-y-4 text-center px-8">
      <span className="text-4xl font-mono font-bold text-primary">404</span>
      <p className="text-sm text-muted-foreground">This page doesn't exist.</p>
      <Link
        href="/"
        className="text-sm text-primary hover:underline underline-offset-4"
      >
        ← Back to journal
      </Link>
    </div>
  )
}
