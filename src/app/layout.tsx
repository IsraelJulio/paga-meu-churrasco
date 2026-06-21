import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50">
        <SessionProvider>
          {children}
          <Toaster
            position="bottom-center"
            richColors
            toastOptions={{
              classNames: {
                toast: "rounded-2xl shadow-xl font-medium",
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
