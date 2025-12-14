import Link from "next/link";

const features = [
  { label: "Lead Management", icon: "dot" },
  { label: "Powerful Automation", icon: "bolt" },
  { label: "Agent Collaboration", icon: "user" },
];

const HexLogo = () => (
  <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden>
    <path
      d="M48 6 14 24v48l34 18 34-18V24L48 6Z"
      stroke="#F44336"
      strokeWidth="4"
      strokeLinejoin="round"
      fill="url(#grad)"
    />
    <path d="M36 38h12M42 32v12" stroke="#F44336" strokeWidth="4" strokeLinecap="round" />
    <path d="M54 40a6 6 0 1 1 12 0 6 6 0 0 1-12 0Z" stroke="#F44336" strokeWidth="4" />
    <path d="M60 46v12" stroke="#F44336" strokeWidth="4" strokeLinecap="round" />
    <defs>
      <radialGradient id="grad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(48 48) rotate(90) scale(48)">
        <stop stopColor="#2A0A0A" />
        <stop offset="1" stopColor="#0B0506" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

export default function Page() {
  return (
    <main className="relative overflow-hidden bg-[#0b0506] text-white">
      {/* Background glows + hex grid */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,0,0,0.35),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(120,0,0,0.28),transparent_38%),radial-gradient(circle_at_50%_80%,rgba(0,0,0,0.9),#060305_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(30deg,rgba(255,0,0,0.05)_10%,rgba(0,0,0,0)_11%),linear-gradient(150deg,rgba(255,0,0,0.05)_10%,rgba(0,0,0,0)_11%)] bg-[length:220px_220px,220px_220px]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_10px_10px,#f44336_1.2px,transparent_0)] [background-size:60px_60px]" />
        <div className="absolute left-6 top-24 h-80 w-80 opacity-40 [background:radial-gradient(circle_at_30%_30%,rgba(255,0,0,0.5),transparent_55%)] blur-2xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center px-6 pb-16 pt-12 text-center md:pt-16">
        <div className="mb-8 flex flex-col items-center gap-4">
          <HexLogo />
          <div className="text-xl font-semibold tracking-[0.2em] text-white">CRM PLUS</div>
        </div>

        <h1 className="mb-4 max-w-3xl text-4xl font-bold leading-[1.1] md:text-5xl">
          Power your real estate agency with the #1 CRM.
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-[#D5D5D5]">Streamline operations. Track leads, Grow faster.</p>

        <div className="mb-6 flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
          <Link
            href="#"
            className="w-full max-w-[240px] rounded-lg bg-[#F44336] px-6 py-3 text-center text-base font-semibold text-white shadow-[0_0_32px_rgba(244,67,54,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(244,67,54,0.6)]"
          >
            Get Started Free
          </Link>
          <span className="text-sm text-[#D5D5D5]">No credit card required</span>
        </div>

        <p className="mb-10 text-sm text-[#D5D5D5]">Trusted by 150+ agencies • Integration with PortaLX</p>

        {/* Device mock block (stylized to mirror reference) */}
        <div className="relative mb-12 w-full max-w-4xl overflow-hidden rounded-[28px] border border-[#341012] bg-gradient-to-b from-[#140708] via-[#0b0506] to-[#050304] shadow-[0_10px_60px_rgba(0,0,0,0.65)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,0,0,0.25),transparent_60%),radial-gradient(circle_at_70%_70%,rgba(255,0,0,0.18),transparent_55%)]" />
          <div className="relative aspect-[5/3] bg-[linear-gradient(135deg,#1a0c0f,#0b0506_55%,#0a0a10)]">
            <div className="absolute inset-x-6 top-6 h-[70%] rounded-[22px] border border-[#2d171a] bg-[#0c090f] shadow-[0_0_40px_rgba(255,0,0,0.25)]" />
            <div className="absolute inset-x-10 top-10 h-[62%] rounded-[18px] border border-[#1d0f12] bg-gradient-to-br from-[#1b0e14] via-[#0b0a12] to-[#0c0a0f] shadow-[0_10px_30px_rgba(0,0,0,0.5)]" />
            <div className="absolute bottom-8 right-10 h-[55%] w-[120px] rounded-[28px] border border-[#1d1115] bg-gradient-to-b from-[#161520] via-[#0e0d16] to-[#0a090f] shadow-[0_10px_26px_rgba(0,0,0,0.5)]" />
          </div>
        </div>

        {/* Feature pills */}
        <div className="grid w-full max-w-4xl gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.label}
              className="flex items-center gap-3 rounded-2xl border border-[#241014] bg-gradient-to-br from-[#0f0c12] to-[#0b080d] px-4 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2f1a1e] bg-[#140c10] text-[#F44336] shadow-[0_0_12px_rgba(244,67,54,0.25)]"
                aria-hidden
              >
                {feature.icon === "dot" && <span className="h-3 w-3 rounded-full bg-[#F44336]" />}
                {feature.icon === "bolt" && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="#F44336" />
                  </svg>
                )}
                {feature.icon === "user" && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="#F44336" strokeWidth="2" />
                    <path d="M5 20c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5" stroke="#F44336" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </span>
              <p className="text-base font-semibold text-white">{feature.label}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-[#D5D5D5]">↓ Scroll to learn more</p>
      </div>
    </main>
  );
}
