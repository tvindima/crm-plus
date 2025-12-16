import Link from "next/link";
import Image from "next/image";

const features = [
  { label: "Smart Dashboard", icon: "chart", description: "Real-time metrics and KPIs at a glance" },
  { label: "Property Management", icon: "home", description: "Manage listings with automated updates" },
  { label: "Lead Tracking", icon: "user", description: "Track and convert leads efficiently" },
  { label: "Calendar & Tasks", icon: "calendar", description: "Schedule visits and manage follow-ups" },
  { label: "Team Collaboration", icon: "users", description: "Coordinate agents and share insights" },
  { label: "AI Assistant", icon: "bot", description: "Smart suggestions powered by AI" },
];

const testimonials = [
  { name: "Ana Silva", role: "Agency Director", company: "ImobiNova", quote: "CRM PLUS transformed our operations. We increased conversions by 40% in 3 months.", avatar: "AS" },
  { name: "Carlos Mendes", role: "Senior Agent", company: "ReMax Premium", quote: "The automation features save me 10 hours per week. I can focus on closing deals.", avatar: "CM" },
  { name: "Rita Costa", role: "Franchise Owner", company: "Century 21", quote: "Perfect for managing multiple agents. The dashboard gives me total visibility.", avatar: "RC" },
];

const faqs = [
  { q: "How long does onboarding take?", a: "Most agencies are fully operational within 48 hours. We provide guided setup and migration support." },
  { q: "What integrations are available?", a: "CRM PLUS integrates with major portals (Idealista, Imovirtual), email platforms, and your existing website." },
  { q: "Is there a free trial?", a: "Yes! Start with our 14-day free trial. No credit card required." },
  { q: "How is pricing structured?", a: "Simple per-agent pricing starting at €29/month. Volume discounts available for agencies with 10+ agents." },
  { q: "What support do you offer?", a: "24/7 chat support, video tutorials, and dedicated account manager for premium plans." },
];

export default function Page() {
  return (
    <main className="relative overflow-hidden bg-black text-white selection:bg-pink-500/30 selection:text-white">
      {/* Background glows + effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,0,128,0.4),transparent_50%),radial-gradient(circle_at_80%_60%,rgba(192,38,211,0.35),transparent_45%),radial-gradient(circle_at_20%_80%,rgba(124,58,237,0.3),transparent_50%)]" />
        <div className="absolute left-1/4 top-20 h-96 w-96 opacity-60 [background:radial-gradient(circle,rgba(255,0,128,0.6),transparent_70%)] blur-3xl" />
        <div className="absolute right-1/4 top-40 h-80 w-80 opacity-50 [background:radial-gradient(circle,rgba(192,38,211,0.5),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center px-4 sm:px-6 lg:px-8 pb-20 pt-12 text-center md:pt-20">
        <div className="mb-8 sm:mb-10 flex flex-col items-center gap-3">
          <Image 
            src="/logo-crm-plus.svg" 
            alt="CRM PLUS Logo - Advanced CRM for Real Estate" 
            width={300} 
            height={300}
            priority
            className="w-[200px] sm:w-[250px] md:w-[300px] h-auto drop-shadow-[0_0_25px_rgba(255,0,128,0.6)] transition-transform duration-500 hover:scale-105"
          />
        </div>

        <h1 className="mb-6 max-w-4xl text-[clamp(2.5rem,8vw,4.5rem)] font-bold leading-[1.1] tracking-tight">
          Boost Your Sales Pipeline,<br />Empower Your Agents,<br />Close More Deals
        </h1>
        <p className="mb-10 max-w-2xl text-[clamp(1.125rem,3vw,1.375rem)] leading-relaxed text-gray-300">The complete CRM platform built exclusively for real estate agencies. Automate workflows, track every lead, and scale your business with confidence.</p>

        <Link
          href="#features"
          className="group mb-16 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#FF0080] to-[#C026D3] px-10 py-4 text-lg font-semibold text-white shadow-[0_0_40px_rgba(255,0,128,0.6)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(255,0,128,0.9)] active:scale-95"
        >
          Get Started
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-1">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
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

        {/* Para Quem Section */}
        <section className="w-full max-w-5xl mb-20">
          <h2 className="text-4xl font-bold mb-4 text-center">Built For Real Estate Professionals</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">Whether you're a solo agent or managing a franchise, CRM PLUS scales with your business</p>
          
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/20 to-black p-6 text-center transition-all hover:border-purple-500/60 hover:scale-105">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20 text-4xl">🏢</div>
              <h3 className="mb-2 text-xl font-bold">Agencies</h3>
              <p className="text-sm text-gray-400">Manage teams, track performance, and scale operations</p>
            </div>
            <div className="rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-950/20 to-black p-6 text-center transition-all hover:border-pink-500/60 hover:scale-105">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/20 text-4xl">🌐</div>
              <h3 className="mb-2 text-xl font-bold">Franchises</h3>
              <p className="text-sm text-gray-400">Multi-location management with centralized insights</p>
            </div>
            <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/20 to-black p-6 text-center transition-all hover:border-blue-500/60 hover:scale-105">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20 text-4xl">👤</div>
              <h3 className="mb-2 text-xl font-bold">Solo Agents</h3>
              <p className="text-sm text-gray-400">Powerful tools without the complexity or cost</p>
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <div id="features" className="grid w-full max-w-5xl gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 scroll-mt-20 mb-20">
          {features.map((feature) => (
            <div
              key={feature.label}
              className="group relative overflow-hidden rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-950/20 via-black to-purple-950/20 p-6 min-h-[180px] shadow-[0_0_30px_rgba(255,0,128,0.2)] transition-all duration-300 hover:border-pink-500/60 hover:shadow-[0_0_50px_rgba(255,0,128,0.4)] hover:-translate-y-1 active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5 opacity-0 transition group-hover:opacity-100" />
              <div className="relative flex flex-col items-center gap-4 text-center">
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-2xl border border-pink-500/40 bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-pink-400 shadow-[0_0_20px_rgba(255,0,128,0.3)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  aria-hidden="true"
                >
                  {feature.icon === "chart" && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3v18h18" strokeLinecap="round" />
                      <path d="M18 17V9M13 17V5M8 17v-3" strokeLinecap="round" />
                    </svg>
                  )}
                  {feature.icon === "home" && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      <path d="M9 22V12h6v10" />
                    </svg>
                  )}
                  {feature.icon === "user" && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="8" r="5" />
                      <path d="M3 21c2-4 6-6 9-6s7 2 9 6" strokeLinecap="round" />
                    </svg>
                  )}
                  {feature.icon === "calendar" && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
                    </svg>
                  )}
                  {feature.icon === "users" && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="7" r="4" />
                      <circle cx="17" cy="10" r="3" />
                      <path d="M2 21c1-3 4-5 7-5s6 2 7 5M15 21c1-2 3-4 5-4" strokeLinecap="round" />
                    </svg>
                  )}
                  {feature.icon === "bot" && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="6" y="8" width="12" height="12" rx="2" />
                      <path d="M12 2v4M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" />
                      <circle cx="9" cy="13" r="1" fill="currentColor" />
                      <circle cx="15" cy="13" r="1" fill="currentColor" />
                      <path d="M9 17h6" strokeLinecap="round" />
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

      {/* Testimonials Section */}
      <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold mb-4 text-center">Trusted by Leading Agencies</h2>
        <p className="text-gray-400 text-center mb-12">See what real estate professionals are saying</p>
        
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="group rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-950/20 to-purple-950/20 p-6 transition-all hover:border-pink-500/60 hover:-translate-y-1">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-500 text-sm font-bold text-white">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-bold">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                  <div className="text-xs text-pink-400">{t.company}</div>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-gray-300">"{t.quote}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold mb-4 text-center">Frequently Asked Questions</h2>
        <p className="text-gray-400 text-center mb-12">Everything you need to know about CRM PLUS</p>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-950/10 to-black p-6 transition-all hover:border-purple-500/60">
              <summary className="cursor-pointer list-none font-semibold text-white">
                <div className="flex items-center justify-between">
                  <span>{faq.q}</span>
                  <svg className="h-5 w-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </summary>
              <p className="mt-4 text-gray-400 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

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

      {/* Footer with Contacts */}
      <footer className="relative border-t border-pink-500/10 bg-gradient-to-b from-purple-950/20 to-black py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-3">
            <div>
              <Image src="/logo-crm-plus.svg" alt="CRM PLUS" width={120} height={120} className="mb-4" />
              <p className="text-sm text-gray-400">The complete CRM platform for modern real estate agencies</p>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold">Contact</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>📧 support@crmplus.pt</p>
                <p>📞 +351 21 234 5678</p>
                <p>📍 Lisbon, Portugal</p>
              </div>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold">Follow Us</h3>
              <div className="flex gap-4">
                <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-400 transition hover:border-pink-500/60 hover:bg-pink-500/20">𝕏</a>
                <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 transition hover:border-blue-500/60 hover:bg-blue-500/20">in</a>
                <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 transition hover:border-purple-500/60 hover:bg-purple-500/20">IG</a>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-pink-500/10 pt-8 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} CRM PLUS. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Sticky CTA for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-pink-500/20 bg-black/80 backdrop-blur-xl p-4 safe-area-inset-bottom">
        <Link
          href="#features"
          className="group flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#FF0080] to-[#C026D3] px-8 py-4 text-base font-semibold text-white shadow-[0_0_40px_rgba(255,0,128,0.7)] transition-all duration-300 active:scale-95"
        >
          Get Started Now
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-active:translate-x-1">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </main>
  );
}
