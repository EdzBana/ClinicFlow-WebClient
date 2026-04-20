import React from "react";
import {
  Settings,
  LogOut,
  LayoutDashboard,
  Package,
  Boxes,
  FileText,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "@/auth/auth";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const AppSidebar: React.FC = () => {
  const { userType, firstName, lastName } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Inventory",
      path: "/inventory",
      icon: Package,
    },
    {
      title: "Inventory Management",
      path: "/inventory-management",
      icon: Boxes,
    },
    {
      title: "Stock Control",
      path: "/stock-control",
      icon: Boxes,
    },
    {
      title: "Records",
      path: "/records",
      icon: FileText,
    },
    {
      title: "Appointments",
      path: "/appointments",
      icon: Calendar,
      subItems: [
        {
          title: "Queueing System",
          path: "/appointments/queue",
        },
        {
          title: "Student Activities",
          path: "/appointments/student-activities",
        },
        {
          title: "Queue History",
          path: "/appointments/queue-history",
        },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        console.log("Logout successful");
      } else {
        console.error("Logout error:", result.error);
      }
    } catch (err) {
      console.error("Unexpected logout error:", err);
    } finally {
      window.location.href = "/login";
    }
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (path: string, subItems?: Array<{ path: string }>) => {
    if (location.pathname === path) return true;
    return (
      subItems?.some((subItem) => location.pathname === subItem.path) ?? false
    );
  };

  return (
    <Sidebar
      style={{ backgroundColor: "#680000" }}
      className="border-r border-white/10 bg-[#680000]
    lg:static lg:translate-x-0
    fixed inset-y-0 left-0 z-50 w-64
    -translate-x-full data-[state=open]:translate-x-0
    transition-transform"
    >
      <SidebarHeader className="border-b border-white/10 bg-[#680000]">
        <div className="flex items-center justify-between px-2 py-2">
          <h2 className="text-lg font-semibold text-white">Navigation</h2>
          <SidebarMenuButton
            onClick={handleSettings}
            className="h-8 w-8 text-white hover:bg-white/10"
            tooltip="Settings"
          >
            <Settings className="h-4 w-4" />
          </SidebarMenuButton>
        </div>
        <div className="px-2 pb-2">
          <h1 className="text-xl font-bold text-white">
            {firstName} {lastName}
          </h1>
          <p className="text-sm text-white/80">{userType}</p>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#680000]">
        <SidebarGroup className="bg-[#680000]">
          <SidebarGroupLabel className="text-white/60">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                // If item has subItems, render as Collapsible
                if (item.subItems) {
                  return (
                    <Collapsible
                      key={item.path}
                      asChild
                      defaultOpen={isParentActive(item.path, item.subItems)}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            className={
                              isParentActive(item.path, item.subItems)
                                ? "bg-white/10 text-white hover:bg-white/15"
                                : "text-white/90 hover:bg-white/5 hover:text-white"
                            }
                          >
                            <item.icon />
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.subItems.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.path}>
                                <SidebarMenuSubButton
                                  onClick={() => navigate(subItem.path)}
                                  isActive={isActive(subItem.path)}
                                  className={
                                    isActive(subItem.path)
                                      ? "bg-white/10 text-white hover:bg-white/15"
                                      : "text-white/80 hover:bg-white/5 hover:text-white"
                                  }
                                >
                                  <span>{subItem.title}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                // Regular menu item without subItems
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      isActive={isActive(item.path)}
                      tooltip={item.title}
                      className={
                        isActive(item.path)
                          ? "bg-white/10 text-white hover:bg-white/15"
                          : "text-white/90 hover:bg-white/5 hover:text-white"
                      }
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-[#680000]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Logout"
              className="text-white/90 hover:bg-white/5 hover:text-white"
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
