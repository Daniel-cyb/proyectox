"use client"; // Marca este componente como un Client Component

import { useState, useEffect } from "react";
import { Bot } from "lucide-react";
import { Heading } from "@/components/heading";
import { Loader } from "@/components/loader";
import Documentation from "@/components/compliance/Documentation"; // Asegúrate de que la capitalización coincide
import ChatSearch from "@/components/compliance/ChatSearch"; // Asegúrate de que la capitalización coincide

const ComplianceDocumentsPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula la carga inicial
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-4">
      {/* Encabezado */}
      <Heading
        title="Documents Management"
        description="Compliance"
        icon={Bot}
        iconColor="text-blue-500"
        bgColor="bg-blue-500/10"
      />

      {/* Contenedor principal */}
      <div className="px-4 lg:px-8">
        {loading ? (
          <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted shadow-md">
            <Loader />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Sección de Documentación */}
            <Documentation />

            {/* Sección de Búsqueda en Documentos */}
            <ChatSearch />
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceDocumentsPage;
