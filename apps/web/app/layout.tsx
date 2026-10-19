import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "LIGA TRACKER", template: "%s · LIGA TRACKER" },
  description: "Gestión de ligas y torneos de fútbol amateur",
  manifest: "/manifest.json",
};

export const viewport: Viewport = { themeColor: "#10b981" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Tema elegido a mano (cookie). Sin cookie se usa prefers-color-scheme vía CSS,
  // así el HTML del servidor ya llega con el tema correcto y no hay destello.
  const theme = (await cookies()).get("theme")?.value;
  const dataTheme = theme === "light" || theme === "dark" ? theme : undefined;

  return (
    <html lang="es" data-theme={dataTheme} className={inter.variable}>
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}
