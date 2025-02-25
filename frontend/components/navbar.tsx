"use client"; // Esto asegura que se ejecute en el cliente

import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { getApiLimitCount } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const Navbar = () => {
  const [apiLimitCount, setApiLimitCount] = useState(0);
  const [isPro, setIsPro] = useState(false);


  return (
    <div className="flex items-center p-4">
      <MobileSidebar isPro={isPro} apiLimitCount={apiLimitCount} />
      <div className="flex w-full justify-end">
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};

export default Navbar;
