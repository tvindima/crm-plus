import Link from "next/link";
import Image from "next/image";

const features = [
  { label: "Lead Management", icon: "user", description: "Track and convert leads efficiently" },
  { label: "Powerful Automation", icon: "bolt", description: "Automate workflows and save time" },
  { label: "Agent Collaboration", icon: "users", description: "Team coordination made easy" },
];

export default function Page() {
  return (
    <main className="relative overflow-hidden bg-black text-white">
      {/* Background glows + effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,0,128,0.4),transparent_50%),radial-gradient(circle_at_80%_60%,rgba(192,38,211,0.35),transparent_45%),radial-gradient(circle_at_20%_80%,rgba(124,58,237,0.3),transparent_50%)]" />
        <div className="absolute left-1/4 top-20 h-96 w-96 opacity-60 [background:radial-gradient(circle,rgba(255,0,128,0.6),transparent_70%)] blur-3xl" />
        <div className="absolute right-1/4 top-40 h-80 w-80 opacity-50 [background:radial-gradient(circle,rgba(192,38,211,0.5),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center px-6 pb-20 pt-12 text-center md:pt-20">
        <div className="mb-10 flex flex-col items-center gap-3">
          <Image 
            src="/logo-crm-plus.svg" 
            alt="CRM PLUS Logo" 
            width={300} 
            height={300}
            priority
            className="drop-shadow-[0_0_25px_rgba(255,0,128,0.6)]"
          />
        </div>

        <h1 className="mb-6 max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
          Advanced CRM for<br />Real Estate Agencies
        </h1>
        <p className="mb-10 max-w-xl text-xl text-gray-300">Streamline your operations, track leads, and grew</p>

        <Link
          href="#"
          className="mb-16 rounded-full bg-gradient-to-r from-[#FF0080] to-[#C026D3] px-10 py-4 text-lg font-semibold text-white shadow-[0_0_40px_rgba(255,0,128,0.6)] transition hover:-translate-y-1 hover:shadow-[0_0_60px_rgba(255,0,128,0.8)]"
        >
          Get Started
        </Link>

        {/* Device mock block with realistic laptop + mobile */}
        <div className="relative mb-20 w-full max-w-6xl">
          <div className="relative aspect-[16/10] overflow-visible rounded-[32px] border border-pink-500/30 bg-gradient-to-br from-pink-950/40 via-purple-950/30 to-black p-6 shadow-[0_0_80px_rgba(255,0,128,0.4)]">
            {/* Laptop mockup */}
            <div className="absolute left-8 top-8 h-[75%] w-[58%] overflow-hidden rounded-[20px] border-2 border-pink-500/50 bg-gradient-to-br from-gray-900 via-black to-purple-950 shadow-[0_20px_60px_rgba(255,0,128,0.5)]">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-purple-500/10" />
              {/* Mock interface content */}
              <div className="relative p-6">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">CRM P.US</span>
                  <div className="flex gap-2">
                    <div className="h-2 w-2 rounded-full bg-pink-500" />
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-8 w-32 rounded bg-gradient-to-r from-pink-500/20 to-transparent" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-16 rounded-lg border border-pink-500/30 bg-black/40" />
                    <div className="h-16 rounded-lg border border-purple-500/30 bg-black/40" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile mockup */}
            <div className="absolute bottom-8 right-12 h-[70%] w-[140px] overflow-hidden rounded-[36px] border-2 border-purple-500/50 bg-gradient-to-b from-gray-900 via-black to-purple-950 shadow-[0_20px_50px_rgba(192,38,211,0.6)]">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent" />
              <div className="relative p-4">
                <div className="mb-3 h-1 w-12 mx-auto rounded-full bg-gray-600" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-lg border border-pink-500/40 bg-black/50 p-2">
                    <div className="h-2 w-2 rounded-full bg-pink-500" />
                    <div className="h-2 w-16 rounded bg-pink-500/30" />
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-blue-500/40 bg-black/50 p-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <div className="h-2 w-16 rounded bg-blue-500/30" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid w-full max-w-5xl gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.label}
              className="group relative overflow-hidden rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-950/20 via-black to-purple-950/20 p-6 shadow-[0_0_30px_rgba(255,0,128,0.2)] transition hover:border-pink-500/60 hover:shadow-[0_0_50px_rgba(255,0,128,0.4)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5 opacity-0 transition group-hover:opacity-100" />
              <div className="relative flex flex-col items-center gap-4 text-center">
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-2xl border border-pink-500/40 bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-pink-400 shadow-[0_0_20px_rgba(255,0,128,0.3)]"
                  aria-hidden
                >
                  {feature.icon === "user" && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="8" r="5" />
                      <path d="M3 21c2-4 6-6 9-6s7 2 9 6" strokeLinecap="round" />
                    </svg>
                  )}
                  {feature.icon === "bolt" && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
                    </svg>
                  )}
                  {feature.icon === "users" && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="7" r="4" />
                      <circle cx="17" cy="10" r="3" />
                      <path d="M2 21c1-3 4-5 7-5s6 2 7 5M15 21c1-2 3-4 5-4" strokeLinecap="round" />
                    </svg>
                  )}
                </span>
                <div>
                  <h3 className="mb-1 text-lg font-bold text-white">{feature.label}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Section */}
      <section className="relative overflow-hidden border-t border-pink-500/10 bg-gradient-to-b from-black via-purple-950/20 to-black py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/3 top-20 h-96 w-96 opacity-40 [background:radial-gradient(circle,rgba(124,58,237,0.6),transparent_70%)] blur-3xl" />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="text-left">
              <h2 className="mb-6 text-5xl font-bold leading-tight">
                Integrated with<br />Agency Websites
              </h2>
              <p className="text-xl text-gray-300">Gree ntegregicor by CMPLUS</p>
            </div>

            <div className="relative flex items-center justify-center gap-8">
              {/* Robot mascot SVG */}
              <div className="relative">
                <div className="absolute inset-0 -z-10 scale-110 [background:radial-gradient(circle,rgba(59,130,246,0.4),transparent_60%)] blur-2xl" />
                <svg width="200" height="240" viewBox="0 0 200 240" fill="none" className="drop-shadow-[0_0_30px_rgba(59,130,246,0.6)]">
                  {/* Body */}
                  <ellipse cx="100" cy="160" rx="70" ry="65" fill="url(#robotBody)" />
                  <ellipse cx="100" cy="160" rx="60" ry="55" fill="url(#robotBodyInner)" />
                  
                  {/* Head */}
                  <ellipse cx="100" cy="80" rx="55" ry="50" fill="url(#robotHead)" />
                  
                  {/* Eyes */}
                  <circle cx="80" cy="75" r="18" fill="#1E293B" />
                  <circle cx="120" cy="75" r="18" fill="#1E293B" />
                  <circle cx="82" cy="73" r="12" fill="#3B82F6" className="animate-pulse" />
                  <circle cx="122" cy="73" r="12" fill="#3B82F6" className="animate-pulse" />
                  <circle cx="86" cy="70" r="4" fill="white" />
                  <circle cx="126" cy="70" r="4" fill="white" />
                  
                  {/* Antenna */}
                  <line x1="100" y1="30" x2="100" y2="45" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="100" cy="25" r="8" fill="#C026D3" className="animate-pulse" />
                  
                  {/* Smile */}
                  <path d="M75 95 Q100 105 125 95" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" fill="none" />
                  
                  {/* Arms */}
                  <ellipse cx="35" cy="150" rx="15" ry="35" fill="url(#robotArm)" transform="rotate(-20 35 150)" />
                  <ellipse cx="165" cy="150" rx="15" ry="35" fill="url(#robotArm)" transform="rotate(20 165 150)" />
                  
                  {/* Bottom accent */}
                  <ellipse cx="100" cy="200" rx="45" ry="20" fill="url(#robotBottom)" />
                  
                  <defs>
                    <linearGradient id="robotBody" x1="100" y1="95" x2="100" y2="225" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#7C3AED" />
                      <stop offset="0.5" stopColor="#6366F1" />
                      <stop offset="1" stopColor="#3B82F6" />
                    </linearGradient>
                    <linearGradient id="robotBodyInner" x1="100" y1="105" x2="100" y2="215">
                      <stop stopColor="#4C1D95" />
                      <stop offset="1" stopColor="#1E3A8A" />
                    </linearGradient>
                    <linearGradient id="robotHead" x1="100" y1="30" x2="100" y2="130">
                      <stop stopColor="#A78BFA" />
                      <stop offset="1" stopColor="#818CF8" />
                    </linearGradient>
                    <linearGradient id="robotArm" x1="0" y1="0" x2="0" y2="70">
                      <stop stopColor="#6366F1" />
                      <stop offset="1" stopColor="#3B82F6" />
                    </linearGradient>
                    <radialGradient id="robotBottom">
                      <stop stopColor="#3B82F6" stopOpacity="0.6" />
                      <stop offset="1" stopColor="#1E3A8A" stopOpacity="0.3" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>

              {/* Properties mockup */}
              <div className="relative h-80 w-80 overflow-hidden rounded-2xl border border-purple-500/40 bg-gradient-to-br from-gray-900 via-black to-purple-950 shadow-[0_20px_60px_rgba(124,58,237,0.5)]">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
                <div className="relative p-6">
                  <div className="mb-4 text-xs font-bold tracking-wider text-gray-400">CPD ACCOUNTS</div>
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="overflow-hidden rounded-lg border border-purple-500/30 bg-black/60">
                        <div className="aspect-video bg-gradient-to-br from-purple-900/40 to-pink-900/40" />
                        <div className="p-2">
                          <div className="mb-1 h-2 w-full rounded bg-purple-500/30" />
                          <div className="h-1.5 w-2/3 rounded bg-purple-500/20" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
