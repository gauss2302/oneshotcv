import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8fafc] via-white to-[#eaf2ff] px-6">
      <div className="max-w-xl w-full text-center">
        <p className="text-sm font-semibold tracking-widest text-[#457b9d] uppercase">
          Error 404
        </p>
        <h1 className="mt-4 text-5xl sm:text-6xl font-bold text-[#0b1020] tracking-tight">
          We can't find that page
        </h1>
        <p className="mt-5 text-lg text-[#0b1020]/70">
          The link may be broken, or the page may have moved. Either way, your
          resume is fine.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-[#457b9d] px-6 h-12 text-white font-semibold shadow-[0_14px_40px_rgba(69,123,157,0.32)] transition hover:bg-[#3d6d8a]"
          >
            Back to home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 h-12 text-[#0b1020] font-semibold border border-[#0b1020]/10 shadow-[0_10px_30px_rgba(2,6,23,0.08)] transition hover:bg-[#f1faee]"
          >
            Go to your dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
