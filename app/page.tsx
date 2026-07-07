import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
          NexusOS AI
        </h1>
        <p className="text-xl md:text-2xl text-slate-400">
          AI Workforce Operating System
        </p>
        <div className="pt-8">
          <Link 
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Enter Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
