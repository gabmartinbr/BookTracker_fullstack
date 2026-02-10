import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";
import { Toaster } from "react-hot-toast"; // 1. Importar Toaster

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Book Tracker Dashboard",
  description: "Your book tracker with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        {/* 2. Añadir el componente Toaster aquí */}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0f172a', // slate-900
              color: '#fff',
              border: '1px solid #1e293b', // slate-800
            },
          }}
        />

        <SidebarProvider defaultOpen={false}>
          <AppSidebar />
          
          <main className="relative flex min-h-screen flex-col w-full">
            <header className="flex h-10 items-center px-2 border-b border-border/40 bg-background/95 backdrop-blur">
              <SidebarTrigger className="h-10 w-10 [&>svg]:size-7!" />
            </header>

            <div className="flex-1">
              {children}
            </div>
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}