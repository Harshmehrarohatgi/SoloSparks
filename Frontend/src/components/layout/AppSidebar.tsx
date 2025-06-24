
import { NavLink, useLocation } from "react-router-dom";
import { Home, Target, FileText, TrendingUp, Gift } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Quests", url: "/dashboard#quests", icon: Target },
  { title: "Reflections", url: "/reflections", icon: FileText },
  { title: "Progress", url: "/progress", icon: TrendingUp },
  { title: "Rewards", url: "/rewards", icon: Gift },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path.includes("#")) {
      return currentPath === "/dashboard" && path.includes("quests");
    }
    return currentPath === path;
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 w-full transition-colors ${
      isActive 
        ? "bg-primary/20 text-primary font-medium" 
        : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
    }`;

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"}>
      <SidebarContent>
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg sparkle-animation"></div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-lg">Solo Sparks</h2>
                <p className="text-xs text-muted-foreground">Grow • Reflect • Shine</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls({ isActive: isActive(item.url) })}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
