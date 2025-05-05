
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { FileText, ShoppingBag, Users, User, BarChart3 } from 'lucide-react';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r border-border">
          <SidebarContent>
            <div className="py-4 px-3 mb-6">
              <h1 className="text-xl font-bold text-primary">Sistema de Ventas</h1>
            </div>
            <SidebarGroup>
              <SidebarGroupLabel>Módulos</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className={isActive('/') ? 'bg-primary/10 text-primary' : ''}>
                      <Link to="/">
                        <FileText className="mr-2 h-5 w-5" />
                        <span>Reportar Venta</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className={isActive('/inventario') ? 'bg-primary/10 text-primary' : ''}>
                      <Link to="/inventario">
                        <ShoppingBag className="mr-2 h-5 w-5" />
                        <span>Inventario</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className={isActive('/proveedores') ? 'bg-primary/10 text-primary' : ''}>
                      <Link to="/proveedores">
                        <Users className="mr-2 h-5 w-5" />
                        <span>Proveedores</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className={isActive('/afiliados') ? 'bg-primary/10 text-primary' : ''}>
                      <Link to="/afiliados">
                        <User className="mr-2 h-5 w-5" />
                        <span>Afiliados</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className={isActive('/informes') ? 'bg-primary/10 text-primary' : ''}>
                      <Link to="/informes">
                        <BarChart3 className="mr-2 h-5 w-5" />
                        <span>Generar Informes</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        
        <div className="flex-1">
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
              <SidebarTrigger />
              <div className="flex-1"></div>
            </header>
            <main className="flex-1 p-6 md:p-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
