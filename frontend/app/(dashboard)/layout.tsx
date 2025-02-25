// Archivo: DashboardLayout.tsx

import { Sidebar } from "@/components/sidebar";
import { checkSubscription } from "@/lib/subscription";
import { getApiLimitCount } from "@/lib/api-limit";
import ClientLayout from "./ClientLayout"; // Importamos el ClientLayout

const DashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Obtenemos los datos de la API y el estado de suscripción de manera asincrónica
  const apiLimitCount = await getApiLimitCount();
  const isPro = await checkSubscription();

  return (
    <div className="h-full">
      {/* Pasamos los datos obtenidos al ClientLayout */}
      <ClientLayout isPro={isPro} apiLimitCount={apiLimitCount}>
        {children}
      </ClientLayout>
    </div>
  );
};

export default DashboardLayout;
