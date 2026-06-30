import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VecinoClaro — Gestión Bimonetaria",
  description:
    "Plataforma SaaS para gestión de condominios en Venezuela. Contabilidad bimonetaria USD/VES, tasa BCV dinámica, pagos locales y servicios críticos.",
  keywords: [
    "condominio",
    "Venezuela",
    "bimonetario",
    "BCV",
    "pago móvil",
    "Zelle",
    "gestión inmobiliaria",
  ],
  authors: [{ name: "VecinoClaro" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(s){s.unregister();console.log('SW removed:',s.scope);});});}`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
        <Toaster />
        <SonnerToaster richColors position="top-right" />
      </body>
    </html>
  );
}
