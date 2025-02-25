"use client";

import { Bot, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProModal } from "@/hooks/use-pro-modal";

import { Heading } from "@/components/heading";
import Opensearch from "@/components/opensearch";

const OpensearchPage = () => {
  const router = useRouter();
  const proModal = useProModal();

  return (
    <div>
      <Heading
        title="Opensearch Dashboard"
        description="Your data in realtime."
        icon={Search}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />
      <div className="px-4 lg:px-8">
        <Opensearch />
      </div>
    </div>
  );
};

export default OpensearchPage;
