import "../styles/globals.css";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "CRM PLUS — Backoffice",
  description: "Área administrativa e operacional do CRM PLUS para equipas internas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className="bg-[#070708] text-white">{children}</body>
    </html>
  );
}
