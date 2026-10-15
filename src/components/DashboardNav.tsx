"use client";
// components/DashboardNav.tsx — Sidebar navigation

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calculator,
  Package,
  Vault,
  Settings,
  Gem,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/",          icon: Calculator, labelAr: "الكاسا",     labelFr: "Caisse / POS"    },
  { href: "/inventory", icon: Package,    labelAr: "المخزون",    labelFr: "Inventaire"       },
  { href: "/casse-vault", icon: Vault,    labelAr: "صندوق الكاس", labelFr: "Coffre Casse"   },
  { href: "/settings",  icon: Settings,   labelAr: "الإعدادات",  labelFr: "Paramètres"      },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="w-16 lg:w-56 bg-stone-900 border-l border-stone-800 flex flex-col gap-1 p-2 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 py-4 mb-2 border-b border-stone-800">
        <div className="w-8 h-8 gold-gradient rounded-lg flex items-center justify-center shrink-0">
          <Gem className="w-4 h-4 text-stone-950" />
        </div>
        <div className="hidden lg:block">
          <div className="font-black text-white text-sm">الذهابة</div>
          <div className="text-stone-400 text-xs">El Dhehaba POS</div>
        </div>
      </div>

      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
              active
                ? "gold-gradient text-stone-950 shadow-lg shadow-amber-900/20"
                : "text-stone-400 hover:text-white hover:bg-stone-800"
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <div className="hidden lg:block">
              <div className={cn("font-bold text-sm", active ? "text-stone-950" : "")}>{item.labelAr}</div>
              <div className={cn("text-xs opacity-70", active ? "text-stone-900" : "text-stone-500")}>{item.labelFr}</div>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

