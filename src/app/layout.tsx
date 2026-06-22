import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Rajdhani } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/layout/session-provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Paga meu Churrasco 🔥",
  description:
    "Crie seu bolão, desafie seus amigos e descubra quem entende mesmo de futebol.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${rajdhani.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SessionProvider>
          {children}
          <Toaster
            position="bottom-center"
            richColors
            toastOptions={{
              classNames: {
                toast: "rounded-2xl shadow-xl font-medium !bg-[#0d0d1e] !border !border-orange-500/30 !text-slate-100",
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
