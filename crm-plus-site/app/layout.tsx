import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CRM PLUS — Plataforma para Agências",
  description: "Site institucional CRM PLUS para agências imobiliárias: funcionalidades, automação e integração total.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className="bg-[#070708] text-white">{children}</body>
    </html>
  );
}
