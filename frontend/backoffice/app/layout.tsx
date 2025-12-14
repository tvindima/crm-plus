import "../styles/globals.css";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "CRM PLUS — Backoffice",
  description: "Área administrativa e operacional do CRM PLUS para equipas internas.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%23E10600'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='18' font-weight='bold' font-family='Arial'>C+</text></svg>",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className="bg-[#070708] text-white">{children}</body>
    </html>
  );
}
