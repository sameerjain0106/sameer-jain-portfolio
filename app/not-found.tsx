import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="mono-label text-xs text-signal">404</p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink">
        Page not found
      </h1>
      <p className="mt-3 max-w-sm text-sm text-ink-muted">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-signal/10 border border-signal/30 px-4 py-2 text-sm text-signal transition-colors hover:bg-signal/20"
      >
        Back to home
      </Link>
    </div>
  );
}
