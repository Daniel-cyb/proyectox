"use client"; // Asegura que este componente se ejecute en el cliente

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import { Sidebar } from "@/components/sidebar"; // Verifica que la ruta sea correcta
import useWindowSize from "@/hooks/useWindowSize";

interface ClientLayoutProps {
  children: React.ReactNode;
  isPro: boolean;
  apiLimitCount: number;
}

const ClientLayout = ({ children, isPro, apiLimitCount }: ClientLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobile = useWindowSize();

  // Controla el estado del Sidebar según el tamaño de pantalla
  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleSidebarToggle = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="flex-shrink-0">
          <Sidebar 
            apiLimitCount={apiLimitCount} 
            isPro={isPro} 
            isSidebarOpen={isSidebarOpen} 
            onToggle={handleSidebarToggle} 
          />
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
