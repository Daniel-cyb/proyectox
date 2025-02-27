import ClientLayout from "@/app/(dashboard)/ClientLayout";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const isPro = true; // Esto debería obtenerse dinámicamente si es necesario
  const apiLimitCount = 10; // Esto puede cambiar dependiendo de la lógica de negocio

  return (
    <div className="h-full">
      <ClientLayout isPro={isPro} apiLimitCount={apiLimitCount}>
        {children}
      </ClientLayout>
    </div>
  );
};

export default Layout;
