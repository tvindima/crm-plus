import "../styles/globals.css";
import { ReactNode } from "react";


export const metadata = {
  title: "CRM PLUS",
  description: "CRM imobiliario para a Peninsula Iberica",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt">
      <body className="bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white py-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
            <span className="text-xl font-bold text-primary-500">CRM PLUS</span>
            <span className="text-sm text-slate-500">CRM Imobiliario</span>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-12">{children}</main>
      </body>
    </html>
  );
}
