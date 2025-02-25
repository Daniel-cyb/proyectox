"use client";  // Marca este componente como un Client Component

import { useState } from 'react';
import { Bot } from "lucide-react";
import { Heading } from "@/components/heading";
import { Loader } from "@/components/loader";
import Soa from "@/components/compliance/soa"; // Importar el componente Soa

const Dashboard = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <Heading
        title="Dashboard Compliance"
        description="Compliance"
        icon={Bot}
        iconColor="text-blue-500"
        bgColor="bg-blue-500/10"
      />

      <div className="px-4 lg:px-8">
        {loading ? (
          <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
            <Loader />
          </div>
        ) : (
          <div>

            <div className="mb-8">
              <Soa /> {/* Renderiza el módulo Soa */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
