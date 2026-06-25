export default function ThankYouPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-100 px-4 text-center">
      <div className="w-full max-w-md bg-white p-8 sm:p-12 rounded-2xl border border-stone-200/60 shadow-xl space-y-6">
        <div className="mx-auto h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">Thank You</h1>
          <p className="text-stone-605 text-sm font-sans">
            Your print selections have been successfully submitted.
          </p>
        </div>
        
        <div className="h-px bg-stone-100 w-full"></div>
        
        <p className="text-xs text-stone-500 leading-relaxed">
          The studio has been notified and will proceed with preparation of your custom wedding album and prints.
        </p>

        <div className="font-serif text-xs font-semibold tracking-widest text-stone-400 uppercase pt-2">
          SIGNATURE STUDIOS
        </div>
      </div>
    </div>
  );
}
