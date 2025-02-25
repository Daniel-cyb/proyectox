"use client";

import { useState } from 'react';
import SocialMediaMonitoring from "@/components/sub/SocialMediaMonitoring";
import MonitoredTargets from "@/components/sub/MonitoredTargets";
import { Bot } from "lucide-react"; // Usar un icono
import { Heading } from "@/components/heading"; // Importar el encabezado
import { Loader } from "@/components/loader"; // Indicador de carga

const Dashboard = () => {
  const [loading, setLoading] = useState(false); // Estado de carga inicialmente en false, o puedes ajustarlo si necesitas cargar algo

  return (
    <div>
      {/* Encabezado con icono */}
      <Heading
        title="Dashboard"
        description="Monitoreo de marcas y análisis de sentimientos"
        icon={Bot}
        iconColor="text-blue-500"
        bgColor="bg-blue-500/10"
      />
      
      <div className="px-4 lg:px-8">
        {/* Mostrar un loader si hay alguna acción de carga */}
        {loading ? (
          <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
            <Loader />
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <SocialMediaMonitoring />
            </div>

            <div className="mb-8">
              <MonitoredTargets />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
