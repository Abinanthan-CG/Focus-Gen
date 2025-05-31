
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Clock,
  Timer,
  Hourglass,
  Coffee,
  CalendarDays,
  ListChecks,
  // Sparkles, // Removed as AI Assistant is removed
  Settings, // Example for a future settings page
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/clock", label: "Clock", icon: Clock },
  { href: "/stopwatch", label: "Stopwatch", icon: Timer },
  { href: "/countdown", label: "Countdown", icon: Hourglass },
  { href: "/pomodoro", label: "Pomodoro", icon: Coffee },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/todo", label: "To-Do List", icon: ListChecks },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
      <SidebarHeader className="border-b">
        <Link href="/clock" className="flex items-center gap-2 p-2" onClick={() => setOpenMobile(false)}>
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
          <span className="font-semibold font-headline text-lg">NovaFocus</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/clock")}
                  onClick={() => setOpenMobile(false)}
                  className={cn(
                    "w-full justify-start",
                    (pathname === item.href || (pathname.startsWith(item.href) && item.href + '/' !== pathname + '/')) && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                  tooltip={{ children: item.label, className: "bg-popover text-popover-foreground border" }}
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      {/* 
      <SidebarFooter className="mt-auto border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/settings" passHref legacyBehavior>
              <SidebarMenuButton 
                asChild 
                isActive={pathname === "/settings"}
                onClick={() => setOpenMobile(false)}
                className="w-full justify-start"
                tooltip={{ children: "Settings", className: "bg-popover text-popover-foreground border"}}
              >
                <a><Settings className="h-5 w-5" /><span>Settings</span></a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      */}
    </Sidebar>
  );
}
