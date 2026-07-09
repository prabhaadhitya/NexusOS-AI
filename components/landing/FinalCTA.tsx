import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="py-32 bg-[#0A0B0F] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-900/10 pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-8">
          Ready to hire your new <br />
          <span className="text-gradient">Executive Team?</span>
        </h2>
        
        <Link 
          href="/dashboard"
          className="inline-flex items-center justify-center font-bold text-lg text-white bg-gradient-accent px-10 py-5 rounded-full hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_50px_rgba(79,70,229,0.5)] transform hover:-translate-y-1 mb-8"
        >
          Try the Demo
        </Link>
        
        <p className="text-xs font-mono text-gray-600">
          Built on Next.js, Supabase, and OpenRouter
        </p>
      </div>
    </section>
  );
}
