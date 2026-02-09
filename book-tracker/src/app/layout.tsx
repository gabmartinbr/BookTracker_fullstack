import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";

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
  description: "Your book tracker with Netx.js and Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">{/* Forzamos dark mode para el look pro */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <SidebarProvider defaultOpen={false}>
          {/* 1. El Sidebar fijo a la izquierda */}
          <AppSidebar />
          
          {/* 2. El área de contenido que ocupa el resto de la pantalla */}
          <main className="relative flex min-h-screen flex-col w-full">
            {/* Cabecera mínima para el botón de colapsar */}
            <header className="flex h-10 items-center px-2 border-b border-border/40 bg-background/95 backdrop-blur">
              <SidebarTrigger className="h-10 w-10 [&>svg]:size-7!" />
            </header>

            {/* 3. Aquí se inyectará lo que pongas en page.tsx */}
            <div className="flex-1">
              {children}
            </div>
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
