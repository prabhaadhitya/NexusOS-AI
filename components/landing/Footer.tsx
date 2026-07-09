export function Footer() {
  return (
    <footer className="bg-[#0A0B0F] border-t border-[#1F2230] py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-accent flex items-center justify-center">
            <span className="text-white font-bold tracking-tighter text-xs">N</span>
          </div>
          <span className="font-bold tracking-tight text-white">
            NexusOS AI
          </span>
        </div>
        
        <p className="text-sm text-gray-500 text-center md:text-left">
          Run your business with AI employees.
        </p>
        
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} NexusOS. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
