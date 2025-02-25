"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, LayoutDashboard, Settings } from "lucide-react";

// Rutas de navegación
const routes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export const Sidebar = ({ onToggle }: { onToggle: (isOpen: boolean) => void }) => {
  const [isOpen, setIsOpen] = useState(true); // Controla si el Sidebar está abierto o no

  const toggleSidebar = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen); // Cambia el estado del Sidebar
    onToggle(newIsOpen); // Notifica al layout principal sobre el cambio
  };

  return (
    <div
      className={`bg-gray-900 text-white h-screen p-4 ${
        isOpen ? "w-64" : "w-20"
      } transition-all duration-300 fixed left-0 top-0 z-50`}
    >
      {/* Botón para abrir/cerrar el Sidebar */}
      <button
        onClick={toggleSidebar}
        className="mb-4 p-2 bg-gray-100 rounded-full"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Enlaces de navegación */}
      <div className="space-y-4">
        {routes.map((route) => (
          <Link href={route.href} key={route.href} className="flex items-center">
            <route.icon className="w-6 h-6 text-white" />
            {isOpen && <span className="ml-4">{route.label}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
};
