import "../styles/globals.css";
import { ReactNode } from "react";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { BrandImage } from "../components/BrandImage";
import UserMenuWrapper from "../components/UserMenuWrapper";

export const metadata = {
  title: "Imóveis Mais",
  description: "Site público da agência Imóveis Mais.",
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
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <Link href="/" className="flex items-center gap-3">
                <BrandImage src="/brand/agency-logo.svg" alt="Imóveis Mais" width={32} height={32} className="h-8 w-8" />
                <div>
                  <p className="text-sm uppercase tracking-wide text-[#E10600]">Imóveis Mais</p>
                  <p className="text-xs text-[#C5C5C5]">Casas e investimentos à medida</p>
                </div>
              </Link>
              <nav className="flex items-center gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded px-3 py-2 text-sm text-[#C5C5C5] transition hover:text-white hover:shadow-[0_0_10px_#E10600]"
                  >
                    {link.label}
                  </Link>
                ))}
                <UserMenuWrapper />
              </nav>
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>

          <footer className="border-t border-[#2A2A2E] bg-[#0B0B0D] py-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <BrandImage src="/brand/agency-logo.svg" alt="Imóveis Mais" width={120} height={32} className="h-8" style={{ width: 'auto', height: '2rem' }} />
                <p className="text-sm text-[#C5C5C5]">Imóveis exclusivos, equipa local dedicada.</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-[#C5C5C5]">
                <span className="text-xs text-[#7A7A7A]">Powered by CRM PLUS</span>
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
          </footer>
        </div>
      </body>
    </html>
  );
}
