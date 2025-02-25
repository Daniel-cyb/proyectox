"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { Montserrat } from 'next/font/google';
import { ChevronDown, ChevronRight, LayoutDashboard, ShieldAlert, List, MessageSquare, Bot, Search, Settings, CheckSquare, ShieldCheck, Code, Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { FreeCounter } from "@/components/free-counter";

const poppins = Montserrat({ weight: '600', subsets: ['latin'] });

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: "text-sky-500"
  },
  {
    label: 'AI-Assitant',
    icon: Bot,
    href: '/analist',
    color: "text-sky-500"
  },
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
  {
    label: 'SoCless',
    icon: Search,
    color: "text-sky-500",
    href: '/dashboard',
    subRoutes: [
      { label: 'Source Integration', href: '/submenu1' },
      { label: 'Dashboard Opensearch', href: '/opensearch' },
      { label: 'Incident Response Manager (IRM)', href: '/submenu2' },
      { label: 'SOAR', href: '/submenu2' },
      { label: 'SIEM Rules Generator', href: '/code' },
    ],
  },
  {
    label: 'Compliance',
    icon: CheckSquare,
    color: "text-sky-500",
    href: '/code',
    subRoutes: [
      { label: 'Dashboard Compliance', href: '/compliance' },
      { label: 'Compliance Documents', href: '/compliance_documents' },
      { label: 'Risk', href: '/risk' },
      { label: 'Internal Auditor', href: '/Internal_auditor' },
    ],
  },
  {
    label: 'Vulnerability Management',
    icon: ShieldCheck,
    color: "text-sky-500",
    href: '/code',
    subRoutes: [
      { label: 'Dashboard', href: '/submenu1' },
      { label: 'Vulnerability tracking', href: '/submenu2' },
    ],
  },
  {
    label: 'Settings',
    icon: Settings,
    color: "text-sky-500",
    href: '/settings',
  },
];

export const Sidebar = ({
  apiLimitCount = 0,
  isPro = false
}: {
  apiLimitCount: number;
  isPro: boolean;
}) => {
  const pathname = usePathname();
  const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [pathname]);

  const handleSubMenuClick = (label: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const toggleDarkMode = () => {
    const isDarkMode = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={cn(
      "relative h-full bg-[#163e4f] text-white transition-all duration-300",
      isSidebarOpen ? "w-72" : "w-20"
    )}>
      <button
        onClick={toggleSidebar}
        className="absolute top-5 right-2 p-2 #163e4f rounded-full"
      >
        <Menu className="h-6 w-6" />
      </button>
      <div className={cn(
        "space-y-4 py-4 flex flex-col h-full overflow-y-auto",
        isSidebarOpen ? "px-3" : "px-2"
      )}>
        <div className="py-2 flex-1">
          <Link href="/dashboard" className={cn(
            "flex items-center mb-14",
            isSidebarOpen ? "pl-3" : "justify-center"
          )}>
            <div className="relative h-8 w-8 mr-4">
              <Image fill alt="Logo" src="/logox1.png" />
            </div>
            {isSidebarOpen && (
              <h1 className={cn("text-3xl font-bold", poppins.className)}>
                LogXai
              </h1>
            )}
          </Link>
          <div className="space-y-1">
            {routes.map((route) => (
              <div key={route.href}>
                {route.subRoutes ? (
                  <div>
                    <div
                      onClick={() => handleSubMenuClick(route.label)}
                      className={cn(
                        "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                        pathname.startsWith(route.href) ? "text-white bg-white/10" : "text-zinc-400",
                        !isSidebarOpen && "justify-center"
                      )}
                    >
                      <div className={cn("flex items-center", isSidebarOpen ? "flex-1" : "")}>
                        <route.icon className={cn("h-5 w-5", route.color, isSidebarOpen && "mr-3")} />
                        {isSidebarOpen && (
                          <>
                            {route.label}
                            {openSubMenus[route.label] ? (
                              <ChevronDown className="h-4 w-4 ml-auto" />
                            ) : (
                              <ChevronRight className="h-4 w-4 ml-auto" />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    {isSidebarOpen && openSubMenus[route.label] && (
                      <div className="pl-10 space-y-1">
                        {route.subRoutes.map((subRoute) => (
                          <Link
                            key={subRoute.href}
                            href={subRoute.href}
                            className={cn(
                              "text-sm group flex p-2 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                              pathname === subRoute.href ? "text-white bg-white/10" : "text-zinc-400",
                            )}
                          >
                            {subRoute.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={route.href}
                    className={cn(
                      "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                      pathname === route.href ? "text-white bg-white/10" : "text-zinc-400",
                      !isSidebarOpen && "justify-center"
                    )}
                  >
                    <div className={cn("flex items-center", isSidebarOpen ? "flex-1" : "")}>
                      <route.icon className={cn("h-5 w-5", route.color, isSidebarOpen && "mr-3")} />
                      {isSidebarOpen && route.label}
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
        {isSidebarOpen && (
          <button
            onClick={toggleDarkMode}
            className="m-4 p-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded"
          >
            Toggle Dark Mode
          </button>
        )}
        <FreeCounter 
          apiLimitCount={apiLimitCount} 
          isPro={isPro}
        />
      </div>
    </div>
  );
};