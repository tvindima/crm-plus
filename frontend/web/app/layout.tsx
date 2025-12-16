import "../styles/globals.css";
import { ReactNode } from "react";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { BrandImage } from "../components/BrandImage";
import UserMenuWrapper from "../components/UserMenuWrapper";
import MobileMenu from "../components/MobileMenu";

export const metadata = {
  metadataBase: new URL('https://imoveismais-site.vercel.app'),
  title: {
    default: "Imóveis Mais - Casas e Investimentos à Medida",
    template: "%s | Imóveis Mais"
  },
  description: "Encontre a casa perfeita ou o investimento ideal em Portugal. Moradias, apartamentos, terrenos e imóveis comerciais com a Imóveis Mais.",
  keywords: ["imóveis", "casas", "apartamentos", "moradias", "venda", "arrendamento", "Portugal", "Leiria", "investimento imobiliário"],
  authors: [{ name: "Imóveis Mais" }],
  creator: "Imóveis Mais",
  publisher: "Imóveis Mais",
  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: "https://imoveismais-site.vercel.app",
    siteName: "Imóveis Mais",
    title: "Imóveis Mais - Casas e Investimentos à Medida",
    description: "Encontre a casa perfeita ou o investimento ideal em Portugal. Moradias, apartamentos, terrenos e imóveis comerciais.",
    images: [
      {
        url: "/brand/agency-logo.svg",
        width: 1200,
        height: 630,
        alt: "Imóveis Mais",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Imóveis Mais - Casas e Investimentos à Medida",
    description: "Encontre a casa perfeita ou o investimento ideal em Portugal.",
    images: ["/brand/agency-logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/imoveis", label: "Imóveis" },
  { href: "/empreendimentos", label: "Empreendimentos" },
  { href: "/agentes", label: "Equipa" },
  { href: "/contactos", label: "Contactos" },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt" className={poppins.variable}>
      <body className="bg-[#0B0B0D] text-white">
        <div className="min-h-screen bg-grid">
          <header className="sticky top-0 z-20 border-b border-[#2A2A2E] bg-[#0B0B0D]/80 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
              {/* Logo - Simplificado em mobile */}
              <Link href="/" className="flex items-center gap-2 md:gap-3">
                <BrandImage 
                  src="/brand/agency-logo.svg" 
                  alt="Imóveis Mais" 
                  width={32} 
                  height={32} 
                  className="h-7 w-7 md:h-8 md:w-8" 
                />
                <div className="hidden sm:block">
                  <p className="text-xs uppercase tracking-wide text-[#E10600] md:text-sm">Imóveis Mais</p>
                  <p className="hidden text-xs text-[#C5C5C5] md:block">Casas e investimentos à medida</p>
                </div>
                {/* Texto simplificado mobile */}
                <p className="text-xs uppercase tracking-wide text-[#E10600] sm:hidden">Imóveis Mais</p>
              </Link>

              {/* Desktop Navigation - Hidden on mobile */}
              <nav className="hidden items-center gap-2 md:flex lg:gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded px-2 py-2 text-sm text-[#C5C5C5] transition hover:text-white hover:shadow-[0_0_10px_#E10600] lg:px-3"
                  >
                    {link.label}
                  </Link>
                ))}
                <UserMenuWrapper />
              </nav>

              {/* Mobile Menu */}
              <MobileMenu links={navLinks} />
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">{children}</main>

          <footer className="border-t border-[#2A2A2E] bg-[#0B0B0D] py-6 md:py-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between md:px-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <BrandImage 
                  src="/brand/agency-logo.svg" 
                  alt="Imóveis Mais" 
                  width={120} 
                  height={32} 
                  className="h-6 md:h-8" 
                  style={{ width: 'auto', height: '1.5rem' }} 
                />
                <p className="text-xs text-[#C5C5C5] sm:text-sm">Imóveis exclusivos, equipa local dedicada.</p>
              </div>
              <div className="flex flex-col gap-3 text-xs text-[#C5C5C5] sm:flex-row sm:items-center sm:gap-4 md:text-sm">
                <span className="text-[10px] text-[#7A7A7A] md:text-xs">Powered by CRM PLUS</span>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <Link href="/privacidade" className="hover:text-white">
                    Privacidade
                  </Link>
                  <Link href="/cookies" className="hover:text-white">
                    Cookies
                  </Link>
                  <Link href="/termos" className="hover:text-white">
                    Termos
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
