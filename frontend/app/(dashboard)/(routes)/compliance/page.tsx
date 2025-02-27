"use client"; // Marca este componente como un Client Component

import { useState } from 'react';
import { Bot } from "lucide-react";
import { Heading } from "@/components/heading";
import { Loader } from "@/components/loader";
import Compliance from "@/components/compliance/Compliance"; // Asegúrate de que el nombre del archivo coincida exactamente con esta importación

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
              <Compliance /> {/* Renderiza el módulo de ISO 27001 */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
