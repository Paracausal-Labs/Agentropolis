export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full border border-white/15 bg-white/5 p-6">
        <h1 className="text-xl font-black tracking-widest uppercase">Not Found</h1>
        <p className="mt-3 text-sm text-white/80">
          This route does not exist.
        </p>
        <a
          href="/"
          className="inline-block mt-5 px-4 py-2 text-xs font-bold uppercase tracking-widest border border-white/20 hover:bg-white/5"
        >
          Return To City
        </a>
      </div>
    </div>
  )
}

