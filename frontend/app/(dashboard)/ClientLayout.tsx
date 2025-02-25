"use client"; // Esto asegura que este componente se ejecute en el cliente

import Navbar from "@/components/navbar";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar"; // Asegúrate de que la ruta es correcta
import useWindowSize from "@/hooks/useWindowSize"; // Importa el hook personalizado

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Estado para controlar el sidebar
  const isMobile = useWindowSize(); // Usa el hook para detectar si es mobile

  // Maneja el estado del sidebar según el tamaño de la ventana
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false); // Oculta el sidebar si es mobile
    } else {
      setIsSidebarOpen(true); // Muestra el sidebar si es desktop
    }
  }, [isMobile]); // Cambia el sidebar cuando cambia `isMobile`

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen); // Alterna manualmente el estado del sidebar
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="flex-shrink-0">
          <Sidebar onToggle={handleSidebarToggle} />
        </div>
      )}

      {/* Contenido principal que sigue siendo flexible */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar /> {/* Aquí es donde se muestra el Navbar */}

        {/* Contenido desplazable */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
