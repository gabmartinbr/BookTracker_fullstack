"use client"
import { useEffect, useState } from "react"; // Añadimos hooks
import { Search, Library, BarChart3, LogOut, User as UserIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const items = [
  { title: "Search", url: "/", icon: Search },
  { title: "My Library", url: "/library", icon: Library },
  { title: "Stats", url: "/stats", icon: BarChart3 },
];

export function AppSidebar() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);

  // 1. Cargar los datos del usuario real
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({
          email: user.email,
          // El nombre suele venir en user_metadata si lo configuraste al registrarse
          name: user.user_metadata?.full_name || user.email?.split('@')[0]
        });
      }
    };
    getUser();
  }, []);

  // 2. Función de Logout real
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error logging out");
    } else {
      toast.success("Logged out");
      router.push("/login");
      router.refresh(); // Limpia el estado de Next.js
    }
  };

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-bold px-4 py-6 text-lg">
            BookTracker
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      <item.icon className="!w-5 !h-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-2">
        <SidebarMenu>
          {/* Perfil del Usuario Dinámico */}
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="md:h-12 cursor-default">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <UserIcon className="size-5" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-xs text-white capitalize">
                  {user?.name || "Cargando..."}
                </span>
                <span className="truncate text-[10px] text-muted-foreground">
                  {user?.email || "usuario@email.com"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Botón de Logout Funcional */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <button onClick={handleLogout}>
                <LogOut className="!w-5 !h-5" />
                <span>Cerrar Sesión</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}