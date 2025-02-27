"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { Montserrat } from 'next/font/google';
import { ChevronDown, ChevronRight, LayoutDashboard, ShieldAlert, MessageSquare, Bot, Search, Settings, CheckSquare, ShieldCheck, Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { FreeCounter } from "@/components/free-counter";

const poppins = Montserrat({ weight: '600', subsets: ['latin'] });

interface SidebarProps {
  apiLimitCount: number;
  isPro: boolean;
  isSidebarOpen: boolean;
  onToggle?: () => void;
}

const routes = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', color: "text-sky-500" },
  { label: 'AI-Assitant', icon: Bot, href: '/analist', color: "text-sky-500" },
  {
    label: 'Cyber Threat Intelligence',
    icon: ShieldAlert,
    color: "text-sky-500",
    href: '/dos',
    subRoutes: [
      { label: 'Dashboard CTI', href: '/cti' },
      { label: 'Indicator of Compromise', href: '/submenu2' },
      { label: 'Cybersecurity News', href: '/cybersecurity-web-news' },
      { label: 'Mitre att&ck', href: '/mitrematrix' },
      { label: 'Ransomware Tracker', href: '/ransomware' },
      { label: 'Campaings', href: '/campaings' },
      { label: 'Threat Reports', href: '/threat-reports' },
      { label: 'BlacklistChecker', href: '/blacklistchecker' },
      { label: 'Malware Analysis', href: '/analysis' },
    ],
  },
  {
    label: 'Branding monitoring',
    icon: MessageSquare,
    color: "text-sky-500",
    href: '/socialmediamonitoring',
    subRoutes: [
      { label: 'Branding Configuration', href: '/socialmediamonitoring' },
      { label: 'Brand Abuse', href: '/brandabuse' },
      { label: 'Domains Monitoring', href: '/domains-monitoring' },
      { label: 'Darkweb monitoring', href: '/darkweb-monitoring' },
      { label: 'Takedown & Incident Response', href: '/takedown' },
    ],
  },
  { label: 'Settings', icon: Settings, color: "text-sky-500", href: '/settings' },
];

export const Sidebar = ({ apiLimitCount, isPro, isSidebarOpen, onToggle }: SidebarProps) => {
  const pathname = usePathname();
  const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const initialOpenSubMenus: { [key: string]: boolean } = {};
    routes.forEach((route) => {
      if (route.subRoutes) {
        route.subRoutes.forEach((subRoute) => {
          if (pathname.startsWith(subRoute.href)) {
            initialOpenSubMenus[route.label] = true;
          }
        });
      }
    });
    setOpenSubMenus(initialOpenSubMenus);
  }, [pathname]);

  const handleSubMenuClick = (label: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <div className={cn(
      "relative h-full bg-[#163e4f] text-white transition-all duration-300",
      isSidebarOpen ? "w-72" : "w-20"
    )}>
      <button
        onClick={onToggle}
        className="absolute top-5 right-2 p-2 bg-transparent rounded-full"
      >
        <Menu className="h-6 w-6" />
      </button>
      <div className={cn(
        "space-y-4 py-4 flex flex-col h-full overflow-y-auto",
        isSidebarOpen ? "px-3" : "px-2"
      )}>
        <div className="py-2 flex-1">
          <Link href="/dashboard" className="flex items-center mb-14">
            <div className="relative h-8 w-8 mr-4">
              <Image fill alt="Logo" src="/logox1.png" />
            </div>
            {isSidebarOpen && (
              <h1 className={cn("text-3xl font-bold", poppins.className)}>LogXai</h1>
            )}
          </Link>
          <div className="space-y-1">
            {routes.map((route) => (
              <div key={route.href}>
                {route.subRoutes ? (
                  <div>
                    <div
                      onClick={() => handleSubMenuClick(route.label)}
                      className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition"
                    >
                      <div className="flex items-center">
                        <route.icon className="h-5 w-5 text-sky-500 mr-3" />
                        {isSidebarOpen && route.label}
                        {isSidebarOpen && (
                          openSubMenus[route.label] ? <ChevronDown className="h-4 w-4 ml-auto" /> : <ChevronRight className="h-4 w-4 ml-auto" />
                        )}
                      </div>
                    </div>
                    {isSidebarOpen && openSubMenus[route.label] && (
                      <div className="pl-10 space-y-1">
                        {route.subRoutes.map((subRoute) => (
                          <Link key={subRoute.href} href={subRoute.href} className="text-sm p-2 block text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition">
                            {subRoute.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href={route.href} className="text-sm flex p-3 w-full text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition">
                    <route.icon className="h-5 w-5 text-sky-500 mr-3" />
                    {isSidebarOpen && route.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
        <FreeCounter apiLimitCount={apiLimitCount} isPro={isPro} />
      </div>
    </div>
  );
};
