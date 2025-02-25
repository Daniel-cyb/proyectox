"use client";

import { Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProModal } from "@/hooks/use-pro-modal";

import { Heading } from "@/components/heading";


const DashboardPage = () => {
  const router = useRouter();
  const proModal = useProModal();

  return (
    <div>
      <Heading
        title="Overview Logxai"
        description="Check if an IP Address, Domain Name, or Subnet is blacklisted."
        icon={Bot}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />

    </div>
  );
};

export default DashboardPage;