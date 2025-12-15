import "../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CRM PLUS — Advanced CRM for Real Estate Agencies",
  description: "Streamline your operations, track leads, and grow. The most powerful CRM platform for real estate agencies with automation, collaboration and integration.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}
